angular.module('arxivar.plugins')
    .factory('DueDateOneMonthProfilation', ['$q', '$uibModal', 'PluginProfilation', '$timeout', '_', 'moment', function ($q, $uibModal, PluginProfilation, $timeout, _, moment) {
        //DueDateOneMonthProfilationPluginCommand
        // MANDATORY settings in order for the plugin to work.
        var requiredSettings = {
            id: '086ef2a8-99de-4360-83b4-8c867a10b312', // Unique plugin identifier (type: string)
            name: 'DueDateOneMonthProfilation', // Plugin name. Spaces and dots not allowed (type: string)
            label: 'SetDueDate', // User Interface label (type: string)
            description: 'Command to set DueDate', // Plugin description (type: string)
            author: 'Abletech srl', // Plugin author (type: string)
            minVersion: '2.2.0', // Minimun portal version this plugin supports. (type: string, format example: 0.0.1)
            icon: 'fas fa-calendar-day'
        };

        var customSettings = [];
        var userSettings = [];

        var myPlugin = new PluginProfilation(requiredSettings, customSettings, userSettings);
        myPlugin.canRun = function (params) {
            return params.hasOwnProperty('fields') ? $q.when(params.fields !== undefined) : $q.resolve(false);
        };
        myPlugin.run = function (params) {
            var thisPlugin = myPlugin;
            return myPlugin.canRun(params).then(function (canRun) {
                var field = _.find(params.fields, function (f) {
                    return f.name.toLowerCase() === 'scadenza';
                });
                var currentExpire = moment();
                if (field && field.value) {
                    currentExpire = moment(field.value);
                }
                field.value = currentExpire.add(1, 'month').toISOString(true);
                return [field];
            });
        };


        return {
            plugin: myPlugin
        };
    }]);