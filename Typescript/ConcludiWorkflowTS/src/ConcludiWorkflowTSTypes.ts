export const httpOption: IHttpOptions = {
	openload: false,
	hideUserMessageError: false
}


export type promiseArray = Promise<any>[];


type objResultType = {
	description: string;
	endDate: null;
	expireDate: string;
	hasAttachement: boolean;
	hasNote: boolean;
	id: number;
	name: string;
	startDate: string;
	state: number;
	userCompleteName: string;
	length: number
};

export type arrayResult = objResultType[]

export interface IScopeConcludiWorkflow extends angular.IScope {
	allProcess: process[];
	cancel: () => void;
	stop: (proc: process) => any;
	delete: (proc: process) => any;
}

type process = {
$$hashKey?: string;
ids: number[];
length?: number;
name: string
}


