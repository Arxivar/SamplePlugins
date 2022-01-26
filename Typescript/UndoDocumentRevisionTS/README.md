[![Arxivar](http://portal.arxivar.it/download/resources/loghi/Logo-ARXivar_orizzontale-nero.png)](http://www.arxivar.it/)

# Undo Document Revision command plugin

> Sample command implementation for ArxivarNext 

## Installation

- install [NodeJs](https://nodejs.org/en/) if you don't already have it (LTS version 16.13.2 should be fine).

- open the terminal into UndoDocumentRevisionTS folder and install the node_modules locally using the command:

```bash
  npm install
```

- run webpack with this command:

```bash
  npm run webpack
```

_Remember: if you specify the path in the options, you'll not need to follow the steps below. Your plugin already running in ARXivar._

- now a new subfolder named '`UndoDocumentRevisionTS`' has been created, in this folder you will find the javascript compiled files. 

- When you finish to develope your plugin, you have to copy the compiled files folder mentioned above in Scripts/plugins/ (path of ARXivarPortal) in order to use it.(e.g. `MyDrive:\Program Files (x86)\Abletech\ARXivarNext WebPortal\Scripts\plugins`)

_Note: this plugin is provided as a support for learning activities, it's not recommended its use in production environment. Use this as a 'draft' for creating your plugins._

_Note: Instructions for plugin creation can be found at [generator-arxivar-plugin](https://github.com/Arxivar/PluginGenerator/blob/master/README.md)._

## Plugin specification

This command plugin allows you to restore the previous revision for the selected documents.

Once you've added the plugin to your installation, you WON'T NEED to configure it.

## Adding the plugin to the profiles commands

In order to add the plugin to the profiles command list, just edit your command layout and add the `UndoDocumentRevisionTS` item in the position you want 
_(the UndoDocumentRevisionTS entry is shown below the plugin group)_, then save the layout.

## License

 © [Abletech S.r.l.](http://www.arxivar.it/)


