[![Arxivar](http://portal.arxivar.it/download/resources/loghi/Logo-ARXivar_orizzontale-nero.png)](http://www.arxivar.it/)

# Dynamic title  widget plugin

> Task V2 dynamic title and force update of outcome implementation for ArxivarNext.

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

- now a new subfolder named '`DynamicTitle`' has been created, in this folder you will find the javascript compiled files.

- When you finish to develope your plugin, you have to copy the compiled files folder mentioned above in Scripts/plugins/ (path of ARXivarPortal) in order to use it.(e.g. `MyDrive:\Program Files (x86)\Abletech\ARXivarNext WebPortal\Scripts\plugins`)

_Note: this plugin is provided as a support for learning activities, it's not recommended its use in production environment. Use this as a 'draft' for creating your plugins._

_Note: Instructions for plugin creation can be found at [generator-arxivar-plugin](https://github.com/Arxivar/PluginGenerator/blob/master/README.md)._

## Plugin specification

This widget plugin Dynamically updates the Task V2 title by user Language and lock and unlock the outcome. It is designed for task workflows V2.

## Adding the plugin to a task layout

In order to add the plugin to a TASK layout, just edit your task layout and add the new widget `DynamicTitle`. Set the position and size you want.
_(the `DynamicTitle` entry is displayed along with all the preexisting widgets)_, then save the Task Layout. You can hide the map using the widgets settings.


## ARXivar configuration

This plugin was created as a proof of concept for task plugins.

In
```sh
ARXivar Next -> Admin (accessible only to administrative users) -> Plugins manager
```

The DynamicTitle plugin requires the creation of a specific process variable, follow the steps below to configure it:

1. Configure a boolean variable called "BooleanVariable."

2. In the task configuration, set the validation on the outcomes using the formula: [$BooleanVariable$] = true.

3. Set up an "Set process variables" operation containing our previously created variable (the operation can also be hidden).

4. Publish and run your workflow, then try the plugin.


## License

 © [Abletech S.r.l.](http://www.arxivar.it/)


