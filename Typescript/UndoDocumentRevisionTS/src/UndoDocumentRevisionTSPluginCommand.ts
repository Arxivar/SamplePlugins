import { LoDashStatic } from "lodash";
import { arrRevisions, httpOption, IScopeUndoDocumentRevision, promiseArray } from "./UndoDocumentRevisionTSTypes";

angular.module('arxivar.plugins').factory('UndoDocumentRevisionTS', [
	'PluginCommand', '_', '$uibModal', 'arxivarResourceService', 'arxivarUserServiceCreator', 'arxivarRouteService', 'arxivarDocumentsService', 'arxivarNotifierService',
	(PluginCommand: IPluginCommand, _: LoDashStatic, $uibModal: angular.ui.bootstrap.IModalService, arxivarResourceService: IArxivarResourceService, arxivarUserServiceCreator: IArxivarUserServiceCreator, arxivarRouteService: IArxivarRouteService, arxivarDocumentsService: IArxivarDocumentsService, arxivarNotifierService: IArxivarNotifierService) => {

		// MANDATORY settings in order for the plugin to work.
		const requiredSettings: IRequiredSettings = {
			id: '0a350254-7c75-472b-954b-1c6b9137aba2',  // Unique plugin identifier (type: string)
			name: 'UndoDocumentRevisionTS', // Plugin name. Spaces special characters not allowed (type: string)
			icon: 'fas fa-undo',
			label: 'UndoDocumentRevisionTS', // User Interface label (type: string)
			description: 'ripristina la revisione precedente dei documenti selezionati', // Plugin description (type: string)
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

					const promArray: promiseArray = [];

					_.forEach(params.docnumbers, (docId) => {
						promArray.push(arxivarResourceService.get('Revisions/byDocnumber/' + docId, httpOption));
					});

					return Promise.all(promArray)
						.then((arrResult: arrRevisions) => {
							let result = false;
							_.forEach(arrResult, (revisioni, index) => {
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
						.then((hasRevision) => {

							if (hasRevision) {

								const modal = $uibModal.open({
									animation: true,
									template: '<div class="modal-header"> <h3 class="modal-title">Operazione in corso</h3></div>' +
										'<uib-progressbar max="max" value="dynamic"><span style="color:white; white-space:nowrap;">{{counter}} / {{max}}</span></uib-progressbar>' +
										'<div class="modal-footer"></div>',

									controller: ['$scope', '_', '$uibModalInstance', '$q',
										($scope: IScopeUndoDocumentRevision, _: LoDashStatic, $uibModalInstance: angular.ui.bootstrap.IModalInstanceService) => {

											$scope.max = params.docnumbers.length;
											$scope.counter = 0;

											const promises: promiseArray = [];
											const promisesGet: promiseArray = [];
											_.forEach(params.docnumbers, (value) => {
												promisesGet.push(arxivarResourceService.get('Revisions/byDocnumber/' + value, httpOption));
											});

											return Promise.all(promisesGet)
												.then((revisioniInDocNumbers: arrRevisions) => {


													_.forEach(revisioniInDocNumbers, (revisioni, index) => {
														let revArray = revisioni;

														revArray = _.sortBy(revArray, ['revision']);
														let laRevisioneDaRipristinare = _.last(revArray);
														let promiseRevisionByRevision = arxivarResourceService.save('Revisions/' + params.docnumbers[index] + '/' + laRevisioneDaRipristinare.revision + '/1', httpOption, httpOption)
															.then(() => {
																$scope.counter = $scope.counter + 1;
															});
														promises.push(promiseRevisionByRevision);

													});
												})
												.then(() => {
													return Promise.all(promises);
												})
												.then(() => {
													$uibModalInstance.close();
													arxivarNotifierService.notifySuccess('Operazione andata a buon fine');
												});
										}]
								});
								return modal.result;
							}
						})
						.catch((err) => arxivarNotifierService.notifyError(err));
				}
			});
		};

		return { plugin: myPlugin };
	}]);
