import { Injectable } from '@angular/core';
import { addDays, differenceInDays, format, isEqual } from 'date-fns';
import { RegistryData } from '../../models';

@Injectable({
	providedIn: 'root',
})
export class DateService {
	// TODO: Implement agreegating apiDatas by: DAY, WEEK, MONTH
	getAggregatedReigstryData(apiDatas: RegistryData[], dates: Date[]): (string | number)[][] {
		// MM/dd vs MM/dd/yy
		const rows = dates.map((date, i) => {
			return [format(date, 'MM/dd/yy'), ...apiDatas.map((apiData) => apiData.range[i].downloads)];
		});

		return rows;
	}
	getFormattedDateString(date: Date): string {
		return format(date, 'yyyy-MM-dd');
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
