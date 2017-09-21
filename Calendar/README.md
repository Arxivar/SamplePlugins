[![Arxivar](http://www.arxivar.it/download/resources/loghi/Logo-ARXivar_orizzontale-nero.png)](http://www.arxivar.it/)

# Calendar route plugin

> Sample calendar implementation for ArxivarNext

## Installation

* In order to install this plugin in ARXivar Next, just put the plugin folder (`Calendar`) in your plugin installation folder (e.g. `MyDrive:\Program Files (x86)\Able Tech S.r.l\ARXivarNext WebPortal\Scripts\plugins`)

_Note: this plugin is provided as a support for learning activities, it's not recommended its use in production environment. Use this as a 'draft' for creating your plugins._

_Note: Instruction for plugin creation can be found at [generator-arxivar-plugin](https://github.com/Arxivar/PluginGenerator/blob/master/README.md)._

## Plugin specification

This plugin allows you to view some ARXivar profiles contained in a properly configured DocumentType in a 'Calendar like' view.

Once you add the plugin to your installation you need to configure it appropriately.

## ARXivar configuration

The Calendar plugin requires the creation of a specific DocumentType class on the first level of DocumentTypes' ARXivar tree. You will need to set the DocumentType's identifier in the plugin's configuration.

_(The class name is not important)_

This document class will need the following additional fields

  - User, texbox (will contain the user id of the calendar appointment owner)
  - ByDate, databox (will contain the starting date of the appointment)
  - ToDate, databox (will contain the ending date of the appointment)
  - FromTime, numeric (will contain the starting time of the appointment)
  - ToTime, numeric (will contain the ending time of the appointment)
  - Notes, texbox (will contain any appointment notes)

> We recommend the use of a combobox for the user field. This combobox should be configured for
Show ARXivar internal users through query.
Set the users code on the field value.

## Plugin configuration

Once created and configured calendars documents class will need to edit the plugin properties.
From the main menu 
```sh
ARXivar Next -> Admin (accessible only to administrative users) -> Plugins manager
```

Enter in edit for `Calendar` plugin and set all the values for the settings required by the plugin (the document class is the id of the class or its `TIPO1`), then save the configuration.

## Adding the plugin to the menu

If you want to add the plugin to the main menu, simply edit your menu layout, add the `Calendar` item in the position you want 
_(the Calendar entry is shown below the plugin group)_, then save the layout.

## License

 © [Abletech S.r.l.](http://www.arxivar.it/)


