import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDateRangeInput } from '@angular/material/datepicker';
import { ErrorHandlerDirective } from '../../directives';
import { ToObservablePipe } from '../../pipes';

import { DateRangePickerComponent } from './date-range-picker.component';

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
	selector: 'mat-date-range-input',
})
class MockMatDateRangeInputComponent {
	@Input() min!: Date;
	@Input() max!: Date;
	@Input() rangePicker!: MatDateRangeInput<Date>['rangePicker'];
}

@Component({
	selector: 'mat-date-range-picker',
})
class MockMatDateRangePickerComponent {}

@Component({
	selector: 'mat-datepicker-toggle',
})
class MockMatDatepickerToggleComponent {
	@Input() for!: MatDateRangeInput<Date>;
}

describe('DateRangePickerComponent', () => {
	let component: DateRangePickerComponent;
	let fixture: ComponentFixture<DateRangePickerComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [
				DateRangePickerComponent,
				MockMatLabelComponent,
				MockMatHintComponent,
				MockMatErrorComponent,
				MockMatFormFieldComponent,
				MockMatDateRangeInputComponent,
				MockMatDateRangePickerComponent,
				MockMatDatepickerToggleComponent,
				ToObservablePipe,
				ErrorHandlerDirective,
			],
			imports: [ReactiveFormsModule],
		}).compileComponents();

		fixture = TestBed.createComponent(DateRangePickerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
