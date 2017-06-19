
angular.module('arxivar.plugins.directives').directive('taskinvoicewidgetdirective', [
	'TaskInvoiceWidget', 'pluginService', 'taskVariablesService', 'taskOperationsService', '_', 'moment',
	function(TaskInvoiceWidget, pluginService, taskVariablesService, taskOperationsService, _, moment) {

		return {
			restrict: 'E',
			scope: {
				taskDto: '=?'
			},
			templateUrl: './Scripts/plugins/TaskInvoiceWidget/TaskInvoiceWidget.html',
			link: function(scope, element, attrs, ctrls) {

				const _settVariables = ({
					booleanVariables,
					stringVariables,
					comboVariables,
					dateTimeVariables,
					doubleVariables,
					tableVariables, }) => {
					scope.variables = _.concat(booleanVariables, stringVariables, comboVariables, dateTimeVariables, doubleVariables, tableVariables);
					scope.ragionesociale = _.find(scope.variables, { name: 'Ragione sociale' }).displayValue;
					scope.indirizzo = _.find(scope.variables, { name: 'Indirizzo' }).displayValue;
					scope.numerofattura = _.find(scope.variables, { name: 'Numero fattura' }).displayValue;
					scope.importo = _.find(scope.variables, { name: 'Importo' }).value;
					scope.datafattura = moment(_.find(scope.variables, { name: 'Data fattura' }).value).format('L');
					scope.datascadenza = moment(_.find(scope.variables, { name: 'Data scadenza' }).value).format('L');


					var xmlhttp = new XMLHttpRequest();

					var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + scope.indirizzo;
					xmlhttp.onreadystatechange = function() {
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
						if (this.readyState === 4 && this.status === 200) {
							var response = JSON.parse(this.responseText);
							initMap(response.results[0].geometry.location.lat, response.results[0].geometry.location.lng);
						}
					};
					xmlhttp.open('GET', url, true);
					xmlhttp.send();
				};
				$.getScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyC341o4aabs3DDquZfq6BCUihpmD6pgPKo', function() {
					var $mainContainer = $(element).find('div.arx-' + TaskInvoiceWidget.plugin.name.toLowerCase());
					if ($mainContainer.length > 0) {
						$mainContainer.addClass(scope.instanceId);
					}
					if (!_.isNil(scope.taskDto.id)) {
						if (_.isNil(this.operationVariables)) {
							taskOperationsService.getTaskOperations(scope.taskDto.id)
								.then((operations) => {
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

			}
		};
	}]);
