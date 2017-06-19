angular.module('arxivar.plugins').factory('TaskInvoiceWidget', ['PluginWidgetTask', 'taskVariablesService',
	function(PluginWidgetTask, taskVariablesService) {
		// MANDATORY settings in order for the plugin to work.
		var requiredSettings = {
			id: '90ae4e77-5c02-4614-bf98-291897a4e39c', // Unique plugin identifier (type: string)
			name: 'TaskInvoiceWidget', // Plugin name. Spaces and dots not allowed (type: string)
			label: 'TaskInvoiceWidget label', // User Interface label (type: string)
			description: 'Task Invoice Widget', // Plugin description (type: string)
			author: 'Able Tech', // Plugin author (type: string)
			minVersion: '0.0.1' // Minimun portal version this plugin supports. (type: string, format example: 0.0.1)
		};

		// OPTIONAL settings. These objects require the following properties: name, description, defaultValue and type.
		// Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
		var customSettings = [
			{ name: 'Ragione_sociale_field', description: 'Ragione_sociale', defaultValue: 'Ragione_sociale', type: 'string' },
			{ name: 'Indirizzo_field', description: 'Indirizzo', defaultValue: 'Indirizzo', type: 'string' },
			{ name: 'Numero_fattura_field', description: 'Numero_fattura', defaultValue: 'Numero_fattura', type: 'string' },
			{ name: 'Importo_field', description: 'Importo', defaultValue: 'Importo', type: 'string' },
			{ name: 'Data_fattura_field', description: 'Data_fattura', defaultValue: 'Data_fattura', type: 'string' },
			{ name: 'Data_scadenza_field', description: 'Data_scadenza', defaultValue: 'Data_scadenza', type: 'string' },
		];

		// OPTIONAL settings for specific users. These objects require the following properties: name, description, defaultValue and type.
		// Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
		var userSettings = [

		];

		var myPlugin = new PluginWidgetTask(requiredSettings, customSettings, userSettings);
		return { plugin: myPlugin };
	}]);
