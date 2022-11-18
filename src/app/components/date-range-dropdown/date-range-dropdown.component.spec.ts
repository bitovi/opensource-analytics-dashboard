import { Component, forwardRef, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

import { DateRangeDropdownComponent } from './date-range-dropdown.component';

@Component({
	selector: 'mat-option',
})
class MockMatOptionComponent {
	@Input() value!: string;
}

@Component({
	selector: 'mat-label',
})
class MockMatLabelComponent {}

@Component({
	selector: 'mat-form-field',
})
class MockMatFormFieldComponent {}

@Component({
	selector: 'mat-select',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => MockMatSelectComponent),
			multi: true,
		},
	],
})
class MockMatSelectComponent implements ControlValueAccessor {
	@Input() value!: string;

	writeValue() {
		/** stub */
	}

	registerOnChange(): void {
		/** stub */
	}

	registerOnTouched(): void {
		/** stub */
	}
}

describe('DateRangeDropdownComponent', () => {
	let component: DateRangeDropdownComponent;
	let fixture: ComponentFixture<DateRangeDropdownComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [
				DateRangeDropdownComponent,
				MockMatOptionComponent,
				MockMatLabelComponent,
				MockMatFormFieldComponent,
				MockMatSelectComponent,
			],
			imports: [ReactiveFormsModule],
		}).compileComponents();

		fixture = TestBed.createComponent(DateRangeDropdownComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
