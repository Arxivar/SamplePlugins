[![Arxivar](http://portal.arxivar.it/download/resources/loghi/Logo-ARXivar_orizzontale-nero.png)](http://www.arxivar.it/)

# TaskV2 invoice  widget plugin

> Task V2 invoice widget implementation for ArxivarNext.

## Installation

- install [NodeJs](https://nodejs.org/en/) if you don't already have it (LTS version 16.13.2 should be fine).

- open the terminal into TaskV2InvoiceWidget folder and install the node_modules locally using the command:

```bash
  npm install
```

- run webpack with this command:

```bash
  npm run webpack
```

_Remember: if you specify the path in the options, you'll not need to follow the steps below. Your plugin already running in ARXivar._

- now a new subfolder named '`dist\TaskV2InvoiceWidget`' has been created, in this folder you will find the javascript compiled files.

- When you finish to develope your plugin, you have to copy the compiled files folder mentioned above in Scripts/plugins/ (path of ARXivarPortal) in order to use it.(e.g. `MyDrive:\Program Files (x86)\Abletech\ARXivarNext WebPortal\Scripts\plugins`)

_Note: this plugin is provided as a support for learning activities, it's not recommended its use in production environment. Use this as a 'draft' for creating your plugins._

_Note: Instructions for plugin creation can be found at [generator-arxivar-plugin](https://github.com/Arxivar/PluginGenerator/blob/master/README.md)._

## Plugin specification

This widget plugin adds an invoice template with geolocalization and currency conversion to a task detail view. It is designed for task workflows V2.

## Adding the plugin to a task layout

In order to add the plugin to a TASK layout, just edit your task layout and add the new widget `TaskV2InvoiceWidget`. Set the position and size you want.
_(the `TaskV2InvoiceWidget` entry is displayed along with all the preexisting widgets)_, then save the Task Layout. You can hide the map using the widgets settings.


## User level settings and its default value

This plugin was created as a proof of concept for task plugins.

In
```sh
ARXivar Next -> Admin (accessible only to administrative users) -> Plugins manager
```
you can configure the fields with Variables' names present on your ARXivar.

Some fields are alphanumeric (Ragione_sociale_field, Indirizzo_field, Numero_fattura_field), so they must match alphanumeric variables.

Some fields are numeric (Importo_field), so they must match numeric variables.

Some fields are dates (Data_fattura_field, Data_scadenza_field), so they must match date variables.

The variable value set for Indirizzo_field will be used for geolocation showing a marker on a map.

The variable value set for Importo_field will be used for invoice value and could be converted in various currencies inside your running plugin.


## License

 © [Abletech S.r.l.](http://www.arxivar.it/)


