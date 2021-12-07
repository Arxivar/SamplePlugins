import { IHttpService, ITimeoutService } from 'angular';
import { LoDashStatic, reject } from 'lodash';
import { routeType } from './uploadPluginRoute';
import { IScopeUploadPlugin } from './uploadPluginRouteTypes';


angular.module('arxivar.plugins.controller').controller('uploadPluginRouteCtrl', [
	'$scope', '_', 'arxivarResourceService', 'arxivarUserServiceCreator', 'arxivarRouteService', 'arxivarDocumentsService', 'arxivarNotifierService', 'uploadPluginRoute', '$http', '$timeout',
	($scope: IScopeUploadPlugin, _: LoDashStatic, arxivarResourceService: IArxivarResourceService, arxivarUserServiceCreator: IArxivarUserServiceCreator, arxivarRouteService: IArxivarRouteService, arxivarDocumentsService: IArxivarDocumentsService, arxivarNotifierService: IArxivarNotifierService, uploadPluginRoute: routeType, $http: IHttpService, $timeout: ITimeoutService) => {

		$scope.arrayBufferComplete = [];
		$scope.disabled = false;
		const inputFile = angular.element('#upload');

		const _uploadXmlHttpRequest = (url: string, file: File): Promise<string> => {
			const formData = new FormData();
			const http = new XMLHttpRequest();
			http.open('POST', url, true);

			return new Promise((resolve, reject) => {
				http.onreadystatechange = () => {
					if (http.readyState === 4 && http.status === 200) {
						let response = JSON.parse(http.response);
						resolve(response[0]);
					}

				};
				const reader = new FileReader();
				reader.onload = () => {
					const arrayBuffer = reader.result as ArrayBuffer;
					const array = new Uint8Array(arrayBuffer);
					let myBlobPrev = new Blob([array]);

					formData.append('file', myBlobPrev, file.name);

					http.send(formData);
				};
				reader.readAsArrayBuffer(file);
			});
		};

		const _upload$http = (url: string, file: File): Promise<string> => {
			const formData = new FormData();
			const reader = new FileReader();
			return new Promise((resolve, reject) => {
				reader.onload = () => {
					const arrayBuffer = reader.result as ArrayBuffer;
					const array = new Uint8Array(arrayBuffer);
					const myBlobPrev = new Blob([array]);

					formData.append('file', myBlobPrev, file.name);

					$http({
						url: url,
						headers: { 'Content-Type': undefined },
						data: formData,
						method: 'POST'
					})
						.then(({ data }: any) => {

							resolve(data[0]);

						});

				};
				reader.readAsArrayBuffer(file);
			});

		};

		const handler = () => {
			$scope.disabled = true;
			const url = arxivarResourceService.resourceService.arxivarConfig.rootApi + 'buffer/insert';
			const input = inputFile[0] as HTMLInputElement;
			const file = input.files[0];
			//_uploadXmlHttpRequest(url, file)
			_upload$http(url, file)
				.then(bufferId => {
					$timeout(() => {
						$scope.arrayBufferComplete.push({ bufferId: bufferId, bufferName: file.name });
						$scope.disabled = false;
						inputFile.val('');
					});
				});
		};

		inputFile.on({ change: handler });
		
		//$scope.upload = handler;

		$scope.download = (bufferId) => {
			arxivarResourceService.getByteArray('Buffer/file/' + bufferId, { openload: false, hideUserMessageError: false })
				.then(({ data, status, headers }) => {
					return arxivarDocumentsService.downloadStream(data, status, headers);
				});
		};

		$scope.$on('$destroy', () => {
			inputFile.off('change', handler);
		});


	}
]);
