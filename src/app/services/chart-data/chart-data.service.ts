import { formatNumber } from '@angular/common';
import { inject, Injectable, LOCALE_ID } from '@angular/core';
import { Column } from 'angular-google-charts';
import { format } from 'date-fns';
import { ChartData } from '../../models/chart.model';
import { DateService } from '../date';
import { RegistryData } from '../npm-registry/npm-registry.model';

@Injectable({
	providedIn: 'root',
})
export class ChartDataService {
	private readonly locale = inject(LOCALE_ID);

	constructor(private dateService: DateService) {}

	getChartData(apiDatas: RegistryData[], start: Date, end: Date, hiddenLibraries: string[] = []): ChartData {
		// filter out libraries we dont want to show
		const libraries = apiDatas.filter((data) => !hiddenLibraries.includes(data.packageName));

		const columns: Column[] = [
			{ type: 'string', label: 'Date' },
			...libraries.map(({ packageName, total }) => ({
				type: 'number',
				label: `${packageName} (${formatNumber(total, this.locale)})`,
			})),
		];

		const dates = this.dateService.getDateRange(start, end);

		// TODO: get formatter given range
		// MM/dd vs MM/dd/yy
		const rows = dates.map((date, i) => {
			return [format(date, 'MM/dd/yy'), ...libraries.map((data) => data.range[i])];
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
}
