export interface RegistryData {
	packageName: string;
	total: number;
	range: number[];
}

export interface DownloadsPoint {
	downloads: number;
}

export interface DownloadsRange {
	downloads: {
		day: string;
		downloads: number;
	}[];
}

export interface Suggestion {
	package: {
		name: string;
		version: string;
	};
}
