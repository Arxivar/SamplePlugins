angular.module('arxivar.plugins.directives').directive('meteowidgetdirective', [
    'MeteoWidget', 'pluginService', '_',
    function(MeteoWidget, pluginService, _) {
        return {
            restrict: 'E',
            scope: {
                instanceId: '@',
                desktopId: '=?'
            },
            templateUrl: 'Scripts/plugins/MeteoWidget/MeteoWidget.html',
            link: function(scope, element) {
                var $mainContainer = $(element).find('div.arx-' + MeteoWidget.plugin.name.toLowerCase());
                if ($mainContainer.length > 0) {
                    $mainContainer.addClass(scope.instanceId);
                }
                var searchWeather = function(city) {
                    if ($(element.find('.weather-temperature')).openWeather === undefined) {
                        setTimeout(function() {
                            searchWeather(city);
                        }, 1000);
                        return;
                    }

                    $(element.find('.weather-temperature')).openWeather({
                        key: 'bad12547ee402ec2989c3b890d292c18',
                        city: encodeURIComponent(city),
                        descriptionTarget: $mainContainer.find('.weather-description'),
                        windSpeedTarget: $mainContainer.find('.weather-wind-speed'),
                        minTemperatureTarget: $mainContainer.find('.weather-min-temperature'),
                        maxTemperatureTarget: $mainContainer.find('.weather-max-temperature'),
                        humidityTarget: $mainContainer.find('.weather-humidity'),
                        sunriseTarget: $mainContainer.find('.weather-sunrise'),
                        sunsetTarget: $mainContainer.find('.weather-sunset'),
                        placeTarget: $mainContainer.find('.weather-place'),
                        iconTarget: $mainContainer.find('.weather-icon'),
                        success: function() {
                            $('.weather-wrapper').removeClass('hide');
                        },
                        error: function(err) {
                            console.log('Problems calling openWeather api', err);
                        }
                    });
                };

                var setUserSettings = function() {
                    pluginService.setPluginByUser({
                        pluginId: MeteoWidget.plugin.id,
                        desktopId: scope.desktopId,
                        instanceId: scope.instanceId
                    }, [{
                            name: 'citta',
                            value: scope.selectedCity
                        },
                        {
                            name: 'selectedColor',
                            value: scope.selectedColor
                        },
                    ]);
                };

                var setColor = function(color) {
                    $mainContainer.find('.weather-wrapper').css('backgroundColor', color);
                    setUserSettings();
                };

                scope.showMeteo = function() {
                    if (scope.selectedCity) {
                        searchWeather(scope.selectedCity);
                        setUserSettings();
                    }
                };

                scope.colors = [{
                        name: 'blue',
                        value: 'skyblue'
                    },
                    {
                        name: 'orange',
                        value: '#F6981E'
                    },
                    {
                        name: 'green',
                        value: '#7BB77B'
                    },
                ];

                scope.selectColor = function(color) {
                    scope.selectedColor = color.value;
                    setColor(color.value);
                };


                var init = function() {

                    pluginService.getPluginByUser({
                        pluginId: MeteoWidget.plugin.id,
                        desktopId: scope.desktopId,
                        instanceId: scope.instanceId
                    }).then(function(settings) {
                        if (_.isNil(settings) || _.isNil(settings.userSettings)) {
                            scope.selectedCity = 'Montichiari';
                            scope.selectedColor = scope.colors[0].value;
                        } else {
                            scope.selectedCity = _.some(settings.userSettings, {
                                name: 'citta'
                            }) ? _.find(settings.userSettings, {
                                name: 'citta'
                            }).value : 'Montichiari';
                            scope.selectedColor = _.some(settings.userSettings, {
                                name: 'selectedColor'
                            }) ? _.find(settings.userSettings, {
                                name: 'selectedColor'
                            }).value : scope.colors[0].value;
                        }
                        searchWeather(scope.selectedCity);
                        setColor(scope.selectedColor);
                    });
                };
                init();

            }
        };
    }
]);
