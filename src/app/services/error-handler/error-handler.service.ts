import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { map, Observable, take } from 'rxjs';
import { ErrorsHandler } from '../../directives';

const DUPLICATE_VALIDATION_ERROR_KEY = 'duplicateExists';

@Injectable({
	providedIn: 'root',
})
export class ErrorHandlerService {
	getInputErrorsHandler(inputName: string): ErrorsHandler {
		return (errors: ValidationErrors) => {
			if (errors['required']) {
				return `${inputName} is required`;
			}

			if (errors[DUPLICATE_VALIDATION_ERROR_KEY]) {
				return `${inputName} is a duplicate`;
			}

			return 'Input is invalid';
		};
	}

	getDatepickerErrorsHandler(inputName: string): ErrorsHandler {
		return (errors: ValidationErrors) => {
			if (errors['matDatepickerParse']) {
				const error = errors['matDatepickerParse'];
				return `'${error.text}' is an invalid date`;
			}

			if (errors['required']) {
				return `${inputName} is required`;
			}

			return 'Datepicker is invalid';
		};
	}

	noDuplicatesValidator(values$: Observable<string[]>): AsyncValidatorFn {
		return (control: AbstractControl): Observable<ValidationErrors | null> => {
			return values$.pipe(
				map((values) => values.includes(control.value)),
				map((duplicateExists) => (duplicateExists ? { [DUPLICATE_VALIDATION_ERROR_KEY]: true } : null)),
				take(1)
			);
		};
	}
}
