angular.module('arxivar.plugins').factory('ShowParamsPluginRoute', ['PluginRoute', function (PluginRoute) {
    // MANDATORY settings in order for the plugin to work.
    var requiredSettings = {
        id: '727f21b1-4247-4f3e-bc11-40fb6fb51f90', // Unique plugin identifier (type: string)
        name: 'ShowParamsPluginRoute', // Plugin name. Spaces special characters not allowed (type: string)
        label: 'ShowParams', // User Interface label (type: string)
        description: 'ShowParamsPluginRoute description', // Plugin description (type: string)
        author: 'Abletech', // Plugin author (type: string)
        minVersion: '2.0.0', // Minimun portal version this plugin supports. (type: string, format example: 0.0.1)
        icon: 'fas fa-align-justify'
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
    return {
        plugin: myPlugin
    };
}]);