import { Component, Directive, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';

import { ErrorHandlerDirective } from './../../directives';
import { ToObservablePipe } from './../../pipes';
import { ErrorHandlerService } from './../../services/error-handler';

import { AutocompleteComponent } from './autocomplete.component';

@Component({
	selector: 'mat-label',
})
class MockMatLabelComponent {}

@Directive({
	selector: 'matInput',
})
class MockMatInputDirective {
	@Input()
	matAutocomplete!: MatAutocomplete;
}

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
	selector: 'mat-option',
})
class MockMatOptionComponent {
	@Input() value: unknown;
}

describe('AutocompleteComponent', () => {
	let component: AutocompleteComponent;
	let fixture: ComponentFixture<AutocompleteComponent>;

	const errorHandlerServiceMock = {
		noDuplicatesValidator: jest.fn(),
		getInputErrorsHandler: jest.fn(),
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [
				AutocompleteComponent,
				ToObservablePipe,
				ErrorHandlerDirective,
				MockMatHintComponent,
				MockMatErrorComponent,
				MockMatFormFieldComponent,
				MockMatLabelComponent,
				MockMatInputDirective,
				MockMatOptionComponent,
				MatAutocomplete, // Required for #auto="matAutocomplete" directive
			],
			imports: [ReactiveFormsModule],
			providers: [{ provide: ErrorHandlerService, useValue: errorHandlerServiceMock }],
		}).compileComponents();

		fixture = TestBed.createComponent(AutocompleteComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
