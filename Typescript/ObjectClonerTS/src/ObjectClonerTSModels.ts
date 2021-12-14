import { LoDashStatic } from 'lodash';
import { httpOption, pagination } from './ObjectClonerTSCommon';
import { ISingleObject, IObjects, IObjectCloner } from './ObjectClonerTSTypes';

export const onInitModel = (itemPerPage: number, arxivarResourceService: IArxivarResourceService, arxivarNotifierService: IArxivarNotifierService, _: LoDashStatic, $http: any) => {
	const cloneModelFunction = (currentPage: number, model: IObjects) => {

		return arxivarResourceService.get('Models/' + model.id, httpOption)
			.then((singleModel: ISingleObject) => {

				let clonedModel = _.cloneDeep(singleModel);
				clonedModel.id = 0;
				clonedModel.description = singleModel.description + ' CLONE';

				if (clonedModel.previewFileName) {

					return Promise.all([
						arxivarResourceService.getByteArray('Models/template/' + model.id, httpOption),
						arxivarResourceService.getByteArray('Models/previewTemplate/' + model.id, httpOption)
					])
						.then(([byteArray, byteArrayPrev]) => {
							//Upload
							let fileNameParts = clonedModel.fileName.split('.');
							fileNameParts[fileNameParts.length - 2] = fileNameParts[fileNameParts.length - 2] + ' CLONE';
							let filename = fileNameParts.join('.');

							let formData = new FormData();
							let myBlob = new Blob([byteArray.data]);
							formData.append('file', myBlob, filename);


							let fileNamePartsPrev = clonedModel.previewFileName.split('.');
							fileNamePartsPrev[fileNamePartsPrev.length - 2] = fileNamePartsPrev[fileNamePartsPrev.length - 2] + ' CLONE';
							let filenamePrev = fileNamePartsPrev.join('.');

							let formDataPrev = new FormData();
							let myBlobPrev = new Blob([byteArrayPrev.data]);
							formDataPrev.append('file', myBlobPrev, filenamePrev);

							return Promise.all([
								$http({
									url: arxivarResourceService.webApiUrl + 'Cache/insert',
									headers: { 'Content-Type': undefined },
									data: formData,
									method: 'POST'
								}),


								$http({
									url: arxivarResourceService.webApiUrl + 'Cache/insert',
									headers: { 'Content-Type': undefined },
									data: formDataPrev,
									method: 'POST'
								})
							]);
						})
						.then(([cache1, cache2]) => {

							let cacheId = cache1.data[0];
							clonedModel.documentCacheId = cacheId;

							let cacheId2 = cache2.data[0];
							clonedModel.previewDocumentCacheId = cacheId2;

							return arxivarResourceService.save('Models', clonedModel, httpOption);

						})
						.then(() => arxivarResourceService.get('Models', httpOption))
						.then((models: IObjects[]) => {
							const allModels = _.sortBy(models, ['description']);
							return {
								allModels,
								totalItems: allModels.length,
								filteredModels: pagination(_.cloneDeep(allModels), currentPage, itemPerPage)
							};
						})
						.catch((err: any) => arxivarNotifierService.notifyError(err));


				} else if (!clonedModel.previewFileName) {


					return arxivarResourceService
						.getByteArray('Models/template/' + model.id, httpOption)
						.then((byteArray) => {

							//Upload
							let fileNameParts = clonedModel.fileName.split('.');
							fileNameParts[fileNameParts.length - 2] = fileNameParts[fileNameParts.length - 2] + ' CLONE';
							let filename = fileNameParts.join('.');


							let formData = new FormData();
							let myBlob = new Blob([byteArray.data]);
							formData.append('file', myBlob, filename);

							return $http({
								url: arxivarResourceService.webApiUrl + 'Cache/insert',
								headers: { 'Content-Type': undefined },
								data: formData,
								method: 'POST'
							});
						})
						.then((cacheIds) => {
							let cacheId = cacheIds.data[0];
							clonedModel.documentCacheId = cacheId;
							return arxivarResourceService.save('Models', clonedModel, httpOption);
						})
						.then(() => arxivarResourceService.get('Models', httpOption))
						.then((models: IObjects[]) => {
							const allModels = _.sortBy(models, ['description']);
							return {
								allModels,
								totalItems: allModels.length,
								filteredModels: pagination(_.cloneDeep(allModels), currentPage, itemPerPage)
							};
						})
						.catch(err => arxivarNotifierService.notifyError(err));
				};
			});
	};


	const goToModelPage = ({ modelObj }: Pick<IObjectCloner, 'modelObj'>, page: number) => {
		let search = _.isNil(modelObj.search) ? '' : modelObj.search.toLowerCase();
		const filteredModels = _.filter(modelObj.allModels, v => {
			return _.includes(v.description.toLowerCase(), search);
		});
		return {
			totalItems: filteredModels.length,
			currentPage: page,
			filteredModels: pagination(filteredModels, modelObj.currentPage, modelObj.itemsPerPage),
		};
	};

	return arxivarResourceService.get('Models', httpOption)
		.then((models) => {
			const allModels = _.sortBy(models, ['description']);

			return {
				allModels,
				totalItems: allModels.length,
				filteredModels: pagination(_.cloneDeep(allModels), 1, itemPerPage),
				cloneModelFunction,
				goToModelPage
			};
		})
		.catch(err => arxivarNotifierService.notifyError(err));
};


