import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DateRangeDropdown, DATE_RANGE_DROPDOWN_DATA } from '../../models';

@Component({
	selector: 'app-date-range-dropdown',
	templateUrl: './date-range-dropdown.component.html',
	styleUrls: ['./date-range-dropdown.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangeDropdownComponent {
	// inner FormGroup used to manage ControlValueAccessor value
	readonly dateRangeDropdownFormControl = new FormControl<DateRangeDropdown | null>(null, {});

	DATE_RANGE_DROPDOWN_DATA = DATE_RANGE_DROPDOWN_DATA;
}
