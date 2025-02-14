import * as arxInterfaces from './Interfaces';
import moment from 'moment';
import LoDashStatic from 'lodash';
declare global {
    const angular: angular.IAngularStatic;
    type IArxivarDocumentsService = arxInterfaces.IArxivarDocumentsService;
    type IArxivarNotifierService = arxInterfaces.IArxivarNotifierService;
    type IArxivarResourceService = arxInterfaces.IArxivarResourceService;
    type IArxivarRouteService = arxInterfaces.IArxivarRouteService;
    type IArxivarUserServiceCreator = arxInterfaces.IArxivarUserServiceCreator;
    type IWorkflowResourceService = arxInterfaces.IArxivarResourceService;
    type IHttpOptions = arxInterfaces.IHttpOptions;
    type IPluginService = arxInterfaces.IPluginService;
    type IUserService = arxInterfaces.IUserService;
    type IScopeWidgetDesktop = angular.IScope & { instanceId: string; desktopId: string;[propScope: string]: any };
    type IScopeWidgetTask = angular.IScope & { instanceId: string; desktopId: string;[propScope: string]: any };
    type IScopeWidgetTaskV2 = angular.IScope & { instanceId: string; taskDto: arxInterfaces.ITaskV2Dto;[propScope: string]: any };
    type IRequiredSettings = {
        id: string,
        name: string,
        icon: string,
        label: string,
        description: string,
        author: string,
        minVersion: string,
        requireRefresh?: boolean,
        useTypescript: boolean
    };
    type ICommandParamsField = {
        visible: boolean;
        value: any;
        name: string;
        className: string;
        description: string;
        externalId: any;
    };
    export interface ISettingsGenericTypeValue {
        name: string,
        description: string,
    }
    type ISettingsStringValue = ISettingsGenericTypeValue & {
        type: 'string',
        defaultValue: string
    }
    type ISettingsNumberValue = ISettingsGenericTypeValue & {
        type: 'number',
        defaultValue: number,
    }
    type ISettingsBooleanValue = ISettingsGenericTypeValue & {
        type: 'boolean',
        defaultValue: boolean,
    }
    type ISettingsDateValue = ISettingsGenericTypeValue & {
        type: 'date',
        defaultValue: string,
    }

    type ISettingsStringValueForRuntime = ISettingsStringValue & {
        value: ISettingsStringValue['defaultValue']
    }
    type ISettingsNumberValueForRuntime = ISettingsNumberValue & {
        value: ISettingsNumberValue['defaultValue']
    }
    type ISettingsBooleanValueForRuntime = ISettingsBooleanValue & {
        value: ISettingsBooleanValue['defaultValue']
    }
    type ISettingsDateValueForRuntime = ISettingsDateValue & {
        value: ISettingsDateValue['defaultValue']
    }

    type ISettingsTypeValue = ISettingsStringValue | ISettingsNumberValue | ISettingsBooleanValue | ISettingsDateValue;
    type ISettingsTypeValueForRuntime = ISettingsStringValueForRuntime | ISettingsNumberValueForRuntime | ISettingsBooleanValueForRuntime | ISettingsDateValueForRuntime;
    type IProfilationCommandParams = { docnumber?: number; elementId: string, fields: ICommandParamsField[] };
    type IMoment = typeof moment;
    type ILoDash = typeof LoDashStatic;
    type IRouteParams = { queryParams: string };
    type ICustomSettings = ISettingsTypeValue;
    type IUserSettings = ISettingsTypeValue;
    type IWidgetSettings = ISettingsTypeValue;
    type ICustomSettingsForRuntime = ISettingsTypeValueForRuntime;
    type IUserSettingsForRuntime = ISettingsTypeValueForRuntime;
    type IWidgetSettingsForRuntime = ISettingsTypeValueForRuntime;
    type ICommandParams = { docnumbers: number[]; }
    type IConfiguration = IConfigurationDynamic<arxInterfaces.ConfigurationDataTypeEnum>;
    type IConfigurationDynamicBase<T extends arxInterfaces.ConfigurationDataTypeEnum> = { name: string, dataType: T };
    type IConfigurationDynamic<T extends arxInterfaces.ConfigurationDataTypeEnum> =
        T extends arxInterfaces.ConfigurationDataTypeEnum.Bool ? IConfigurationDynamicBase<T> & { value?: boolean } :
        T extends arxInterfaces.ConfigurationDataTypeEnum.Datetime ? IConfigurationDynamicBase<T> & { value?: string } :
        T extends arxInterfaces.ConfigurationDataTypeEnum.Decimal ? IConfigurationDynamicBase<T> & { value?: number } :
        T extends arxInterfaces.ConfigurationDataTypeEnum.Int ? IConfigurationDynamicBase<T> & { value?: number } :
        T extends arxInterfaces.ConfigurationDataTypeEnum.String ? IConfigurationDynamicBase<T> & { value?: string } :
        never
    interface IPluginCommand {
        new(requiredSettings: IRequiredSettings, customSettings: ICustomSettings[], userSettings: IUserSettings[]): IPluginCommand,
        canRun: (params: ICommandParams) => Promise<boolean>,
        run: (params: ICommandParams) => Promise<any>
    }
    interface IPluginProfilation {
        new(requiredSettings: IRequiredSettings, customSettings: ICustomSettings[], userSettings: IUserSettings[]): IPluginProfilation,
        canRun: (params: IProfilationCommandParams) => Promise<boolean>,
        run: (params: IProfilationCommandParams) => Promise<any>
    }
    interface IPluginRoute {
        new(requiredSettings: IRequiredSettings, customSettings: ICustomSettings[], userSettings: IUserSettings[]): IPluginRoute
    }
    interface IPluginWidget {
        new(requiredSettings: IRequiredSettings, customSettings: ICustomSettings[], userSettings: IUserSettings[]): IPluginWidget
    }
    interface IPluginTask {
        new(requiredSettings: IRequiredSettings, customSettings: ICustomSettings[], userSettings: IUserSettings[]): IPluginTask
    }
    interface IPluginTaskV2 {
        new(requiredSettings: IRequiredSettings, customSettings: ICustomSettings[], userSettings: IUserSettings[], widgetSettings: IWidgetSettings[]): IPluginTaskV2,
        requiredSettings: IRequiredSettings,
        customSettings: ICustomSettingsForRuntime[],
        userSettings: IUserSettingsForRuntime[],
        widgetSettings: IWidgetSettingsForRuntime[]

    }


}
