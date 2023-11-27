!function(e){var i={};function t(n){if(i[n])return i[n].exports;var a=i[n]={i:n,l:!1,exports:{}};return e[n].call(a.exports,a,a.exports,t),a.l=!0,a.exports}t.m=e,t.c=i,t.d=function(e,i,n){t.o(e,i)||Object.defineProperty(e,i,{enumerable:!0,get:n})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,i){if(1&i&&(e=t(e)),8&i)return e;if(4&i&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(t.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&i&&"string"!=typeof e)for(var a in e)t.d(n,a,function(i){return e[i]}.bind(null,a));return n},t.n=function(e){var i=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(i,"a",i),i},t.o=function(e,i){return Object.prototype.hasOwnProperty.call(e,i)},t.p="",t(t.s=1)}([
/*!*********************************************!*\
  !*** ./src/TaskV2InvoiceWidgetDirective.ts ***!
  \*********************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */,function(e,i,t){"use strict";angular.module("arxivar.plugins.directives").directive("taskv2invoicewidgetdirective",["workflowResourceService","TaskV2InvoiceWidget","_","moment","$sce","$timeout",function(e,i,t,n,a,r){return{restrict:"E",scope:{instanceId:"@",taskDto:"=?",widgetSettings:"=?"},templateUrl:"./Scripts/plugins/TaskV2InvoiceWidget/TaskV2InvoiceWidget.html",link:function(o,u){var l=u.find("div.arx-"+i.plugin.name.toLowerCase());l.length>0&&l.addClass(o.instanceId);var s=function(e){o.variables=e;var a={ragionesociale:t.find(i.plugin.customSettings,{name:"Ragione_sociale_field"}).value,indirizzo:t.find(i.plugin.customSettings,{name:"Indirizzo_field"}).value,numerofattura:t.find(i.plugin.customSettings,{name:"Numero_fattura_field"}).value,importo:t.find(i.plugin.customSettings,{name:"Importo_field"}).value,datafattura:t.find(i.plugin.customSettings,{name:"Data_fattura_field"}).value,datascadenza:t.find(i.plugin.customSettings,{name:"Data_scadenza_field"}).value};o.ragionesociale=t.find(o.variables,(function(e){return e.variableDefinition.configuration.name===a.ragionesociale})).value,o.indirizzo=t.find(o.variables,(function(e){return e.variableDefinition.configuration.name===a.indirizzo})).value,o.numerofattura=t.find(o.variables,(function(e){return e.variableDefinition.configuration.name===a.numerofattura})).value,o.importo=t.find(o.variables,(function(e){return e.variableDefinition.configuration.name===a.importo})).value,o.importoView=o.importo,o.datafattura=n(t.find(o.variables,(function(e){return e.variableDefinition.configuration.name===a.datafattura})).value).format("L"),o.datascadenza=n(t.find(o.variables,(function(e){return e.variableDefinition.configuration.name===a.datascadenza})).value).format("L")};o.getUrl=function(){return a.trustAsResourceUrl("https://www.google.com/maps?q="+o.indirizzo+"&output=embed")};o.currencyToSymbol={EUR:"€",USD:"$",JPY:"¥",GBP:"£",RUB:"₽"};var c={},f=new Headers;f.append("apikey","eHmdCcHIE7ZzgHhWaykuI8Is7x8OAaDd"),fetch("https://api.apilayer.com/exchangerates_data/latest?symbols=EUR,USD,JPY,GBP,RUB&base=EUR",{method:"GET",headers:f}).then((function(e){return e.json()})).then((function(e){c=t.assign(c,e.rates)})).catch((function(e){return console.log("error",e)}));o.$watch("currency",(function(e,i){e!==i&&r((function(){if(void 0!==o.importo&&void 0!==c){var e="EUR"===o.currency?1:c[o.currency];o.importoView=(e*o.importo).toFixed(2)}}))})),o.hideMap=o.widgetSettings.find((function(e){return"hideMap"===e.key})).value,t.isNil(o.taskDto.id)?(o.variables=[],o.variablesModel={}):(t.isNil(o.operationVariables)&&e.get("v1/task-operations/task/"+o.taskDto.id+"/variables",void 0).then((function(e){o.operationVariables=e.items,s(o.operationVariables)})),o.variablesModel={})}}}])}]);
//# sourceMappingURL=TaskV2InvoiceWidgetDirective.js.map