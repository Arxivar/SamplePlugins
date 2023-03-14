const routeFactory = (PluginRoute: IPluginRoute) => {
    // MANDATORY settings in order for the plugin to work.
	// MANDATORY settings in order for the plugin to work.
    const requiredSettings: IRequiredSettings = {
        id: '90380b34-9438-4e23-bc6f-e72f374cccd1', // Unique plugin identifier (type: string)
        name: 'ObjectClonerTS', // Plugin name. Spaces special characters not allowed (type: string)
        icon: 'fas fa-clone', 
        label: 'ObjectClonerTS', // User Interface label (type: string)
        description: 'Clona viste, modelli e report', // Plugin description (type: string)
        author: 'Abletech srl', // Plugin author (type: string)
        minVersion: '2.6.0', // Minimun portal version this plugin supports. (type: string, format example: 0.0.1)
		useTypescript: true // If this plugin use typescript compiler (type boolean. Default: false) 
    };

    // OPTIONAL settings. These objects require the following properties: name, description, defaultValue and type.
    // Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
    // OPTIONAL settings. These objects require the following properties: name, description, defaultValue and type.
  // Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
	const customSettings: ICustomSettings[] = [
	//{name: '', description: '', defaultValue:'', type: 'string'},
	];

    // OPTIONAL settings for specific users. These objects require the following properties: name, description, defaultValue and type.
    // Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
	// OPTIONAL settings for specific users. These objects require the following properties: name, description, defaultValue and type.
  // Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
   const userSettings: IUserSettings[] = [
        //{name: '', description: '', defaultValue:'', type: 'string'},
    ];

    const myPlugin = new PluginRoute(requiredSettings, customSettings, userSettings);
    return { plugin: myPlugin };
}

angular.module('arxivar.plugins').factory('ObjectClonerTS', ['PluginRoute',routeFactory ]);

export type routeType = ReturnType<typeof routeFactory>
