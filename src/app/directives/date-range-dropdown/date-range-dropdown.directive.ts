import { Directive, forwardRef, Host, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DateRangeDropdownComponent } from './../../components/date-range-dropdown/date-range-dropdown.component';

import { Subject, takeUntil } from 'rxjs';
import { DateRange, DateRangeDropdown } from '../../models';

@Directive({
	selector: '[appDateRangeDropdown]',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => DateRangeDropdownDirective),
			multi: true,
		},
	],
})
export class DateRangeDropdownDirective implements OnInit, OnDestroy, ControlValueAccessor {
	private readonly destroyer$ = new Subject<void>();

	constructor(@Host() private cmp: DateRangeDropdownComponent) {}

	ngOnInit(): void {
		this.cmp.dateRangeDropdownFormControl.valueChanges.pipe(takeUntil(this.destroyer$)).subscribe((value) => {
			if (value) {
				const dateRange = this.getDateRange(value);
				this.onChange(dateRange);
			}
		});
	}

	// onChange callback that will be overridden using `registerOnChange`
	onChange: (dateRange?: DateRange | null) => void = () => {
		/** empty */
	};

	// onTouched callback that will be overridden using `registerOnTouched`
	onTouched = () => {
		/** empty */
	};

	/**
	 * Set Component's ControlValueAccessor value
	 */
	writeValue(dateRange?: DateRange | null): void {
		console.log(dateRange);
		// if (dateRange) {
		// 	this.dateRangeFormControl.setValue(dateRange);
		// }
	}

	/**
	 * Register Component's ControlValueAccessor onChange callback
	 */
	registerOnChange(fn: DateRangeDropdownDirective['onChange']): void {
		this.onChange = fn;
	}

	/**
	 * Register Component's ControlValueAccessor onTouched callback
	 */
	registerOnTouched(fn: DateRangeDropdownDirective['onTouched']): void {
		this.onTouched = fn;
	}

	ngOnDestroy(): void {
		this.destroyer$.next();
		this.destroyer$.complete();
	}

	private getDateRange(dateRangeDropdown: DateRangeDropdown): DateRange {
		const pastDate = new Date();
		if (dateRangeDropdown.rangeTimeline === 'years') {
			pastDate.setFullYear(pastDate.getFullYear() - dateRangeDropdown.rangeValue);
		} else if (dateRangeDropdown.rangeTimeline === 'months') {
			pastDate.setMonth(pastDate.getMonth() - dateRangeDropdown.rangeValue);
		} else if (dateRangeDropdown.rangeTimeline === 'weeks') {
			pastDate.setDate(pastDate.getDate() - dateRangeDropdown.rangeValue * 7);
		}
		return [pastDate, new Date()];
	}
}
