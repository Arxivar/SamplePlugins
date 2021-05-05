
/* eslint-disable angular/di-unused */
angular.module('arxivar.plugins').factory('ConcludiWorkflow', ['$timeout', '$q', 'PluginCommand', '_', '$http', 'arxivarResourceService', 'arxivarUserServiceCreator', 'arxivarRouteService', 'arxivarDocumentsService', 'arxivarNotifierService', '$uibModal',
	function($timeout, $q, PluginCommand, _, $http, arxivarResourceService, arxivarUserServiceCreator, arxivarRouteService, arxivarDocumentsService, arxivarNotifierService, $uibModal,) {

		// MANDATORY settings in order for the plugin to work.
		var requiredSettings = {
			id: 'c41dc34a-591c-4011-9a98-0e4d0f81deaa',  // Unique plugin identifier (type: string)
			name: 'ConcludiWorkflow', // Plugin name. Spaces special characters not allowed (type: string)
			icon: 'fas fa-ban',
			label: 'ConcludiWorkflow', // User Interface label (type: string)
			description: 'conclude o elimina tutti i processi i cui documenti selezionati sono &#34;documento principale&#34;', // Plugin description (type: string)
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


						var checkProcess = function() {
							var promArray = [];

							_.forEach(params.docnumbers, function(docId) {
								promArray.push(arxivarResourceService.get('Workflow/bydocnumber/' + docId + '/history'));
							});
							return $q.all(promArray)
								.then(function(arrResult) {
									var result = false;
									_.forEach(arrResult, function(processHistories) {
										if (processHistories.length > 0) {
											result = true;
										}
									});
									return result;
								});
						};


						checkProcess()
							.then(function(hasProcess) {

								if (hasProcess) {
									$uibModal.open({
										animation: true,
										template: '<div class="modal-header">' +
											'<h3 class="modal-title">Concludi o elimina processi</h3>' +
											'<table class="table"> <tr><th>Nome</th> <th>Processi collegati</th> <th></th> <th></th> </tr>' +
											'<tr ng-repeat="process in allProcess"> <td>{{process.name}}</td> <td>{{process.ids.length}}</td>' +
											'<td><span title="concludi processo" class="arx-span" ng-click="stop(process)"><i class="fas fa-stop-circle"></i></span></td>' +
											'<td><span title="elimina processo" class="arx-span" ng-click="delete(process)"><i class="fas fa-trash"></i></span></div></td> </tr> </table>' +
											'</div></div><div class="modal-footer">' +
											'<button class="btn btn-primary" type="button" ng-click="cancel()">ESCI</button></div>',

										controller: ['$scope', '_', '$uibModalInstance', '$q',
											function($scope, _, $uibModalInstance, $q,) {


												$scope.allDocs = [];
												$scope.allProcess = [];

												$scope.cancel = function() {
													$uibModalInstance.dismiss('cancel');
												};


												$scope.stop = function(proc) {
													_.forEach(proc.ids, function(processId) {
														arxivarResourceService.update('Workflow/stop/' + processId)
															.then(function() {
																arxivarNotifierService.notifySuccess('Conclusione processo ' + processId + ' andata a buon fine');
															})
															.catch(function(err) {
																arxivarNotifierService.notifyError(err);
															});
													});
												};

												$scope.delete = function(proc) {
													_.forEach(proc.ids, function(processId) {
														arxivarResourceService.delete('Workflow/delete/' + processId + '/true')
															.then(function() {
																arxivarNotifierService.notifySuccess('Eliminazione processo ' + processId + ' andata a buon fine');
															})
															.catch(function(err) {
																arxivarNotifierService.notifyError(err);
															});
													});
												};


												_.forEach(params.docnumbers, function(docId) {
													arxivarResourceService.get('Workflow/bydocnumber/' + docId + '/history')
														.then(function(processHistories) {

															_.forEach(processHistories, function(process) { //
																var findedProcess = _.find($scope.allProcess, { name: process.name });
																if (!_.isNil(findedProcess)) {
																	findedProcess.ids.push(process.id);
																} else {
																	$scope.allProcess.push({ name: process.name, ids: [process.id] });
																}
															});
														})
														.catch(function(err) { arxivarNotifierService.notifyError(err); });
												});
											}
										]
									});
								} else {
									arxivarNotifierService.notifyError('Non ci sono processi attivi per il documento ');
								}
							});


					}
				});
		};

		return { plugin: myPlugin };
	}]);
