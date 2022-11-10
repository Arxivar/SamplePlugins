[![Arxivar](http://portal.arxivar.it/download/resources/loghi/Logo-ARXivar_orizzontale-nero.png)](http://www.arxivar.it/)

# FeesCanPrototype

> Sample plugin profilation implementation for ArxivarNext, allows you to use Fees Scan services to read a data from a receipt image.

## Installation

- install [NodeJs](https://nodejs.org/en/) if you don't already have it (LTS version 16.13.2 should be fine).

- open the terminal into FeesCanPrototype folder and install the node_modules locally using the command:

```bash
  npm install
```

- run webpack with this command:

```bash
  npm run webpack
```

_Remember: if you specify the path in the options, you'll not need to follow the steps below. Your plugin already running in ARXivar._

- now a new subfolder named '`FeesCanPrototype`' has been created, in this folder you will find the javascript compiled files. 

- When you finish to develope your plugin, you have to copy the compiled files folder mentioned above in Scripts/plugins/ (path of ARXivarPortal) in order to use it.(e.g. `MyDrive:\Program Files (x86)\Abletech\ARXivarNext WebPortal\Scripts\plugins`)

_Note: this plugin is provided as a support for learning activities, it's not recommended its use in production environment. Use this as a 'draft' for creating your plugins._

_Note: Instructions for plugin creation can be found at [generator-arxivar-plugin](https://github.com/Arxivar/PluginGenerator/blob/master/README.md)._

## Plugin specification

This plugin allows you to retrieve a file from the Portal and call Fees Scan Implementation Services.

Once you've added the plugin to your installation, you will need to configure it.

You will need to apply the 2.7.23 fix to be able to use this plugin.

## Plugin configuration

This plugin was created as a proof of concept to retrieve a file from the Portal and call Fees Scan Implementation Services.
This plugin requires the configuration of custom settings. You will need to set the custom settings in the plugin's configuration.

In
```sh
ARXivar Next -> Admin (accessible only to administrative users) -> Plugins manager
```

You have to configure this custom setting :

- **DateFieldName**: this input should be mapped to a string variable, containing the name of a datetime additional field.
- **PriceFieldName**: this input should be mapped to a string variable, containing the name of a double additional field.
- **CurrencyFieldName**: this input should be mapped to a string variable, containing the name of a string additional field.
- **VatNumberFieldName**: this input should be mapped to a string variable, containing the name of a string additional field.
- **CompanyNameFieldName**: this input should be mapped to a string variable, containing the name of a string additional field.
- **CompanyAddressFieldName**: this input should be mapped to a string variable, containing the name of a string additional field.
- **MerchantFieldName**: this input should be mapped to a string variable, containing the name of a string additional field.
- **CountryCodeFieldName**: this input should be mapped to a string variable, containing the name of a string additional field.
- **DocumentNumberFieldName**: this input should be mapped to a string variable, containing the name of a string additional field.
- **ApiKey (Required)**: this setting contain the API Key needed to call the *Fees Scan APIs*(https://www.fees.world/)

The information read from the receipt will be stored in the additional fields that you configured. 
## Adding the plugin to the profiles commands

In order to add the route plugin to the menu, just edit your menu layout and add the `FeesCanPrototype` item in the position you want .
_(the FeesCanPrototype entry is shown below the plugin group)_, then save the layout.

## License

 © [Abletech S.r.l.](http://www.arxivar.it/)


