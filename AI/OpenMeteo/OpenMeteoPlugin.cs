using System.ComponentModel;
using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;

namespace Abletech.Arxivar.ArxAI.Plugins.OpenMeteo;

/// <summary>
/// Plugin that gathers weather forecast and air quality from the Open-Meteo APIs
/// (see https://open-meteo.com/en/docs). It geocodes a free-text location, then queries the
/// forecast and air-quality endpoints. When an <see cref="ApiKey"/> is configured, the commercial
/// (customer-*) endpoints are used and the key is appended to every request.
/// </summary>
[ArxAiPlugin(PluginIdValue, "OpenMeteo", "1.0.0",
    Description = "Plugin that gathers weather forecast and air quality from OpenMeteo",
    Icon = "fas fa-cloud-sun")]
public class OpenMeteoPlugin : ArxAiToolProvider, IInstructionsProvider, IInitializablePlugin, IAsyncDisposable
{
    const string PluginIdValue = "643d7266-7a8b-42cf-b32f-d867e157098a";

    // Free endpoints (no key) and their commercial counterparts (used when ApiKey is set).
    const string GeocodingHostFree = "geocoding-api.open-meteo.com";
    const string GeocodingHostCustomer = "customer-geocoding-api.open-meteo.com";
    const string ForecastHostFree = "api.open-meteo.com";
    const string ForecastHostCustomer = "customer-api.open-meteo.com";
    const string AirQualityHostFree = "air-quality-api.open-meteo.com";
    const string AirQualityHostCustomer = "customer-air-quality-api.open-meteo.com";

    /// <summary>HttpClient owned by this instance; created in <see cref="InitializeAsync"/> and released in <see cref="DisposeAsync"/>.</summary>
    private HttpClient _httpClient;

    /// <summary>Logger injected by the host, categorized with the plugin name.</summary>
    [Injected]
    public ILogger Logger { get; set; } = null;

    /// <summary>Default location, used when a tool is invoked without an explicit location.</summary>
    [Parameter(DisplayName = "Default Location", Description = "The default location, used if no location is passed in the prompt", Required = false, Confidential = false, DisplayOrder = 1)]
    public string DefaultLocation { get; set; } = string.Empty;

    /// <summary>
    /// Optional commercial Open-Meteo API key. When set, requests are routed to the commercial
    /// (customer-*) endpoints and the key is appended as the <c>apikey</c> query parameter.
    /// Persisted encrypted in the secure store, write-only in the management APIs.
    /// </summary>
    [Parameter(DisplayName = "OpenMeteo Api Key", Description = "The commercial Api Key for OpenMeteo - optional", Required = false, Confidential = true, DisplayOrder = 2)]
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>Whether a commercial API key is configured.</summary>
    private bool UseCommercial => !string.IsNullOrWhiteSpace(ApiKey);

    /// <inheritdoc />
    public Task InitializeAsync()
    {
        Logger.LogInformation("OpenMeteoPlugin: initializing (commercial endpoints: {UseCommercial})", UseCommercial);

        _httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(30) };
        _httpClient.DefaultRequestHeaders.UserAgent.TryParseAdd("Abletech.Arxivar.ArxAI.Plugins.OpenMeteo/1.0.0");
        return Task.CompletedTask;
    }

    /// <inheritdoc />
    public string GetInstructions(IArxAiPluginContext context)
    {
        Logger.LogInformation("OpenMeteoPlugin: applying instructions for user {UserId} on {DocumentCount} document(s)",
            context.UserId?.ToString() ?? "unknown", context.Documents.Count);

        var defaultLocation = string.IsNullOrWhiteSpace(DefaultLocation)
            ? "no default location is configured, so a location must always be provided"
            : $"when the user does not specify a location, use the default location \"{DefaultLocation}\"";

        return $$"""
            You can use the OpenMeteo tools to answer questions about the weather and the air quality.
            - Use GetDailyForecast for the daily weather forecast at a given place; by default it is today, pass daysAhead (1 = tomorrow, up to 15) for a future day.
            - Use GetAirQuality for the current air quality (AQI and pollutant concentrations) at a given place.
            The location is a free-text place name (city, address, landmark) that is geocoded automatically;
            {{defaultLocation}}. Report temperatures, wind and pollutant values together with the units returned by the tools.
            """;
    }

    /// <summary>Maximum number of days ahead supported by the Open-Meteo forecast API (0 = today).</summary>
    const int MaxDaysAhead = 15;

    /// <summary>
    /// Tool: geocodes the given location and returns the weather forecast for a single day,
    /// today by default or up to <see cref="MaxDaysAhead"/> days in the future.
    /// </summary>
    [Description("Geocodes a location (free-text place name) and returns the weather forecast for a single day, including min/max temperature, precipitation and wind. By default it returns the current day; use daysAhead to get a day in the future. If no location is provided the configured default location is used.")]
    public async Task<DailyForecastResult> GetDailyForecast(
        [Description("The place to get the forecast for (e.g. \"Rome\", \"Brescia, Italy\", \"Times Square, New York\"). Leave empty to use the configured default location.")]
        string location = null,
        [Description("How many days in the future to forecast: 0 = today (default), 1 = tomorrow, up to 15. Values are clamped to this range.")]
        int daysAhead = 0,
        CancellationToken cancellationToken = default)
    {
        var place = ResolveLocation(location);
        var offset = Math.Clamp(daysAhead, 0, MaxDaysAhead);
        Logger.LogInformation("OpenMeteoPlugin: GetDailyForecast for '{Location}' (daysAhead: {DaysAhead})", place, offset);

        var geo = await GeocodeAsync(place, cancellationToken);

        // Current conditions describe "now", so they are only meaningful for today's forecast.
        var wantsCurrent = offset == 0;
        var query =
            $"latitude={Fmt(geo.Latitude)}&longitude={Fmt(geo.Longitude)}" +
            (wantsCurrent ? "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m" : string.Empty) +
            "&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset" +
            $"&timezone=auto&forecast_days={offset + 1}";
        var uri = BuildUri(ForecastHostFree, ForecastHostCustomer, "/v1/forecast", query);

        var response = await _httpClient.GetFromJsonAsync<ForecastResponse>(uri, cancellationToken)
                       ?? throw new InvalidOperationException("Open-Meteo returned an empty forecast response.");

        var current = response.Current;
        var currentUnits = response.CurrentUnits ?? new ForecastUnits();
        var daily = response.Daily ?? throw new InvalidOperationException("Open-Meteo returned no daily forecast.");
        var dailyUnits = response.DailyUnits ?? new ForecastUnits();

        return new DailyForecastResult
        {
            Location = geo.DisplayName,
            Latitude = response.Latitude,
            Longitude = response.Longitude,
            Timezone = response.Timezone,
            DaysAhead = offset,
            Date = At(daily.Time, offset),
            Conditions = WmoDescription(AtInt(daily.WeatherCode, offset)),
            TemperatureMax = AtNum(daily.Temperature2mMax, offset),
            TemperatureMin = AtNum(daily.Temperature2mMin, offset),
            ApparentTemperatureMax = AtNum(daily.ApparentTemperature2mMax, offset),
            TemperatureUnit = dailyUnits.Temperature2mMax ?? "°C",
            PrecipitationSum = AtNum(daily.PrecipitationSum, offset),
            PrecipitationUnit = dailyUnits.PrecipitationSum ?? "mm",
            PrecipitationProbabilityMaxPercent = AtNum(daily.PrecipitationProbabilityMax, offset),
            WindSpeedMax = AtNum(daily.WindSpeed10mMax, offset),
            WindSpeedUnit = dailyUnits.WindSpeed10mMax ?? "km/h",
            Sunrise = At(daily.Sunrise, offset),
            Sunset = At(daily.Sunset, offset),
            Current = current is null ? null : new CurrentConditions
            {
                Time = current.Time,
                Conditions = WmoDescription(current.WeatherCode),
                Temperature = current.Temperature2m,
                ApparentTemperature = current.ApparentTemperature,
                RelativeHumidityPercent = current.RelativeHumidity2m,
                WindSpeed = current.WindSpeed10m,
                TemperatureUnit = currentUnits.Temperature2m ?? "°C",
                WindSpeedUnit = currentUnits.WindSpeed10m ?? "km/h",
            },
        };
    }

    /// <summary>
    /// Tool: geocodes the given location and returns the current air quality from Open-Meteo.
    /// </summary>
    [Description("Geocodes a location (free-text place name) and returns the current air quality: European and US AQI plus the main pollutant concentrations (PM10, PM2.5, CO, NO2, SO2, O3). If no location is provided the configured default location is used.")]
    public async Task<AirQualityResult> GetAirQuality(
        [Description("The place to get the air quality for (e.g. \"Milan\", \"Brescia, Italy\"). Leave empty to use the configured default location.")]
        string location = null,
        CancellationToken cancellationToken = default)
    {
        var place = ResolveLocation(location);
        Logger.LogInformation("OpenMeteoPlugin: GetAirQuality for '{Location}'", place);

        var geo = await GeocodeAsync(place, cancellationToken);

        var query =
            $"latitude={Fmt(geo.Latitude)}&longitude={Fmt(geo.Longitude)}" +
            "&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone" +
            "&timezone=auto";
        var uri = BuildUri(AirQualityHostFree, AirQualityHostCustomer, "/v1/air-quality", query);

        var response = await _httpClient.GetFromJsonAsync<AirQualityResponse>(uri, cancellationToken)
                       ?? throw new InvalidOperationException("Open-Meteo returned an empty air-quality response.");

        var current = response.Current ?? throw new InvalidOperationException("Open-Meteo returned no current air quality.");
        var units = response.CurrentUnits ?? new AirQualityUnits();

        return new AirQualityResult
        {
            Location = geo.DisplayName,
            Latitude = response.Latitude,
            Longitude = response.Longitude,
            Timezone = response.Timezone,
            Time = current.Time,
            EuropeanAqi = current.EuropeanAqi,
            EuropeanAqiBand = EuropeanAqiBand(current.EuropeanAqi),
            UsAqi = current.UsAqi,
            ParticulateMatter10 = current.Pm10,
            ParticulateMatter2_5 = current.Pm2_5,
            CarbonMonoxide = current.CarbonMonoxide,
            NitrogenDioxide = current.NitrogenDioxide,
            SulphurDioxide = current.SulphurDioxide,
            Ozone = current.Ozone,
            ConcentrationUnit = units.Pm10 ?? "μg/m³",
        };
    }

    /// <inheritdoc />
    public ValueTask DisposeAsync()
    {
        Logger.LogInformation("OpenMeteoPlugin: disposing");

        _httpClient?.Dispose();
        _httpClient = null;
        return ValueTask.CompletedTask;
    }

    // ---- Helpers -----------------------------------------------------------------------------

    /// <summary>Resolves the effective location: the explicit argument, otherwise the configured default.</summary>
    private string ResolveLocation(string location)
    {
        if (!string.IsNullOrWhiteSpace(location))
            return location.Trim();
        if (!string.IsNullOrWhiteSpace(DefaultLocation))
            return DefaultLocation.Trim();
        throw new InvalidOperationException("No location was provided and no default location is configured.");
    }

    /// <summary>Geocodes a free-text place name into coordinates using the Open-Meteo geocoding API.</summary>
    private async Task<GeoLocation> GeocodeAsync(string location, CancellationToken cancellationToken)
    {
        var query = $"name={Uri.EscapeDataString(location)}&count=1&language=en&format=json";
        var uri = BuildUri(GeocodingHostFree, GeocodingHostCustomer, "/v1/search", query);

        var response = await _httpClient.GetFromJsonAsync<GeocodingResponse>(uri, cancellationToken);
        var first = response?.Results?.FirstOrDefault()
                    ?? throw new InvalidOperationException($"Could not find any location matching '{location}'.");

        var parts = new[] { first.Name, first.Admin1, first.Country }
            .Where(p => !string.IsNullOrWhiteSpace(p));
        return new GeoLocation(string.Join(", ", parts), first.Latitude, first.Longitude);
    }

    /// <summary>
    /// Builds the request URI, selecting the free or commercial host based on <see cref="ApiKey"/>
    /// and appending the <c>apikey</c> query parameter for commercial requests.
    /// </summary>
    private string BuildUri(string freeHost, string customerHost, string path, string query)
    {
        var host = UseCommercial ? customerHost : freeHost;
        var uri = $"https://{host}{path}?{query}";
        if (UseCommercial)
            uri += $"&apikey={Uri.EscapeDataString(ApiKey)}";
        return uri;
    }

    private static string Fmt(double value) => value.ToString(CultureInfo.InvariantCulture);

    private static string At(IReadOnlyList<string> list, int index) => list is not null && index < list.Count ? list[index] : null;

    private static double? AtNum(IReadOnlyList<double?> list, int index) => list is not null && index < list.Count ? list[index] : null;

    private static int? AtInt(IReadOnlyList<int?> list, int index) => list is not null && index < list.Count ? list[index] : null;

    /// <summary>Maps a WMO weather interpretation code to a human-readable description.</summary>
    private static string WmoDescription(int? code) => code switch
    {
        null => null,
        0 => "Clear sky",
        1 => "Mainly clear",
        2 => "Partly cloudy",
        3 => "Overcast",
        45 => "Fog",
        48 => "Depositing rime fog",
        51 => "Light drizzle",
        53 => "Moderate drizzle",
        55 => "Dense drizzle",
        56 => "Light freezing drizzle",
        57 => "Dense freezing drizzle",
        61 => "Slight rain",
        63 => "Moderate rain",
        65 => "Heavy rain",
        66 => "Light freezing rain",
        67 => "Heavy freezing rain",
        71 => "Slight snow fall",
        73 => "Moderate snow fall",
        75 => "Heavy snow fall",
        77 => "Snow grains",
        80 => "Slight rain showers",
        81 => "Moderate rain showers",
        82 => "Violent rain showers",
        85 => "Slight snow showers",
        86 => "Heavy snow showers",
        95 => "Thunderstorm",
        96 => "Thunderstorm with slight hail",
        99 => "Thunderstorm with heavy hail",
        _ => $"Unknown (code {code})",
    };

    /// <summary>Maps a European AQI value to its qualitative band.</summary>
    private static string EuropeanAqiBand(double? aqi) => aqi switch
    {
        null => null,
        <= 20 => "Good",
        <= 40 => "Fair",
        <= 60 => "Moderate",
        <= 80 => "Poor",
        <= 100 => "Very poor",
        _ => "Extremely poor",
    };

    // ---- Geocoding DTOs ----------------------------------------------------------------------

    private sealed record GeoLocation(string DisplayName, double Latitude, double Longitude);

    private sealed class GeocodingResponse
    {
        [JsonPropertyName("results")] public List<GeocodingResult> Results { get; set; }
    }

    private sealed class GeocodingResult
    {
        [JsonPropertyName("name")] public string Name { get; set; }
        [JsonPropertyName("latitude")] public double Latitude { get; set; }
        [JsonPropertyName("longitude")] public double Longitude { get; set; }
        [JsonPropertyName("country")] public string Country { get; set; }
        [JsonPropertyName("admin1")] public string Admin1 { get; set; }
    }

    // ---- Forecast DTOs -----------------------------------------------------------------------

    private sealed class ForecastResponse
    {
        [JsonPropertyName("latitude")] public double Latitude { get; set; }
        [JsonPropertyName("longitude")] public double Longitude { get; set; }
        [JsonPropertyName("timezone")] public string Timezone { get; set; }
        [JsonPropertyName("current")] public ForecastCurrent Current { get; set; }
        [JsonPropertyName("current_units")] public ForecastUnits CurrentUnits { get; set; }
        [JsonPropertyName("daily")] public ForecastDaily Daily { get; set; }
        [JsonPropertyName("daily_units")] public ForecastUnits DailyUnits { get; set; }
    }

    private sealed class ForecastCurrent
    {
        [JsonPropertyName("time")] public string Time { get; set; }
        [JsonPropertyName("temperature_2m")] public double? Temperature2m { get; set; }
        [JsonPropertyName("relative_humidity_2m")] public double? RelativeHumidity2m { get; set; }
        [JsonPropertyName("apparent_temperature")] public double? ApparentTemperature { get; set; }
        [JsonPropertyName("weather_code")] public int? WeatherCode { get; set; }
        [JsonPropertyName("wind_speed_10m")] public double? WindSpeed10m { get; set; }
    }

    private sealed class ForecastDaily
    {
        [JsonPropertyName("time")] public List<string> Time { get; set; }
        [JsonPropertyName("weather_code")] public List<int?> WeatherCode { get; set; }
        [JsonPropertyName("temperature_2m_max")] public List<double?> Temperature2mMax { get; set; }
        [JsonPropertyName("temperature_2m_min")] public List<double?> Temperature2mMin { get; set; }
        [JsonPropertyName("apparent_temperature_max")] public List<double?> ApparentTemperature2mMax { get; set; }
        [JsonPropertyName("precipitation_sum")] public List<double?> PrecipitationSum { get; set; }
        [JsonPropertyName("precipitation_probability_max")] public List<double?> PrecipitationProbabilityMax { get; set; }
        [JsonPropertyName("wind_speed_10m_max")] public List<double?> WindSpeed10mMax { get; set; }
        [JsonPropertyName("sunrise")] public List<string> Sunrise { get; set; }
        [JsonPropertyName("sunset")] public List<string> Sunset { get; set; }
    }

    private sealed class ForecastUnits
    {
        [JsonPropertyName("temperature_2m")] public string Temperature2m { get; set; }
        [JsonPropertyName("temperature_2m_max")] public string Temperature2mMax { get; set; }
        [JsonPropertyName("wind_speed_10m")] public string WindSpeed10m { get; set; }
        [JsonPropertyName("wind_speed_10m_max")] public string WindSpeed10mMax { get; set; }
        [JsonPropertyName("precipitation_sum")] public string PrecipitationSum { get; set; }
    }

    // ---- Air-quality DTOs --------------------------------------------------------------------

    private sealed class AirQualityResponse
    {
        [JsonPropertyName("latitude")] public double Latitude { get; set; }
        [JsonPropertyName("longitude")] public double Longitude { get; set; }
        [JsonPropertyName("timezone")] public string Timezone { get; set; }
        [JsonPropertyName("current")] public AirQualityCurrent Current { get; set; }
        [JsonPropertyName("current_units")] public AirQualityUnits CurrentUnits { get; set; }
    }

    private sealed class AirQualityCurrent
    {
        [JsonPropertyName("time")] public string Time { get; set; }
        [JsonPropertyName("european_aqi")] public double? EuropeanAqi { get; set; }
        [JsonPropertyName("us_aqi")] public double? UsAqi { get; set; }
        [JsonPropertyName("pm10")] public double? Pm10 { get; set; }
        [JsonPropertyName("pm2_5")] public double? Pm2_5 { get; set; }
        [JsonPropertyName("carbon_monoxide")] public double? CarbonMonoxide { get; set; }
        [JsonPropertyName("nitrogen_dioxide")] public double? NitrogenDioxide { get; set; }
        [JsonPropertyName("sulphur_dioxide")] public double? SulphurDioxide { get; set; }
        [JsonPropertyName("ozone")] public double? Ozone { get; set; }
    }

    private sealed class AirQualityUnits
    {
        [JsonPropertyName("pm10")] public string Pm10 { get; set; }
    }

    // ---- Tool result types (serialized to the agent via JSON schema) -------------------------

    /// <summary>The weather forecast for a single day at a resolved location.</summary>
    public sealed class DailyForecastResult
    {
        [Description("The resolved location name (city, region, country)")]
        public string Location { get; set; }
        [Description("Latitude of the resolved location")]
        public double Latitude { get; set; }
        [Description("Longitude of the resolved location")]
        public double Longitude { get; set; }
        [Description("IANA timezone the times are expressed in")]
        public string Timezone { get; set; }
        [Description("How many days ahead of today this forecast is for (0 = today)")]
        public int DaysAhead { get; set; }
        [Description("The forecast date (ISO 8601)")]
        public string Date { get; set; }
        [Description("Human-readable description of the expected conditions")]
        public string Conditions { get; set; }
        [Description("Maximum temperature of the day")]
        public double? TemperatureMax { get; set; }
        [Description("Minimum temperature of the day")]
        public double? TemperatureMin { get; set; }
        [Description("Maximum apparent (feels-like) temperature of the day")]
        public double? ApparentTemperatureMax { get; set; }
        [Description("Unit of the temperature values")]
        public string TemperatureUnit { get; set; }
        [Description("Total precipitation expected during the day")]
        public double? PrecipitationSum { get; set; }
        [Description("Unit of the precipitation value")]
        public string PrecipitationUnit { get; set; }
        [Description("Maximum probability of precipitation during the day, in percent")]
        public double? PrecipitationProbabilityMaxPercent { get; set; }
        [Description("Maximum wind speed of the day")]
        public double? WindSpeedMax { get; set; }
        [Description("Unit of the wind speed value")]
        public string WindSpeedUnit { get; set; }
        [Description("Sunrise time (ISO 8601)")]
        public string Sunrise { get; set; }
        [Description("Sunset time (ISO 8601)")]
        public string Sunset { get; set; }
        [Description("Current conditions at the location, when available")]
        public CurrentConditions Current { get; set; }
    }

    /// <summary>Current weather conditions at the resolved location.</summary>
    public sealed class CurrentConditions
    {
        [Description("Observation time (ISO 8601)")]
        public string Time { get; set; }
        [Description("Human-readable description of the current conditions")]
        public string Conditions { get; set; }
        [Description("Current air temperature")]
        public double? Temperature { get; set; }
        [Description("Current apparent (feels-like) temperature")]
        public double? ApparentTemperature { get; set; }
        [Description("Current relative humidity, in percent")]
        public double? RelativeHumidityPercent { get; set; }
        [Description("Current wind speed")]
        public double? WindSpeed { get; set; }
        [Description("Unit of the temperature values")]
        public string TemperatureUnit { get; set; }
        [Description("Unit of the wind speed value")]
        public string WindSpeedUnit { get; set; }
    }

    /// <summary>The current air quality at a resolved location.</summary>
    public sealed class AirQualityResult
    {
        [Description("The resolved location name (city, region, country)")]
        public string Location { get; set; }
        [Description("Latitude of the resolved location")]
        public double Latitude { get; set; }
        [Description("Longitude of the resolved location")]
        public double Longitude { get; set; }
        [Description("IANA timezone the times are expressed in")]
        public string Timezone { get; set; }
        [Description("Observation time (ISO 8601)")]
        public string Time { get; set; }
        [Description("European Air Quality Index (0 = best)")]
        public double? EuropeanAqi { get; set; }
        [Description("Qualitative band of the European AQI (Good/Fair/Moderate/Poor/Very poor/Extremely poor)")]
        public string EuropeanAqiBand { get; set; }
        [Description("United States Air Quality Index")]
        public double? UsAqi { get; set; }
        [Description("Particulate matter up to 10 µm")]
        public double? ParticulateMatter10 { get; set; }
        [Description("Particulate matter up to 2.5 µm")]
        public double? ParticulateMatter2_5 { get; set; }
        [Description("Carbon monoxide concentration")]
        public double? CarbonMonoxide { get; set; }
        [Description("Nitrogen dioxide concentration")]
        public double? NitrogenDioxide { get; set; }
        [Description("Sulphur dioxide concentration")]
        public double? SulphurDioxide { get; set; }
        [Description("Ozone concentration")]
        public double? Ozone { get; set; }
        [Description("Unit of the pollutant concentration values")]
        public string ConcentrationUnit { get; set; }
    }
}
