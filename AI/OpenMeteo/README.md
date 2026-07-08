[![Arxivar](http://portal.arxivar.it/download/resources/loghi/Logo-ARXivar_orizzontale-nero.png)](http://www.arxivar.it/)

# OpenMeteo ArxAI plugin

> Sample ArxAI plugin implementation for ARXivar Next, exposing weather forecast and air quality tools backed by the [Open-Meteo](https://open-meteo.com/en/docs) APIs.

## Installation

- install [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0) if you don't already have it.

- open the terminal into the `OpenMeteo` folder and build the plugin:

```bash
  dotnet build -c Release
```

  this produces `Abletech.Arxivar.ArxAI.Plugins.OpenMeteo.zip` in `bin\Release\`, packaging the plugin DLL together with its dependencies.

- open a command prompt where the `arxai-plugin` CLI is available and upload the plugin into ARXivar with this command:

```bash
  arxai-plugin.exe upload -p bin\Release\Abletech.Arxivar.ArxAI.Plugins.OpenMeteo.zip
```

- to update an already installed version, use `update` instead of `upload`:

```bash
  arxai-plugin.exe update -p bin\Release\Abletech.Arxivar.ArxAI.Plugins.OpenMeteo.zip
```

- now the plugin is running in ARXivar, and its tools are available to the ArxAI agent.

_Note: this plugin is provided as a support for learning activities, it's not recommended its use in production environment. Use this as a 'draft' for creating your plugins._

_Note: Instructions for plugin creation can be found at [generator-arxivar-plugin](https://github.com/Arxivar/PluginGenerator/blob/master/README.md)._

## Plugin specification

This plugin geocodes a free-text location and exposes two tools to the ArxAI agent:

- `GetDailyForecast` - the weather forecast for a single day (today by default, up to 15 days ahead), including min/max temperature, precipitation and wind, plus current conditions when the requested day is today.
- `GetAirQuality` - the current air quality (European and US AQI, plus PM10/PM2.5, CO, NO2, SO2, O3 concentrations) at a given place.

## Settings

- **Default Location** _(optional)_ - the location used when a tool is invoked without an explicit location.
- **OpenMeteo Api Key** _(optional, confidential)_ - a commercial Open-Meteo API key. When set, requests are routed to the commercial (`customer-*`) endpoints instead of the free ones.

## License

 © [Abletech S.r.l.](http://www.arxivar.it/)
