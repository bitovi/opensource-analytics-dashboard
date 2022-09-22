import { ValidationErrors } from '@angular/forms';

export type ErrorsHandler = (errors: ValidationErrors) => string;

export type NullishValidationErrors = ValidationErrors | null | undefined;
