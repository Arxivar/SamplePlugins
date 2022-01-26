[![Arxivar](http://portal.arxivar.it/download/resources/loghi/Logo-ARXivar_orizzontale-nero.png)](http://www.arxivar.it/)

# Upload Plugin Route 

> Sample route implementation for ArxivarNext, allows you to upload a file into the buffer.

## Installation

- install [NodeJs](https://nodejs.org/en/) if you don't already have it (LTS version 16.13.2 should be fine).

- open the terminal into uploadPluginRoute folder and install the node_modules locally using the command:

```bash
  npm install
```

- run webpack with this command:

```bash
  npm run webpack
```

_Remember: if you specify the path in the options, you'll not need to follow the steps below. Your plugin already running in ARXivar._

- now a new subfolder named '`UploadPluginRouteTS`' has been created, in this folder you will find the javascript compiled files. 

- When you finish to develope your plugin, you have to copy the compiled files folder mentioned above in Scripts/plugins/ (path of ARXivarPortal) in order to use it.(e.g. `MyDrive:\Program Files (x86)\Abletech\ARXivarNext WebPortal\Scripts\plugins`)

_Note: this plugin is provided as a support for learning activities, it's not recommended its use in production environment. Use this as a 'draft' for creating your plugins._

_Note: Instructions for plugin creation can be found at [generator-arxivar-plugin](https://github.com/Arxivar/PluginGenerator/blob/master/README.md)._

## Plugin specification

This route plugin allows you to upload a file into the buffer.

Once you've added the plugin to your installation, you won't need to configure it.

Optionally just add a existent maskID into the code to use 'mask' functionality 



## Adding the plugin to the profiles commands

In order to add the route plugin to the menu, just edit your menu layout and add the `UploadPluginRoute` item in the position you want .
_(the uploadPluginRoute entry is shown below the plugin group)_, then save the layout.

## License

 © [Abletech S.r.l.](http://www.arxivar.it/)


