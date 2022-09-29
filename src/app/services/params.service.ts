import { Injectable } from '@angular/core';
import { QueryParams } from '../models/query-params.model';

/**
 * Gets and sets params without changing navigation history.
 * Because this, it doesn't work with the `Router` Service.
 */
@Injectable({
	providedIn: 'root',
})
export class ParamsService {
	/**
	 * Gets param value by name
	 */
	getParam(name: string): string | null {
		try {
			const params = new URLSearchParams(window.location.search);

			return params.get(name);
		} catch (error) {
			console.error(error);

			return null;
		}
	}

	/**
	 * Set param value by name. Replaces any previous value(s) currently in the url
	 */
	setParam(name: string, value: string): void {
		// Get current params
		const params = new URLSearchParams(window.location.search);

		// Clear any value if there is already one
		// If you append a value, there will be duplicate name value pairs in the url
		params.delete(name);

		params.append(name, value);
		params.sort();

		const baseUrl = window.location.href.split('?')[0];

		// Update params without changing navigation history
		window.history.replaceState({}, document.title, `${baseUrl}?${params.toString()}`);
	}

	/**
	 * Get package names in params
	 */
	getPackageNames(): string[] {
		const packageNames = this.getParam(QueryParams.PACKAGE_NAMES)?.split(',') ?? [];

		// Filter any empty strings since these those wouldn't be valid package names
		return packageNames.filter((packageName) => !!packageName);
	}

	/**
	 * Set package names in params
	 */
	setPackageNames(packageNames: string[]): void {
		this.setParam(QueryParams.PACKAGE_NAMES, packageNames.toString());
	}
}
