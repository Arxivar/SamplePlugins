angular.module('arxivar.plugins.directives').directive('meteowidgetdirective', [
    'MeteoWidget', 'pluginService', '_', 'arxivarNotifierService', '$timeout',
    function (MeteoWidget, pluginService, _, arxivarNotifierService, $timeout) {
        return {
            restrict: 'E',
            scope: {
                instanceId: '@',
                desktopId: '=?'
            },
            templateUrl: 'Scripts/plugins/MeteoWidget/MeteoWidget.html',
            link: function (scope, element) {
                const $mainContainer = $(element).find('div.arx-' + MeteoWidget.plugin.name.toLowerCase());
                if ($mainContainer.length > 0) {
                    $mainContainer.addClass(scope.instanceId);
                }

                scope.isThemeLight = document.body.classList.contains('theme-light');

                const searchWeather = function (city) {
                    if ($(element.find('.weather-temperature')).openWeather === undefined) {
                        setTimeout(function () {
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
                        success: function () {
                            $('.weather-wrapper').removeClass('hide');
                        },
                        error: function (err) {
                            console.log('Problems calling openWeather api', err);
                        }
                    });
                };

                const setUserSettings = function () {
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


                const Http = new XMLHttpRequest();
                function getApi(url) {
                    Http.open('GET', url);
                    Http.send();
                    Http.onreadystatechange = function () {
                        if (this.readyState === 4 && this.status === 200) {
                            console.log(JSON.parse(this.response));
                            const parsed = JSON.parse(this.response);
                            $timeout(() => {
                                scope.selectedCity = parsed.locality;
                            });
                        }
                    };
                }

                scope.getPosition = function () {

                    if (!navigator.geolocation) {
                        arxivarNotifierService.notifyError('Geolocalizzazione non supportata o disabilitata dal browser corrente');
                    } else {
                        navigator.geolocation.getCurrentPosition((position) => {
                            //console.log('long: ' + position.coords.longitude,'lat: ' + position.coords.latitude);
                            const revPosition = 'https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + position.coords.latitude + '&longitude=' + position.coords.longitude;
                            getApi(revPosition);
                        }
                        );
                    }
                };

                const setColor = function (color) {
                    $mainContainer.find('.weather-wrapper').css('backgroundColor', color);
                    setUserSettings();
                };

                scope.showMeteo = function () {
                    if (scope.selectedCity) {
                        searchWeather(scope.selectedCity);
                        setUserSettings();
                        MeteoWidget.plugin.setTitle({
                            id: MeteoWidget.plugin.id,
                            instanceId: scope.instanceId,
                            title: 'Meteo ' + scope.selectedCity
                        });
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

                scope.selectColor = function (color) {
                    scope.selectedColor = color.value;
                    setColor(color.value);
                };


                const init = function () {

                    pluginService.getPluginByUser({
                        pluginId: MeteoWidget.plugin.id,
                        desktopId: scope.desktopId,
                        instanceId: scope.instanceId
                    }).then(function (settings) {
                        if (_.isNil(settings) || _.isNil(settings.userSettings)) {
                            scope.selectedCity = 'Milano';

                            scope.selectedColor = scope.colors[0].value;
                        } else {
                            scope.selectedCity = _.some(settings.userSettings, {
                                name: 'citta'
                            }) ? _.find(settings.userSettings, {
                                name: 'citta'
                            }).value : 'Milano';
                            scope.selectedColor = _.some(settings.userSettings, {
                                name: 'selectedColor'
                            }) ? _.find(settings.userSettings, {
                                name: 'selectedColor'
                            }).value : scope.colors[0].value;
                        }


                        searchWeather(scope.selectedCity);
                        setColor(scope.selectedColor);

                        MeteoWidget.plugin.setTitle({
                            id: MeteoWidget.plugin.id,
                            instanceId: scope.instanceId,
                            title: 'Meteo ' + scope.selectedCity
                        });
                    });
                };
                init();

            }
        };
    }
]);
