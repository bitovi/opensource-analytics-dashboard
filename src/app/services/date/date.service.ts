import { Injectable } from '@angular/core';
import { addDays, differenceInDays, format, isEqual, parse } from 'date-fns';
import { DateFormat, RegistryData } from '../../models';

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
		// MM/dd vs MM/dd/yy
		const rows = dates.map((date, i) => {
			return [format(date, 'MM/dd/yy'), ...apiDatas.map((apiData) => apiData.range[i].downloads)];
		});

		return rows;
	}

	getDateRange(start: Date, end: Date): Date[] {
		const diff = differenceInDays(end, start);

		const days = Array.from({ length: diff }, (_, i) => i + 1);

		const dates = [start, ...days.map((additionalDays) => addDays(start, additionalDays))];

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		if (!isEqual(dates.at(-1)!, end)) {
			throw new Error('Unexpected getDateRange end mismatch');
		}

		return dates;
	}
}
