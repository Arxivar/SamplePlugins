/* eslint-disable angular/di-unused */
angular.module('arxivar.plugins.controller').controller('ObjectClonerCtrl',
	['$scope', 'ObjectCloner', '_', 'arxivarResourceService', 'arxivarUserServiceCreator', 'arxivarRouteService', 'arxivarDocumentsService', 'arxivarNotifierService', 'params', '$http', '$q',
		function($scope, ObjectCloner, _, arxivarResourceService, arxivarUserServiceCreator, arxivarRouteService, arxivarDocumentsService, arxivarNotifierService, params, $http, $q) {
			//To pass a parameter to the routePlugin add the queryParams parameter to the querystring
			//E.g. {URL_PORTAL}/#!/pluginroutes/{PLUGIN_ID}?queryParams=valueToPass
			//The object params contain a property queryParams with the value passed
			//E.g. console.log(params.queryParams) -&gt;  valueToPass

			function pagination(items, pageNumber, itemsPerPage) {
				let index;
				pageNumber = (pageNumber - 1) * itemsPerPage;
				let newArr = [];

				for (index = 0; index < items.length; index++) {
					if (index >= pageNumber && index <= pageNumber + (itemsPerPage - 1)) {
						newArr.push(items[index]);
					}
				}
				return newArr;
			};


			//***************************************************VIEW**********************************************
			function onInitView() {
				$scope.filterObj = {
					search: '',
					currentPage: 1,
					itemsPerPage: 10,
					maxSize: 5,
					boundaryLinks: true,
					filteredViews: [],
					chooseView: function(view) {

						arxivarResourceService.get('ViewsBuilder/' + view.id)
							.then(function(singleView) {
								var clonedView = _.cloneDeep(singleView);
								clonedView.id = '';
								clonedView.description = singleView.description + ' CLONE';

								return arxivarResourceService.save('ViewsBuilder', clonedView);
							})
							.then(function() {
								return arxivarResourceService.get('v3/Views');
							})
							.then(function(views) {
								$scope.allViews = _.sortBy(views, ['description']);
								$scope.filterObj.filteredViews = _.cloneDeep($scope.allViews);
								$scope.filterObj.totalItems = $scope.filterObj.filteredViews.length;
								$scope.filterObj.filteredViews = pagination($scope.filterObj.filteredViews, $scope.filterObj.currentPage, $scope.filterObj.itemsPerPage);
							})
							.catch(function(err) {
								arxivarNotifierService.notifyError(err);
							});
					}
				};


				arxivarResourceService.get('v3/Views')
					.then(function(views) {
						$scope.allViews = _.sortBy(views, ['description']);
						$scope.filterObj.filteredViews = _.cloneDeep($scope.allViews);
						$scope.filterObj.totalItems = $scope.filterObj.filteredViews.length;
						$scope.filterObj.filteredViews = pagination($scope.filterObj.filteredViews, $scope.filterObj.currentPage, $scope.filterObj.itemsPerPage);
					})
					.catch(function(err) {
						arxivarNotifierService.notifyError(err);
					});


			}

			onInitView();


			function goToPage(page) {
				var search = _.isNil($scope.filterObj.search) ? '' : $scope.filterObj.search.toLowerCase();
				$scope.filterObj.filteredViews = _.filter($scope.allViews, function(v) {
					return _.includes(v.description.toLowerCase(), search);
				});
				$scope.filterObj.totalItems = $scope.filterObj.filteredViews.length;
				$scope.filterObj.currentPage = page;
				$scope.filterObj.filteredViews = pagination($scope.filterObj.filteredViews, $scope.filterObj.currentPage, $scope.filterObj.itemsPerPage);
			}

			$scope.$watch('filterObj.search', function(newVal, oldVal) {
				goToPage(1);
			});


			$scope.$watch('filterObj.currentPage', function(newVal, oldVal) {
				goToPage(newVal);
			});


			//***************************************MODEL************************************************************
			function onInitModel() {

				$scope.filterObj2 = {
					search: '',
					currentPage: 1,
					itemsPerPage: 10,
					maxSize: 5,
					boundaryLinks: true,
					filteredModels: [],
					chooseModel: function(model) {

						arxivarResourceService
							.get('Models/' + model.id)
							.then(function(singleModel) {

								var clonedModel = _.cloneDeep(singleModel);
								clonedModel.id = 0;
								clonedModel.description = singleModel.description + ' CLONE';

								if (clonedModel.previewFileName) {

									$q.all([
										arxivarResourceService.getByteArray('Models/template/' + model.id),
										arxivarResourceService.getByteArray('Models/previewTemplate/' + model.id)
									])
										.then(function(arr) {
											var byteArray = arr[0];
											var byteArrayPrev = arr[1];

											//Upload
											var fileNameParts = clonedModel.fileName.split('.');
											fileNameParts[fileNameParts.length - 2] = fileNameParts[fileNameParts.length - 2] + ' CLONE';
											var filename = fileNameParts.join('.');

											var formData = new FormData();
											var myBlob = new Blob([byteArray.data]);
											formData.append('file', myBlob, filename);


											var fileNamePartsPrev = clonedModel.previewFileName.split('.');
											fileNamePartsPrev[fileNamePartsPrev.length - 2] = fileNamePartsPrev[fileNamePartsPrev.length - 2] + ' CLONE';
											var filenamePrev = fileNamePartsPrev.join('.');

											var formDataPrev = new FormData();
											var myBlobPrev = new Blob([byteArrayPrev.data]);
											formDataPrev.append('file', myBlobPrev, filenamePrev);

											return $q.all([
												$http({
													url: 'http://localhost/ARXivarResourceServer/api/Cache/insert',
													headers: { 'Content-Type': undefined },
													data: formData,
													method: 'POST'
												}),
												$http({
													url: 'http://localhost/ARXivarResourceServer/api/Cache/insert',
													headers: { 'Content-Type': undefined },
													data: formDataPrev,
													method: 'POST'
												})
											]);
										})
										.then(function(arr2) {
											var cache1 = arr2[0];
											var cache2 = arr2[1];

											var cacheId = cache1.data[0];
											clonedModel.documentCacheId = cacheId;

											var cacheId2 = cache2.data[0];
											clonedModel.previewDocumentCacheId = cacheId2;

											return arxivarResourceService.save('Models', clonedModel);

										})
										.then(function() {
											return arxivarResourceService.get('Models');
										})
										.then(function(models) {
											$scope.allModels = _.sortBy(models, ['groupName']);
											$scope.filterObj2.filteredModels = _.cloneDeep($scope.allModels);
											$scope.filterObj2.totalItems = $scope.filterObj2.filteredModels.length;
											$scope.filterObj2.filteredModels = pagination($scope.filterObj2.filteredModels, $scope.filterObj2.currentPage, $scope.filterObj2.itemsPerPage);
										});


								} else if (!clonedModel.previewFileName) {


									arxivarResourceService
										.getByteArray('Models/template/' + model.id)
										.then(function(byteArray) {

											//Upload
											var fileNameParts = clonedModel.fileName.split('.');
											fileNameParts[fileNameParts.length - 2] = fileNameParts[fileNameParts.length - 2] + ' CLONE';
											var filename = fileNameParts.join('.');


											var formData = new FormData();
											var myBlob = new Blob([byteArray.data]);
											formData.append('file', myBlob, filename);

											return $http({
												url: 'http://localhost/ARXivarResourceServer/api/Cache/insert',
												headers: { 'Content-Type': undefined },
												data: formData,
												method: 'POST'
											});
										})
										.then(function(cacheIds) {
											var cacheId = cacheIds.data[0];
											clonedModel.documentCacheId = cacheId;
											return arxivarResourceService.save('Models', clonedModel);
										})
										.then(function() {
											return arxivarResourceService.get('Models');
										})
										.then(function(models) {
											$scope.allModels = _.sortBy(models, ['groupName']);
											$scope.filterObj2.filteredModels = _.cloneDeep($scope.allModels);
											$scope.filterObj2.totalItems = $scope.filterObj2.filteredModels.length;
											$scope.filterObj2.filteredModels = pagination($scope.filterObj2.filteredModels, $scope.filterObj2.currentPage, $scope.filterObj2.itemsPerPage);
										})
										.catch(function(err) {
											arxivarNotifierService.notifyError(err);
										});
								};
							});
					}
				};


				arxivarResourceService.get('Models')
					.then(function(models) {
						$scope.allModels = _.sortBy(models, ['groupName']);
						$scope.filterObj2.filteredModels = _.cloneDeep($scope.allModels);
						$scope.filterObj2.totalItems = $scope.filterObj2.filteredModels.length;
						$scope.filterObj2.filteredModels = pagination($scope.filterObj2.filteredModels, $scope.filterObj2.currentPage, $scope.filterObj2.itemsPerPage);
					})
					.catch(function(err) {
						arxivarNotifierService.notifyError(err);
					});
			}

			onInitModel();


			function goToPage2(page) {
				var search = _.isNil($scope.filterObj2.search) ? '' : $scope.filterObj2.search.toLowerCase();
				$scope.filterObj2.filteredModels = _.filter($scope.allModels, function(obj) {
					return _.includes(obj.description.toLowerCase(), search);
				});
				$scope.filterObj2.totalItems = $scope.filterObj2.filteredModels.length;
				$scope.filterObj2.currentPage = page;
				$scope.filterObj2.filteredModels = pagination($scope.filterObj2.filteredModels, $scope.filterObj2.currentPage, $scope.filterObj2.itemsPerPage);
			}

			$scope.$watch('filterObj2.search', function(newVal, oldVal) {
				goToPage2(1);
			});


			$scope.$watch('filterObj2.currentPage', function(newVal, oldVal) {
				goToPage2(newVal);
			});

			//****************************************REPORT*************************************


			function onInitReport() {

				$scope.filterObj3 = {
					search: '',
					currentPage: 1,
					itemsPerPage: 10,
					maxSize: 5,
					boundaryLinks: true,
					filteredReports: [],
					chooseReport: function(report) {

						arxivarResourceService.get('Report/' + report.id)
							.then(function(singleReport) {

								var clonedReport = _.cloneDeep(singleReport);
								clonedReport.id = '';
								clonedReport.name = singleReport.name + ' CLONE';

								return $q.all(
									[arxivarResourceService.save('Report/Insert', clonedReport),
									arxivarResourceService.get('Report/' + report.id + '/Template?editMode=true')]
								);
							})
							.then(function(arr) {
								var newReport = arr[0];
								var templateParams = arr[1];
								//arxivarResourceService.get('Report')

								if (templateParams) {
									return arxivarResourceService.save('Report/' + newReport.data.id + '/UpdateTemplate', JSON.stringify(templateParams));

								} else {
									throw new Error('Non ci sono template');	//arxivarNotifierService.notifyError('Non ci sono template');
								}

							})
							.then(function() {
								arxivarNotifierService.notifySuccess('Operazione andata a buon fine');
								return arxivarResourceService.get('Report');
							})
							.then(function(reports) {
								$scope.allReports = _.sortBy(reports, ['name']);
								$scope.filterObj3.filteredReports = _.cloneDeep($scope.allReports);
								$scope.filterObj3.totalItems = $scope.filterObj3.filteredReports.length;
								$scope.filterObj3.filteredReports = pagination($scope.filterObj3.filteredReports, $scope.filterObj3.currentPage, $scope.filterObj3.itemsPerPage);
							})
							.catch(function(err) {
								arxivarNotifierService.notifyError(err);
							});
					},
				};
			};


			arxivarResourceService.get('Report')
				.then(function(reports) {
					$scope.allReports = _.sortBy(reports, ['name']);
					$scope.filterObj3.filteredReports = _.cloneDeep($scope.allReports);
					$scope.filterObj3.totalItems = $scope.filterObj3.filteredReports.length;
					$scope.filterObj3.filteredReports = pagination($scope.filterObj3.filteredReports, $scope.filterObj3.currentPage, $scope.filterObj3.itemsPerPage);
				})
				.catch(function(err) {
					arxivarNotifierService.notifyError(err);
				});


			onInitReport();

			function goToPage3(page) {
				var search = _.isNil($scope.filterObj3.search) ? '' : $scope.filterObj3.search.toLowerCase();
				$scope.filterObj3.filteredReports = _.filter($scope.allReports, function(obj) {
					return _.includes(obj.name.toLowerCase(), search);
				});
				$scope.filterObj3.totalItems = $scope.filterObj3.filteredReports.length;
				$scope.filterObj3.currentPage = page;
				$scope.filterObj3.filteredReports = pagination($scope.filterObj3.filteredReports, $scope.filterObj3.currentPage, $scope.filterObj3.itemsPerPage);
			}

			$scope.$watch('filterObj3.search', function(newVal, oldVal) {
				goToPage3(1);
			});


			$scope.$watch('filterObj3.currentPage', function(newVal, oldVal) {
				goToPage3(newVal);
			});


		}]);
