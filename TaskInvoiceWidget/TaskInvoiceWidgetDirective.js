
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
				var _settVariables = ({
					booleanVariables,
					stringVariables,
					comboVariables,
					dateTimeVariables,
					doubleVariables,
					tableVariables, }) => {
					var fields = _getCustomField();
					scope.variables = _.concat(booleanVariables, stringVariables, comboVariables, dateTimeVariables, doubleVariables, tableVariables);
					scope.ragionesociale = _.find(scope.variables, { name: fields.ragionesociale }).displayValue;
					scope.indirizzo = _.find(scope.variables, { name: fields.indirizzo }).displayValue;
					scope.numerofattura = _.find(scope.variables, { name: fields.numerofattura }).displayValue;
					scope.importo = _.find(scope.variables, { name: fields.importo }).value;
					scope.importoView = scope.importo;
					scope.datafattura = moment(_.find(scope.variables, { name: fields.datafattura }).value).format('L');
					scope.datascadenza = moment(_.find(scope.variables, { name: fields.datascadenza }).value).format('L');


					var xmlhttp = new XMLHttpRequest();

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
				$.getScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyC341o4aabs3DDquZfq6BCUihpmD6pgPKo', function() {
					var $mainContainer = $(element).find('div.arx-' + TaskInvoiceWidget.plugin.name.toLowerCase());
					if ($mainContainer.length > 0) {
						$mainContainer.addClass(scope.instanceId);
					}
					if (!_.isNil(scope.taskDto.id)) {
						if (_.isNil(this.operationVariables)) {
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
				});
				var convert = function(data) {
					$timeout(function() {
						if (scope.importo !== undefined) {
							const newRate = scope.currency === 'EUR' ? 1 : data.rates[scope.currency];
							scope.importoView = (newRate * scope.importo).toFixed(2);

						}
					});
				};
				scope.currencyToSymbol = {
					EUR: '€',
					USD: '$',
					JPY: '¥',
					GBP: '£',
					RUB: '₽',
				};
				scope.$watch('currency', function() {
					$.getJSON('http://api.fixer.io/latest?base=EUR', convert);
				});

			}
		};
	}]);

