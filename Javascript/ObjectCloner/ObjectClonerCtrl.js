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
				$scope.viewsObj = {
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
								arxivarNotifierService.notifySuccess('Operazione andata a buon fine');
								$scope.allViews = _.sortBy(views, ['description']);
								$scope.viewsObj.filteredViews = _.cloneDeep($scope.allViews);
								$scope.viewsObj.totalItems = $scope.viewsObj.filteredViews.length;
								$scope.viewsObj.filteredViews = pagination($scope.viewsObj.filteredViews, $scope.viewsObj.currentPage, $scope.viewsObj.itemsPerPage);
							})
							.catch(function(err) {
								arxivarNotifierService.notifyError(err);
							});
					}
				};

				arxivarResourceService.get('v3/Views')
					.then(function(views) {
						$scope.allViews = _.sortBy(views, ['description']);
						$scope.viewsObj.filteredViews = _.cloneDeep($scope.allViews);
						$scope.viewsObj.totalItems = $scope.viewsObj.filteredViews.length;
						$scope.viewsObj.filteredViews = pagination($scope.viewsObj.filteredViews, $scope.viewsObj.currentPage, $scope.viewsObj.itemsPerPage);
					})
					.catch(function(err) {
						arxivarNotifierService.notifyError(err);
					});

			}

			onInitView();

			function goToViewPage(page) {
				var search = _.isNil($scope.viewsObj.search) ? '' : $scope.viewsObj.search.toLowerCase();
				$scope.viewsObj.filteredViews = _.filter($scope.allViews, function(v) {
					return _.includes(v.description.toLowerCase(), search);
				});
				$scope.viewsObj.totalItems = $scope.viewsObj.filteredViews.length;
				$scope.viewsObj.currentPage = page;
				$scope.viewsObj.filteredViews = pagination($scope.viewsObj.filteredViews, $scope.viewsObj.currentPage, $scope.viewsObj.itemsPerPage);
			}

			$scope.$watch('viewsObj.search', function(newVal, oldVal) {
				goToViewPage(1);
			});

			$scope.$watch('viewsObj.currentPage', function(newVal, oldVal) {
				goToViewPage(newVal);
			});

			//***************************************MODEL************************************************************
			function onInitModel() {

				$scope.modelsObj = {
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
												//arxivarResourceService.getPost('Cache/insert', formData, { 'Content-Type': undefined }),
												$http({
													url: arxivarResourceService.resourceService.arxivarConfig.rootApi + 'Cache/insert',
													headers: { 'Content-Type': undefined },
													data: formData,
													method: 'POST'
												}),


												$http({
													url: arxivarResourceService.resourceService.arxivarConfig.rootApi + 'Cache/insert',
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
											arxivarNotifierService.notifySuccess('Operazione andata a buon fine');
											$scope.allModels = _.sortBy(models, ['description']);
											$scope.modelsObj.filteredModels = _.cloneDeep($scope.allModels);
											$scope.modelsObj.totalItems = $scope.modelsObj.filteredModels.length;
											$scope.modelsObj.filteredModels = pagination($scope.modelsObj.filteredModels, $scope.modelsObj.currentPage, $scope.modelsObj.itemsPerPage);
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
												url: arxivarResourceService.resourceService.arxivarConfig.rootApi + 'Cache/insert',
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
											arxivarNotifierService.notifySuccess('Operazione andata a buon fine');
											$scope.allModels = _.sortBy(models, ['description']);
											$scope.modelsObj.filteredModels = _.cloneDeep($scope.allModels);
											$scope.modelsObj.totalItems = $scope.modelsObj.filteredModels.length;
											$scope.modelsObj.filteredModels = pagination($scope.modelsObj.filteredModels, $scope.modelsObj.currentPage, $scope.modelsObj.itemsPerPage);
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
						$scope.allModels = _.sortBy(models, ['description']);
						$scope.modelsObj.filteredModels = _.cloneDeep($scope.allModels);
						$scope.modelsObj.totalItems = $scope.modelsObj.filteredModels.length;
						$scope.modelsObj.filteredModels = pagination($scope.modelsObj.filteredModels, $scope.modelsObj.currentPage, $scope.modelsObj.itemsPerPage);
					})
					.catch(function(err) {
						arxivarNotifierService.notifyError(err);
					});
			}

			onInitModel();

			function goToModelPage(page) {
				var search = _.isNil($scope.modelsObj.search) ? '' : $scope.modelsObj.search.toLowerCase();
				$scope.modelsObj.filteredModels = _.filter($scope.allModels, function(obj) {
					return _.includes(obj.description.toLowerCase(), search);
				});
				$scope.modelsObj.totalItems = $scope.modelsObj.filteredModels.length;
				$scope.modelsObj.currentPage = page;
				$scope.modelsObj.filteredModels = pagination($scope.modelsObj.filteredModels, $scope.modelsObj.currentPage, $scope.modelsObj.itemsPerPage);
			}

			$scope.$watch('modelsObj.search', function(newVal, oldVal) {
				goToModelPage(1);
			});

			$scope.$watch('modelsObj.currentPage', function(newVal, oldVal) {
				goToModelPage(newVal);
			});

			//****************************************REPORT*************************************

			function onInitReport() {

				$scope.reportsObj = {
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
									return arxivarNotifierService.notifyError('Non ci sono template da clonare');
									//throw new Error('Non ci sono template');	//arxivarNotifierService.notifyError('Non ci sono template');
								}

							})
							.then(function() {
								arxivarNotifierService.notifySuccess('Operazione andata a buon fine');
								return arxivarResourceService.get('Report');
							})
							.then(function(reports) {
								$scope.allReports = _.sortBy(reports, ['name']);
								$scope.reportsObj.filteredReports = _.cloneDeep($scope.allReports);
								$scope.reportsObj.totalItems = $scope.reportsObj.filteredReports.length;
								$scope.reportsObj.filteredReports = pagination($scope.reportsObj.filteredReports, $scope.reportsObj.currentPage, $scope.reportsObj.itemsPerPage);
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
					$scope.reportsObj.filteredReports = _.cloneDeep($scope.allReports);
					$scope.reportsObj.totalItems = $scope.reportsObj.filteredReports.length;
					$scope.reportsObj.filteredReports = pagination($scope.reportsObj.filteredReports, $scope.reportsObj.currentPage, $scope.reportsObj.itemsPerPage);
				})
				.catch(function(err) {
					arxivarNotifierService.notifyError(err);
				});

			onInitReport();

			function goToReportPage(page) {
				var search = _.isNil($scope.reportsObj.search) ? '' : $scope.reportsObj.search.toLowerCase();
				$scope.reportsObj.filteredReports = _.filter($scope.allReports, function(obj) {
					return _.includes(obj.name.toLowerCase(), search);
				});
				$scope.reportsObj.totalItems = $scope.reportsObj.filteredReports.length;
				$scope.reportsObj.currentPage = page;
				$scope.reportsObj.filteredReports = pagination($scope.reportsObj.filteredReports, $scope.reportsObj.currentPage, $scope.reportsObj.itemsPerPage);
			}

			$scope.$watch('reportsObj.search', function(newVal, oldVal) {
				goToReportPage(1);
			});

			$scope.$watch('reportsObj.currentPage', function(newVal, oldVal) {
				goToReportPage(newVal);
			});
		}]);
