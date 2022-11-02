import { Component, inject, LOCALE_ID, OnDestroy } from '@angular/core';

import { FormControl, FormGroup } from '@angular/forms';
import { Column } from 'angular-google-charts';
import { isAfter, isEqual, startOfDay, subDays } from 'date-fns';
import {
	catchError,
	combineLatest,
	debounceTime,
	filter,
	forkJoin,
	map,
	merge,
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
import { ChartData, DateFormat, DateRange, HARDCODED_PACKAGE_NAMES, RegistryData, StorageId } from './models';
import { ApiService, DataService, DateService, ErrorHandlerService, ParamsService, StorageService } from './services';

type RegistryError = { error?: { error?: string }; message?: string };

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
	private readonly dateService = inject(DateService);
	private readonly storageService = inject(StorageService);
	private readonly errorHandlerService = inject(ErrorHandlerService);
	private readonly dataService = inject(DataService);
	private readonly apiService = inject(ApiService);
	private readonly paramsService = inject(ParamsService);
	private readonly matSnackBar = inject(MatSnackBar);
	private readonly locale = inject(LOCALE_ID);

	private readonly unsubscribe$ = new Subject<void>();

	readonly apiDatas$: Observable<RegistryData[]>;

	readonly chartData$: Observable<ChartData>;

	/* loaded package names  */
	readonly packageNames: ArrayObservable<string> = new ArrayObservable(this.getDefaultPackageNames());

	/* keep track of loaded package names in localstorage and display them as suggestion
     if they are not already loaded
  */
	readonly autocompletePackageNames: ArrayObservable<string> = new ArrayObservable(
		this.getCachedPackageNames(StorageId.PACKAGE_NAMES).sort()
	);

	readonly dateRangeFormGroup = new FormGroup({
		dateRangeFormControl: new FormControl(this.getInitialDateRange(), {
			nonNullable: true,
		}),
		dateRangeDropdownFormControl: new FormControl<DateRange | null>(null),
	});

	readonly addPackage: FormControl<string> = new FormControl('', {
		nonNullable: true,
	});

	/* visible package names */
	readonly selectedPackageNames = new FormControl<string[]>(this.packageNames.getValue(), {
		nonNullable: true,
	});

	/* Observale that will display loaded packages from NPM */
	readonly autocompleteOptions$!: Observable<string[]>;

	constructor() {
		/*
        Problem:
        dateRangeFormGroup.controls.dateRangeFormControl emits value even if emitEvent == false

        if possible to solve, then rework: const selectedDates$ = this.dateRangeFormGroup into
        merge([]) but take value only from the dateRangeFormControl


      */
		// changing date range - reset dateRangeDropdownFormControl
		this.dateRangeFormGroup.controls.dateRangeDropdownFormControl.valueChanges
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe((value) => {
				if (value) {
					this.dateRangeFormGroup.controls.dateRangeFormControl.patchValue(value, {
						onlySelf: true,
						emitEvent: false,
					});
				}
			});

		// changing date range - reset dateRangeDropdownFormControl
		this.dateRangeFormGroup.controls.dateRangeFormControl.valueChanges
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe(() => {
				this.dateRangeFormGroup.controls.dateRangeDropdownFormControl.patchValue(null, {
					onlySelf: true,
					emitEvent: false,
				});
			});

		this.packageNames.observable$
			.pipe(
				tap((packageNames) => {
					this.onPackageNamesChanged(packageNames);
					this.paramsService.setPackageNames(packageNames);
				}),
				takeUntil(this.unsubscribe$)
			)
			.subscribe();

		// if user selects a package, save it into localstore as future suggestion
		this.autocompletePackageNames.observable$
			.pipe(
				tap((autocompletePackageNames) => {
					// Cache autocomplete package names
					this.storageService.setItem(StorageId.PACKAGE_NAMES, autocompletePackageNames);
				}),
				takeUntil(this.unsubscribe$)
			)
			.subscribe();

		const selectedDates$ = merge(
			this.dateRangeFormGroup.controls.dateRangeFormControl.valueChanges,
			this.dateRangeFormGroup.controls.dateRangeDropdownFormControl.valueChanges
		).pipe(
			startWith(this.dateRangeFormGroup.controls.dateRangeFormControl.value),
			filter((dateRange): dateRange is DateRange => !!dateRange),

			// Ignore any values where the end is before the start
			filter(([start, end]) => isEqual(end, start) || isAfter(end, start))
		);

		selectedDates$
			.pipe(
				tap((dateRange) => {
					// Store the current date range in the query params
					this.paramsService.setDateRange(dateRange);
				}),
				takeUntil(this.unsubscribe$)
			)
			.subscribe();

		// npm library suggestions on user input
		const suggestions$ = this.searchLibraryOnInputChange();

		// autocomplete options to show package names for the user
		this.autocompleteOptions$ = combineLatest([
			// All suggestions
			suggestions$.pipe(startWith([])),
			// packages that already have been loaded
			this.packageNames.observable$.pipe(startWith(this.packageNames.getValue())),
			// Partial npm package name to filter options
			this.addPackage.valueChanges.pipe(startWith('')),
		]).pipe(
			map(([suggestions, alreadyLoadedPackageNames, query]) =>
				this.getAutocompleteOptions(
					[...new Set([...(this.autocompletePackageNames.getValue() ?? []), ...suggestions])],
					alreadyLoadedPackageNames,
					query
				)
			)
		);

		this.apiDatas$ = combineLatest([selectedDates$, this.packageNames.observable$]).pipe(
			switchMap(([[start, end], packageNames]) => this.getApiDates(packageNames, start, end)),
			shareReplay({ refCount: false, bufferSize: 0 })
		);

		// filter out libraries that are selected / visible
		const selectedApiDatas$ = combineLatest([
			this.apiDatas$,
			this.selectedPackageNames.valueChanges.pipe(startWith(this.selectedPackageNames.value)),
		]).pipe(
			map(([apiDatas, selectedPackageNames]) =>
				// Filter displaying analytics of any npm package that is not selected
				apiDatas.filter((apiData) => selectedPackageNames.includes(apiData.packageName))
			)
		);

		// Populate chart
		this.chartData$ = selectedApiDatas$.pipe(
			withLatestFrom(selectedDates$),
			map(([apiDatas, dateRange]) => this.getChartData(apiDatas, dateRange))
		);
	}

	/**
	 * Get initial list of active packages that should populate the chart
	 *
	 * List of packages should never be empty
	 */
	getDefaultPackageNames(): string[] {
		// Check query params for list of packages first
		const packageNamesFromQueryParams = this.paramsService.getPackageNames();

		if (packageNamesFromQueryParams.length) {
			return packageNamesFromQueryParams.sort();
		}

		// Fallback to storage / cache
		const cachedPackages = this.getCachedPackageNames(StorageId.ACTIVE_PACKAGE_NAMES);

		if (cachedPackages.length) {
			return cachedPackages.sort();
		}

		// Fallback to list of bitovi open source package names
		return [...HARDCODED_PACKAGE_NAMES].sort();
	}

	/**
	 * Get list of packages for the autocomplete or for `app-package-list` from storage / cache
	 */
	getCachedPackageNames(storageId: StorageId): string[] {
		try {
			const cache = JSON.parse(this.storageService.getItem(storageId) ?? '[]');

			if (cache?.length) {
				return cache;
			}
		} catch (error) {
			console.error(error);
		}

		return [];
	}

	removePackageName(packageName: string): void {
		this.packageNames.removeValue(packageName);
	}

	onPackageNamesChanged(packageNames: string[]) {
		this.selectedPackageNames.setValue(packageNames);

		// Update autocomplete values with any package name ever added
		this.autocompletePackageNames.set([...new Set([...packageNames, ...this.autocompletePackageNames.getValue()])]);
		this.autocompletePackageNames.sort();

		// Cache package names
		this.storageService.setItem(StorageId.ACTIVE_PACKAGE_NAMES, packageNames);
	}

	onPackageNameSubmit(): void {
		const newPackage = this.addPackage.value;

		// ignore repeated package names
		if (!this.packageNames.getValue().includes(newPackage)) {
			this.autocompletePackageNames.push(newPackage);
			this.packageNames.push(newPackage);
		}

		// Clear value
		this.addPackage.setValue('');
		this.addPackage.markAsUntouched();
	}

	getApiDates(packageNames: string[], start: Date, end: Date): Observable<RegistryData[]> {
		if (!packageNames.length) {
			return of([]);
		}

		return forkJoin(
			packageNames.map((packageName) =>
				this.dataService
					.getRegistry(
						packageName,
						this.dateService.getDateString(start, DateFormat.YEAR_MONTH_DAY),
						this.dateService.getDateString(end, DateFormat.YEAR_MONTH_DAY)
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

	getChartData(apiDatas: RegistryData[], dateRange: DateRange): ChartData {
		const columns: Column[] = [
			{ type: 'string', label: 'Date' },
			...apiDatas.map(({ packageName, total }) => ({
				type: 'number',
				label: `${packageName} (${formatNumber(total, this.locale)})`,
			})),
		];

		const dates = this.dateService.getDates(dateRange);
		const rows = this.dateService.getAggregatedReigstryData(apiDatas, dates);

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

	displayErrorMessage(error: unknown): void {
		const message = this.getErrorMessage(error as RegistryError);
		const estimatedDuration = 2000 + message.length * 100;

		this.matSnackBar.open(message, 'Dismiss', {
			duration: Math.min(Math.max(estimatedDuration, 5000), 15000),
		});
	}

	clearCache(): void {
		this.storageService.clearAllStorage();
		this.paramsService.setPackageNames([]);
	}

	private searchLibraryOnInputChange(): Observable<string[]> {
		return this.addPackage.valueChanges.pipe(
			debounceTime(300),
			switchMap((query) => {
				if (!query) {
					return of([]);
				}
				return this.apiService.getSuggestions(query).pipe(
					map((suggestions) =>
						// prevent displaying already loaded packages
						suggestions.filter((suggestion) => !this.packageNames.getValue().includes(suggestion))
					)
				);
			})
		);
	}

	/**
	 * @param source - npm packages that can be displayed in the select
	 * @param skip - npm packages that are already loaded and we dont want to display them again
	 * @param query - npm package prefix that we are looking for.
	 *                Filters out from source only packages that match query
	 * @returns npm packages that will be displayed on the select
	 */

	private getAutocompleteOptions(source: string[], skip: string[], query: string): string[] {
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

	/**
	 * Initialze date range with a week before the current date
	 */
	getInitialDateRange(): DateRange {
		const currentDate = startOfDay(new Date());

		const dateRangeParams = this.paramsService.getDateRange();

		if (dateRangeParams) {
			return dateRangeParams;
		}

		return [subDays(currentDate, 8), subDays(currentDate, 1)];
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
