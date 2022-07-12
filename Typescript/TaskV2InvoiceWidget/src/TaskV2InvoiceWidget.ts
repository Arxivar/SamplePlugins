const widgetFactory = (PluginWidgetTaskV2: IPluginTaskV2) => {
  // MANDATORY settings in order for the plugin to work.
  const requiredSettings: IRequiredSettings = {
    id: '775ac369-e101-4e35-b0b3-ba4f4447d639', // Unique plugin identifier (type: string)
    name: 'TaskV2InvoiceWidget', // Plugin name. Spaces special characters not allowed (type: string)
    icon: 'fa fa-bookmark',
    label: 'TaskV2InvoiceWidget label', // User Interface label (type: string)
    description: 'Task V2 Invoice Widget', // Plugin description (type: string)
    author: 'Able Tech', // Plugin author (type: string)
    minVersion: '2.7.0', // Minimun portal version this plugin supports. (type: string, format example: 0.0.1)
    useTypescript: true // If this plugin use typescript compiler (type boolean. Default: false)
  };

  // OPTIONAL settings. These objects require the following properties: name, description, defaultValue and type.
  // Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
  const customSettings: ICustomSettings[] = [{
    name: 'Ragione_sociale_field',
    description: 'Ragione_sociale',
    defaultValue: 'Ragione_sociale',
    type: 'string'
  },
  {
    name: 'Indirizzo_field',
    description: 'Indirizzo',
    defaultValue: 'Indirizzo',
    type: 'string'
  },
  {
    name: 'Numero_fattura_field',
    description: 'Numero_fattura',
    defaultValue: 'Numero_fattura',
    type: 'string'
  },
  {
    name: 'Importo_field',
    description: 'Importo',
    defaultValue: 'Importo',
    type: 'string'
  },
  {
    name: 'Data_fattura_field',
    description: 'Data_fattura',
    defaultValue: 'Data_fattura',
    type: 'string'
  },
  {
    name: 'Data_scadenza_field',
    description: 'Data_scadenza',
    defaultValue: 'Data_scadenza',
    type: 'string'
  }
  ];

  // OPTIONAL settings for specific users. These objects require the following properties: name, description, defaultValue and type.
  // Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
  const userSettings: IUserSettings[] = [
    //{name: '', description: '', defaultValue:'', type: 'string'},
  ];

  // OPTIONAL settings for specific users. These objects require the following properties: name, description, defaultValue and type.
  // Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
  const widgetSettings: IWidgetSettings[] = [
    //{name: '', description: '', defaultValue:'', type: 'string'},
    { name: 'hideMap', description: 'Nascondi mappa', defaultValue: false, type: 'boolean' }
  ];

  const myPlugin = new PluginWidgetTaskV2(requiredSettings, customSettings, userSettings, widgetSettings);
  return { plugin: myPlugin };
};

angular.module('arxivar.plugins').factory('TaskV2InvoiceWidget', ['PluginWidgetTaskV2', widgetFactory]);

export type widgetType = ReturnType<typeof widgetFactory>
