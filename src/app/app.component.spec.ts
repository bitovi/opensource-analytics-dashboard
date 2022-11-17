import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppComponent } from './app.component';
import { ToObservablePipe } from './pipes';

@Component({
	selector: 'app-package-list',
})
class MockPackageListComponent {}

@Component({
	selector: 'app-date-range-picker',
})
class MockDateRangePickerComponent {}

@Component({
	selector: 'app-date-range-dropdown',
})
class MockDateRangeDropdownComponent {}

describe('AppComponent', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			declarations: [
				AppComponent,
				ToObservablePipe,
				MockPackageListComponent,
				MockDateRangePickerComponent,
				MockDateRangeDropdownComponent,
			],
			providers: [
				{
					provide: MatSnackBar,
					useValue: {
						open: () => {
							/** stub */
						},
					},
				},
			],
		}).compileComponents();
	});

	it('should create the app', () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.componentInstance;
		expect(app).toBeTruthy();
	});
});
