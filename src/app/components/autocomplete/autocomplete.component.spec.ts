import { Component, Directive, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { of } from 'rxjs';

import { ErrorHandlerDirective } from './../../directives';
import { ToObservablePipe } from './../../pipes';
import { ErrorHandlerService } from './../../services/error-handler';
import { AutocompleteComponent, autocompleteComponentFn } from './autocomplete.component';

@Component({
	selector: 'mat-label',
})
class MockMatLabelComponent {}

@Directive({
	selector: '[matInput]',
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

	let errorHandlerServiceMock: ErrorHandlerService;

	const noDuplicatesValidatorFn = () => of({} as ValidationErrors);

	beforeEach(async () => {
		errorHandlerServiceMock = {
			getDatepickerErrorsHandler: jest.fn(),
			noDuplicatesValidator: () => noDuplicatesValidatorFn,
			getInputErrorsHandler: jest.fn(),
		};

		await TestBed.configureTestingModule({
			declarations: [
				AutocompleteComponent,
				ToObservablePipe,
				ErrorHandlerDirective,
				MockMatHintComponent,
				MockMatErrorComponent,
				MockMatFormFieldComponent,
				MockMatLabelComponent,
				MockMatOptionComponent,
				MatAutocomplete, // Required for #auto="matAutocomplete" directive
				MockMatInputDirective,
			],
			imports: [ReactiveFormsModule],
			providers: [{ provide: ErrorHandlerService, useValue: errorHandlerServiceMock }],
		}).compileComponents();

		fixture = TestBed.createComponent(AutocompleteComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();

		// trigger control value accessor functions
		component.registerOnChange(jest.fn());
		component.registerOnTouched(jest.fn());
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('autocompleteComponentFn()', () => {
		it('should return AutocompleteComponent', () => {
			expect(autocompleteComponentFn()).toBe(AutocompleteComponent);
		});
	});

	describe('ngOnInit()', () => {
		it('should create a form control for addPackage', () => {
			expect(component.addOption).toBeDefined();
			expect(component.addOption.value).toEqual('');

			expect(component.addOption.asyncValidator).toBeTruthy();
			expect(component.addOption.hasAsyncValidator(noDuplicatesValidatorFn)).toBe(true);
		});

		it('should subscribe on form control value change', () => {
			expect(component.onChange).not.toHaveBeenCalled();
			component.addOption.patchValue('test');
			expect(component.onChange).toHaveBeenCalledWith('test');
		});
	});

	describe('ngOnDestroy()', () => {
		it('should complete unsubscribe$ subject', () => {
			expect(component['unsubscribe$']).toBeDefined();

			const completeSpy = jest.spyOn(component['unsubscribe$'], 'complete');
			const nextSpy = jest.spyOn(component['unsubscribe$'], 'next');
			component.ngOnDestroy();

			expect(nextSpy).toHaveBeenCalled();
			expect(completeSpy).toHaveBeenCalled();
		});
	});

	describe('onEnterKey()', () => {
		it('should select the first element in matAutocomplete.options', () => {
			const emitSpy = jest.spyOn(component.selectedOption, 'emit');
			const onChangeSpy = jest.spyOn(component, 'onChange');

			const input = 'Angular';
			component.autocomplateOptions = [input, 'Test2'];

			component.onEnterKey();

			expect(emitSpy).toHaveBeenCalled();
			expect(onChangeSpy).toHaveBeenCalledWith(input);
		});

		it('should not notify parent by onChange if there is not value in autocomplateOptions', () => {
			const emitSpy = jest.spyOn(component.selectedOption, 'emit');
			const onChangeSpy = jest.spyOn(component, 'onChange');

			component.autocomplateOptions = [];

			component.onEnterKey();

			expect(emitSpy).toHaveBeenCalled();
			expect(onChangeSpy).not.toHaveBeenCalled();
		});
	});

	describe('writeValue()', () => {
		it('should set value for addPackage formControl', () => {
			const mockInput = 'Angular';

			expect(component.addOption.value).toEqual('');
			component.writeValue(mockInput);
			expect(component.addOption.value).toEqual(mockInput);
			component.writeValue(undefined);
			expect(component.addOption.value).toEqual('');
		});
	});

	describe('registerOnChange()', () => {
		it('should add function to onChange', () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const mockFn = (value: string) => {
				/**EMPTY */
			};
			component.registerOnChange(mockFn);
			expect(component.onChange).toEqual(mockFn);
		});
	});

	describe('registerOnTouched()', () => {
		it('should add function to onTouched', () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const mockFn = (value: void) => {
				/**EMPTY */
			};
			component.registerOnTouched(mockFn);
			expect(component.onTouched).toEqual(mockFn);
		});
	});

	describe('validate()', () => {
		it('should return error if addPackage is invalid', () => {
			const mockErrors = () => ({} as ValidationErrors);

			component.addOption.setErrors(mockErrors);

			expect(component.addOption.errors).toBe(mockErrors);
			expect(component.validate()).toBe(mockErrors);
		});

		it('should return null if addPackage is valid', () => {
			component.addOption.setErrors(null);

			expect(component.addOption.errors).toBe(null);
			expect(component.validate()).toBe(null);
		});
	});
});
