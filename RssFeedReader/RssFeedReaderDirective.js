angular.module('arxivar.plugins.directives').directive('rssfeedreaderdirective', ['$http', '$interval', '$log', '$state', 'RssFeedReader', 'pluginService', '_', 'feedService', 'clientSettingsService', 'moment', 
  function($http, $interval, $log, $state, RssFeedReader, pluginService, _, feedService, clientSettingsService, moment) {
    return {
      restrict: 'E',
      scope: {
        instanceId: '@',
        desktopId: '=?'
      },
      templateUrl: 'Scripts/plugins/RssFeedReader/RssFeedReader.html',
      link: function(scope, element) {
        var $mainContainer = $(element).find('div.arx-arxivarinfo');
        if ($mainContainer.length > 0) {
          $mainContainer.addClass(scope.instanceId);
        }

        scope.showConfig = ($state.current && $state.current.name === 'desktopConfigurator');

        var setUserSettings = function() {
          var userSettings = {
            settings: [{ name: 'feedUrl', value: scope.feedUrl }]
          };
          clientSettingsService.setWidgetSettings(RssFeedReader.plugin.id, scope.instanceId, scope.desktopId, userSettings);
        };

        var loadFeeds = function() {
          scope.isLoading = true;
          feedService.parseFeeds(scope.feedUrl)
            .then(function(items) {              
                // scope.feedItems = response.responseData.feed.entries;
                scope.feedItems = items;
				_.forEach(items, function(item){
					item.formattedPubDate = item.pubDate;
					var valueDate = moment(new Date(item.pubDate));
					if (valueDate.isValid()) {
						item.formattedPubDate = valueDate.format('L LTS');
					}
				});

                if (items && items.length > 0) {
                  //se la chiamata va a buon fine salvo i settings
                  setUserSettings();
                }              
            }).error(function(error) {
              $log.error(error);
            }).then(function() {
              scope.isLoading = false;
            });
          return;
        };

        scope.loadFeeds = loadFeeds;

        var refreshFeeds = function() {
          $interval(function() {
            loadFeeds();
          }, 60000);
        };


        var init = function() {
          scope.feedTitle = RssFeedReader.plugin.customSettings[1].value;
          if (!_.isNil(scope.desktopId) && !_.isNil(scope.instanceId)) {
            clientSettingsService.getWidgetSettings(RssFeedReader.plugin.id, scope.instanceId, scope.desktopId).then(function(settings) {
              if (settings && settings.settings) {
                scope.feedUrl = _.find(settings.settings, { 'name': 'feedUrl' }).value;
              }
              loadFeeds();
              refreshFeeds();
            }).catch(function() {
              scope.feedUrl = RssFeedReader.plugin.customSettings[0].value;
              loadFeeds();
              refreshFeeds();
            });
          };


        };
        init();
      }
    };
  }
]);

angular.module('arxivar.plugins').factory('feedService', ['$http', '$q', function($http, $q) {
	var jQueryScript = document.createElement('script');
	jQueryScript.setAttribute('src','https://cdn.jsdelivr.net/npm/rss-parser@3.1.2/dist/rss-parser.min.js');
	document.head.appendChild(jQueryScript);

	var _parseFeeds = function(url) {		
		var CORS_PROXY = "https://cors-anywhere.herokuapp.com/"
		var parser = new RSSParser();
		var defer = $q.defer()
		parser.parseURL(CORS_PROXY + url, function(err, feed) {
		  defer.resolve(feed.items);		
		})
		return defer.promise;
	};
	return {
	  parseFeeds: _parseFeeds
	};
  }]);
