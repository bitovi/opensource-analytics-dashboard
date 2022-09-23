import { Pipe, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Pipe({
	name: 'toObservable',
})
export class ToObservablePipe implements PipeTransform {
	// Initialize Observable
	private getObservable = <T>(value: T) => {
		// Set initial value
		const subject$ = new BehaviorSubject<T>(value);

		const observable$ = subject$.asObservable();

		// Only emit values now that Observable exists
		this.getObservable = (nextValue: T) => {
			// Update value
			subject$.next(nextValue);

			// Return existing Observable
			return observable$;
		};

		// Return created Observable
		return observable$;
	};

	/**
	 * Wraps value with BehaviorSubject and returns Observable that emits its current value
	 *
	 * @param value Wrapped value
	 * @returns Observable of value
	 */
	transform<T>(value: T): Observable<T> {
		return this.getObservable(value);
	}
}
