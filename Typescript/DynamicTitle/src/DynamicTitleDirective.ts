import { widgetType } from "./DynamicTitle";

//Types
type LanguageType = 'IT' | 'ES' | 'FR' | 'DE' | 'RO' | 'EN';
type TranslationsType = { title: string; selectLanguage: string; change: string; unlock: string; lock: string; success: string; }
type SetVariableObjectType = {
	processId: string;
	processObjectId: string;
	operationId: string;
	setVariables: {
		diagramVarId: string;
		variableType: number;
		value: boolean;
		id: string;
	}[];
}
type VariableType = {
	id: string;
	variableType: number;
	value: boolean;
	variableDefinition: {
		id: string;
		configuration: {
			variableType: number;
			name: string;
		}
	}
}
type OperationInfoType = {
	id: string;
	processId: string;
	processObjectId: string;
	operationDescription: string;
}
type DynamicTitleScopeType = {
	languages: string[];
	titleTranslated: (language: LanguageType) => string;
	changeLanguage: (selectedLanguage: LanguageType) => void;
	forceUpdate: () => void;
	languageSelected: LanguageType;
	selectLanguageText: string;
	changeText: string;
	lockUnlockText: string;
	successText: string;
}



angular.module('arxivar.plugins.directives').directive('dynamictitledirective', [
	'workflowResourceService', 'arxivarUserServiceCreator', 'arxivarNotifierService', 'taskV2PluginService', 'DynamicTitle',
	(workflowResourceService: IWorkflowResourceService, arxivarUserServiceCreator: IArxivarUserServiceCreator, arxivarNotifierService: IArxivarNotifierService, taskV2PluginService: ITaskV2PluginService, DynamicTitle: widgetType) => {
		return {
			restrict: 'E',
			scope: {
				instanceId: '@',
				taskDto: '=?',
				widgetSettings: '=?'
			},
			templateUrl: './Scripts/plugins/DynamicTitle/DynamicTitle.html',
			link: async (scope: IScopeWidgetTaskV2 & DynamicTitleScopeType, element: JQuery) => {
				const $mainContainer = element.find('div.arx-' + DynamicTitle.plugin.name.toLowerCase());
				if ($mainContainer.length > 0) {
					$mainContainer.addClass(scope.instanceId);

					//************** EXAMPLE OF updateWidgetSettings **************

					scope.languages = ['IT', 'ES', 'FR', 'DE', 'RO', 'EN'];

					//get the boolean variable called "BooleanVariable"
					const booleanVariables: VariableType[] = await workflowResourceService.get(`v1/task-operations/task/${scope.taskDto.id}/variables`, { hideUserMessageError: false, openloader: false });
					const booleanVariable = booleanVariables.find(variable => variable.variableDefinition.configuration.name === "BooleanVariable")

					// Translation object
					const translations: Record<LanguageType, TranslationsType> = {
						IT: {
							title: 'Titolo in italiano',
							selectLanguage: 'Seleziona una lingua',
							change: 'Cambia',
							unlock: 'Sblocca esito',
							lock: 'Blocca esito',
							success: 'Variabile aggiornata in:',
						},
						ES: {
							title: 'Título en español',
							selectLanguage: 'Selecciona un idioma',
							change: 'Cambiar',
							unlock: 'Desbloquear resultado',
							lock: 'Bloquear resultado',
							success: 'Variable actualizada en:',
						},
						FR: {
							title: 'Titre en français',
							selectLanguage: 'Choisissez une langue',
							change: 'Changer',
							unlock: 'Débloquer résultat',
							lock: 'Bloquer résultat',
							success: 'Variable mise à jour en:',
						},
						DE: {
							title: 'Titel auf Deutsch',
							selectLanguage: 'Wähle eine Sprache',
							change: 'Ändern',
							unlock: 'Ergebnis freischalten',
							lock: 'Ergebnis sperren',
							success: 'Variable aktualisiert in:',
						},
						RO: {
							title: 'Titlu în română',
							selectLanguage: 'Selectează o limbă',
							change: 'Schimbă',
							unlock: 'Deblochează rezultat',
							lock: 'Blochează rezultat',
							success: 'Variabila actualizată in:',
						},
						EN: {
							title: 'Title in English',
							selectLanguage: 'Select a language',
							change: 'Change',
							unlock: 'Unlock outcome',
							lock: 'Lock outcome',
							success: 'Variable updated in:',
						}
					};

					//create userService instance and get user language
					const userService = await arxivarUserServiceCreator.create();
					const userLanguage = userService.getLang() as LanguageType;
					scope.languageSelected = scope.languages.includes(userLanguage) ? userLanguage : 'EN';

					//set initial title
					scope.titleTranslated = (language: LanguageType): string => {
						return translations[language]?.title;
					};

					//set initial texts
					scope.selectLanguageText = translations[scope.languageSelected].selectLanguage;
					scope.changeText = translations[scope.languageSelected].change;
					scope.lockUnlockText = booleanVariable.value ? translations[scope.languageSelected]?.lock : translations[scope.languageSelected].unlock;
					scope.successText = translations[scope.languageSelected].success;

					//use taskV2PluginService function to update widget title
					taskV2PluginService.updateWidgetSettings(DynamicTitle.plugin.requiredSettings.id, scope.instanceId, 'title', scope.titleTranslated(scope.languageSelected));

					//change widget title and texts language
					scope.changeLanguage = (selectedLanguage: LanguageType = 'EN') => {
						taskV2PluginService.updateWidgetSettings(DynamicTitle.plugin.requiredSettings.id, scope.instanceId, 'title', scope.titleTranslated(selectedLanguage));
						scope.selectLanguageText = translations[selectedLanguage].selectLanguage;
						scope.changeText = translations[selectedLanguage].change;
						scope.lockUnlockText = booleanVariable.value ? translations[selectedLanguage].lock : translations[selectedLanguage].unlock;
						scope.successText = translations[selectedLanguage].success;
						scope.languageSelected = selectedLanguage;
					};


					//************** EXAMPLE OF forceUpdateOutcomesByTaskId **************

					const operationInfo: OperationInfoType[] = await workflowResourceService.get(`v1/task-operations/task/${scope.taskDto.id}`, { hideUserMessageError: false, openloader: false });

					scope.forceUpdate = async () => {

						const booleanVariables: VariableType[] = await workflowResourceService.get(`v1/task-operations/task/${scope.taskDto.id}/variables`, { hideUserMessageError: false, openloader: false });
						const booleanVariable = booleanVariables.find(variable => variable.variableDefinition.configuration.name === "BooleanVariable")

						let setVariableObject: SetVariableObjectType = {
							operationId: operationInfo[0].id,
							processId: scope.taskDto.processTaskInfo.id,
							processObjectId: scope.taskDto.id,
							setVariables: [
								{
									diagramVarId: booleanVariable.variableDefinition.id,
									variableType: booleanVariable.variableType,
									value: !booleanVariable.value,
									id: booleanVariable.id
								}
							]
						};

						try {
							await workflowResourceService.save(`v1/task-operations/execute/set-variables`, setVariableObject, { hideUserMessageError: false, openloader: false });
							taskV2PluginService.forceUpdateOutcomesByTaskId(scope.taskDto.id);
							scope.lockUnlockText = !booleanVariable.value ? translations[scope.languageSelected]?.lock : translations[scope.languageSelected]?.unlock;
							arxivarNotifierService.notifySuccess(`${scope.successText} ${!booleanVariable.value}`);
						} catch (error) {
							arxivarNotifierService.notifyError(error);
						}
					};
				}
			}
		};
	}]);
