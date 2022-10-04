import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateRangeDropdownComponent } from './date-range-dropdown.component';

describe('DateRangeDropdownComponent', () => {
	let component: DateRangeDropdownComponent;
	let fixture: ComponentFixture<DateRangeDropdownComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [DateRangeDropdownComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(DateRangeDropdownComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
