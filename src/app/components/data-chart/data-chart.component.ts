import { formatNumber } from '@angular/common';
import { Component, inject, Input, LOCALE_ID, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ChartType, Column } from 'angular-google-charts';
import { format } from 'date-fns';
import { ChartData } from 'src/app/models/chart.model';

import { DateService } from 'src/app/services';
import { RegistryData } from 'src/app/services/npm-registry/npm-registry.model';

@Component({
	selector: 'app-data-chart',
	templateUrl: './data-chart.component.html',
	styleUrls: ['./data-chart.component.scss'],
})
export class DataChartComponent implements OnInit, OnChanges {
	@Input() registryData?: RegistryData[] | null;
	@Input() dateRangeForm!: any;

	chartData?: ChartData;

	// Used to input bind ChartType enum in template
	readonly chartType = ChartType.Line;
	private readonly locale = inject(LOCALE_ID);
	constructor(private dateService: DateService) {}

	ngOnInit(): void {}

	ngOnChanges(changes: SimpleChanges): void {
		if (this.registryData && changes?.['registryData']?.currentValue) {
			this.chartData = this.getChartData(this.registryData, this.dateRangeForm.start, this.dateRangeForm.end);
		}
	}

	getChartData(apiDatas: RegistryData[], start: Date, end: Date): ChartData {
		const columns: Column[] = [
			{ type: 'string', label: 'Date' },
			...apiDatas.map(({ packageName, total }) => ({
				type: 'number',
				label: `${packageName} (${formatNumber(total, this.locale)})`,
			})),
		];

		const dates = this.dateService.getDateRange(start, end);

		// TODO: get formatter given range
		// MM/dd vs MM/dd/yy
		const rows = dates.map((date, i) => {
			return [format(date, 'MM/dd/yy'), ...apiDatas.map((data) => data.range[i])];
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
