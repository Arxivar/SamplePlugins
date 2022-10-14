[![Arxivar](http://portal.arxivar.it/download/resources/loghi/Logo-ARXivar_orizzontale-nero.png)](http://www.arxivar.it/)

# Receipt plugin link

> Sample implementation for ArxivarNext Workflow V2 

## Installation

- click on ReceiptPluginLink.sln then build the solution, the ReceiptPluginLink.zip will be created inside the folder.
  
- open a command prompt and go to `"C:\..\..\Abletech\ARXivarNext Workflow Service\wf-plugin.exe"` 
  
- upload ReceiptPluginLink into ARXivar with this command:

```bash
  wf-plugin.exe upload -p your\plugin\path\folder\ReceiptPluginLink.zip
```

- now the plugin is running in ARXivar, you will find it in the link Operation of the Workflow V2 Designer.


_Note: this plugin is provided as a support for learning activities, it's not recommended its use in production environment. Use this as a 'draft' for creating your plugins._

_Note: Instructions for plugin creation can be found at [generator-arxivar-plugin](https://github.com/Arxivar/PluginGenerator/blob/master/README.md)._

## Plugin specification

This plugin allows to read a receipt image, calling the *Fees Scan* external service to crop the image and retrieves the information contained in the receipt (such as price, currency, company, merchant, date, & others).

The receipt must be passed as primary document in the workflow process in which the plugin is configured. The information read from the receipt will be stored in the additional fields configured for the profile and the cropped image will override the original receipt image.

The plugin configuration is the following:

### Input parameters

- **ApiKey (Required)**: this input should be mapped to a string variable, containing the API Key needed to call the *Fees Scan APIs*
- **DateFieldName**: this input should be mapped to a string variable, containing the name of a datetime additional field.
- **PriceFieldName**: this input should be mapped to a string variable, containing the name of a double additional field.
- **CurrencyFieldName**: this input should be mapped to a string variable, containing the name of a string additional field.
- **VatNumberFieldName**: this input should be mapped to a string variable, containing the name of a string additional field.
- **CompanyNameFieldName**: this input should be mapped to a string variable, containing the name of a string additional field.
- **CompanyAddressFieldName**: this input should be mapped to a string variable, containing the name of a string additional field.
- **MerchantFieldName**: this input should be mapped to a string variable, containing the name of a string additional field.
- **CountryCodeFieldName**: this input should be mapped to a string variable, containing the name of a string additional field.
- **DocumentNumberFieldName**: this input should be mapped to a string variable, containing the name of a string additional field.

### Output parameters

- **Success**: this output should be mapped to a boolean variable and contains whether the plugin ends correctly
- **ErrorMessage**: this output should be mapped to a string variabile and contains the error message returns in case of failure.

## License

 © [Abletech S.r.l.](http://www.arxivar.it/)