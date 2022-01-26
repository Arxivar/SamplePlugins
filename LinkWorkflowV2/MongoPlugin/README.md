[![Arxivar](http://portal.arxivar.it/download/resources/loghi/Logo-ARXivar_orizzontale-nero.png)](http://www.arxivar.it/)

# Mongo Query plugin Link

> Sample implementation for ArxivarNext Workflow V2  


## Installation

- install [NodeJs](https://nodejs.org/en/) if you don't already have it (LTS version 16.13.2 should be fine).

- open the terminal into MongoPlugin folder and install the node_modules locally using the command:

```bash
  npm install
```

- click on MongoPlugin.sln then build the solution, the MongoPlugin.zip will be created inside the folder.
  
- open a command prompt and go to `"C:\..\..\Abletech\ARXivarNext Workflow Service\wf-plugin.exe"` 
  
- upload MongoPlugin into ARXivar with this command:

```bash
  wf-plugin.exe upload -p ..\..\MongoPlugin\MongoPlugin.zip
```

- now the plugin is running in ARXivar,you will find it in the link Operation of the Workflow V2 Designer


_Note: this plugin is provided as a support for learning activities, it's not recommended its use in production environment. Use this as a 'draft' for creating your plugins._

_Note: Instructions for plugin creation can be found at [generator-arxivar-plugin](https://github.com/Arxivar/PluginGenerator/blob/master/README.md)._


## Plugin specification

This Mongo Query plugin allows you to perform queries on a Mongo Database.


## License

 © [Abletech S.r.l.](http://www.arxivar.it/)


