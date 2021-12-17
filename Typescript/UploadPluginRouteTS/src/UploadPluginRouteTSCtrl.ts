import { LoDashStatic } from 'lodash';
import { routeType } from './UploadPluginRouteTS';
import { IScopeUploadPlugin } from './UploadPluginRouteTSType';

angular.module('arxivar.plugins.controller').controller('UploadPluginRouteTSCtrl', [
	'$scope', '$http', '$timeout', '_', 'arxivarResourceService', 'arxivarUserServiceCreator', 'arxivarRouteService', 'arxivarDocumentsService', 'arxivarNotifierService', 'UploadPluginRouteTS',
	($scope: IScopeUploadPlugin, $http: angular.IHttpService, $timeout: angular.ITimeoutService, _: LoDashStatic, arxivarResourceService: IArxivarResourceService, arxivarUserServiceCreator: IArxivarUserServiceCreator, arxivarRouteService: IArxivarRouteService, arxivarDocumentsService: IArxivarDocumentsService, arxivarNotifierService: IArxivarNotifierService, UploadPluginRouteTS: routeType) => {

		$scope.arrayBufferComplete = [];
		$scope.disabled = false;
		//IMPORTANT: INSERT AN EXISTING MASK ID BELOW
		const maskID = 'eb69d6c75f56460b8756cef279c86551';
		const inputFile = angular.element('#upload');

		//XMLHttpRequest call (disabled)
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

		//$http call (enabled)
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

		// comment/decomment _uploadXmlHttpRequest/_upload$http below to change between $http or XMLHttpRequest call function 
		const handler = () => {
			$scope.disabled = true;
			const url = arxivarResourceService.webApiUrl + 'buffer/insert';
			const input = inputFile[0] as HTMLInputElement;
			const file = input.files[0];
			//_uploadXmlHttpRequest(url, file)
			_upload$http(url, file)
				.then(bufferId => {
					$timeout(() => {
						const url = arxivarRouteService.getURLProfilation({ bufferId: bufferId, fileName: file.name });
						const maskUrl = arxivarRouteService.getMaskProfilation(maskID, { bufferId: bufferId, fileName: file.name });
						$scope.arrayBufferComplete.push({ bufferId: bufferId, bufferName: file.name, url, maskUrl });
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
