import { Injectable } from '@angular/core';
import {
	addDays,
	differenceInDays,
	format,
	isBefore,
	isEqual,
	isValid,
	parse,
	startOfDay,
	subMonths,
	subWeeks,
	subYears,
} from 'date-fns';
import { DateFormat, DateRange, DateRangeDropdown, DateRangeTimeline, RegistryData } from '../../models';

@Injectable({
	providedIn: 'root',
})
export class DateService {
	/**
	 * Get a Date instance based on a string format
	 */
	getDate(date: string, dateFormat: DateFormat): Date {
		return parse(date, dateFormat, new Date());
	}

	/**
	 * Get a formatted date string based on a string format
	 */
	getDateString(date: Date, dateFormat: DateFormat): string {
		return format(date, dateFormat);
	}

	// TODO: Implement agreegating apiDatas by: DAY, WEEK, MONTH
	getAggregatedReigstryData(apiDatas: RegistryData[], dates: Date[]): (string | number)[][] {
		const rows = dates.map((date) => {
			// create matching format with registryData.range[N].day
			const correctDateFormat = format(date, 'yyyy-MM-dd');
			// from API response for each library find downloads for the corresponsing day (correctDateFormat)
			const existingDate = apiDatas.map(
				(registryData) => registryData.range.find((d) => d.day === correctDateFormat)?.downloads ?? 0
			);
			return [format(date, 'MM/dd/yy'), ...existingDate];
		});

		return rows;
	}

	/**
	 * Verifies instance is a Date with some valid value
	 */
	isValidDate(date: unknown): date is Date {
		if (!(date instanceof Date)) {
			return false;
		}

		// Check if Date instance since `isValid` accepts number (milliseconds)
		return isValid(date);
	}

	/**
	 * Verifies instance is a [Date, Date] where each Date has a valid value
	 * and the first Date is equal or before the second Date
	 */
	isValidDateRange(dateRange: unknown): dateRange is DateRange {
		// Validate dateRange is an array
		if (!Array.isArray(dateRange)) {
			return false;
		}

		// Validate there is exactly one value for start and one value for end
		if (dateRange.length !== 2) {
			return false;
		}

		// Validate start and end are valid dates
		const [start, end] = dateRange;

		if (!this.isValidDate(start)) {
			return false;
		}

		if (!this.isValidDate(end)) {
			return false;
		}

		// start is equal or before end
		return isEqual(start, end) || isBefore(start, end);
	}

	/**
	 * Gets an array of Dates where the values increment by one day
	 * and the first value is the first value of the `DateRange`,
	 * and the last value is the last value of `DateRange`
	 */
	getDates(dateRange: DateRange): Date[] {
		const [start, end] = dateRange;

		const diff = differenceInDays(end, start);

		const days = Array.from({ length: diff }, (_, i) => i + 1);

		const dates = [start, ...days.map((additionalDays) => addDays(start, additionalDays))];
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		if (!isEqual(dates.at(-1)!, end)) {
			console.error({ dates, end });
			throw new Error('Unexpected getDates end mismatch');
		}

		return dates;
	}

	/**
	 *
	 * @param dateRangeDropdown value from DATE_RANGE_DROPDOWN_DATA
	 * @returns A converted value from DATE_RANGE_DROPDOWN_DATA to a DateRange that
	 * reference the [start, end] dates
	 *
	 * Used to receive errors from this.getDates() when not working with midnight dates
	 */
	getDateRangeByDropdown(dateRangeDropdown: DateRangeDropdown): DateRange {
		const today = startOfDay(new Date()); // today midnight

		if (dateRangeDropdown.rangeTimeline === DateRangeTimeline.YEARS) {
			// substract years
			return [subYears(startOfDay(new Date()), dateRangeDropdown.rangeValue), today];
		} else if (dateRangeDropdown.rangeTimeline === DateRangeTimeline.MONTHS) {
			// substract months
			return [subMonths(startOfDay(new Date()), dateRangeDropdown.rangeValue), today];
		} else if (dateRangeDropdown.rangeTimeline === DateRangeTimeline.WEEKS) {
			// substract weeks and add plus one day, because we were showing one day more than the subscracted weeks
			const pastDate = addDays(subWeeks(startOfDay(new Date()), dateRangeDropdown.rangeValue), 1);
			return [pastDate, today];
		}
		throw new Error('Unexpected getDateRangeByDropdown DateRangeTimeline value');
	}
}
