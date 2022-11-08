import { Component, Directive, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { of } from 'rxjs';

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

	let errorHandlerServiceMock: ErrorHandlerService;

	const noDuplicatesValidatorFn = () => of({} as ValidationErrors);
	const componentFn = () => AutocompleteComponent;

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
				MockMatInputDirective,
				MockMatOptionComponent,
				MatAutocomplete, // Required for #auto="matAutocomplete" directive
			],
			imports: [ReactiveFormsModule],
			providers: [
				{ provide: ErrorHandlerService, useValue: errorHandlerServiceMock },
				{ provide: NG_VALUE_ACCESSOR, useExisting: componentFn, multi: true },
				{ provide: NG_VALIDATORS, useExisting: componentFn, multi: true },
			],
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

	describe('Test: providers', () => {
		it('should return AutocompleteComponent', () => {
			expect(componentFn()).toBe(AutocompleteComponent);
		});
	});

	describe('Test: ngOnInit()', () => {
		it('should create a form control for addPackage', () => {
			expect(component.addPackage).toBeDefined();
			expect(component.addPackage.value).toEqual('');

			expect(component.addPackage.asyncValidator).toBeTruthy();
			expect(component.addPackage.hasAsyncValidator(noDuplicatesValidatorFn)).toBe(true);
		});

		it('should subscribe on form control value change', () => {
			expect(component.onChange).not.toHaveBeenCalled();
			component.addPackage.patchValue('test');
			expect(component.onChange).toHaveBeenCalledWith('test');
		});
	});

	describe('Test: ngOnDestroy()', () => {
		it('should complete unsubscribe$ subject', () => {
			expect(component['unsubscribe$']).toBeDefined();

			const completeSpy = jest.spyOn(component['unsubscribe$'], 'complete');
			const nextSpy = jest.spyOn(component['unsubscribe$'], 'next');
			component.ngOnDestroy();

			expect(nextSpy).toHaveBeenCalled();
			expect(completeSpy).toHaveBeenCalled();
		});
	});

	describe('Test: onOptionSelected()', () => {
		it('should notify parent about the selected package name', () => {
			const mockPackageName = 'Angular';

			const mockInput: MatAutocompleteSelectedEvent = {
				option: {
					value: mockPackageName,
				},
			} as MatAutocompleteSelectedEvent;

			const emitSpy = jest.spyOn(component.selectedPackage, 'emit');
			const onChangeSpy = jest.spyOn(component, 'onChange');

			component.onOptionSelected(mockInput);

			expect(onChangeSpy).toHaveBeenCalledWith(mockPackageName);
			expect(emitSpy).toHaveBeenCalledWith(mockPackageName);
		});
	});

	describe('Test: writeValue()', () => {
		it('should set value for addPackage formControl', () => {
			const mockInput = 'Angular';

			expect(component.addPackage.value).toEqual('');
			component.writeValue(mockInput);
			expect(component.addPackage.value).toEqual(mockInput);
			component.writeValue(undefined);
			expect(component.addPackage.value).toEqual('');
		});
	});

	describe('Test: registerOnChange()', () => {
		it('should add function to onChange', () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const mockFn = (value: string) => {
				/**EMPTY */
			};
			component.registerOnChange(mockFn);
			expect(component.onChange).toEqual(mockFn);
		});
	});

	describe('Test: registerOnTouched()', () => {
		it('should add function to onTouched', () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const mockFn = (value: void) => {
				/**EMPTY */
			};
			component.registerOnTouched(mockFn);
			expect(component.onTouched).toEqual(mockFn);
		});
	});

	describe('Test: validate()', () => {
		it('should return error if addPackage is invalid', () => {
			const mockErrors = () => ({} as ValidationErrors);

			component.addPackage.setErrors(mockErrors);

			expect(component.addPackage.errors).toBe(mockErrors);
			expect(component.validate()).toBe(mockErrors);
		});

		it('should return null if addPackage is valid', () => {
			component.addPackage.setErrors(null);

			expect(component.addPackage.errors).toBe(null);
			expect(component.validate()).toBe(null);
		});
	});
});
