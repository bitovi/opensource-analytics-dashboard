import { Component, ElementRef, inject, LOCALE_ID, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Column } from 'angular-google-charts';
import { format, isAfter, isEqual, startOfDay, subDays } from 'date-fns';
import {
	catchError,
	combineLatest,
	debounceTime,
	filter,
	forkJoin,
	fromEvent,
	map,
	mergeMap,
	Observable,
	of,
	shareReplay,
	startWith,
	Subject,
	switchMap,
	takeUntil,
	tap,
	withLatestFrom,
} from 'rxjs';

import { formatNumber } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ArrayObservable } from './classes';
import { ChartData } from './models';
import { DateService, ErrorHandlerService, NpmRegistryService, StorageService } from './services';
import { RegistryData } from './services/npm-registry/npm-registry.model';
import { DateRange } from './components/date-range-picker/date-range-picker.component';

type RegistryError = { error?: { error?: string }; message?: string };

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
	@ViewChild('addPackageNameForm', { static: true })
	private readonly addPackageNameForm!: ElementRef<HTMLFormElement>;

	private readonly dateService = inject(DateService);
	private readonly storageService = inject(StorageService);
	private readonly errorHandlerService = inject(ErrorHandlerService);
	private readonly npmRegistryService = inject(NpmRegistryService);
	private readonly matSnackBar = inject(MatSnackBar);
	private readonly locale = inject(LOCALE_ID);

	readonly autocompleteOptions$!: Observable<string[]>;

	private readonly unsubscribe$ = new Subject<void>();

	readonly packageErrorsHandler = this.errorHandlerService.getInputErrorsHandler('package name');

	readonly apiDatas$: Observable<RegistryData[]>;

	readonly chartData$: Observable<ChartData>;

	readonly packageNames: ArrayObservable<string> = new ArrayObservable(this.getCachedPackageNames('package-names'));
	readonly autocompletePackageNames: ArrayObservable<string> = new ArrayObservable(
		this.getCachedPackageNames('autocomplete-package-names')
	);

	readonly dateRangeFormControl: FormControl<DateRange> = new FormControl(this.getInitialDateRange(), {
		nonNullable: true,
	});

	readonly addPackage: FormControl<string> = new FormControl('', {
		asyncValidators: this.errorHandlerService.noDuplicatesValidator(this.packageNames.observable$),
		nonNullable: true,
	});

	readonly selectedPackageNames = new FormControl<string[]>(this.packageNames.getValue(), {
		nonNullable: true,
	});

	constructor() {
		this.packageNames.observable$
			.pipe(
				tap((packageNames) => {
					this.onPackageNamesChanged(packageNames);
					this.setPackageNamesInParams(packageNames);
				}),
				takeUntil(this.unsubscribe$)
			)
			.subscribe();

		this.autocompletePackageNames.observable$
			.pipe(
				tap((autocompletePackageNames) => {
					// cache autocomplete package names
					this.storageService.setItem('autocomplete-package-names', autocompletePackageNames);
				})
			)
			.subscribe();

		const selectedDates$ = this.dateRangeFormControl.valueChanges.pipe(
			startWith(this.dateRangeFormControl.value),
			// Ignore any values where the end is before the start
			filter(([start, end]) => isEqual(end, start) || isAfter(end, start))
		);

		const suggestions$ = this.addPackage.valueChanges.pipe(
			debounceTime(200),
			switchMap((query) => {
				if (!query) {
					return of([]);
				}

				return this.npmRegistryService.getSuggestions(query);
			}),
			withLatestFrom(this.packageNames.observable$),
			map(([suggestions, existingPackageNames]) =>
				suggestions.filter((suggestion) => !existingPackageNames.includes(suggestion))
			)
		);

		this.autocompleteOptions$ = combineLatest([
			// All possible npm package names (based on local storage)
			this.autocompletePackageNames.observable$,
			// All suggestions
			suggestions$,
			// Already selected package names
			this.packageNames.observable$,
			// Partial npm package name to filter options
			this.addPackage.valueChanges.pipe(startWith('')),
		]).pipe(
			map(([autocompletePackageNames, suggestions, packageNames, query]) =>
				this.getAutocompleteOptions([...new Set([...autocompletePackageNames, ...suggestions])], packageNames, query)
			)
		);

		this.apiDatas$ = combineLatest([this.packageNames.observable$, selectedDates$]).pipe(
			mergeMap(([packageNames, [start, end]]) => this.getApiDates(packageNames, start, end)),
			shareReplay({ refCount: false, bufferSize: 0 })
		);

		const selectedPackageNames$ = this.selectedPackageNames.valueChanges.pipe(
			startWith(this.selectedPackageNames.value)
		);

		const selectedApiDatas$ = combineLatest([this.apiDatas$, selectedPackageNames$]).pipe(
			map(([apiDatas, selectedPackageNames]) =>
				// Filter displaying analytics of any npm package that is not selected
				apiDatas.filter((apiData) => selectedPackageNames.includes(apiData.packageName))
			)
		);

		// Populate chart
		this.chartData$ = selectedApiDatas$.pipe(
			withLatestFrom(selectedDates$),
			map(([apiDatas, [start, end]]) => this.getChartData(apiDatas, start, end))
		);
	}

	ngOnInit(): void {
		// Handle when add package name form submits
		fromEvent(this.addPackageNameForm.nativeElement, 'submit')
			.pipe(
				withLatestFrom(this.packageNames.observable$),
				tap(([, packageNames]) => {
					const newPackageName = this.addPackage.value;

					// Avoid duplicate npm package names
					if (packageNames.includes(newPackageName)) {
						return;
					}

					// Add to list of package names
					this.packageNames.push(newPackageName);
					this.packageNames.sort();

					// Clear value
					this.addPackage.setValue('');
					this.addPackage.markAsUntouched();
				})
			)
			.subscribe();
	}

	getDefaultPackageNames(): string[] {
		const packageNames = this.getPackageNamesFromParams().filter((packageName) => !!packageName);

		return (
			packageNames.length
				? packageNames
				: [
						'@bitovi/eslint-config',
						'@bitovi/react-numerics',
						'@bitovi/use-simple-reducer',
						'ngx-feature-flag-router',
						'react-to-webcomponent',
				  ]
		).sort();
	}

	getCachedPackageNames(key: string): string[] {
		const packageNames = this.getDefaultPackageNames();

		try {
			const cache = JSON.parse(this.storageService.getItem(key) ?? '[]');

			if (cache?.length) {
				return [...new Set([...packageNames, ...cache])].sort();
			}
		} catch (error) {
			console.error(error);
		}

		return packageNames;
	}

	removePackageName(packageName: string): void {
		this.packageNames.removeValue(packageName);
	}

	onPackageNamesChanged(packageNames: string[]) {
		this.selectedPackageNames.setValue(packageNames);

		// Update autocomplete values with any package name ever added
		this.autocompletePackageNames.set([...new Set([...packageNames, ...this.autocompletePackageNames.getValue()])]);
		this.autocompletePackageNames.sort();

		// cache package names
		this.storageService.setItem('package-names', packageNames);
	}

	getAutocompleteOptions(source: string[], skip: string[], query: string): string[] {
		const particalPackageNameSlug = query.toLowerCase();
		const packageNameSlugs = skip.map((packageName) => packageName.toLowerCase());

		return source.filter((autocompletePackageName) => {
			const autocompleteSlug = autocompletePackageName.toLowerCase();

			if (packageNameSlugs.includes(autocompleteSlug)) {
				return false;
			}

			return autocompleteSlug.includes(particalPackageNameSlug);
		});
	}

	getApiDates(packageNames: string[], start: Date, end: Date): Observable<RegistryData[]> {
		if (!packageNames.length) {
			return of([]);
		}

		return forkJoin(
			packageNames.map((packageName) =>
				this.npmRegistryService
					.getRegistry(
						packageName,
						this.dateService.getFormattedDateString(start),
						this.dateService.getFormattedDateString(end)
					)
					.pipe(
						catchError((error: unknown) => {
							// Display error
							this.displayErrorMessage(error);
							// Remove package name
							this.removePackageName(packageName);
							return of(null);
						})
					)
			)
			// Filter out errors
		).pipe(map((datas) => datas.filter((data): data is RegistryData => !!data)));
	}

	getChartData(apiDatas: RegistryData[], start: Date, end: Date): ChartData {
		const columns: Column[] = [
			{ type: 'string', label: 'Date' },
			...apiDatas.map(({ packageName, total }) => ({
				type: 'number',
				label: `${packageName} (${formatNumber(total, this.locale)})`,
			})),
		];

		const dates = this.dateService.getDateRange(start, end);

		// TODO: get formatter given range
		// MM/dd vs MM/dd/yy
		const rows = dates.map((date, i) => {
			return [format(date, 'MM/dd/yy'), ...apiDatas.map((apiData) => apiData.range[i])];
		});

		const options = {
			chart: {
				title: 'Downloads',
				subtitle: 'per day for a given period of specific package(s)',
			},
			height: 400,
		};

		return { columns, rows, options };
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

	displayErrorMessage(error: unknown) {
		const message = this.getErrorMessage(error as RegistryError);
		const estimatedDuration = 2000 + message.length * 100;

		this.matSnackBar.open(message, 'Dismiss', {
			duration: Math.min(Math.max(estimatedDuration, 5000), 15000),
		});
	}

	clearCache(): void {
		this.storageService.clearAllStorage();
		this.setPackageNamesInParams([]);
	}

	getPackageNamesFromParams(): string[] {
		try {
			const params = new URLSearchParams(window.location.search);

			return params.get('p')?.split(',') ?? [];
		} catch (error) {
			console.error(error);
			return [];
		}
	}

	setPackageNamesInParams(packageNames: string[]): void {
		let url = window.location.href.split('?')[0];
		url += `?p=${packageNames}`;
		window.history.replaceState({}, document.title, url);
	}

	/**
	 * Initialze date range with a week before the current date
	 */
	getInitialDateRange(): [Date, Date] {
		const currentDate = startOfDay(new Date());

		return [subDays(currentDate, 8), subDays(currentDate, 1)];
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
