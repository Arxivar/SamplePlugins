import { LoDashStatic } from 'lodash';
import { httpOption, pagination } from './ObjectClonerTSCommon';
import { ISingleObject, IObjectCloner, IObjects } from './ObjectClonerTSTypes';

export const onInitView = (itemPerPage: number, arxivarResourceService: IArxivarResourceService, arxivarNotifierService: IArxivarNotifierService, _: LoDashStatic) => {
	const cloneViewFunction = (currentPage: number, view: IObjects) => {

		return arxivarResourceService.get('ViewsBuilder/' + view.id, httpOption)
			.then((singleView: ISingleObject) => {
				let clonedView: ISingleObject = _.cloneDeep(singleView);
				clonedView.id = '';
				clonedView.description = singleView.description + ' CLONE';

				return arxivarResourceService.save('ViewsBuilder', clonedView, httpOption);
			})
			.then(() => arxivarResourceService.get('v3/Views', httpOption))
			.then((views: IObjects[]) => {
				const allViews = _.sortBy(views, ['description']);
				return {
					allViews,
					totalItems: allViews.length,
					filteredViews: pagination(_.cloneDeep(allViews), currentPage, itemPerPage)
				};
			})
			.catch(err => arxivarNotifierService.notifyError(err));
	};

	const goToViewPage = ({ viewObj }: Pick<IObjectCloner, 'viewObj'>, page: number) => {
		let search = _.isNil(viewObj.search) ? '' : viewObj.search.toLowerCase();
		const filteredViews = _.filter(viewObj.allViews, v => {
			return _.includes(v.description.toLowerCase(), search);
		});
		return {
			totalItems: filteredViews.length,
			currentPage: page,
			filteredViews: pagination(filteredViews, viewObj.currentPage, viewObj.itemsPerPage),
		};
	};

	return arxivarResourceService.get('v3/Views', httpOption)
		.then((views) => {
			const allViews = _.sortBy(views, ['description']);

			return {
				allViews,
				totalItems: allViews.length,
				filteredViews: pagination(_.cloneDeep(allViews), 1, itemPerPage),
				cloneViewFunction,
				goToViewPage
			};
		})
		.catch(err => arxivarNotifierService.notifyError(err));

};
