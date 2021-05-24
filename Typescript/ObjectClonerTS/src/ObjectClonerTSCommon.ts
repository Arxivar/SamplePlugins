import { IObjects } from "./ObjectClonerTSTypes";

export const pagination = (items: IObjects[], pageNumber: number, itemsPerPage: number): IObjects[] => {
	let index: number;
	pageNumber = (pageNumber - 1) * itemsPerPage;
	let newArr: IObjects[] = [];

	for (index = 0; index < items.length; index++) {
		if (index >= pageNumber && index <= pageNumber + (itemsPerPage - 1)) {
			newArr.push(items[index]);
		}
	}
	return newArr;
}

export const httpOption: IHttpOptions = {
	openload: false,
	hideUserMessageError: false
}
