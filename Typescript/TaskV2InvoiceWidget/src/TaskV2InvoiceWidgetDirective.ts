import { widgetType } from './TaskV2InvoiceWidget';
import { LoDashStatic } from 'lodash';
angular.module('arxivar.plugins.directives').directive('taskv2invoicewidgetdirective', [
	'workflowResourceService', 'TaskV2InvoiceWidget', '_', 'moment', '$sce', '$timeout',
	(workflowResourceService: IWorkflowResourceService, TaskV2InvoiceWidget: widgetType, _: LoDashStatic, moment: any, $sce: angular.ISCEService, $timeout: angular.ITimeoutService) => {
		return {
			restrict: 'E',
			scope: {
				instanceId: '@',
				taskDto: '=?',
				widgetSettings: '=?'
			},
			templateUrl: './Scripts/plugins/TaskV2InvoiceWidget/TaskV2InvoiceWidget.html',
			link: (scope: IScopeWidgetTask, element: JQuery<HTMLElement>) => {
				const $mainContainer = element.find('div.arx-' + TaskV2InvoiceWidget.plugin.name.toLowerCase());
				if ($mainContainer.length > 0) {
					$mainContainer.addClass(scope.instanceId);
				}
				var _getCustomField = () => {
					return {
						ragionesociale: _.find(TaskV2InvoiceWidget.plugin.customSettings, {
							name: 'Ragione_sociale_field'
						}).value,
						indirizzo: _.find(TaskV2InvoiceWidget.plugin.customSettings, {
							name: 'Indirizzo_field'
						}).value,
						numerofattura: _.find(TaskV2InvoiceWidget.plugin.customSettings, {
							name: 'Numero_fattura_field'
						}).value,
						importo: _.find(TaskV2InvoiceWidget.plugin.customSettings, {
							name: 'Importo_field'
						}).value,
						datafattura: _.find(TaskV2InvoiceWidget.plugin.customSettings, {
							name: 'Data_fattura_field'
						}).value,
						datascadenza: _.find(TaskV2InvoiceWidget.plugin.customSettings, {
							name: 'Data_scadenza_field'
						}).value,
					};
				};
				var _setVariables = (variables: any) => {
					scope.variables = variables;
					//set scope variables
					var fields = _getCustomField();
					scope.ragionesociale = _.find(scope.variables, (v) => {
						return v.variableDefinition.configuration.name === fields.ragionesociale;
					}).value;
					scope.indirizzo = _.find(scope.variables, (v) => {
						return v.variableDefinition.configuration.name === fields.indirizzo;
					}).value;
					scope.numerofattura = _.find(scope.variables, (v) => {
						return v.variableDefinition.configuration.name === fields.numerofattura;
					}).value;
					scope.importo = _.find(scope.variables, (v) => {
						return v.variableDefinition.configuration.name === fields.importo;
					}).value;
					scope.importoView = scope.importo;
					scope.datafattura = moment(_.find(scope.variables, (v) => {
						return v.variableDefinition.configuration.name === fields.datafattura;
					}).value).format('L');
					scope.datascadenza = moment(_.find(scope.variables, (v) => {
						return v.variableDefinition.configuration.name === fields.datascadenza;
					}).value).format('L');
				};
				scope.getUrl = () => {
					return $sce.trustAsResourceUrl('https://www.google.com/maps?q=' + scope.indirizzo + '&output=embed');
				};
				//initalize the widget
				var init = () => {

					scope.hideMap = scope.widgetSettings.find((setting: { key: string, kind: string, value: string | number | boolean }) => { return setting.key === 'hideMap'; }).value;

					if (!_.isNil(scope.taskDto.id)) {
						if (_.isNil(scope.operationVariables)) {
							workflowResourceService.get('v1/task-operations/task/' + scope.taskDto.id + '/variables', undefined)
								.then((results: any) => {
									scope.operationVariables = results.items;
									_setVariables(scope.operationVariables);

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
				var _rate: any = {};

				var myHeaders = new Headers();
				myHeaders.append('apikey', 'eHmdCcHIE7ZzgHhWaykuI8Is7x8OAaDd');

				const requestOptions = {
					method: 'GET',
					headers: myHeaders
				};

				fetch('https://api.apilayer.com/exchangerates_data/latest?symbols=EUR,USD,JPY,GBP,RUB&base=EUR', requestOptions)
					.then((response: Response) => {
						return response.json();
					}).then((data: any) => {
						_rate = _.assign(_rate, data.rates);
					})
					.catch(error => console.log('error', error));

				var convert = () => {
					$timeout(() => {
						if (scope.importo !== undefined && _rate !== undefined) {
							var newRate = scope.currency === 'EUR' ? 1 : _rate[scope.currency];
							scope.importoView = (newRate * scope.importo).toFixed(2);
						}
					});
				};

				//on change currency run convert
				scope.$watch('currency', (newVal, oldVal) => {
					if (newVal !== oldVal) {
						convert();
					}
				});
				init();
			}
		};
	}]);
