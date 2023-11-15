export interface IScopeUploadPlugin extends angular.IScope {
	goToProfilation: (bufferId: string, fileName: string) => void;
	disabled: boolean;
	download: (bufferId: any) => void;
	bufferId: string;
	arrayBufferComplete: { bufferId: string, bufferName: string, url: string, maskUrl: string }[];
	upload: any;
	isThemeLight: boolean;
}
