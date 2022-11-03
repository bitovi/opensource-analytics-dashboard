import { ChangeDetectionStrategy, Component, forwardRef, inject, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { DateRange, DateRangeDropdown, DATE_RANGE_DROPDOWN_DATA } from './../../models';
import { DateService } from './../../services';

@Component({
	selector: 'app-date-range-dropdown',
	templateUrl: './date-range-dropdown.component.html',
	styleUrls: ['./date-range-dropdown.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => DateRangeDropdownComponent),
			multi: true,
		},
	],
})
export class DateRangeDropdownComponent implements OnInit, OnDestroy, ControlValueAccessor {
	// inner FormControl used to manage ControlValueAccessor value
	readonly dateRangeDropdownFormControl = new FormControl<DateRangeDropdown | null>(null, {});
	private readonly destroyer$ = new Subject<void>();
	private readonly dateService = inject(DateService);

	DATE_RANGE_DROPDOWN_DATA = DATE_RANGE_DROPDOWN_DATA;

	// onChange callback that will be overridden using `registerOnChange`
	onChange: (dateRange?: DateRange | null) => void = () => {
		/** empty */
	};

	// onTouched callback that will be overridden using `registerOnTouched`
	onTouched = () => {
		/** empty */
	};

	ngOnInit(): void {
		this.dateRangeDropdownFormControl.valueChanges.pipe(takeUntil(this.destroyer$)).subscribe((value) => {
			if (value) {
				const dateRange = this.dateService.getDateRangeByDropdown(value);
				this.onChange(dateRange);
			}
		});
	}

	/**
	 * Set Component's ControlValueAccessor value
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	writeValue(dateRange?: DateRange | null): void {
		this.dateRangeDropdownFormControl.patchValue(null, { onlySelf: true, emitEvent: false });
	}

	/**
	 * Register Component's ControlValueAccessor onChange callback
	 */
	registerOnChange(fn: DateRangeDropdownComponent['onChange']): void {
		this.onChange = fn;
	}

	/**
	 * Register Component's ControlValueAccessor onTouched callback
	 */
	registerOnTouched(fn: DateRangeDropdownComponent['onTouched']): void {
		this.onTouched = fn;
	}

	ngOnDestroy(): void {
		this.destroyer$.next();
		this.destroyer$.complete();
	}
}
