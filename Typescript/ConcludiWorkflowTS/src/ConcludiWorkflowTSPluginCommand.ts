import { LoDashStatic } from "lodash";
import uiGrid from "ui-grid";
import { arrayResult, httpOption, IScopeConcludiWorkflow, promiseArray } from "./ConcludiWorkflowTSTypes";

angular.module('arxivar.plugins').factory('ConcludiWorkflowTS', [
	'PluginCommand', '_', '$uibModal', 'arxivarResourceService', 'arxivarUserServiceCreator', 'arxivarRouteService', 'arxivarDocumentsService', 'arxivarNotifierService',
	(PluginCommand: IPluginCommand, _: LoDashStatic, $uibModal: angular.ui.bootstrap.IModalService, arxivarResourceService: IArxivarResourceService, arxivarUserServiceCreator: IArxivarUserServiceCreator, arxivarRouteService: IArxivarRouteService, arxivarDocumentsService: IArxivarDocumentsService, arxivarNotifierService: IArxivarNotifierService) => {

		// MANDATORY settings in order for the plugin to work.
		const requiredSettings: IRequiredSettings = {
			id: '8c7ab7ae-546b-43c8-98de-981aeb1c5376',  // Unique plugin identifier (type: string)
			name: 'ConcludiWorkflowTS', // Plugin name. Spaces special characters not allowed (type: string)
			icon: 'fas fa-ban',
			label: 'ConcludiWorkflowTS', // User Interface label (type: string)
			description: 'conclude o elimina tutti i processi i cui documenti selezionati sono documento principale', // Plugin description (type: string)
			author: 'Abletech srl', // Plugin author (type: string)
			minVersion: '2.0.0', // Minimun portal version this plugin supports. (type: string, format example: 0.0.1)
			requireRefresh: true, // If this plugin requires grid data refresh (type boolean. Default: false)
			useTypescript: true // If this plugin use typescript compiler (type boolean. Default: false) 
		};

		// OPTIONAL settings. These objects require the following properties: name, description, defaultValue and type.
		// Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
		const customSettings: ICustomSettings[] = [
			//{name: '', description: '', defaultValue:'', type: 'string'},
		];

		// OPTIONAL settings for specific users. These objects require the following properties: name, description, defaultValue and type.
		// Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
		const userSettings: IUserSettings[] = [
			//{name: '', description: '', defaultValue:'', type: 'string'},
		];

		const myPlugin = new PluginCommand(requiredSettings, customSettings, userSettings);

		// This function is a promise with asyncronous logic to determine if this plugin can run. Input parameters: array of docnumbers (params.docnumbers), flag locked (params.locked only in F2) 
		// Output parameter: Promise of bool
		myPlugin.canRun = (params) => {
			return params.hasOwnProperty('docnumbers') ? Promise.resolve(params.docnumbers.length >= 1) : Promise.resolve(false);
		};

		// This function is a promise with asyncronous run logic. Input parameters: array of docnumbers (params.docnumbers), flag locked (params.locked only in F2) 
		// Output parameter type expected: Promise of any
		myPlugin.run = (params) => {
			return myPlugin.canRun(params).then((canRun) => {
				if (canRun) {

					const checkProcess = () => {
						const promArray: promiseArray = [];

						_.forEach(params.docnumbers, (docId) => {
							promArray.push(arxivarResourceService.get('Workflow/bydocnumber/' + docId + '/history', httpOption));
						});
						return Promise.all(promArray)
							.then((arrResult: arrayResult) => {
								let result = false;
								_.forEach(arrResult, (processHistories) => {
									if (processHistories.length > 0) {
										result = true;
									}
								});
								return result;
							});
					};

					checkProcess()
						.then((hasProcess) => {

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

									controller: ['$scope', '_', '$uibModalInstance',
										($scope: IScopeConcludiWorkflow, _: LoDashStatic, $uibModalInstance: angular.ui.bootstrap.IModalInstanceService) => {

											$scope.allProcess = [];

											$scope.cancel = () => {
												$uibModalInstance.dismiss('cancel');
											};

											$scope.stop = (proc) => {
												_.forEach(proc.ids, (processId) => {
													arxivarResourceService.update('Workflow/stop/' + processId, httpOption, httpOption)
														.then(() => {
															arxivarNotifierService.notifySuccess('Conclusione processo ' + processId + ' andata a buon fine');
														})
														.catch((err) => {
															arxivarNotifierService.notifyError(err);
														});
												});
											};

											$scope.delete = (proc) => {
												_.forEach(proc.ids, (processId) => {
													arxivarResourceService.delete('Workflow/delete/' + processId + '/true', httpOption, httpOption)
														.then(() => {
															arxivarNotifierService.notifySuccess('Eliminazione processo ' + processId + ' andata a buon fine');
														})
														.catch((err) => {
															arxivarNotifierService.notifyError(err);
														});
												});
											};

											_.forEach(params.docnumbers, (docId) => {
												arxivarResourceService.get('Workflow/bydocnumber/' + docId + '/history', httpOption)
													.then((processHistories: arrayResult) => {

														_.forEach(processHistories, (process) => {
															let findedProcess = _.find($scope.allProcess, { name: process.name });
															if (!_.isNil(findedProcess)) {
																findedProcess.ids.push(process.id);
															} else {
																$scope.allProcess.push({ name: process.name, ids: [process.id] });
															}
														});
													})
													.catch((err) => { arxivarNotifierService.notifyError(err); });
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
