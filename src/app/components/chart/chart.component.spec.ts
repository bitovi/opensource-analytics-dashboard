import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoogleChartComponent } from 'angular-google-charts';

import { ChartComponent } from './chart.component';

@Component({
	selector: 'google-chart',
})
class MockGoogleChartComponent {
	@Input() type!: GoogleChartComponent['type'];
	@Input() data!: GoogleChartComponent['data'];
	@Input() options!: GoogleChartComponent['options'];
	@Input() columns!: GoogleChartComponent['columns'];
	@Input() dynamicResize!: GoogleChartComponent['dynamicResize'];
}

describe('ChartComponentComponent', () => {
	let component: ChartComponent;
	let fixture: ComponentFixture<ChartComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ChartComponent, MockGoogleChartComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(ChartComponent);
		component = fixture.componentInstance;
		component.chartData = {
			rows: [],
			columns: [],
			options: [],
		};
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
