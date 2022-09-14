import { ValidationErrors } from '@angular/forms';

export type ErrorsHandler = (errors: ValidationErrors) => string;
export type RegistryError = { error?: { error?: string }; message?: string };
export type NullishValidationErrors = ValidationErrors | null | undefined;
