import { Injectable } from '@angular/core';
import { QueryParams } from '../models/query-params.model';

@Injectable({
	providedIn: 'root',
})
export class ParamsService {
	getPackageNamesFromParams(): string[] {
		try {
			const params = new URLSearchParams(window.location.search);

			const packageNames = params.get(QueryParams.PACKAGE_NAMES)?.split(',') ?? [];

			// Filter any empty strings since these those wouldn't be valid package names
			return packageNames.filter((packageName) => !!packageName);
		} catch (error) {
			console.error(error);
			return [];
		}
	}

	setPackageNamesInParams(packageNames: string[]): void {
		let url = window.location.href.split('?')[0];
		url += `?${QueryParams.PACKAGE_NAMES}=${packageNames}`;
		window.history.replaceState({}, document.title, url);
	}
}
