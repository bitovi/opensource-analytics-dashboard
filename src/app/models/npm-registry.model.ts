export interface RegistryData {
	packageName: string;
	total: number;
	range: DownloadsRangeData[];
}

export interface DownloadsPoint {
	downloads: number;
}

export interface DownloadsRange {
	downloads: DownloadsRangeData[];
}

export interface DownloadsRangeData {
	day: string;
	downloads: number;
}

export interface Suggestion {
	package: {
		name: string;
		version: string;
		links: {
			repository: string;
		};
	};
}
