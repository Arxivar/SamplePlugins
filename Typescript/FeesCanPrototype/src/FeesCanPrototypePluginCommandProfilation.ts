import { LoDashStatic } from 'lodash';

angular.module('arxivar.plugins').factory('FeesCanPrototype', [
	'PluginProfilation', 'arxivarResourceService', '$uibModal',
	function(PluginProfilation: IPluginProfilation, arxivarResourceService: IArxivarResourceService, $uibModal: any){

		// MANDATORY settings in order for the plugin to work.
		const requiredSettings: IRequiredSettings = {
			id: '9515a392-a3cb-4a0f-9a53-3ce2c3365d92',  // Unique plugin identifier (type: string)
			name: 'FeesCanPrototype', // Plugin name. Spaces special characters not allowed (type: string)
			icon: 'fas fa-receipt',
			label: 'FeesCanPrototype label', // User Interface label (type: string)
			description: 'FeesCanPrototype description', // Plugin description (type: string)
			author: 'Able Tech', // Plugin author (type: string)
			minVersion: '2.2.0', // Minimun portal version this plugin supports. (type: string, format example: 0.0.1)
			useTypescript: true // If this plugin use typescript compiler (type boolean. Default: false)
		};
		
		// OPTIONAL settings. These objects require the following properties: name, description, defaultValue and type.
		// Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
		const customSettings: ICustomSettings[] = [
			{ name: 'date', description: 'date', defaultValue: '', type: 'string' },
			{ name: 'price', description: 'price', defaultValue: '', type: 'string' },
			{ name: 'currency', description: 'currency', defaultValue: '', type: 'string' },
			{ name: 'merchant', description: 'merchant', defaultValue: '', type: 'string' },
			{ name: 'vat_number', description: 'vat_number', defaultValue: '', type: 'string' },
			{ name: 'country_code', description: 'country_code', defaultValue: '', type: 'string' },
			{ name: 'company_name', description: 'company_name', defaultValue: '', type: 'string' },
			{ name: 'company_address', description: 'company_address', defaultValue: '', type: 'string' },
			{ name: 'ndoc', description: 'ndoc', defaultValue: '', type: 'string' },
			{ name: 'api_key', description: 'api_key', defaultValue: '', type: 'string' },

		];

		// OPTIONAL settings for specific users. These objects require the following properties: name, description, defaultValue and type.
		// Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
		const userSettings: IUserSettings[] = [
			//{name: '', description: '', defaultValue:'', type: 'string'},
		];

		const myPlugin = new PluginProfilation(requiredSettings, customSettings, userSettings);

		// This function is a promise with asyncronous logic to determine if this plugin can run.
		// Input parameters: array of fields (params.fields), value of docnumber (params.docnumber only in edit profile),array of files (params.files)
		// Output parameter: Promise of bool
		myPlugin.canRun = function(params) {
			return (params.hasOwnProperty('fields') ? Promise.resolve(params.fields.length >= 1) : Promise.resolve(false)) 
			&& (params.hasOwnProperty('files') ? Promise.resolve(params.files.length >= 1) : Promise.resolve(false));
		};

		// This function is a promise with asyncronous run logic.
		// Input parameters: array of fields (params.fields), value of docnumber (params.docnumber only in edit profile),array of files (params.files)
		// Output parameter: Promise of object with 2 props: fields => array of fields (only the fields to change) and files => array of files (replace the files on profilation)
		myPlugin.run = function(params){
			const thisPlugin = myPlugin;
			return myPlugin.canRun(params)
				.then(function(canRun){
					if (canRun) {
						const modal = $uibModal.open({
							animation: true,
							size: 'lg',
							template: `
								<div class="inmodal">
									<div class="modal-header">
										<h2><i class="fas fa-receipt"></i><span style="margin-left:5px">Scontrino</span></h2>
									</div>
									<div class="modal-body">
										<div class="modalContainer">
											<div style='display: flex;
											flex-direction: column;
											align-items: center;'>
												<div ng-if='onLoading'>
													<h1>Caricamento...</h1>
												</div>
												<div ng-if='!onLoading'>
													<h3 style="text-align:center">Anteprima elaborata</h3>
													<img ng-src='{{croppedImage}}'>
												</div>
											</div>
										</div>
									</div>
									<div class="modal-footer">
										<button class="btn btn-primary" type="button" ng-click="confirm()"><span translate="Ok" /></button>
									</div>
								</div>`,
							controller: ['$scope', '$uibModalInstance', '_', '$timeout', 
							function($scope: any, $uibModalInstance: any, _: LoDashStatic, $timeout: any) {
									$scope.returnFields = [];
									$scope.originalImage = undefined;
									$scope.onLoading = true;
									$scope.apiKey = _.find(thisPlugin.customSettings, {
										name: 'api_key'
									}).value as string;

									$scope.confirm = function() {
										$uibModalInstance.close({fields:$scope.returnFields,files:params.files});
									};

									arxivarResourceService.getByteArray('/Buffer/file/'+ params.files[0].fileGuid ,undefined)
									.then(function(file){
										_uploadToFee(file.data);
										_uploadToCrop(file.data);
									});

									var _getCustomField = function() {
										return {
											date: _.find(thisPlugin.customSettings, {
												name: 'date'
											}).value as string,
											price: _.find(thisPlugin.customSettings, {
												name: 'price'
											}).value as string,
											currency: _.find(thisPlugin.customSettings, {
												name: 'currency'
											}).value as string,
											merchant: _.find(thisPlugin.customSettings, {
												name: 'merchant'
											}).value as string,
											vat_number: _.find(thisPlugin.customSettings, {
												name: 'vat_number'
											}).value as string,
											country_code: _.find(thisPlugin.customSettings, {
												name: 'country_code'
											}).value as string,
											company_name: _.find(thisPlugin.customSettings, {
												name: 'company_name'
											}).value as string,
											company_address: _.find(thisPlugin.customSettings, {
												name: 'company_address'
											}).value as string,
											ndoc: _.find(thisPlugin.customSettings, {
												name: 'ndoc'
											}).value as string,
										};
									};

									var _setFields = function(fields: any, newFieldValues: any) {
										var customFields = _getCustomField();
										const newFields = fields.map(function(f: any) {
											let value = f.value;
											switch (f.name.toLowerCase()) {
												case customFields.date.toLowerCase():
													value = newFieldValues.date;
													break;
												case customFields.price.toLowerCase():
													value = newFieldValues.price;
													break;
												case customFields.currency.toLowerCase():
													value = newFieldValues.currency;
													break;
												case customFields.merchant.toLowerCase():
													value = newFieldValues.merchant;
													break;
												case customFields.vat_number.toLowerCase():
													value = newFieldValues.vat.vat_number;
													break;
												case customFields.country_code.toLowerCase():
													value = newFieldValues.vat.country_code;
													break;
												case customFields.company_name.toLowerCase():
													value = newFieldValues.vat.company_name;
													break;
												case customFields.company_address.toLowerCase():
													value = newFieldValues.vat.company_address;
													break;
												case customFields.ndoc.toLowerCase():
													value = newFieldValues.ndoc;
													break;
												default:
													break;
											}
											return {
												...f,
												value
											};

										});
										return newFields;
									};

									const _uploadToFee = function(file:any): Promise<string> {
										return new Promise(function(resolve, reject){
											const myBlobFile = new Blob([file]);
											const myHeaders = new Headers();
												myHeaders.append('x-api-key', $scope.apiKey);
												const myBody = new FormData();
												myBody.append('file', myBlobFile, '');
												fetch('https://service.fees.world/API/v1.2/ocr', {
													method: 'POST',
													headers: myHeaders,
													// mode: 'no-cors' // I thought that this might not be required to be used. But please check this for your actual situation.
													body: myBody
												})
													.then(function(response){
														return response.json()
													})
													.then(function(results){
														const values = results.Data;
														$scope.returnFields = _setFields(params.fields, values);
													});
										});
									};
									const _uploadToCrop = function(file:any): Promise<string> {
										return new Promise(function(resolve, reject){
											const myBlobFile = new Blob([file]);
											const myHeaders = new Headers();
												myHeaders.append('x-api-key', $scope.apiKey);
												const myBody = new FormData();
												myBody.append('file', myBlobFile, file.name);
												fetch('https://service.fees.world/API/v1.2/crop', {
													method: 'POST',
													headers: myHeaders,
													// mode: 'no-cors' // I thought that this might not be required to be used. But please check this for your actual situation.
													body: myBody
												})
													.then(function(response){
														return response.blob()
													})
													.then(function(results){
														$timeout(function(){
															const objectURL = URL.createObjectURL(results);
															$scope.croppedImage = objectURL;
															$scope.onLoading = false;
														});
													});
										});
									};
								}
							]
						});
						return modal.result.then(function({fields,files}:any){
							return{fields,files};
						});
					};
					return null;
				});
		};


		return { plugin: myPlugin };
	}]);

