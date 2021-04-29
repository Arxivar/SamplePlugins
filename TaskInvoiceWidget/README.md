[![Arxivar](http://portal.arxivar.it/download/resources/loghi/Logo-ARXivar_orizzontale-nero.png)](http://www.arxivar.it/)

# Task invoice widget plugin

> Task invoice widget implementation for ArxivarNext.

## Installation

* In order to install this plugin in ARXivar Next, just put the plugin folder (`TaskInvoiceWidget`) in your plugin installation folder (e.g. `MyDrive:\Program Files (x86)\Able Tech S.r.l\ARXivarNext WebPortal\Scripts\plugins`)

_Note: this plugin is provided as a support for learning activities, it's not recommended its use in production environment. Use this as a 'draft' for creating your plugins._

_Note: Instructions for plugin creation can be found at [generator-arxivar-plugin](https://github.com/Arxivar/PluginGenerator/blob/master/README.md)._

## Plugin specification

This widget plugin adds an invoice template with geolocalization and currency conversion to a task detail view. It is designed for task workflows.

## Adding the plugin to a task layout

In order to add the plugin to a TASK layout, just edit your task layout and add the new widget `TaskInvoiceWidget`. Set the position and size you want. 
_(the `TaskInvoiceWidget` entry is displayed along with all the preexisting widgets)_, then save the Task Layout.


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


