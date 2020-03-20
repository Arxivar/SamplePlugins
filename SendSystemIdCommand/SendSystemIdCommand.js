angular.module('arxivar.plugins').factory('SendSystemIdCommand', [
    '$q', '$uibModal', 'arxivarRouteService', 'PluginCommand',
    function ($q, $uibModal, arxivarRouteService, PluginCommand) {

        // MANDATORY settings in order for the plugin to work.
        var requiredSettings = {
            id: '086ef2a8-99de-4360-83b5-8c867a10b345', // Unique plugin identifier (type: string)
            name: 'SendSystemIdCommand', // Plugin name. Spaces and dots not allowed (type: string)
            label: 'SendSystemId', // User Interface label (type: string)
            description: 'Command for send a systemId to a plugin route', // Plugin description (type: string)
            author: 'Abletech srl', // Plugin author (type: string)
            minVersion: '2.2.0', // Minimun portal version this plugin supports. (type: string, format example: 0.0.1)
            requireRefresh: false, // If this plugin requires grid data refresh (type boolean. Default: false)
            icon: 'fas fa-arrow-square-right'
        };

        // OPTIONAL settings. These objects require the following properties: name, description, defaultValue and type.
        // Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
        var customSettings = [{
            name: 'pluginRouteId',
            description: 'Plugin route id',
            defaultValue: '727f21b1-4247-4f3e-bc11-40fb6fb51f90',
            type: 'string'
        }];

        // OPTIONAL settings for specific users. These objects require the following properties: name, description, defaultValue and type.
        // Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
        var userSettings = [];

        var myPlugin = new PluginCommand(requiredSettings, customSettings, userSettings);

        // This function is a promise with asyncronous logic to determine if this plugin can run. Input parameters: array of docnumbers.
        myPlugin.canRun = function (params) {
            return params.hasOwnProperty('docnumbers') ? $q.when(params.docnumbers.length >= 1) : $q.resolve(false);
        };

        // This function is a promise with asyncronous run logic. Input parameters: array of docnumbers.
        myPlugin.run = function (params) {
            var thisPlugin = myPlugin;
            myPlugin.canRun(params).then(function (canRun) {
                if (canRun) {
                    var pluginId = thisPlugin.customSettings[0].value;
                    var docnumber = params.docnumbers[0];
                    var url = arxivarRouteService.getURLPluginRoute(pluginId);
                    window.location.href = url + '?queryParams=' + docnumber;
                }
            });
        };


        return {
            plugin: myPlugin
        };
    }
]);