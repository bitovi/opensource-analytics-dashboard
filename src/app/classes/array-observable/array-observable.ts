import { map, merge, Observable, scan, shareReplay, startWith, Subject, tap } from 'rxjs';

export type CompareFn<T> = Parameters<Array<T>['sort']>[0];

export class ArrayObservable<T> {
	private value: T[];
	readonly observable$: Observable<T[]>;

	readonly set$ = new Subject<T[]>();
	readonly push$ = new Subject<T>();
	readonly removeValue$ = new Subject<T>();
	readonly sort$ = new Subject<CompareFn<T> | void>();

	constructor(source: T[] = []) {
		this.value = source;

		this.observable$ = merge(
			this.set$.pipe(map((values) => () => this._set(values))),
			this.push$.pipe(map((value) => (array: T[]) => this._push(array, value))),
			this.removeValue$.pipe(map((value) => (array: T[]) => this._removeValue(array, value))),
			this.sort$.pipe(map((compareFn) => (array: T[]) => this._sort(array, compareFn ?? undefined)))
		).pipe(
			scan<(array: T[]) => T[], T[]>((array: T[], reducer: (array: T[]) => T[]) => reducer(array), source),
			tap((array) => {
				this.value = array;
			}),
			startWith(source),
			shareReplay({ refCount: false, bufferSize: 0 })
		);
	}

	getValue(): T[] {
		return [...this.value];
	}

	private _set(values: T[]): T[] {
		return [...values];
	}

	set(values: T[]): void {
		this.set$.next(values);
	}

	private _push(array: T[], value: T): T[] {
		return [...array, value];
	}

	push(value: T): void {
		this.push$.next(value);
	}

	private _removeValue(array: T[], value: T): T[] {
		return [...array].filter((oldValue) => oldValue !== value);
	}

	removeValue(value: T): void {
		this.removeValue$.next(value);
	}

	private _sort(array: T[], compareFn?: CompareFn<T>): T[] {
		return [...array].sort(compareFn);
	}

	sort(compareFn?: CompareFn<T>): void {
		this.sort$.next(compareFn);
	}
}
