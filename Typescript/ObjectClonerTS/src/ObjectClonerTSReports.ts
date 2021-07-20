import { LoDashStatic } from 'lodash';
import { httpOption, pagination } from './ObjectClonerTSCommon';
import { IObjectCloner, ISingleObject, IObjects } from './ObjectClonerTSTypes';


export const onInitReport = (itemPerPage: number, arxivarResourceService: IArxivarResourceService, arxivarNotifierService: IArxivarNotifierService, _: LoDashStatic) => {
	const cloneReportFunction = (currentPage: number, report: IObjects) => {

		return arxivarResourceService.get('Report/' + report.id, httpOption)
			.then((singleReport) => {

				let clonedReport: ISingleObject = _.cloneDeep(singleReport);
				clonedReport.id = '';
				clonedReport.name = singleReport.name + ' CLONE';

				return Promise.all(
					[arxivarResourceService.save('Report/Insert', clonedReport, httpOption),
					arxivarResourceService.get('Report/' + report.id + '/Template?editMode=true', httpOption)]
				);
			})
			.then((arr) => {
				let newReport = arr[0];
				let templateParams = arr[1];

				if (templateParams) {
					return arxivarResourceService.save('Report/' + newReport.data.id + '/UpdateTemplate', JSON.stringify(templateParams), httpOption);
				} else {
					return arxivarNotifierService.notifyError('Non ci sono template da clonare');
					//throw new Error('Non ci sono template');
				}
			})
			.then(() => {
				return arxivarResourceService.get('Report', httpOption);
			})
			.then((reports: IObjects[]) => {
				const allReports = _.sortBy(reports, ['name']);
				return {
					allReports,
					totalItems: allReports.length,
					filteredReports: pagination(_.cloneDeep(allReports), currentPage, itemPerPage)
				};

			})
			.catch(err => arxivarNotifierService.notifyError(err));
	};


	const goToReportPage = ({ reportObj }: Pick<IObjectCloner, 'reportObj'>, page: number) => {
		let search = _.isNil(reportObj.search) ? '' : reportObj.search.toLowerCase();
		const filteredReports = _.filter(reportObj.allReports, obj => {
			return _.includes(obj.name.toLowerCase(), search);
		});
		return {
			totalItems: filteredReports.length,
			currentPage: page,
			filteredReports: pagination(filteredReports, reportObj.currentPage, reportObj.itemsPerPage)
		};
	};

	return arxivarResourceService.get('Report', httpOption)
		.then((reports) => {
			const allReports = _.sortBy(reports, ['name']);
			return {
				allReports,
				totalItems: allReports.length,
				filteredReports: pagination(_.cloneDeep(allReports), 1, itemPerPage),
				cloneReportFunction,
				goToReportPage
			};

		})
		.catch(err => arxivarNotifierService.notifyError(err));

};
