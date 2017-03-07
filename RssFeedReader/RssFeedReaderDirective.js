angular.module('arxivar.plugins.directives').directive('rssfeedreaderdirective', ['$http','$interval','$log','$state','RssFeedReader', 'pluginService','_','feedService','clientSettingsService',
function($http,$interval,$log, $state, RssFeedReader, pluginService,_,feedService, clientSettingsService) {
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
        clientSettingsService.setWidgetSettings(RssFeedReader.plugin.id, scope.instanceId, scope.desktopId,  userSettings);
      };

      var loadFeeds = function(saveUrl) {
          scope.isLoading = true;
          feedService.parseFeeds(scope.feedUrl)
          .success(function(response) {
//            scope.feedItems = response.responseData.feed.entries;
			  scope.feedItems = response.query.results.rss.channel.item;

            if (saveUrl) {
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
          loadFeeds(false);
        }, 60000);
      };


      var init = function() {
        scope.feedTitle = RssFeedReader.plugin.customSettings[1].value;
        if (scope.desktopId && scope.instanceId) {
          clientSettingsService.getWidgetSettings(RssFeedReader.plugin.id, scope.instanceId, scope.desktopId).then(function(settings) {
            if (settings && settings.settings) {
              scope.feedUrl = _.find(settings.settings, {'name': 'feedUrl'}).value;
            }
            loadFeeds(false);
            refreshFeeds();
          }).catch(function() {
            scope.feedUrl = RssFeedReader.plugin.customSettings[0].value;
            loadFeeds(false);
            refreshFeeds();
          });
        };


      };
      init();
    }
  };
}]);

angular.module('arxivar.plugins').factory('feedService',['$http',function($http) {
  var _parseFeeds = function(url) {
    return $http.jsonp('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%20%3D%20\'' + encodeURIComponent(url) + '\'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=JSON_CALLBACK');
  };
  return {
    parseFeeds: _parseFeeds
  };
}
]);
