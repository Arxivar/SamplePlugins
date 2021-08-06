/* eslint-disable no-useless-constructor */
import { ConfigurationDataTypeEnum } from '../Interfaces';
import { DiagramVariableItem, DiagramVariableListItem, DiagramVariableQueryItem, DiagramVariableTypeEnum, ListColumnItem, ModelItem, OutputResultType, PluginModel } from './MongoPluginDtos';

const pluginId = '47643477-b5a0-4154-b253-1a3511c7799b';
const columnSeparator = ';';
class MongoPlugin {
	viewerMode = false;
	enableSave: ({ enable }: { enable: boolean }) => void;
	configuration: IConfiguration[];
	diagramId: string;
	readonly saver: { onSave: () => IConfiguration[] };
	model: PluginModel;
	selectedColumnsIds: string[];
	listColumnsItems: ListColumnItem[];
	queryResult: OutputResultType;
	loadingCommand = false;
	loadingVariables = false;
	testButtonEnabled = false;
	outputVariables: DiagramVariableListItem[];
	selectedOutputVariable: DiagramVariableListItem;
	queryVariables: DiagramVariableListItem[];
	usedQueryVariables: DiagramVariableQueryItem[];
	diagramsVariables: DiagramVariableItem[];
	variablesTypes: typeof DiagramVariableTypeEnum = DiagramVariableTypeEnum;
	constructor(readonly $timeout: any, readonly workflowResourceService: IWorkflowResourceService, readonly _: ILoDash, readonly arxivarRouteService: IArxivarRouteService, readonly arxivarResourceService: IArxivarResourceService) {
	}

	$onInit(): void {
		const that = this;

		// creo model
		that.model = that.createModel(that.configuration);
		that.queryResult = {
			columns: [],
			errorMessage: '',
			success: false
		};
		that.listColumnsItems = [];

		// id selezionati
		that.selectedColumnsIds = (that.model.columns.value as string).split(columnSeparator);

		// Advanced configuration
		that.saver.onSave = () => {
			that.model.columns.value = that.model.useAdvancedConfiguration.value === true ? that.listColumnsItems.filter(x => x.selected).map(x => x.id).join(columnSeparator) : '';
			const items = Object.values(that.model).map(x => that.mapConfiguration(x));
			if (that.usedQueryVariables?.length > 0) {
				items.push(...that.usedQueryVariables.map(x => ({
					name: x.id,
					dataType: (x.variableType === DiagramVariableTypeEnum.String ? ConfigurationDataTypeEnum.String : DiagramVariableTypeEnum.Int) as any,
					value: (x.value as any)
				})));
			}
			return items;
		};

		// caricamento variabili
		that.bindVariables(that.diagramId).then(() => {
			// dalla configurazione recupero le variabili usate nella query
			that.usedQueryVariables = [];
			that.configuration?.forEach(c => {
				const variable = that.queryVariables?.find(v => v.id === c.name);
				if (variable) {
					that.usedQueryVariables.push({
						...variable,
						value: c.dataType === ConfigurationDataTypeEnum.String ? c.value : (c.value as number)
					});
				}
			});
			// variabile di uscita selezionata
			const selectedVar = that.outputVariables?.find(v => v.id === that.model.outputVariableName.value);
			if (!that._.isNil(selectedVar)) {
				that.selectedOutputVariable = angular.copy(selectedVar);
			} else {
				that.selectedOutputVariable = {
					id: '',
					name: '',
					variableType: DiagramVariableTypeEnum
						.String
				};
			}
			// controlli query
			that.checkQueryText();
			// validazione
			that.validate();
		});
	}
	createModel(configuration: IConfiguration[]): PluginModel {
		// model con valori di default
		let model: PluginModel = {
			databaseName: {
				name: 'databaseName',
				dataType: ConfigurationDataTypeEnum.String,
				value: 'Workflow',
				placeholder: 'Workflow',
			},
			queryText: {
				name: 'queryText',
				dataType: ConfigurationDataTypeEnum.String,
				value: '',
				placeholder: '{\'aggregate\': \'log\',\'allowDiskUse\': true,\'pipeline\': [{\'$match\': {\'Level\': \'Information\'}}],\'cursor\': { \'batchSize\': 1000 }}'
			},
			columns: {
				name: 'columns',
				dataType: ConfigurationDataTypeEnum.String,
				value: ''
			},
			useAdvancedConfiguration: {
				name: 'useAdvancedConfiguration',
				dataType: ConfigurationDataTypeEnum.Bool,
				value: false
			},
			outputVariableName: {
				name: 'outputVariableName',
				dataType: ConfigurationDataTypeEnum.String,
				value: ''
			}
		};
		// associo la configurazione, se presente
		if (configuration?.length > 0) {
			const items = Object.values(model);
			configuration.forEach(c => {
				items.forEach(m => {
					if (m.name === c.name) {
						m.value = c.value;
					}
				});
			});
			model = items.reduce((acc, curr: ModelItem) => (acc[curr.name] = curr, acc), ({} as PluginModel));
		}
		return model;
	}

	mapConfiguration(model: ModelItem): IConfiguration {
		return {
			name: model.name,
			dataType: model.dataType,
			value: model.value
		};
	}

	validate() {
		const enable = this.model.useAdvancedConfiguration.value === false || (
			this.model.useAdvancedConfiguration.value === true &&
			this.listColumnsItems.filter(x => x.selected === true).length > 0 &&
			!this._.isNil(this.model.databaseName.value) && this.model.databaseName.value !== '' &&
			!this._.isNil(this.model.outputVariableName.value) && this.model.outputVariableName.value !== '' &&
			!this._.isNil(this.model.queryText.value) && this.model.queryText.value !== '');
		this.enableSave({ enable: enable });
	}

	executeCommand() {
		const that = this;
		// sostituisco i dati delle variabili nella query
		let queryText = this.model.queryText.value.toString();
		that.usedQueryVariables?.forEach(v => {
			const name = `#@${v.name}@#`;
			const value = v.variableType === DiagramVariableTypeEnum.String ? `${(v.value as any).replaceAll('\'', '\'\'')}` : `${v.value}`;
			queryText = queryText.replace(name, value);
		});
		// eseguo il comando
		const data = [
			{
				key: 'DatabaseName',
				value: this.model.databaseName.value
			},
			{
				key: 'QueryText',
				value: queryText
			}
		];
		that.loadingCommand = true;
		this.workflowResourceService.getPost(this.arxivarRouteService.getPartialURLPluginLinkExecuteCommand(pluginId), data, {})
			.then((results: any) => {
				//that.$timeout(() => {
				that.queryResult = results.data.parsedData;
				that.listColumnsItems = that._.orderBy(that.queryResult.columns, [col => col.id.toLowerCase()], ['asc']).map(x => ({
					id: x.id,
					label: x.label,
					selected: that.selectedColumnsIds.includes(x.id)
				}));
				//});
			}).catch((error) => {
				that.model.columns.value = '';
				that.listColumnsItems = [];
				console.error(error);
			}).finally(() => {
				that.validate();
				that.loadingCommand = false;
			});
	}
	bindVariables(diagramId: String) {
		const that = this;
		that.loadingVariables = true;
		that.diagramsVariables = [];
		that.outputVariables = [
			{ id: '', name: '--seleziona--', variableType: DiagramVariableTypeEnum.Matrix }
		];
		that.queryVariables = [];
		return that.workflowResourceService.get('v1/diagrams/' + diagramId + '/variables', {}).then((variables: DiagramVariableItem[]) => {
			that.diagramsVariables = angular.copy(variables);
			// variabili tabella selezionabili per l'output
			let filteredVariables = variables?.filter(v => v.configuration.variableType === DiagramVariableTypeEnum.Matrix);
			let mapVariables = filteredVariables?.map(v => ({
				id: v.configuration.name,
				name: v.configuration.name,
				variableType: v.configuration.variableType,
			}));
			if (mapVariables?.length > 0) {
				that.outputVariables.push(...that._.orderBy(mapVariables, [v => v.name.toLowerCase()], ['asc']));
			}
			// variabili string/number utilizzabili nel testo della query
			filteredVariables = variables?.filter(v => v.configuration.variableType === DiagramVariableTypeEnum.String || v.configuration.variableType === DiagramVariableTypeEnum.Int);
			mapVariables = filteredVariables?.map(v => ({
				id: v.id,
				name: v.configuration.name,
				variableType: v.configuration.variableType,
			}));
			if (mapVariables?.length > 0) {
				that.queryVariables = that._.orderBy(mapVariables, [v => v.name.toLowerCase()], ['asc']);
			}
		}).finally(() => {
			that.loadingVariables = false;
		});
	}
	checkQueryText(): void {
		const that = this;
		// cerco nel testo le variabili utilizzate di tipo String/Int/Decimal
		const allowedTypes = [DiagramVariableTypeEnum.String, DiagramVariableTypeEnum.Int, DiagramVariableTypeEnum.Decimal];
		const variablesFound: DiagramVariableQueryItem[] = [];
		if (that.model.queryText.value !== '') {
			const results = [...(that.model.queryText.value as any).matchAll(/#@([\w\-]+)@#/g)];
			results?.forEach(x => {
				const diagramVariable = that.diagramsVariables.find(v => v.configuration.name === x[1]);
				const usedVariable = that.usedQueryVariables?.find(v => v.name === x[1]);
				if (allowedTypes.includes(diagramVariable?.configuration.variableType) && !variablesFound.some(v => v.id === diagramVariable?.id)) {
					variablesFound.push({
						id: diagramVariable.id,
						name: diagramVariable.configuration.name,
						variableType: diagramVariable.configuration.variableType,
						value: !this._.isNil(usedVariable) ? usedVariable.value : diagramVariable.configuration.variableType === DiagramVariableTypeEnum.String ? '' : 0
					});
				}
			});
		}
		// aggiorno la lista delle variabili per il test della query
		that.usedQueryVariables = angular.copy(variablesFound);
		// verifico dati variabili nella query
		that.allowTest();
	}
	addQueryVariable(item: DiagramVariableListItem): void {
		this.model.queryText.value += ` #@${item?.name}@#`;
		this.checkQueryText();
	}
	allowTest() {
		const that = this;
		this.testButtonEnabled = !this._.isNil(this.model.queryText.value) && this.model.queryText.value !== '' &&
			!this._.isNil(this.model.databaseName.value) && this.model.databaseName.value !== '' &&
			!this._.isNil(this.model.outputVariableName.value) && this.model.outputVariableName.value !== '' &&
			(this.usedQueryVariables?.length === 0 || !this.usedQueryVariables.some(x => x.value === '' || that._.isNil(x.value)));
	}
	selectColumn(item: ListColumnItem) {
		const column = this.listColumnsItems?.find(c => c.id === item.id);
		if (column) {
			column.selected = !column.selected;
		}
		this.validate();
	}
	backToConfiguration() {
		this.selectedColumnsIds = this.listColumnsItems?.filter(c => c.selected)?.map(c => c.id);
		this.listColumnsItems = [];
		this.validate();
	}
	$onDestroy(): void {

	}
}

angular.module('arxivar.pluginoperations')
	.component('47643477b5a04154b2531a3511c7799b', {
		bindings: {
			configuration: '<',
			enableSave: '&',
			saver: '<',
			viewerMode: '<',
			diagramId: '<',
		},
		controllerAs: 'ctrl',
		controller: ['$timeout', 'workflowResourceService', '_', 'arxivarRouteService', 'arxivarResourceService', MongoPlugin],
		template: `
				<div ng-include="'47643477b5a04154b2531a3511c7799b.html'"> 
				</div>
		`
	});
