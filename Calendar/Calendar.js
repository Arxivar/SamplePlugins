angular.module('arxivar.plugins').factory('Calendar', ['PluginRoute', function(PluginRoute) {
    // MANDATORY settings in order for the plugin to work.
    var requiredSettings = {
        id: 'f36c1b2e-02ed-4f95-b855-fe8b62655370', // Unique plugin identifier (type: string)
        name: 'Calendar', // Plugin name. Spaces and dots not allowed (type: string)
        label: 'Calendar', // User Interface label (type: string)
        description: 'Plugin demo for ARXivar calendar ', // Plugin description (type: string)
        author: 'Abletech srl', // Plugin author (type: string)
        minVersion: '0.0.1', // Minimun portal version this plugin supports. (type: string, format example: 0.0.1)
        icon: 'fas fa-calendar-day'
    };

    // OPTIONAL settings. These objects require the following properties: name, description, defaultValue and type.
    // Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
    var customSettings = [{
            name: 'nomeCampoUtente',
            description: 'Campo aggiuntivo utente appuntamento',
            defaultValue: 'COMBO28_24',
            type: 'string'
        },
        {
            name: 'nomeCampoDa',
            description: 'Campo aggiuntivo data inizio',
            defaultValue: 'DATA29_24',
            type: 'string'
        },
        {
            name: 'nomeCampoA',
            description: 'Campo aggiuntivo data fine',
            defaultValue: 'DATA30_24',
            type: 'string'
        },
        {
            name: 'nomeCampoDaOra',
            description: 'Campo aggiuntivo ora inizio',
            defaultValue: 'NUMERIC32_24',
            type: 'string'
        },
        {
            name: 'nomeCampoAOra',
            description: 'Campo aggiuntivo ora fine',
            defaultValue: 'NUMERIC33_24',
            type: 'string'
        },
        {
            name: 'nomeCampoNote',
            description: 'Campo aggiuntivo note appuntamento',
            defaultValue: 'TESTO31_24',
            type: 'string'
        },
        {
            name: 'classe',
            description: 'Classe calendari',
            defaultValue: '24',
            type: 'string'
        },
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
