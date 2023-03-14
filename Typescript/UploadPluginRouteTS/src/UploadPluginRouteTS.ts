const routeFactory = (PluginRoute: IPluginRoute) => {
    // MANDATORY settings in order for the plugin to work.
	// MANDATORY settings in order for the plugin to work.
    const requiredSettings: IRequiredSettings = {
        id: '06a70066-13e5-46da-83d4-bd969f9f1e84', // Unique plugin identifier (type: string)
        name: 'UploadPluginRouteTS', // Plugin name. Spaces special characters not allowed (type: string)
        icon: 'fas fa-upload', 
        label: 'UploadPluginRouteTS', // User Interface label (type: string)
        description: 'An example plugin that upload pdf file', // Plugin description (type: string)
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
};

angular.module('arxivar.plugins').factory('UploadPluginRouteTS', ['PluginRoute',routeFactory ]);

export type routeType = ReturnType<typeof routeFactory>
