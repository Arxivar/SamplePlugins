angular.module('arxivar.plugins').factory('MeteoWidget', ['PluginWidget', function(PluginWidget) {
    // MANDATORY settings in order for the plugin to work.
    var requiredSettings = {
        id: '95643900-663d-4a8a-8278-68227457f5bc', // Unique plugin identifier (type: string)
        name: 'MeteoWidget', // Plugin name. Spaces and dots not allowed (type: string)
        label: 'Meteo informations', // User Interface label (type: string)
        description: 'Meteo informations widget', // Plugin description (type: string)
        author: 'Abletech srl', // Plugin author (type: string)
        minVersion: '0.0.1', // Minimun portal version this plugin supports. (type: string, format example: 0.0.1)
		icon: 'fa fa-sun'
	};

    // OPTIONAL settings. These objects require the following properties: name, description, defaultValue and type.
  // Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
	var customSettings = [
	//{name: '', description: '', defaultValue:'', type: 'string'},
	];

    // OPTIONAL settings for specific users. These objects require the following properties: name, description, defaultValue and type.
  // Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
	var userSettings = [
	//{name: '', description: '', defaultValue:'', type: 'string'},
	];

    var myPlugin = new PluginWidget(requiredSettings, customSettings, userSettings);
    return { plugin: myPlugin };
}]);
