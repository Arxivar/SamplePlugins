[![Arxivar](http://portal.arxivar.it/download/resources/loghi/Logo-ARXivar_orizzontale-nero.png)](http://www.arxivar.it/)
# sample-plugins in Typescript ![Typescript](typescript.png)


> Some sample plugins for ARXivar Next

## Installation

- open the terminal into your plugin folder and install the node_modules locally using the command:

```bash
  npm install
```

- run webpack with this command:

```bash
  npm run webpack
```

_Remember: if you specify the path in the options, you'll not need to follow the steps below. Your plugin already running in ARXivar._

- now a new subfolder named '`(e.g. `CalendarWidget`)`' has been created, in this folder you will find the javascript compiled files. 

- When you finish to develope your plugin, you have to copy the compiled files folder mentioned above in Scripts/plugins/ (path of ARXivarPortal) in order to use it.(e.g. `MyDrive:\Program Files (x86)\Able Tech S.r.l\ARXivarNext WebPortal\Scripts\plugins`)

_Note: These plugins are provided as a support for learning activities, it's not recommended their use in production environment. Use them as a 'draft' for creating your plugins._

_Note: Instructions for plugin creation can be found at [generator-arxivar-plugin](https://github.com/Arxivar/PluginGenerator/blob/master/README.md)._

## Repository content
This repository contains these plugins:
  - [ConcludiWorkflowTS](ConcludiWorkflowTS/README.md)
  - [ObjectClonerTS](ObjectClonerTS/README.md)
  - [UndoDocumentRevisionTS](UndoDocumentRevisionTS/README.md)

You can either download the .zip file or clone the repo.

## License

 © [Abletech S.r.l.](http://www.arxivar.it/)
 
 
