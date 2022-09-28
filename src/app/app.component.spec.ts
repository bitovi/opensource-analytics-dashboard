import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppComponent } from './app.component';
import { ToObservablePipe } from './pipes';

@Component({
	selector: 'mat-label',
})
class MockMatLabelComponent {}

@Component({
	selector: 'mat-hint',
})
class MockMatHintComponent {}

@Component({
	selector: 'mat-error',
})
class MockMatErrorComponent {}

@Component({
	selector: 'mat-form-field',
})
class MockMatFormFieldComponent {}

@Component({
	selector: 'app-package-list',
})
class MockPackageListComponent {}

@Component({
	selector: 'app-date-range-picker',
})
class MockDateRangePickerComponent {}

describe('AppComponent', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			declarations: [
				AppComponent,
				ToObservablePipe,
				MatAutocomplete, // Required for #auto="matAutocomplete" directive
				MockMatLabelComponent,
				MockMatHintComponent,
				MockMatErrorComponent,
				MockMatFormFieldComponent,
				MockPackageListComponent,
				MockDateRangePickerComponent,
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
