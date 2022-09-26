import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ChartType } from 'angular-google-charts';
import { ChartData } from '../../models';

@Component({
	selector: 'app-chart-component',
	templateUrl: './chart-component.component.html',
	styleUrls: ['./chart-component.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponentComponent {
	@Input() chartData!: ChartData;

	// Used to input bind ChartType enum in template
	readonly chartType = ChartType.Line;
}