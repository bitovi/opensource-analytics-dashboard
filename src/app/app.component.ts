import { Component, inject, LOCALE_ID, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ChartType, Column, Row } from 'angular-google-charts';
import { format, isAfter, isEqual, startOfDay, subDays } from 'date-fns';
import {
	catchError,
	combineLatest,
	filter,
	forkJoin,
	map,
	mergeMap,
	Observable,
	of,
	shareReplay,
	startWith,
	Subject,
	takeUntil,
	tap,
} from 'rxjs';

import { formatNumber } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ArrayObservable } from './classes';
import { DateService, ErrorHandlerService, NpmRegistryService, StorageService } from './services';
import { RegistryData } from './services/npm-registry/npm-registry.model';

enum SelectKeydown {
	SPACE = 'Space',
	SPACE_2 = ' ',
	ENTER = 'Enter',
}

const POSSIBLE_KEYDOWNS = [SelectKeydown.ENTER, SelectKeydown.SPACE, SelectKeydown.SPACE_2];

interface ChartData {
	columns: Column[];
	rows: Row[];
	options: object;
}

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
	private readonly npmRegistryService = inject(NpmRegistryService);
	private readonly matSnackBar = inject(MatSnackBar);
	private readonly locale = inject(LOCALE_ID);

	readonly minDate = new Date(2015, 0, 1);
	readonly maxDate = new Date();

	private readonly unsubscribe$ = new Subject<void>();

	readonly startDateErrorsHandler = this.errorHandlerService.getDatepickerErrorsHandler('Start Date');
	readonly endDateErrorsHandler = this.errorHandlerService.getDatepickerErrorsHandler('End Date');
	readonly packageErrorsHandler = this.errorHandlerService.getInputErrorsHandler('package name');

	// Used to input bind ChartType enum in template
	readonly chartType = ChartType.Line;

	readonly apiDatas$: Observable<RegistryData[]>;

	readonly chartData$: Observable<ChartData>;

	/* loaded package names  */
	readonly packageNames = new FormControl<string[]>(this.getCachedPackageNames('package-names'), {
		nonNullable: true,
	});

	/* keep track of loaded package names in localstorage and display them as suggestion
     if they are not already loaded
  */
	readonly autocompletePackageNames: ArrayObservable<string> = new ArrayObservable(
		this.getCachedPackageNames('autocomplete-package-names')
	);

	readonly dateRangeFormGroup = this.getDateRangeFormGroup();

	/* visible package names */
	readonly selectedPackageNames = new FormControl<string[]>(this.packageNames.value, {
		nonNullable: true,
	});

	constructor() {
		this.packageNames.valueChanges
			.pipe(
				tap((packageNames) => {
					this.onPackageNamesChanged(packageNames);
					this.setPackageNamesInParams(packageNames);
				}),
				takeUntil(this.unsubscribe$)
			)
			.subscribe();

		// if user selects a package, save it into localstore as future suggestion
		this.autocompletePackageNames.observable$
			.pipe(
				tap((autocompletePackageNames) => {
					// cache autocomplete package names
					this.storageService.setItem('autocomplete-package-names', autocompletePackageNames);
				})
			)
			.subscribe();

		const selectedDates$ = this.dateRangeFormGroup.valueChanges.pipe(
			startWith(this.dateRangeFormGroup.value),
			// Only emit selected dates from form if they're valid
			filter((dates): dates is { start: Date; end: Date } => !!dates.start && !!dates.end),
			// Ignore any values where the end is before the start
			filter((dates) => isEqual(dates.end, dates.start) || isAfter(dates.end, dates.start))
		);

		this.apiDatas$ = combineLatest([
			selectedDates$,
			this.packageNames.valueChanges.pipe(startWith(this.packageNames.value)),
		]).pipe(
			mergeMap(([dateRange, packageNames]) => this.getApiDates(packageNames, dateRange.start, dateRange.end)),
			shareReplay({ refCount: false, bufferSize: 0 })
		);

		this.chartData$ = combineLatest([
			this.apiDatas$,
			selectedDates$,
			this.selectedPackageNames.valueChanges.pipe(startWith(this.selectedPackageNames.value)),
		]).pipe(
			map(([registryData, dateRange, visibleLibraries]) =>
				this.getChartData(registryData, dateRange.start, dateRange.end, visibleLibraries)
			)
		);
	}

	getDateRangeFormGroup(): FormGroup<{
		start: FormControl<Date | null>;
		end: FormControl<Date | null>;
	}> {
		const currentDate = startOfDay(new Date());

		return new FormGroup({
			start: new FormControl<Date | null>(subDays(currentDate, 8), {
				validators: Validators.required,
			}),
			end: new FormControl<Date | null>(subDays(currentDate, 1), {
				validators: Validators.required,
			}),
		});
	}
	/* Return package names from URL, if empry return default names */
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

	/* Return package names from URL combined with packaged names saved in local storage */
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
		const loadedPackageNames = this.packageNames.value;
		const newValue = loadedPackageNames.filter((value) => value !== packageName);
		this.packageNames.patchValue(newValue);
	}

	onPackageNamesChanged(packageNames: string[]) {
		this.selectedPackageNames.setValue(packageNames);

		// Update autocomplete values with any package name ever added
		this.autocompletePackageNames.set([...new Set([...packageNames, ...this.autocompletePackageNames.getValue()])]);
		this.autocompletePackageNames.sort();

		// cache package names
		this.storageService.setItem('package-names', packageNames);
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

	getChartData(apiDatas: RegistryData[], start: Date, end: Date, visibleLibraries: string[]): ChartData {
		// filter out libraries we want to show
		const libraries = apiDatas.filter((data) => visibleLibraries.includes(data.packageName));

		const columns: Column[] = [
			{ type: 'string', label: 'Date' },
			...libraries.map(({ packageName, total }) => ({
				type: 'number',
				label: `${packageName} (${formatNumber(total, this.locale)})`,
			})),
		];

		const dates = this.dateService.getDateRange(start, end);

		// TODO: get formatter given range
		// MM/dd vs MM/dd/yy
		const rows = dates.map((date, i) => {
			return [format(date, 'MM/dd/yy'), ...libraries.map((apiData) => apiData.range[i])];
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
	 * ngForOf trackBy for packageNames
	 */
	trackByPackageName(_index: number, hasPackageName: { packageName: string }): string {
		return hasPackageName.packageName;
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

	/* Return package names from URL */
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

	handleSelectAsClick(event: KeyboardEvent): void {
		// Check if KeyboardEvent is a selection
		if (!this.keydownIsSelect(event)) {
			return;
		}

		// Prevent normal accessibility
		event.preventDefault();
		event.stopPropagation();
		// Call click function instead
		(event.target as HTMLButtonElement).click();
	}

	keydownIsSelect(event: KeyboardEvent): boolean {
		return POSSIBLE_KEYDOWNS.includes((event.key ?? event.code) as SelectKeydown);
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
