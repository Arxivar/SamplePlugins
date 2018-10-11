angular.module('arxivar.plugins').factory('RssFeedReader', ['PluginWidget', function(PluginWidget) {
  // MANDATORY settings in order for the plugin to work.
  var requiredSettings = {
    id: '04b086a6-48cd-480a-a55b-c5b2e4d48c4e', // Unique plugin identifier (type: string)
    name: 'RssFeedReader', // Plugin name. Spaces and dots not allowed (type: string)
    label: 'ARXivar Rss feed reader', // User Interface label (type: string)
    description: 'ARXivar Rss feed reader', // Plugin description (type: string)
    author: 'Abletech srl', // Plugin author (type: string)
    minVersion: '0.0.1', // Minimun portal version this plugin supports. (type: string, format example: 0.0.1)
	icon: 'fa fa-rss-square'
  };

  // OPTIONAL settings. These objects require the following properties: name, description, defaultValue and type.
  // Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
  var customSettings = [
    {name: 'feedUrl', description: 'Url rss feed', defaultValue: 'http://www.arxivar.it/azienda/news?format=feed&type=rss', type: 'string'},
    {name: 'feedTitle', description: 'Feed rss title', defaultValue: 'News from Able Tech', type: 'string'}
  ];

  // OPTIONAL settings for specific users. These objects require the following properties: name, description, defaultValue and type.
  // Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
  var userSettings = [
    //{name: '', description: '', defaultValue:'', type: 'string'},
  ];

  var myPlugin = new PluginWidget(requiredSettings, customSettings, userSettings);
  return { plugin: myPlugin };
}]);
