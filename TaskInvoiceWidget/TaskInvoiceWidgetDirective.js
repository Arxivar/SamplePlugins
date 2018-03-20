
angular.module('arxivar.plugins.directives').directive('taskinvoicewidgetdirective', [
	'TaskInvoiceWidget', 'pluginService', 'taskVariablesService', 'taskOperationsService', '_', 'moment', '$timeout',
	function(TaskInvoiceWidget, pluginService, taskVariablesService, taskOperationsService, _, moment, $timeout) {

		return {
			restrict: 'E',
			scope: {
				taskDto: '=?'
			},
			templateUrl: './Scripts/plugins/TaskInvoiceWidget/TaskInvoiceWidget.html',
			link: function(scope, element, attrs, ctrls) {
				//get custom fields from cinfiguration
				var _getCustomField = function() {
					return {
						ragionesociale: _.find(TaskInvoiceWidget.plugin.customSettings, { name: 'Ragione_sociale_field' }).value,
						indirizzo: _.find(TaskInvoiceWidget.plugin.customSettings, { name: 'Indirizzo_field' }).value,
						numerofattura: _.find(TaskInvoiceWidget.plugin.customSettings, { name: 'Numero_fattura_field' }).value,
						importo: _.find(TaskInvoiceWidget.plugin.customSettings, { name: 'Importo_field' }).value,
						datafattura: _.find(TaskInvoiceWidget.plugin.customSettings, { name: 'Data_fattura_field' }).value,
						datascadenza: _.find(TaskInvoiceWidget.plugin.customSettings, { name: 'Data_scadenza_field' }).value,
					};
				};
				var _settVariables = function(varibles) {

					const booleanVariables = varibles.booleanVariables;
					const stringVariables = varibles.stringVariables;
					const comboVariables = varibles.comboVariables;
					const dateTimeVariables = varibles.dateTimeVariables;
					const doubleVariables = varibles.doubleVariables;
					const tableVariables = varibles.tableVariables;


					scope.variables = _.concat(booleanVariables, stringVariables, comboVariables, dateTimeVariables, doubleVariables, tableVariables);
					//set scope variables
					var fields = _getCustomField();
					scope.ragionesociale = _.find(scope.variables, { name: fields.ragionesociale }).displayValue;
					scope.indirizzo = _.find(scope.variables, { name: fields.indirizzo }).displayValue;
					scope.numerofattura = _.find(scope.variables, { name: fields.numerofattura }).displayValue;
					scope.importo = _.find(scope.variables, { name: fields.importo }).value;
					scope.importoView = scope.importo;
					scope.datafattura = moment(_.find(scope.variables, { name: fields.datafattura }).value).format('L');
					scope.datascadenza = moment(_.find(scope.variables, { name: fields.datascadenza }).value).format('L');

					//converting addresses string into geographic coordinates
					var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + scope.indirizzo;
					$.get(url, function(response) {
						function initMap(lat, lng) {
							if (lat !== undefined) {
								var myLatLng = { lat: lat, lng: lng };
								var map = new google.maps.Map(document.getElementById('map'), {
									zoom: 15,
									center: myLatLng
								});
								var marker = new google.maps.Marker({
									position: myLatLng,
									map: map,
								});
							}
						}
						if (response.status === 'OK') {
							initMap(response.results[0].geometry.location.lat, response.results[0].geometry.location.lng);
						}
					});
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
				// download google maps lib
				$.getScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyC341o4aabs3DDquZfq6BCUihpmD6pgPKo', function() {
					//run the init after download
					init();
				});

				//currency to symbol map
				scope.currencyToSymbol = {
					EUR: '€',
					USD: '$',
					JPY: '¥',
					GBP: '£',
					RUB: '₽',
				};
				//get conversion rates from EUR
				var _rate;
				$.getJSON('http://api.fixer.io/latest?base=EUR', function(data) {
					_rate = data.rates;
				});
				var convert = function() {
					$timeout(function() {
						if (scope.importo !== undefined && _rate !== undefined) {
							const newRate = scope.currency === 'EUR' ? 1 : _rate[scope.currency];
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

			}
		};
	}]);

