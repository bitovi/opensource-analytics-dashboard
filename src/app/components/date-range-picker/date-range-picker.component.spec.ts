import { Component, Input } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatDateRangeInput } from '@angular/material/datepicker';
import { DateService } from '../../services';
import { ErrorHandlerDirective } from '../../directives';
import { ToObservablePipe } from '../../pipes';

import { DateRangePickerComponent, dateRangePickerComponentFn } from './date-range-picker.component';
import { DateRange } from 'src/app/models';

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

	describe('dateRangePickerComponentFn()', () => {
		it('should return DateRangePickerComponent', () => {
			expect(dateRangePickerComponentFn()).toEqual(DateRangePickerComponent);
		});
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have a minDate of 1/1/2015', () => {
		expect(component.minDate).toStrictEqual(new Date(2015, 0, 1));
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

	describe('writeValue()', () => {
		it('should set skipEmit to true', () => {
			component['skipEmit'] = false;
			component.writeValue(null);
			expect(component['skipEmit']).toBe(true);
		});
		it('should set dateRange to null values when dateRange is invalid', () => {
			const dateService = TestBed.inject(DateService);
			jest.spyOn(dateService, 'isValidDateRange').mockReturnValue(false);

			const setValueSpy = jest.spyOn(component.dateRangeFormGroup, 'setValue').mockImplementation(() => ({}));
			const nullValue = { start: null, end: null };

			component.writeValue(null);
			expect(setValueSpy).toHaveBeenCalledWith(nullValue, { onlySelf: true, emitEvent: false });
		});
		it('should write date range to dateRangeFormGroup when valid', () => {
			const dateService = TestBed.inject(DateService);
			jest.spyOn(dateService, 'isValidDateRange').mockReturnValue(true);

			const setValueSpy = jest.spyOn(component.dateRangeFormGroup, 'setValue').mockImplementation(() => ({}));
			const dateRange: DateRange = [new Date('2021-10-01'), new Date('2021-11-01')];

			component.writeValue(dateRange);

			expect(setValueSpy).toBeCalledWith(
				{ start: dateRange[0], end: dateRange[1] },
				{ onlySelf: true, emitEvent: false }
			);
		});
		it('should reset skipEmit to false with setTimeout', fakeAsync(() => {
			const dateService = TestBed.inject(DateService);
			jest.spyOn(dateService, 'isValidDateRange').mockReturnValue(true);
			jest.spyOn(component.dateRangeFormGroup, 'setValue').mockImplementation(() => ({}));

			const dateRange: DateRange = [new Date('2021-10-01'), new Date('2021-11-01')];

			component.writeValue(dateRange);

			// Wait some time for the timeout
			tick(500);
			// Use fixture to wait until we're stable
			fixture.detectChanges();
			fixture.whenStable().then(() => {
				expect(component['skipEmit']).toBe(false);
			});
		}));
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

	describe('registerOnChange()', () => {
		it('should assign onChange to given function', () => {
			const fn = jest.fn();
			component.registerOnChange(fn);
			expect(component.onChange).toEqual(fn);
		});
	});

	describe('registerOnTouched()', () => {
		it('should assign onTouched to given function', () => {
			const fn = jest.fn();
			component.registerOnTouched(fn);
			expect(component.onTouched).toEqual(fn);
		});
	});
});
