import { formatNumber } from '@angular/common';
import { inject, Injectable, LOCALE_ID } from '@angular/core';
import { Column } from 'angular-google-charts';
import { addDays, differenceInDays, format, isEqual } from 'date-fns';
import { ChartData, RegistryData } from '../../models';

@Injectable({
	providedIn: 'root',
})
export class DateService {
	private readonly locale = inject(LOCALE_ID);

	getChartData(apiDatas: RegistryData[], start: Date, end: Date): ChartData {
		const columns: Column[] = [
			{ type: 'string', label: 'Date' },
			...apiDatas.map(({ packageName, total }) => ({
				type: 'number',
				label: `${packageName} (${formatNumber(total, this.locale)})`,
			})),
		];

		const dates = this.getDateRange(start, end);

		// TODO: get formatter given range
		// MM/dd vs MM/dd/yy
		const rows = dates.map((date, i) => {
			return [format(date, 'MM/dd/yy'), ...apiDatas.map((apiData) => apiData.range[i])];
		});

		const options = {
			chart: {
				title: 'Downloads',
				subtitle: 'per day for a given period of specific package(s)',
			},
			height: 400,
		};

		return { columns, rows, options };
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
