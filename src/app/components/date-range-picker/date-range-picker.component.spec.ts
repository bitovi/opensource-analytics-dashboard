import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
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

	describe('when dateRangeFormGroup value changes', () => {
		// beforeEach(() => {
		// 	component['skipEmit'] = false;
		// });
		it('should NOT call onChange if group is invalid', () => {
			const onChangeSpy = jest.spyOn(component, 'onChange');
			jest.spyOn(component.dateRangeFormGroup, 'valid', 'get').mockReturnValueOnce(false);
			component.dateRangeFormGroup.setValue({ start: new Date(), end: new Date() });
			expect(onChangeSpy).not.toHaveBeenCalled();
		});
		it('should NOT call onChange if skipEmit is true', () => {
			const onChangeSpy = jest.spyOn(component, 'onChange');
			component['skipEmit'] = true;
			component.dateRangeFormGroup.setValue({ start: new Date(), end: new Date() });
			expect(onChangeSpy).not.toHaveBeenCalled();
		});
		it('should NOT call onChange if start or end values are falsy', () => {
			const onChangeSpy = jest.spyOn(component, 'onChange');

			component.dateRangeFormGroup.setValue({ start: null, end: null });
			expect(onChangeSpy).not.toHaveBeenCalled();

			component.dateRangeFormGroup.setValue({ start: null, end: new Date() });
			expect(onChangeSpy).not.toHaveBeenCalled();

			component.dateRangeFormGroup.setValue({ start: new Date(), end: null });
			expect(onChangeSpy).not.toHaveBeenCalled();
		});
		it('should call onChange if group is valid and start and end are truthy', () => {
			const onChangeSpy = jest.spyOn(component, 'onChange');

			const startDate = new Date('2021-10-31');
			const endDate = new Date('2021-12-25');

			component.dateRangeFormGroup.setValue({ start: startDate, end: endDate });
			expect(onChangeSpy).toHaveBeenCalledWith([startDate, endDate]);
		});
	});

	describe('getDateRangeFormGroup()', () => {
		it('should return a new FormGroup with null start and end values', () => {
			const group = component.getDateRangeFormGroup();
			// Ensure 'start' control exists
			expect(group.get('start')).toBeTruthy();
			// Ensure 'end' control exists
			expect(group.get('end')).toBeTruthy();
			// Ensure 'start' has a null value
			expect(group.get('start')?.value).toBeNull();
			// Ensure 'end' has a null value
			expect(group.get('start')?.value).toBeNull();
			// Ensure 'start' is required
			expect(group.get('start')?.hasValidator(Validators.required)).toBe(true);
			// Ensure 'end' is required
			expect(group.get('end')?.hasValidator(Validators.required)).toBe(true);
		});
	});

	describe('matDateRangePickerValidators', () => {
		const sampleErrors: ValidationErrors = { notEnoughMoo: true };
		it('should return null when no nested errors are found', () => {
			component.dateRangeFormGroup.setErrors(null);
			component.dateRangeFormGroup.controls.start.setErrors(null);
			component.dateRangeFormGroup.controls.end.setErrors(null);
			expect(component.matDateRangePickerValidators()).toBeNull();
		});
		it('should return form group errors when present', () => {
			component.dateRangeFormGroup.setErrors(sampleErrors);
			expect(component.matDateRangePickerValidators()).toStrictEqual(sampleErrors);
		});
		it('should return start control errors when present and form group errors are not', () => {
			component.dateRangeFormGroup.setErrors(null);
			component.dateRangeFormGroup.controls.start.setErrors(sampleErrors);
			expect(component.matDateRangePickerValidators()).toStrictEqual(sampleErrors);
		});
		it('should return end control errors when present and start control and form group errors are not', () => {
			component.dateRangeFormGroup.setErrors(null);
			component.dateRangeFormGroup.controls.start.setErrors(null);
			component.dateRangeFormGroup.controls.end.setErrors(sampleErrors);
			expect(component.matDateRangePickerValidators()).toStrictEqual(sampleErrors);
		});
	});

	describe('validate()', () => {
		it('should return result of matDateRangePickerValidators()', () => {
			const spy = jest.spyOn(component, 'matDateRangePickerValidators').mockImplementationOnce(() => null);
			const result = component.validate();

			// Make sure result matches mock return value
			expect(result).toBeNull();
			// Make sure matDateRangePickerValidators was called
			expect(spy).toHaveBeenCalledTimes(1);
		});
	});
});
