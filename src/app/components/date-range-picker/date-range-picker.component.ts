import { ChangeDetectionStrategy, Component, forwardRef, OnInit } from '@angular/core';
import {
	AbstractControl,
	ControlValueAccessor,
	FormBuilder,
	FormControl,
	FormGroup,
	NG_VALIDATORS,
	NG_VALUE_ACCESSOR,
	ValidationErrors,
	ValidatorFn,
	Validators,
} from '@angular/forms';
import { isAfter, isEqual, startOfDay, subDays } from 'date-fns';
import { filter, startWith } from 'rxjs';
import { DateRangeValue } from 'src/app/models/data-range-picket.model';
import { ErrorHandlerService } from 'src/app/services';

@Component({
	selector: 'app-date-range-picker',
	templateUrl: './date-range-picker.component.html',
	styleUrls: ['./date-range-picker.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{
			provide: NG_VALIDATORS,
			useExisting: forwardRef(() => DateRangePickerComponent),
			multi: true,
		},
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => DateRangePickerComponent),
			multi: true,
		},
	],
})
export class DateRangePickerComponent implements OnInit, ControlValueAccessor, Validators {
	readonly minDate = new Date(2015, 0, 1);
	readonly maxDate = new Date();
	readonly formGroup = this.getDateRangeFormGroup();
	readonly startDateErrorsHandler = this.errorHandlerService.getDatepickerErrorsHandler('Start Date');
	readonly endDateErrorsHandler = this.errorHandlerService.getDatepickerErrorsHandler('End Date');

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onChange = (value: DateRangeValue) => {
		/* empty */
	};
	onTouched = () => {
		/* empty */
	};

	constructor(private errorHandlerService: ErrorHandlerService, private fb: FormBuilder) {}

	ngOnInit(): void {
		this.watchDateChange();
	}

	writeValue(value: any): void {
		this.formGroup.controls.start.setValue(value);
		this.formGroup.controls.end.setValue(value);
	}
	registerOnChange(fn: any): void {
		this.onChange = fn;
	}
	registerOnTouched(fn: any): void {
		this.onTouched = fn;
	}

	setDisabledState?(): void {
		throw new Error('Method not implemented.');
	}

	onBlur(event?: Event): void {
		console.log('DateRangePickerComponent onBlur()', event);
	}

	// Normally validators have an AbstractControl as an argument
	// Silencing lint error, but in production, we should just remove (keeping it here as notes)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	matDateRangePickerValidators = (c: AbstractControl): ValidationErrors | null => {
		// Carry MatDateRangePicker errors to this Component's errors
		const nestedErrors = this.formGroup.errors ?? this.formGroup.controls.start.errors ?? this.formGroup.controls.end.errors;

		if (nestedErrors) {
			return nestedErrors;
		}

		return null;
	};

	_validator: ValidatorFn | null = Validators.compose([this.matDateRangePickerValidators]);

	validate(c: AbstractControl): ValidationErrors | null {
		// How to compose multiple validators
		// return Validators.compose([this.matDateRangePickerValidators]);
		return this.matDateRangePickerValidators(c);
	}

	private watchDateChange(): void {
		this.formGroup.valueChanges
			.pipe(
				startWith(this.formGroup.value),
				// Only emit selected dates from form if they're valid
				filter((dates): dates is { start: Date; end: Date } => !!dates.start && !!dates.end),
				// Ignore any values where the end is before the start
				filter((dates) => isEqual(dates.end, dates.start) || isAfter(dates.end, dates.start))
			)
			.subscribe((value) => this.onChange([value.start, value.end]));
	}

	private getDateRangeFormGroup(): FormGroup<{
		start: FormControl<Date | null>;
		end: FormControl<Date | null>;
	}> {
		const currentDate = startOfDay(new Date());

		return this.fb.group({
			start: [subDays(currentDate, 8), [Validators.required]],
			end: [subDays(currentDate, 1), [Validators.required]],
		});
	}
}
