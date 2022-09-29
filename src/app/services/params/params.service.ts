import { inject, Injectable } from '@angular/core';
import { DateFormat, DateRange, QueryParams } from '../../models';
import { DateService } from '../date';

/**
 * Gets and sets params without changing navigation history.
 * Because this, it doesn't work with the `Router` Service.
 */
@Injectable({
	providedIn: 'root',
})
export class ParamsService {
	private readonly dateService = inject(DateService);

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
		// If you append a value without deleting, there will be duplicate name value pairs in the url
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
	setPackageNames(dateRange: string[]): void {
		this.setParam(QueryParams.PACKAGE_NAMES, dateRange.toString());
	}

	/**
	 * Get package names in params
	 */
	getDateRange(): DateRange | null {
		const dateRangeParams = this.getParam(QueryParams.DATE_RANGE)?.split(',') ?? [];

		// Ensure that there's exactly 2 values for the date range
		if (dateRangeParams.length !== 2) {
			return null;
		}

		const [start, end] = dateRangeParams;

		return [
			this.dateService.getDate(start, DateFormat.YEAR_MONTH_DAY),
			this.dateService.getDate(end, DateFormat.YEAR_MONTH_DAY),
		];
	}

	/**
	 * Set package names in params
	 */
	setDateRange([start, end]: DateRange): void {
		const startString = this.dateService.getDateString(start, DateFormat.YEAR_MONTH_DAY);
		const endString = this.dateService.getDateString(end, DateFormat.YEAR_MONTH_DAY);

		const param = `${startString},${endString}`;

		this.setParam(QueryParams.DATE_RANGE, param);
	}
}
