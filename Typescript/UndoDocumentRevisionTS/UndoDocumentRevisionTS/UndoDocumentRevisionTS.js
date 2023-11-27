/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/UndoDocumentRevisionTSPluginCommand.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/UndoDocumentRevisionTSPluginCommand.ts":
/*!****************************************************!*\
  !*** ./src/UndoDocumentRevisionTSPluginCommand.ts ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _UndoDocumentRevisionTSTypes = __webpack_require__(/*! ./UndoDocumentRevisionTSTypes */ \"./src/UndoDocumentRevisionTSTypes.ts\");\nangular.module('arxivar.plugins').factory('UndoDocumentRevisionTS', ['PluginCommand', '_', '$uibModal', 'arxivarResourceService', 'arxivarUserServiceCreator', 'arxivarRouteService', 'arxivarDocumentsService', 'arxivarNotifierService', function (PluginCommand, _, $uibModal, arxivarResourceService, arxivarUserServiceCreator, arxivarRouteService, arxivarDocumentsService, arxivarNotifierService) {\n  // MANDATORY settings in order for the plugin to work.\n  var requiredSettings = {\n    id: '0a350254-7c75-472b-954b-1c6b9137aba2',\n    // Unique plugin identifier (type: string)\n    name: 'UndoDocumentRevisionTS',\n    // Plugin name. Spaces special characters not allowed (type: string)\n    icon: 'fas fa-undo',\n    label: 'UndoDocumentRevisionTS',\n    // User Interface label (type: string)\n    description: 'ripristina la revisione precedente dei documenti selezionati',\n    // Plugin description (type: string)\n    author: 'Abletech srl',\n    // Plugin author (type: string)\n    minVersion: '2.0.0',\n    // Minimun portal version this plugin supports. (type: string, format example: 0.0.1)\n    requireRefresh: true,\n    // If this plugin requires grid data refresh (type boolean. Default: false)\n    useTypescript: true // If this plugin use typescript compiler (type boolean. Default: false) \n  };\n\n  // OPTIONAL settings. These objects require the following properties: name, description, defaultValue and type.\n  // Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format\n  var customSettings = [\n    //{name: '', description: '', defaultValue:'', type: 'string'},\n  ];\n\n  // OPTIONAL settings for specific users. These objects require the following properties: name, description, defaultValue and type.\n  // Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format\n  var userSettings = [\n    //{name: '', description: '', defaultValue:'', type: 'string'},\n  ];\n  var myPlugin = new PluginCommand(requiredSettings, customSettings, userSettings);\n\n  // This function is a promise with asyncronous logic to determine if this plugin can run. Input parameters: array of docnumbers (params.docnumbers), flag locked (params.locked only in F2) \n  // Output parameter: Promise of bool\n  myPlugin.canRun = function (params) {\n    return params.hasOwnProperty('docnumbers') ? Promise.resolve(params.docnumbers.length >= 1) : Promise.resolve(false);\n  };\n\n  // This function is a promise with asyncronous run logic. Input parameters: array of docnumbers (params.docnumbers), flag locked (params.locked only in F2) \n  // Output parameter type expected: Promise of any\n  myPlugin.run = function (params) {\n    return myPlugin.canRun(params).then(function (canRun) {\n      if (canRun) {\n        var promArray = [];\n        _.forEach(params.docnumbers, function (docId) {\n          promArray.push(arxivarResourceService.get('Revisions/byDocnumber/' + docId, _UndoDocumentRevisionTSTypes.httpOption));\n        });\n        return Promise.all(promArray).then(function (arrResult) {\n          var result = false;\n          _.forEach(arrResult, function (revisioni, index) {\n            if (revisioni.length > 0) {\n              result = true;\n            }\n            if (revisioni.length === 0) {\n              throw new Error('Il documento non ha revisioni, impossibile ripristinare');\n            }\n            if (params.rows[index].WFVERSIONSTATE === 1) {\n              throw new Error('Processo di workflow in corso, impossibile ripristinare');\n            }\n            if (params.rows[index].WFVERSIONSTATE === 10) {\n              throw new Error('Processo di workflow V2 in corso, impossibile ripristinare');\n            }\n          });\n          return result;\n        }).then(function (hasRevision) {\n          if (hasRevision) {\n            var modal = $uibModal.open({\n              animation: true,\n              template: '<div class=\"modal-header\"> <h3 class=\"modal-title\">Operazione in corso</h3></div>' + '<uib-progressbar max=\"max\" value=\"dynamic\"><span style=\"color:white; white-space:nowrap;\">{{counter}} / {{max}}</span></uib-progressbar>' + '<div class=\"modal-footer\"></div>',\n              controller: ['$scope', '_', '$uibModalInstance', '$q', function ($scope, _, $uibModalInstance) {\n                $scope.max = params.docnumbers.length;\n                $scope.counter = 0;\n                var promises = [];\n                var promisesGet = [];\n                _.forEach(params.docnumbers, function (value) {\n                  promisesGet.push(arxivarResourceService.get('Revisions/byDocnumber/' + value, _UndoDocumentRevisionTSTypes.httpOption));\n                });\n                return Promise.all(promisesGet).then(function (revisioniInDocNumbers) {\n                  _.forEach(revisioniInDocNumbers, function (revisioni, index) {\n                    var revArray = revisioni;\n                    revArray = _.sortBy(revArray, ['revision']);\n                    var laRevisioneDaRipristinare = _.last(revArray);\n                    var promiseRevisionByRevision = arxivarResourceService.save('Revisions/' + params.docnumbers[index] + '/' + laRevisioneDaRipristinare.revision + '/1', _UndoDocumentRevisionTSTypes.httpOption, _UndoDocumentRevisionTSTypes.httpOption).then(function () {\n                      $scope.counter = $scope.counter + 1;\n                    });\n                    promises.push(promiseRevisionByRevision);\n                  });\n                }).then(function () {\n                  return Promise.all(promises);\n                }).then(function () {\n                  $uibModalInstance.close();\n                  arxivarNotifierService.notifySuccess('Operazione andata a buon fine');\n                });\n              }]\n            });\n            return modal.result;\n          }\n        }).catch(function (err) {\n          return arxivarNotifierService.notifyError(err);\n        });\n      }\n    });\n  };\n  return {\n    plugin: myPlugin\n  };\n}]);\n\n//# sourceURL=webpack:///./src/UndoDocumentRevisionTSPluginCommand.ts?");

/***/ }),

/***/ "./src/UndoDocumentRevisionTSTypes.ts":
/*!********************************************!*\
  !*** ./src/UndoDocumentRevisionTSTypes.ts ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.httpOption = void 0;\nvar httpOption = exports.httpOption = {\n  openload: false,\n  hideUserMessageError: false\n};\n\n//# sourceURL=webpack:///./src/UndoDocumentRevisionTSTypes.ts?");

/***/ })

/******/ });