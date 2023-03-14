angular.module('arxivar.plugins').factory('ObjectCloner', ['PluginRoute', function (PluginRoute) {
    // MANDATORY settings in order for the plugin to work.
    var requiredSettings = {
        id: '545a26db-97a5-4494-9625-414209c50d99', // Unique plugin identifier (type: string)
        name: 'ObjectCloner', // Plugin name. Spaces special characters not allowed (type: string)
        icon: 'fas fa-clone', 
        label: 'ObjectCloner', // User Interface label (type: string)
        description: 'Clona viste,modelli e report', // Plugin description (type: string)
        author: 'Abletech srl', // Plugin author (type: string)
        minVersion: '2.6.0' // Minimun portal version this plugin supports. (type: string, format example: 0.0.1)
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
	
    var myPlugin = new PluginRoute(requiredSettings, customSettings, userSettings);
    return { plugin: myPlugin };
}]);
