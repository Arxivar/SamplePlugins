const widgetFactory = (PluginWidgetTaskV2: IPluginTaskV2) => {
  // MANDATORY settings in order for the plugin to work.
  const requiredSettings: IRequiredSettings = {
    id: '46ed73c1-7730-4532-af1f-f7f8780afe69', // Unique plugin identifier (type: string)
    name: 'DynamicTitle', // Plugin name. Spaces special characters not allowed (type: string)
    icon: 'fas fa-flag',
    label: 'Dynamic Title', // User Interface label (type: string)
    description: 'Dynamically updates the Task V2 title by user Language', // Plugin description (type: string)
    author: 'Abletech', // Plugin author (type: string)
    minVersion: '2.10.0', // Minimun portal version this plugin supports. (type: string, format example: 0.0.1)
    useTypescript: true // If this plugin use typescript compiler (type boolean. Default: false) 
  };

  // OPTIONAL settings. These objects require the following properties: name, description, defaultValue and type.
  // Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
  const customSettings: ICustomSettings[] = [
    //{name: '', description: '', defaultValue:'', type: 'string'},
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
  ];

  const myPlugin = new PluginWidgetTaskV2(requiredSettings, customSettings, userSettings, widgetSettings);
  return { plugin: myPlugin };
};

angular.module('arxivar.plugins').factory('DynamicTitle', ['PluginWidgetTaskV2', widgetFactory]);

export type widgetType = ReturnType<typeof widgetFactory>
