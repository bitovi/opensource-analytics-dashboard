import { ChangeDetectionStrategy, Component, forwardRef, inject, OnDestroy } from '@angular/core';
import {
	ControlValueAccessor,
	FormControl,
	FormGroup,
	NG_VALIDATORS,
	NG_VALUE_ACCESSOR,
	ValidationErrors,
	Validators,
} from '@angular/forms';
import { Subject, takeUntil, tap } from 'rxjs';
import { DateRange } from '../../models';
import { DateService, ErrorHandlerService } from '../../services';

export const dateRangePickerComponentFn = () => DateRangePickerComponent;

@Component({
	selector: 'app-date-range-picker',
	templateUrl: './date-range-picker.component.html',
	styleUrls: ['./date-range-picker.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{
			provide: NG_VALIDATORS,
			useExisting: forwardRef(dateRangePickerComponentFn),
			multi: true,
		},
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(dateRangePickerComponentFn),
			multi: true,
		},
	],
})
export class DateRangePickerComponent implements ControlValueAccessor, OnDestroy {
	private readonly dateService = inject(DateService);
	private readonly errorHandlerService = inject(ErrorHandlerService);

	// inner FormGroup used to manage ControlValueAccessor value
	readonly dateRangeFormGroup = this.getDateRangeFormGroup();

	readonly minDate = new Date(2015, 0, 1);
	readonly maxDate = new Date();

	// Start and End ErrorHandlers used to populate `mat-error`
	readonly startDateErrorsHandler = this.errorHandlerService.getDatepickerErrorsHandler('Start Date');
	readonly endDateErrorsHandler = this.errorHandlerService.getDatepickerErrorsHandler('End Date');

	/**
	 * mat-date-input does not support
	 * change events emitted despite using emitEvents false
	 * https://github.com/angular/components/issues/20218
	 */
	private skipEmit = false;

	// onChange callback that will be overridden using `registerOnChange`
	onChange: (dateRange?: DateRange | null) => void = () => {
		/** empty */
	};
	// onTouched callback that will be overridden using `registerOnTouched`
	onTouched = () => {
		/** empty */
	};

	/**
	 * Bubbles up MatDateRangePicker errors to this
	 * Component's ControlValueAccessor validators
	 */
	matDateRangePickerValidators = (): ValidationErrors | null => {
		const nestedErrors =
			this.dateRangeFormGroup.errors ??
			this.dateRangeFormGroup.controls.start.errors ??
			this.dateRangeFormGroup.controls.end.errors;

		if (nestedErrors) {
			return nestedErrors;
		}

		return null;
	};

	private readonly destroyer$ = new Subject<void>();

	constructor() {
		this.dateRangeFormGroup.valueChanges
			.pipe(
				tap(({ start, end }) => {
					if (!this.dateRangeFormGroup.valid || this.skipEmit) {
						return;
					}

					if (!start || !end) {
						return;
					}

					this.onChange([start, end]);
				}),
				takeUntil(this.destroyer$)
			)
			.subscribe();
	}

	/**
	 * Creates FormGroup that is responsible for setting
	 * Component's ControlValueAccessor value
	 */
	getDateRangeFormGroup(): FormGroup<{
		start: FormControl<Date | null>;
		end: FormControl<Date | null>;
	}> {
		return new FormGroup({
			start: new FormControl<Date | null>(null, {
				validators: Validators.required,
			}),
			end: new FormControl<Date | null>(null, {
				validators: Validators.required,
			}),
		});
	}

	/**
	 * Set Component's ControlValueAccessor value
	 */
	writeValue(dateRange?: DateRange | null): void {
		this.skipEmit = true;
		// Clear start and end FormControl's value when trying to set
		// date range to something that isn't iterable to avoid spreading
		// values to `start` and `end` FormControls
		if (!this.dateService.isValidDateRange(dateRange)) {
			this.dateRangeFormGroup.setValue(
				{
					start: null,
					end: null,
				},
				{
					onlySelf: true,
					emitEvent: false,
				}
			);
			return;
		}

		const [start, end] = dateRange;

		// Validation on start and end themselves are handled by their FormControls.
		this.dateRangeFormGroup.setValue(
			{ start, end },
			{
				onlySelf: true,
				emitEvent: false,
			}
		);

		setTimeout(() => {
			this.skipEmit = false;
		});
	}

	/**
	 * Register Component's ControlValueAccessor onChange callback
	 */
	registerOnChange(fn: DateRangePickerComponent['onChange']): void {
		this.onChange = fn;
	}

	/**
	 * Register Component's ControlValueAccessor onTouched callback
	 */
	registerOnTouched(fn: DateRangePickerComponent['onTouched']): void {
		this.onTouched = fn;
	}

	/**
	 * Provides validators
	 */
	validate(): ValidationErrors | null {
		return this.matDateRangePickerValidators();
	}

	ngOnDestroy(): void {
		this.destroyer$.next();
		this.destroyer$.complete();
	}
}
