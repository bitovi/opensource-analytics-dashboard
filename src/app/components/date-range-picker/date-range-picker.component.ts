import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { isAfter, isEqual, startOfDay, subDays } from 'date-fns';
import { filter, startWith } from 'rxjs';
import { DateRangeForm } from 'src/app/models/data-range-picket.model';
import { ErrorHandlerService } from 'src/app/services';

@Component({
	selector: 'app-date-range-picker',
	templateUrl: './date-range-picker.component.html',
	styleUrls: ['./date-range-picker.component.scss'],
})
export class DateRangePickerComponent implements OnInit {
	@Output() dateChange: EventEmitter<DateRangeForm> = new EventEmitter<DateRangeForm>();
	@Output() clearCache: EventEmitter<void> = new EventEmitter<void>();

	readonly minDate = new Date(2015, 0, 1);
	readonly maxDate = new Date();
	readonly dateRangeFormGroup = this.getDateRangeFormGroup();
	readonly startDateErrorsHandler = this.errorHandlerService.getDatepickerErrorsHandler('Start Date');
	readonly endDateErrorsHandler = this.errorHandlerService.getDatepickerErrorsHandler('End Date');
	constructor(private errorHandlerService: ErrorHandlerService, private fb: FormBuilder) {}

	ngOnInit(): void {
		this.watchDateChange();
	}

	onClearCache(): void {
		this.clearCache.emit();
	}

	private watchDateChange(): void {
		this.dateRangeFormGroup.valueChanges
			.pipe(
				startWith(this.dateRangeFormGroup.value),
				// Only emit selected dates from form if they're valid
				filter((dates): dates is { start: Date; end: Date } => !!dates.start && !!dates.end),
				// Ignore any values where the end is before the start
				filter((dates) => isEqual(dates.end, dates.start) || isAfter(dates.end, dates.start))
			)
			.subscribe((value) => this.dateChange.emit(value));
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
