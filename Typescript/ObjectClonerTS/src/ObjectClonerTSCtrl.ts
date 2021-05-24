import { LoDashStatic } from "lodash";
import { routeType } from "./ObjectClonerTS";
import { onInitReport } from "./ObjectClonerTSReports";
import { onInitView } from "./ObjectClonerTSViews";
import { onInitModel } from "./ObjectClonerTSModels";
import { IObjectCloner } from "./ObjectClonerTSTypes";


angular.module('arxivar.plugins.controller').controller('ObjectClonerTSCtrl', [
	'$timeout', '$scope', '_', '$http', 'arxivarResourceService', 'arxivarUserServiceCreator', 'arxivarRouteService', 'arxivarDocumentsService', 'arxivarNotifierService', 'ObjectClonerTS',
	($timeout: angular.ITimeoutService, $scope: IObjectCloner, _: LoDashStatic, $http: angular.IHttpService, arxivarResourceService: IArxivarResourceService, arxivarUserServiceCreator: IArxivarUserServiceCreator, arxivarRouteService: IArxivarRouteService, arxivarDocumentsService: IArxivarDocumentsService, arxivarNotifierService: IArxivarNotifierService, ObjectClonerTS: routeType) => {


		//***************************************************VIEW**********************************************

		const itemPerPage = 10
		const _maxSize = 5;

		onInitView(itemPerPage, arxivarResourceService, arxivarNotifierService, _)
			.then((resultInitView) => {
				if (resultInitView) {
					$timeout(() => {
						$scope.viewObj = {
							allViews: resultInitView.allViews,
							search: '',
							currentPage: 1,
							itemsPerPage: itemPerPage,
							maxSize: _maxSize,
							boundaryLinks: true,
							filteredViews: resultInitView.filteredViews,
							totalItems: resultInitView.totalItems,
							cloneViewFunction: (currentPage, view) => {
								return resultInitView.cloneViewFunction(currentPage, view)
									.then((resultClone) => {
										if (resultClone) {
											const { allViews, totalItems, filteredViews } = resultClone;
											$scope.viewObj.allViews = allViews;
											$scope.viewObj.totalItems = totalItems;
											$scope.viewObj.filteredViews = filteredViews;
										}
									});
							},
						}

						$scope.$watch('viewObj.search', (newVal, oldVal) => {
							const { totalItems, currentPage, filteredViews } = resultInitView.goToViewPage($scope, 1)
							$scope.viewObj.totalItems = totalItems;
							$scope.viewObj.currentPage = currentPage;
							$scope.viewObj.filteredViews = filteredViews;
						});

						$scope.$watch('viewObj.currentPage', (newVal: number, oldVal) => {
							const { totalItems, currentPage, filteredViews } = resultInitView.goToViewPage($scope, newVal);
							$scope.viewObj.totalItems = totalItems;
							$scope.viewObj.currentPage = currentPage;
							$scope.viewObj.filteredViews = filteredViews;
						});
					})

				}
			});



		//***************************MODEL********************************************/

		onInitModel(itemPerPage, arxivarResourceService, arxivarNotifierService, _, $http)
			.then((resultInitModel) => {
				if (resultInitModel) {
					$timeout(() => {
						$scope.modelObj = {
							search: '',
							currentPage: 1,
							itemsPerPage: itemPerPage,
							maxSize: _maxSize,
							boundaryLinks: true,
							allModels: resultInitModel.allModels,
							filteredModels: resultInitModel.filteredModels,
							totalItems: resultInitModel.totalItems,
							cloneModelFunction: (currentPage, model) => {
								return resultInitModel.cloneModelFunction(currentPage, model)
									.then((resultClone) => {
										if (resultClone) {
											const { allModels, totalItems, filteredModels } = resultClone;
															
											$scope.modelObj.allModels =allModels;
											$scope.modelObj.totalItems = totalItems;
											$scope.modelObj.filteredModels = filteredModels;
										}
									});
							},
						};

						$scope.$watch('modelObj.search', (newVal, oldVal) => {
							const { totalItems, currentPage, filteredModels } = resultInitModel.goToModelPage($scope, 1)
							$scope.modelObj.totalItems = totalItems;
							$scope.modelObj.currentPage = currentPage;
							$scope.modelObj.filteredModels = filteredModels;
						});

						$scope.$watch('modelObj.currentPage', (newVal: number, oldVal) => {
							const { totalItems, currentPage, filteredModels } = resultInitModel.goToModelPage($scope, newVal)
							$scope.modelObj.totalItems = totalItems;
							$scope.modelObj.currentPage = currentPage;
							$scope.modelObj.filteredModels = filteredModels;
						});
					})

				}
			});

		//***************************REPORT********************************************/

		onInitReport(itemPerPage, arxivarResourceService, arxivarNotifierService, _)
			.then((resultInitReport) => {
				if (resultInitReport) {
					$timeout(() => {
						$scope.reportObj = {
							search: '',
							currentPage: 1,
							itemsPerPage: itemPerPage,
							maxSize: _maxSize,
							allReports: resultInitReport.allReports,
							boundaryLinks: true,
							filteredReports: resultInitReport.filteredReports,
							totalItems: resultInitReport.totalItems,
							cloneReportFunction: (currentPage, report) => {
								return resultInitReport.cloneReportFunction(currentPage, report)
									.then((resultClone) => {
										if (resultClone) {
											const { allReports, totalItems, filteredReports } = resultClone;
											$scope.reportObj.totalItems = totalItems;
											$scope.reportObj.allReports = allReports;
											$scope.reportObj.filteredReports = filteredReports;
										}
									});
							},
						};

						$scope.$watch('reportObj.search', (newVal, oldVal) => {
							const { totalItems, currentPage, filteredReports } = resultInitReport.goToReportPage($scope, 1)
							$scope.reportObj.totalItems = totalItems;
							$scope.reportObj.currentPage = currentPage;
							$scope.reportObj.filteredReports = filteredReports;
						});

						$scope.$watch('reportObj.currentPage', (newVal: number, oldVal) => {
							const { totalItems, currentPage, filteredReports } = resultInitReport.goToReportPage($scope, newVal)
							$scope.reportObj.totalItems = totalItems;
							$scope.reportObj.currentPage = currentPage;
							$scope.reportObj.filteredReports = filteredReports;
						});
					})

				}
			});


	}
]);
