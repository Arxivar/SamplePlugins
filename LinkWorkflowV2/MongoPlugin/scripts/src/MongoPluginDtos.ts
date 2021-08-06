/* eslint-disable no-useless-constructor */
import { ConfigurationDataTypeEnum } from '../Interfaces';
export enum DiagramVariableTypeEnum {
	Any = 0,
	String = 1,
	Int = 2,
	Decimal = 3,
	Boolean = 4,
	Datetime = 5,
	Array = 6,
	Matrix = 7,
	Chrono = 8,
	User = 9,
	Contact = 10,
}

export type OutputResultType = {
	success: boolean;
	errorMessage: string;
	columns: OutputResultItemType[];
}
export type OutputResultItemType = {
	id: string;
	label: string;
	position: number;
	columnType: string;
	visible: boolean;
}
export type ListColumnItem = {
	id: string;
	label: string;
	selected: boolean;
}
export type ModelItem = {
	name: string,
	dataType: ConfigurationDataTypeEnum;
	value: string | number | boolean | Date;
	placeholder?: string;
}
export type PluginModel = {
	databaseName: ModelItem;
	queryText: ModelItem;
	columns: ModelItem;
	useAdvancedConfiguration: ModelItem;
	outputVariableName: ModelItem;
}
export type DiagramVariableItem = {
	id: string;
	configuration: {
		name: string;
		variableType: DiagramVariableTypeEnum;
	}
}
export type DiagramVariableListItem = {
	id: string;
	name: string;
	variableType: DiagramVariableTypeEnum;
}
export type DiagramVariableQueryItem = DiagramVariableListItem & {
	value: string | number;
}
