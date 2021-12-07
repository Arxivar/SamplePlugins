export interface IScopeUploadPlugin extends angular.IScope {
	disabled: boolean;
	download: (bufferId: any) => void;
	bufferId: string;
	arrayBufferComplete: { bufferId: string, bufferName: string }[];
	upload: any
}
