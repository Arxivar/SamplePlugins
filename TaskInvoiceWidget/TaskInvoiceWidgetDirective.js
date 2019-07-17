angular.module('arxivar.plugins.directives').directive('taskinvoicewidgetdirective', [
    'TaskInvoiceWidget', 'taskOperationsService', '_', 'moment', '$timeout', '$sce',
    function(TaskInvoiceWidget, taskOperationsService, _, moment, $timeout, $sce) {

        return {
            restrict: 'E',
            scope: {
                taskDto: '=?'
            },
            templateUrl: './Scripts/plugins/TaskInvoiceWidget/TaskInvoiceWidget.html',
            link: function(scope, element) {
                //get custom fields from cinfiguration
                var _getCustomField = function() {
                    return {
                        ragionesociale: _.find(TaskInvoiceWidget.plugin.customSettings, {
                            name: 'Ragione_sociale_field'
                        }).value,
                        indirizzo: _.find(TaskInvoiceWidget.plugin.customSettings, {
                            name: 'Indirizzo_field'
                        }).value,
                        numerofattura: _.find(TaskInvoiceWidget.plugin.customSettings, {
                            name: 'Numero_fattura_field'
                        }).value,
                        importo: _.find(TaskInvoiceWidget.plugin.customSettings, {
                            name: 'Importo_field'
                        }).value,
                        datafattura: _.find(TaskInvoiceWidget.plugin.customSettings, {
                            name: 'Data_fattura_field'
                        }).value,
                        datascadenza: _.find(TaskInvoiceWidget.plugin.customSettings, {
                            name: 'Data_scadenza_field'
                        }).value,
                    };
                };
                var _settVariables = function(varibles) {

                    var booleanVariables = varibles.booleanVariables;
                    var stringVariables = varibles.stringVariables;
                    var comboVariables = varibles.comboVariables;
                    var dateTimeVariables = varibles.dateTimeVariables;
                    var doubleVariables = varibles.doubleVariables;
                    var tableVariables = varibles.tableVariables;


                    scope.variables = _.concat(booleanVariables, stringVariables, comboVariables, dateTimeVariables, doubleVariables, tableVariables);
                    //set scope variables
                    var fields = _getCustomField();
                    scope.ragionesociale = _.find(scope.variables, {
                        name: fields.ragionesociale
                    }).displayValue;
                    scope.indirizzo = _.find(scope.variables, {
                        name: fields.indirizzo
                    }).displayValue;
                    scope.numerofattura = _.find(scope.variables, {
                        name: fields.numerofattura
                    }).displayValue;
                    scope.importo = _.find(scope.variables, {
                        name: fields.importo
                    }).value;
                    scope.importoView = scope.importo;
                    scope.datafattura = moment(_.find(scope.variables, {
                        name: fields.datafattura
                    }).value).format('L');
                    scope.datascadenza = moment(_.find(scope.variables, {
                        name: fields.datascadenza
                    }).value).format('L');

                };
                scope.getUrl = function() {
                    return $sce.trustAsResourceUrl('https://www.google.com/maps?q=' + scope.indirizzo + '&output=embed');
                };
                //initalize the widget
                var init = function() {
                    var $mainContainer = $(element).find('div.arx-' + TaskInvoiceWidget.plugin.name.toLowerCase());
                    if ($mainContainer.length > 0) {
                        $mainContainer.addClass(scope.instanceId);
                    }
                    if (!_.isNil(scope.taskDto.id)) {
                        if (_.isNil(scope.operationVariables)) {
                            taskOperationsService.getTaskOperations(scope.taskDto.id)
                                .then(function(operations) {
                                    scope.operationVariables = operations.taskWorkVariablesOperation;
                                    _settVariables(operations.taskWorkVariablesOperation.processVariablesFields);

                                });
                        }
                        scope.variablesModel = {};
                    } else {
                        scope.variables = [];
                        scope.variablesModel = {};
                    }
                };

                //currency to symbol map
                scope.currencyToSymbol = {
                    EUR: '€',
                    USD: '$',
                    JPY: '¥',
                    GBP: '£',
                    RUB: '₽',
                };
                //get conversion rates from EUR
                var _rate = {};
                var q1 = 'EUR_USD,EUR_JPY';
                var q2 = 'EUR_GBP,EUR_RUB';

                $.getJSON('https://free.currencyconverterapi.com/api/v6/convert?q=' + q1, function(data) {
                    _rate = _.assign(_rate, data.results);
                });
                $.getJSON('https://free.currencyconverterapi.com/api/v6/convert?q=' + q2, function(data) {
                    _rate = _.assign(_rate, data.results);
                });

                var convert = function() {
                    $timeout(function() {
                        if (scope.importo !== undefined && _rate !== undefined) {
                            var newRate = scope.currency === 'EUR' ? 1 : _rate['EUR_' + scope.currency].val;
                            scope.importoView = (newRate * scope.importo).toFixed(2);
                        }
                    });
                };

                //on change currency run convert
                scope.$watch('currency', function(newVal, oldVal) {
                    if (newVal !== oldVal) {
                        convert();
                    }
                });
                init();

            }
        };
    }
]);
