[![Arxivar](http://www.arxivar.it/download/resources/loghi/Logo-ARXivar_orizzontale-nero.png)](http://www.arxivar.it/)

# Rss feed reader widget plugin

> Rss feed reader widget implementation for ArxivarNext.

## Installation

* In order to install this plugin in ARXivar Next, just put the plugin folder (`RssFeedReader`) in your plugin installation folder (e.g. `MyDrive:\Program Files (x86)\Able Tech S.r.l\ARXivarNext WebPortal\Scripts\plugins`)

_Note: this plugin is provided as a support for learning activities, it's not recommended its use in production environment. Use this as a 'draft' for creating your plugins._

_Note: Instructions for plugin creation can be found at [generator-arxivar-plugin](https://github.com/Arxivar/PluginGenerator/blob/master/README.md)._

## Plugin specification

This widget plugin adds customizable reader for any valid rss internet feed.

## Adding the plugin to a desktop

In order to add the plugin to a desktop, just edit your desktop and add the new widget `RssFeedReader`. Set the position and size you want. 
_(the `RssFeedReader` entry is displayed along with all the preexisting widgets)_, then save th Desktop.

If you need add the desktop to the menu layout of the users.

## User level settings and its default value

This plugin was created as a proof of concept of integration with external services and enhancement of a end user level plugin setting with default plugin level values.
The user can in fact choose the url feed of the reader on every desktop where this widget appears. These are automatically saved for the user connected and the specific desktop. The administrator can set the default value for url feed from the settings of the plugin available at 
```sh
ARXivar Next -> Admin (accessible only to administrative users) -> Plugins manager
```

## License

 © [Abletech S.r.l.](http://www.arxivar.it/)


