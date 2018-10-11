angular.module('arxivar.plugins').factory('CalendarWidget', ['PluginWidget', function(PluginWidget) {
    // MANDATORY settings in order for the plugin to work.
    var requiredSettings = {
        id: '416B979B-CD2B-4B71-A098-37FC6F0C4F25', // Unique plugin identifier (type: string)
        name: 'CalendarWidget', // Plugin name. Spaces and dots not allowed (type: string)
        label: 'Widget agenda del giorno', // User Interface label (type: string)
        description: 'Oggi', // Plugin description (type: string)
        author: 'Abletech srl', // Plugin author (type: string)
        minVersion: '0.0.1', // Minimun portal version this plugin supports. (type: string, format example: 0.0.1)
		icon: 'fa fa-calendar'
    };

    // OPTIONAL settings. These objects require the following properties: name, description, defaultValue and type.
    // Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
    var customSettings = [
      { name: 'nomeCampoUtente', description: 'Campo aggiuntivo utente appuntamento', defaultValue: 'COMBO28_24', type: 'string' },
      { name: 'nomeCampoDa', description: 'Campo aggiuntivo data inizio', defaultValue: 'DATA29_24', type: 'string' },
      { name: 'nomeCampoA', description: 'Campo aggiuntivo data fine', defaultValue: 'DATA30_24', type: 'string' },
      { name: 'nomeCampoDaOra', description: 'Campo aggiuntivo ora inizio', defaultValue: 'NUMERIC32_24', type: 'string' },
      { name: 'nomeCampoAOra', description: 'Campo aggiuntivo ora fine', defaultValue: 'NUMERIC33_24', type: 'string' },
      { name: 'nomeCampoNote', description: 'Campo aggiuntivo note appuntamento', defaultValue: 'TESTO31_24', type: 'string' },
      { name: 'classe', description: 'Classe calendari', defaultValue: '24', type: 'string' },
      // {name: 'test', description: 'Url rss test', defaultValue: 'test', type: 'string'}
    ];

    // OPTIONAL settings for specific users. These objects require the following properties: name, description, defaultValue and type.
    // Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
    var userSettings = [
      //{name: '', description: '', defaultValue:'', type: 'string'},
    ];

    var myPlugin = new PluginWidget(requiredSettings, customSettings, userSettings);
    return { plugin: myPlugin };
}]);
