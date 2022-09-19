import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, Observable } from 'rxjs';
import { RegistryError } from 'src/app/directives';

@Injectable()
export class ErrorInterceptorService implements HttpInterceptor {
	constructor(private readonly matSnackBar: MatSnackBar) {}

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(request).pipe(
			catchError((error: unknown) => {
				// Display error
				this.displayErrorMessage(error);
				throw error;
			})
		);
	}

	displayErrorMessage(error: unknown) {
		const message = this.getErrorMessage(error as RegistryError);
		const estimatedDuration = 2000 + message.length * 100;

		this.matSnackBar.open(message, 'Dismiss', {
			duration: Math.min(Math.max(estimatedDuration, 5000), 15000),
		});
	}

	/**
	 * Get message from error when using HttpClient and reaching npm registry
	 */
	getErrorMessage(error: RegistryError): string {
		if (error?.error?.error) {
			return error.error.error;
		}

		if (error?.message) {
			return error.message;
		}

		return 'Unexpected error';
	}
}
