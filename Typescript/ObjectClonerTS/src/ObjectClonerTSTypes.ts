export type IObjects = {
	allowEmptyFilterMode: number,
	canDelete: boolean,
	canExecute: boolean,
	canUpdate: boolean,
	description: string,
	documentType: number,
	documentTypeDescription: string,
	editFields: string,
	formOpen: boolean,
	id: string,
	lockFields: null,
	maxItems: number,
	orderFields: string,
	searchFilterDto: null,
	selectFields: string,
	selectFilterDto: null
	showFields: boolean,
	showGroupsMode: number,
	type2: number,
	type3: number,
	user: number,
	userCompleteName: string,
	name: string //aggiunta per reports
	groupName: string //aggiunta per model
}

export type ISingleObject = {
	allowEmptyFilterMode: number,
	canDelete: boolean,
	canExecute: boolean,
	canUpdate: boolean,
	description: string,
	documentType: number,
	editFields: any, //{ description: null, daAAndOr: 1, fields: Array(0) }
	formOpen: boolean,
	id: string | number, //aggiunto number per model
	lockFields: any, //{ description: null, daAAndOr: 1, fields: Array(0) }
	selectFields: any, //{ fields: Array<any>, maxItems: 0 }
	showFields: boolean,
	showGroupsMode: number,
	type2: number,
	type3: number,
	user: number,
	userCompleteName: string,
	name: string, //aggiunta per reports
	groupName: string //aggiunta per model
	previewFileName: any, //aggiunto per model
	fileName: string //aggiunto per model
	previewDocumentCacheId: any, //aggiunto per model
	documentCacheId: string | number //aggiunto per model
}

export interface IObjectCloner extends angular.IScope {
	viewObj: {
		allViews: IObjects[],
		search: string,
		currentPage: number,
		itemsPerPage: number,
		maxSize: number,
		boundaryLinks: boolean,
		filteredViews: IObjects[],
		totalItems: number,
		cloneViewFunction: (currentPage: number, view: IObjects) => void,
	},

	modelObj: {
		allModels: IObjects[],
		search: string,
		currentPage: number,
		itemsPerPage: number,
		maxSize: number,
		boundaryLinks: boolean,
		filteredModels: IObjects[],
		totalItems: number,
		cloneModelFunction: (currentPage: number, model: IObjects) => void
	},

	reportObj: {
		allReports: IObjects[],
		search: string,
		currentPage: number,
		itemsPerPage: number,
		maxSize: number,
		boundaryLinks: boolean,
		filteredReports: IObjects[],
		totalItems: number,
		cloneReportFunction: (currentPage: number, report: IObjects) => void
	},
}
