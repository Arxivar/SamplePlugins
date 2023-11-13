angular.module('arxivar.plugins.directives').directive('rssfeedreaderdirective', [
    '$interval', '$log', '$state', 'RssFeedReader', 'pluginService', '_', 'feedService', 'moment', 'arxivarNotifierService',
    function ($interval, $log, $state, RssFeedReader, pluginService, _, feedService, moment, arxivarNotifierService) {
        return {
            restrict: 'E',
            scope: {
                instanceId: '@',
                desktopId: '=?'
            },
            templateUrl: 'Scripts/plugins/RssFeedReader/RssFeedReader.html',
            link: function (scope, element) {
                const $mainContainer = $(element).find('div.arx-arxivarinfo');
                if ($mainContainer.length > 0) {
                    $mainContainer.addClass(scope.instanceId);
                }

                scope.showConfig = true;

                const setUserSettings = function () {
                    const settings = [{
                        name: 'feedUrl',
                        value: scope.feedUrl
                    }];

                    const instanceobj = {
                        pluginId: RssFeedReader.plugin.id,
                        desktopId: scope.desktopId,
                        instanceId: scope.instanceId
                    };
                    if ($state.current && $state.current.name === 'desktopConfigurator') {
                        //Save the settings of this instance for all users
                        pluginService.saveSettings('global', instanceobj, settings);
                    } else {
                        //Save the settings of this instance for me
                        pluginService.saveSettings('user', instanceobj, settings);
                    }
                };

                const loadFeeds = function () {
                    scope.isLoading = true;
                    feedService.parseFeeds(scope.feedUrl)
                        .then(function (items) {
                            // scope.feedItems = response.responseData.feed.entries;
                            scope.feedItems = items;
                            _.forEach(items, function (item) {
                                item.formattedPubDate = item.pubDate;
                                const valueDate = moment(new Date(item.pubDate));
                                if (valueDate.isValid()) {
                                    item.formattedPubDate = valueDate.format('L LTS');
                                }
                            });

                            if (items && items.length > 0) {
                                //se la chiamata va a buon fine salvo i settings
                                setUserSettings();
                            }
                            scope.isLoading = false;
                        }).catch(function (error) {
                            $log.error(error);
                            scope.isLoading = false;
                        });
                    return;
                };

                scope.loadFeeds = loadFeeds;

                scope.resetUrl = function () {
                    scope.feedUrl = '';
                    scope.feedItems = '';
                    arxivarNotifierService.notifyInfo('Hai eliminato l\'url del feed');
                };

                scope.restoreDefault = function () {
                    scope.feedUrl = 'https://www.ansa.it/sito/ansait_rss.xml';
                };

                const refreshFeeds = function () {
                    $interval(function () {
                        loadFeeds();
                    }, 60000);
                };


                const init = function () {
                    const setFeedUrl = function (settings) {
                        if (settings) {
                            scope.feedUrl = _.find(settings, {
                                'name': 'feedUrl'
                            }).value;
                        } else {
                            scope.feedUrl = 'https://www.ansa.it/sito/ansait_rss.xml';
                        }
                        loadFeeds();
                        refreshFeeds();
                    };
                    scope.feedTitle = RssFeedReader.plugin.customSettings[1].value;
                    if (!_.isNil(scope.desktopId) && !_.isNil(scope.instanceId)) {
                        const instanceobj = {
                            pluginId: RssFeedReader.plugin.id,
                            desktopId: scope.desktopId,
                            instanceId: scope.instanceId
                        };
                        //Get settings of this instance for me
                        pluginService.getSettings('user', instanceobj)
                            .then(function (settings) {
                                setFeedUrl(settings);
                            }).catch(function () {
                                //Get settings of this instance for all
                                pluginService.getSettings('global', instanceobj)
                                    .then(function (settings) {
                                        setFeedUrl(settings);
                                    }).catch(function () {
                                        //Get settings of plugin for all
                                        pluginService.getSettings('global', {
                                            pluginId: RssFeedReader.plugin.id
                                        })
                                            .then(function (settings) {
                                                setFeedUrl(settings);
                                            });
                                    });

                            });
                    }


                };
                init();
            }
        };
    }
]);

angular.module('arxivar.plugins').factory('feedService',
    ['$q',
        function ($q) {
            const jQueryScript = document.createElement('script');
            jQueryScript.setAttribute('src', 'https://cdn.jsdelivr.net/npm/rss-parser@3.1.2/dist/rss-parser.min.js');
            document.head.appendChild(jQueryScript);

            const _parseFeeds = function (url) {
                const CORS_PROXY = 'https://thingproxy.freeboard.io/fetch/';
                const parser = new RSSParser();
                const defer = $q.defer();
                parser.parseURL(CORS_PROXY + url, function (err, feed) {
                    defer.resolve(feed.items);
                    if (err) { throw err; }
                });
                return defer.promise;
            };
            return {
                parseFeeds: _parseFeeds
            };
        }
    ]);

