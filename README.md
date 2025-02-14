[![Arxivar](http://portal.arxivar.it/download/resources/loghi/Logo-ARXivar_orizzontale-nero.png)](http://www.arxivar.it/)
# sample-plugins in Javascript ![Javascript](Javascript/javascript.png)

> Some sample plugins for ARXivar Next

## Installation

* In order to install a plugin in ARXivar Next, just put the plugin folder (e.g. `CalendarWidget`) in your plugin installation folder (e.g. `MyDrive:\Program Files (x86)\Abletech\ARXivarNext WebPortal\Scripts\plugins`)


## Repository content
This repository contains these Javascript plugins:
  - [Calendar route plugin](Javascript/Calendar/README.md)
  - [Calendar command plugin](Javascript/CalendarCommand/README.md)
  - [Calendar widget plugin](Javascript/CalendarWidget/README.md)
  - [Meteo widget plugin](Javascript/MeteoWidget/README.md)
  - [RSS feed reader widget plugin](Javascript/RssFeedReader/README.md)
  - [Task invoice widget plugin (task plugin)](Javascript/TaskInvoiceWidget/README.md)
  - [ConcludiWorkflowTS](Javascript/ConcludiWorkflow/README.md)
  - [DueDateOneMonthProfilation](Javascript/DueDateOneMonthProfilation/README.md)
  - [ObjectCloner](Javascript/ObjectCloner/README.md)
  - [SendSystemIdCommand](Javascript/SendSystemIdCommand/README.md)
  - [ShowParamsPluginRoute](Javascript/ShowParamsPluginRoute/README.md)
  - [UndoDocumentRevision](Javascript/UndoDocumentRevision/README.md)

You can either download the .zip file or clone the repo.


  # sample-plugins in Typescript ![Typescript](Typescript/typescript.png)


> Some sample plugins for ARXivar Next

## Installation

- install [NodeJs](https://nodejs.org/en/) if you don't already have it (LTS version 16.13.2 should be fine).

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

- When you finish to develope your plugin, you have to copy the compiled files folder mentioned above in Scripts/plugins/ (path of ARXivarPortal) in order to use it.(e.g. `MyDrive:\Program Files (x86)\Abletech\ARXivarNext WebPortal\Scripts\plugins`)

  ## Repository content
This repository contains these Typescript plugins:
  - [ConcludiWorkflowTS](Typescript/ConcludiWorkflowTS/README.md)
  - [ObjectClonerTS](Typescript/ObjectClonerTS/README.md)
  - [UndoDocumentRevisionTS](Typescript/UndoDocumentRevisionTS/README.md)
  - [UploadPluginRouteTS](Typescript/UploadPluginRouteTS/README.md)
  - [TaskV2InvoiceWidget](Typescript/TaskV2InvoiceWidget/README.md)
  - [FeesCanPrototype](Typescript/FeesCanPrototype/README.md)
  - [DynamicTitle](Typescript/DynamicTitle/README.md)

You can either download the .zip file or clone the repo.


# sample-plugins Link Workflow V2

> Some sample plugins for ARXivar Next

## Installation

* Click [here](LinkWorkflowV2/README.md) in order to install a plugin  link in ARXivar Next.

## Repository content
This repository contains these link Workflow V2 plugins:
  - [MongoPlugin](LinkWorkflowV2/MongoPlugin/README.md)
  - [ReceiptPluginLink](LinkWorkflowV2/ReceiptPluginLink/README.md)

You can either download the .zip file or clone the repo.

## License

_Note: These plugins are provided as a support for learning activities, it's not recommended their use in production environment. Use them as a 'draft' for creating your plugins._

_Note: Instructions for plugin creation can be found at [generator-arxivar-plugin](https://github.com/Arxivar/PluginGenerator/blob/master/README.md)._

 © [Abletech S.r.l.](http://www.arxivar.it/)


