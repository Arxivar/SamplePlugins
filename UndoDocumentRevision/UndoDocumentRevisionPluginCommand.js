

/* eslint-disable angular/di-unused */
angular.module('arxivar.plugins').factory('UndoDocumentRevision', ['$q', 'PluginCommand', '_', 'arxivarResourceService', 'arxivarUserServiceCreator', 'arxivarRouteService', 'arxivarDocumentsService', 'arxivarNotifierService', '$uibModal',
	function($q, PluginCommand, _, arxivarResourceService, arxivarUserServiceCreator, arxivarRouteService, arxivarDocumentsService, arxivarNotifierService, $uibModal) {

		// MANDATORY settings in order for the plugin to work.
		var requiredSettings = {
			id: '84a8b913-f1e5-4eb8-b594-21c9243eb089',  // Unique plugin identifier (type: string)
			name: 'UndoDocumentRevision', // Plugin name. Spaces special characters not allowed (type: string)
			icon: 'fas fa-undo',
			label: 'UndoDocumentRevision', // User Interface label (type: string)
			description: 'ripristina la revisione precedente dei documenti selezionati', // Plugin description (type: string)
			author: 'Abletech srl', // Plugin author (type: string)
			minVersion: '2.0.0', // Minimun portal version this plugin supports. (type: string, format example: 0.0.1)
			requireRefresh: true // If this plugin requires grid data refresh (type boolean. Default: false)
		};

		// OPTIONAL settings. These objects require the following properties: name, description, defaultValue and type.
		// Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
		var customSettings = [
			//{name: '', description: '', defaultValue:'', type: 'string'},
		];

		// OPTIONAL settings for specific users. These objects require the following properties: name, description, defaultValue and type.
		// Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
		var userSettings = [
			//{name: '', description: '', defaultValue:'', type: 'string'},
		];

		var myPlugin = new PluginCommand(requiredSettings, customSettings, userSettings);

		// This function is a promise with asyncronous logic to determine if this plugin can run. Input parameters: array of docnumbers (params.docnumbers), flag locked (params.locked only in F2) 
		// Output parameter: Promise of bool
		myPlugin.canRun = function(params) {
			return params.hasOwnProperty('docnumbers') ? $q.when(params.docnumbers.length >= 1) : $q.resolve(false);
		};

		// This function is a promise with asyncronous run logic. Input parameters: array of docnumbers (params.docnumbers), flag locked (params.locked only in F2) 
		// Output parameter type expected: Promise of any
		myPlugin.run = function(params) {

			return myPlugin.canRun(params)

				.then(function(canRun) {
					if (canRun) {

						var promArray = [];

						_.forEach(params.docnumbers, function(docId) {
							promArray.push(arxivarResourceService.get('Revisions/byDocnumber/' + docId));
						});

						return $q.all(promArray)
							.then(function(arrResult) {
								var result = false;
								_.forEach(arrResult, function(revisioni, index) {
									if (revisioni.length > 0) {
										result = true;
									}
									if (revisioni.length === 0) {
										throw new Error('Il documento non ha revisioni, impossibile ripristinare');
									}
									if (params.rows[index].WFVERSIONSTATE === 1) {
										throw new Error('Processo di workflow in corso, impossibile ripristinare');
									}
									if (params.rows[index].WFVERSIONSTATE === 10) {
										throw new Error('Processo di workflow V2 in corso, impossibile ripristinare');
									}
								});
								return result;
							})
							.then(function(hasRevision) {

								if (hasRevision) {

									var modal = $uibModal.open({
										animation: true,
										template: '<div class="modal-header"> <h3 class="modal-title">Operazione in corso</h3></div>' +
											'<uib-progressbar max="max" value="dynamic"><span style="color:white; white-space:nowrap;">{{counter}} / {{max}}</span></uib-progressbar>' +
											'<div class="modal-footer"></div>',

										controller: ['$scope', '_', '$uibModalInstance', '$q',
											function($scope, _, $uibModalInstance, $q) {

												$scope.max = params.docnumbers.length;
												$scope.counter = 0;

												var promises = [];
												var promisesGet = [];
												_.forEach(params.docnumbers, function(value) {
													promisesGet.push(arxivarResourceService.get('Revisions/byDocnumber/' + value));
												});

												return $q.all(promisesGet)
													.then(function(revisioniInDocNumbers) {


														_.forEach(revisioniInDocNumbers, function(revisioni, index) {
															var revArray = revisioni;

															revArray = _.sortBy(revArray, ['revision']);
															var laRevisioneDaRipristinare = _.last(revArray);
															var promiseRevisionByRevision = arxivarResourceService.save('Revisions/' + params.docnumbers[index] + '/' + laRevisioneDaRipristinare.revision + '/1')
																.then(function() {
																	$scope.counter = $scope.counter + 1;
																});
															promises.push(promiseRevisionByRevision);

														});
													})
													.then(function() {
														return $q.all(promises);
													})
													.then(function() {
														$uibModalInstance.close();
														arxivarNotifierService.notifySuccess('Operazione andata a buon fine');
													});
											}]
									});
									return modal.result;
								}
							})
							.catch(function(err) {
								arxivarNotifierService.notifyError(err);
							});

					}
				});
		};


		return { plugin: myPlugin };
	}]);
