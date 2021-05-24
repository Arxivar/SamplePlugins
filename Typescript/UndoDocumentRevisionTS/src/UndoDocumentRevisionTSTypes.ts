export const httpOption: IHttpOptions = {
	openload: false,
	hideUserMessageError: false
}

export type promiseArray = Promise<any>[];

export interface IScopeUndoDocumentRevision extends angular.IScope {
	max: number;
	counter: number;
}

export type arrRevisions = revisionObj[][];


type revisionObj = {
	attachments: boolean,
	cdLabel: string,
	compressed: boolean,
	compressionMode: number,
	cstring: string,
	device: number,
	docnumber: number,
	documentDate: string,
	fileDate: string,
	fileName: string,
	hash: string,
	id: number,
	originalName: string,
	path: string,
	profileDate: string,
	revision: number,
	saveType: number,
	user: number,
	userDescription: string,
	zipPassword: string,
}

