[![Arxivar](http://portal.arxivar.it/download/resources/loghi/Logo-ARXivar_orizzontale-nero.png)](http://www.arxivar.it/)
# sample-plugins Link Workflow V2


> Some sample plugins for ARXivar Next

## Installation


Your generated plugin will be find into plugin-link folder

### Standard configuration

* In order to install a plugin link in Arxivar Next just build the solution(after writing your plugin) and upload the generated .zip file running the CLI. 

### Advanced configuration:

* In order to install a plugin link that uses advanced configuration in Arxivar Next just build the solution(after writing your plugin) and upload the generated .zip file running the CLI.

_Attention: if it's a Typescript plugin don't forget to run the command ```npm install``` before build the solution._


### How to use the CLI

- Open a command prompt and use the instruction below into `"C:\..\..\Abletech\ARXivarNext Workflow Service\wf-plugin.exe"` to run the CLI and see possible options:
  
```bash
  wf-plugin.exe help
```

- Upload your plugin into Arxivar as in this example:

```bash
  wf-plugin.exe upload -p your\plugin\path\folder\yourProject.zip
```
- If you have to edit your plugin, rebuild the solution after finishing the changes then run the update command:

```bash
  wf-plugin.exe update -p your\plugin\path\folder\yourProject.zip
```

- To delete the plugin run the delete command (use  ```wf-plugin.exe list``` if you don't remember the Assembly name ) :

```bash
  wf-plugin.exe delete -a yourProject
```
## Repository content
This repository contains these link plugins:
  - [PluginLink1](ConcludiWorkflowTS/README.md)

You can either download the .zip file or clone the repo.

_Note: These plugins are provided as a support for learning activities, it's not recommended their use in production environment. Use them as a 'draft' for creating your plugins._

_Note: Instructions for plugin creation can be found at [generator-arxivar-plugin](https://github.com/Arxivar/PluginGenerator/blob/master/README.md)._

## License

 © [Abletech S.r.l.](http://www.arxivar.it/)
 
 
