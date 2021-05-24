[![Arxivar](http://portal.arxivar.it/download/resources/loghi/Logo-ARXivar_orizzontale-nero.png)](http://www.arxivar.it/)

# Send SystemId Command plugin

> Sample calendar conversion command implementation for ArxivarNext (this command send a systemId to a plugin route)

## Installation

* In order to install this plugin in ARXivar Next, just put the plugin folder (`SendSystemIdCommand`) in your plugin installation folder (e.g. `MyDrive:\Program Files (x86)\Able Tech S.r.l\ARXivarNext WebPortal\Scripts\plugins`)

_Note: this plugin is provided as a support for learning activities, it's not recommended its use in production environment. Use this as a 'draft' for creating your plugins._

_Note: Instructions for plugin creation can be found at [generator-arxivar-plugin](https://github.com/Arxivar/PluginGenerator/blob/master/README.md)._

## Plugin specification

This command plugin allows you to send a systemId to a plugin route.

Once you've added the plugin to your installation, you will need to configure it properly.

## Plugin configuration

From the main menu 
```sh
ARXivar Next -> Admin (accessible only to administrative users) -> Plugins manager
```

Enter in edit mode for `SendSystemIdCommand` plugin and set the plugin route id, then save the configuration.


## Adding the plugin to the profiles commands

In order to add the plugin to the profiles command list, just edit your command layout and add the `SendSystemIdCommand` item in the position you want 
_(the ToAppointment entry is shown below the plugin group)_, then save the layout.

## License

 © [Abletech S.r.l.](http://www.arxivar.it/)


