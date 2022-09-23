import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { MatError } from '@angular/material/form-field';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ErrorsHandler, NullishValidationErrors } from './error-handler.model';

@Directive({
	selector: '[appErrorHandler]',
})
export class ErrorHandlerDirective implements OnInit, OnDestroy {
	@Input() errors$!: Observable<NullishValidationErrors> | Observable<NullishValidationErrors>[];
	@Input() handleErrors: ErrorsHandler | ErrorsHandler[] = this.defaultHandleError;

	// private readonly span: HTMLSpanElement = this.renderer.createElement('span');
	private readonly textNode: Node = this.renderer.createText('');

	private readonly unsubscribe$ = new Subject<void>();

	constructor(private readonly elementRef: ElementRef<MatError>, private readonly renderer: Renderer2) {
		// // Add text to span
		// this.renderer.appendChild(this.span, this.textNode);
		// Add span to <mat-error>
		this.renderer.appendChild(this.elementRef.nativeElement, this.textNode);
	}

	ngOnInit(): void {
		this.getErrorsObservable(this.errors$)
			.pipe(
				map((errorsArray) => {
					for (let i = 0; i < errorsArray.length; i++) {
						const errors = errorsArray[i];

						if (!errors) {
							continue;
						}

						const errorHandler = this.getErrorHandler(this.handleErrors, i);

						const message = errorHandler(errors);

						if (message) {
							return message;
						}
					}

					return '';
				}),
				tap((message) => {
					this.setText(message);
				})
			)
			.subscribe();
	}

	getErrorsObservable(
		errors: Observable<NullishValidationErrors> | Observable<NullishValidationErrors>[]
	): Observable<NullishValidationErrors[]> {
		if (!Array.isArray(errors)) {
			return errors.pipe(map((error) => [error]));
		}

		return combineLatest(errors);
	}

	getErrorHandler(handleErrors: ErrorsHandler | ErrorsHandler[], index: number): ErrorsHandler {
		if (!Array.isArray(handleErrors)) {
			return handleErrors;
		}

		return handleErrors[index];
	}

	setText(text: string): void {
		this.renderer.setValue(this.textNode, text);
	}

	defaultHandleError(errors: ValidationErrors): string {
		const keys = Object.keys(errors);

		if (!keys.length) {
			return '';
		}

		return keys[0];
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
