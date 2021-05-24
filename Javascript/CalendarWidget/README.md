[![Arxivar](http://portal.arxivar.it/download/resources/loghi/Logo-ARXivar_orizzontale-nero.png)](http://www.arxivar.it/)

# Calendar widget plugin

> Sample calendar widget implementation for ArxivarNext.

## Installation

* In order to install this plugin in ARXivar Next, just put the plugin folder (`CalendarWidget`) in your plugin installation folder (e.g. `MyDrive:\Program Files (x86)\Able Tech S.r.l\ARXivarNext WebPortal\Scripts\plugins`)

_Note: this plugin is provided as a support for learning activities, it's not recommended its use in production environment. Use this as a 'draft' for creating your plugins._

_Note: Instructions for plugin creation can be found at [generator-arxivar-plugin](https://github.com/Arxivar/PluginGenerator/blob/master/README.md)._

## Plugin specification

This widget plugin adds the `today` view capability to ARXivar Next modular desktop system.

Once you've added the plugin to your installation, you will need to configure it properly.

## ARXivar configuration

> :exclamation: **This configuration part is common with Calendar and CalendarCommand plugin. Therefore, if you have already configured one of these plugins skip this section**


The Calendar widget plugin requires the creation of a specific DocumentType class on the first level of DocumentTypes ARXivar tree. You will need to set the DocumentType's identifier in the plugin's configuration.

_(The class name is not important)_

This document class will need the following additional fields

  - User, texbox (will contain the user id of the calendar appointment owner)
  - ByDate, databox (will contain the date of appointment begins)
  - ToDate, databox (will contain the date of appointment ends)
  - FromTime, numeric (will contain the time the appointment begins)
  - ToTime, numeric (will contain the time the appointment ends)
  - Notes, texbox (will contain any appointment notes)

> We recommend the use of a combobox for the user field. This combobox should be configured for
Show ARXivar internal users through query.
Set the users code on the field value.

## Plugin configuration

Once you've created and configured calendars documents class, you will need to edit the plugin properties.
From the main menu 
```sh
ARXivar Next -> Admin (accessible only to administrative users) -> Plugins manager
```

Enter in edit for `CalendarWidget` plugin and set all the values for the settings that the plugin requires (the document class is the id of the class or its `TIPO1`), then save the configuration.

## Adding the plugin to a desktop

In order to add the plugin to a desktop, just edit your desktop and add the new widget `Oggi`. Set the position and size you want. 
_(the `Oggi` entry is displayed along with all the preexisting widgets), then save the layout._

If you need add the desktop to the menu layout of the users.

## License

 © [Abletech S.r.l.](http://www.arxivar.it/)


