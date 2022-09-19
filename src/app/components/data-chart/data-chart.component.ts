import { Component, Input } from '@angular/core';
import { ChartType } from 'angular-google-charts';
import { ChartData } from 'src/app/models/chart.model';

@Component({
	selector: 'app-data-chart',
	templateUrl: './data-chart.component.html',
	styleUrls: ['./data-chart.component.scss'],
})
export class DataChartComponent {
	@Input() chartData!: ChartData;

	// Used to input bind ChartType enum in template
	readonly chartType = ChartType.Line;

	constructor() {}
}
