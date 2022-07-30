import {
  Component,
  ElementRef,
  inject,
  LOCALE_ID,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ChartType, Column, Row } from 'angular-google-charts';
import { format, isAfter, isEqual, startOfDay, subDays } from 'date-fns';
import {
  catchError,
  combineLatest,
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
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';

import {
  NpmRegistryService,
  StorageService,
  DateService,
  ErrorHandlerService,
} from './services';
import { ArrayObservable } from './classes';
import { RegistryData } from './services/npm-registry/npm-registry.model';
import { formatNumber } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

interface ChartData {
  columns: Column[];
  rows: Row[];
  options: object;
}

type RegistryError = { error?: { error?: string }, message?: string};

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

  readonly minDate = new Date(2015, 0, 1);
  readonly maxDate = new Date();

  private readonly unsubscribe$ = new Subject<void>();

  readonly startDateErrorsHandler =
    this.errorHandlerService.getDatepickerErrorsHandler('Start Date');
  readonly endDateErrorsHandler =
    this.errorHandlerService.getDatepickerErrorsHandler('End Date');
  readonly packageErrorsHandler =
    this.errorHandlerService.getInputErrorsHandler('package name');

  // Used to input bind ChartType enum in template
  readonly chartType = ChartType.Line;

  readonly apiDatas$: Observable<RegistryData[]>;

  readonly chartData$: Observable<ChartData>;

  readonly packageNames: ArrayObservable<string> = new ArrayObservable(
    this.getCachedPackageNames('package-names')
  );
  readonly autocompletePackageNames: ArrayObservable<string> =
    new ArrayObservable(
      this.getCachedPackageNames('autocomplete-package-names')
    );

  readonly dateRangeFormGroup = this.getDateRangeFormGroup();
  readonly addPackage: FormControl<string> = new FormControl('', {
    asyncValidators: this.errorHandlerService.noDuplicatesValidator(
      this.packageNames.observable$
    ),
    nonNullable: true,
  });
  readonly selectedPackageNames = new FormControl<string[]>(this.packageNames.getValue(), {
    nonNullable: true,
  });

  constructor() {
    this.packageNames.observable$
      .pipe(
        tap((packageNames) => this.onPackageNamesChanged(packageNames)),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();

    this.autocompletePackageNames.observable$
      .pipe(
        tap((autocompletePackageNames) => {
          // cache autocomplete package names
          this.storageService.setItem(
            'autocomplete-package-names',
            autocompletePackageNames
          );
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

    this.autocompleteOptions$ = combineLatest([
      // All possible npm package names
      this.autocompletePackageNames.observable$,
      // Already selected package names
      this.packageNames.observable$,
      // Partial npm package name to filter options
      this.addPackage.valueChanges,
    ]).pipe(
      map(([autocompletePackageNames, packageNames, partialPackageName]) =>
        this.getAutocompleteOptions(
          autocompletePackageNames,
          packageNames,
          partialPackageName
        )
      )
    );

    this.apiDatas$ = combineLatest([
      this.packageNames.observable$,
      selectedDates$,
    ]).pipe(
      mergeMap(([packageNames, dates]) => this.getApiDates(packageNames, dates.start, dates.end)),
      shareReplay({ refCount: false, bufferSize: 0 })
    );

    const selectedPackageNames$ = this.selectedPackageNames.valueChanges.pipe(
      startWith(this.selectedPackageNames.value)
    );

    const selectedApiDatas$ = combineLatest([
      this.apiDatas$,
      selectedPackageNames$,
    ]).pipe(
      map(([apiDatas, selectedPackageNames]) =>
        // Filter displaying analytics of any npm package that is not selected
        apiDatas.filter((apiData) => selectedPackageNames.includes(apiData.packageName))
      )
    );

    // Populate chart
    this.chartData$ = selectedApiDatas$.pipe(
      withLatestFrom(selectedDates$),
      map(([apiDatas, formValues]) => this.getChartData(apiDatas, formValues.start, formValues.end))
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

  getCachedPackageNames(key: string): string[] {
    try {
      const cache = JSON.parse(this.storageService.getItem(key) ?? '');

      if (cache?.length) {
        return cache;
      }
    } catch (error) {
      console.error(error);
    }

    // Default to the known npm packages for the Angular team
    return ['@bitovi/eslint-config', 'ngx-feature-flag-router'];
  }

  removePackageName(packageName: string): void {
    this.packageNames.removeValue(packageName);
  }

  onPackageNamesChanged(packageNames: string[]) {
    this.selectedPackageNames.setValue(packageNames);

    // Update autocomplete values with any package name ever added
    this.autocompletePackageNames.set([
      ...new Set([...packageNames, ...this.autocompletePackageNames.getValue()]),
    ]);
    this.autocompletePackageNames.sort();

    // cache package names
    this.storageService.setItem('package-names', packageNames);
  }

  getAutocompleteOptions(
    source: string[],
    skip: string[],
    partialPackageName: string
  ): string[] {
    if (!partialPackageName) {
      return [];
    }

    const particalPackageNameSlug = partialPackageName.toLowerCase();
    const packageNameSlugs = skip.map((packageName) =>
      packageName.toLowerCase()
    );

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
      packageNames.map((packageName) => this.npmRegistryService.getRegistry(
        packageName,
        this.dateService.getFormattedDateString(start),
        this.dateService.getFormattedDateString(end)
      ).pipe(
        catchError((error: unknown) => {
          // Display error
          this.displayErrorMessage(error);
          // Remove package name
          this.removePackageName(packageName);
          return of(null);
        }),
      ))
      // Filter out errors
    ).pipe(map(datas => datas.filter((data): data is RegistryData => !!data)));
  }

  getChartData(apiDatas: RegistryData[], start: Date, end: Date): ChartData {
    const columns: Column[] = [
      { type: 'string', label: 'Date' },
      ...apiDatas.map(({ packageName, total }) => ({
        type: 'number', label: `${packageName} (${formatNumber(total, this.locale)})`,
      })),
    ];

    const dates = this.dateService.getDateRange(start, end);

    // TODO: get formatter given range
    // MM/dd vs MM/dd/yy
    const rows = dates.map((date, i) => {
      return [
        format(date, 'MM/dd/yy'),
        ...apiDatas.map((apiData) => apiData.range[i]),
      ];
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
  trackByPackageName(
    _index: number,
    hasPackageName: { packageName: string }
  ): string {
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

    return "Unexpected error";
  }

  displayErrorMessage(error: unknown) {
    const message = this.getErrorMessage(error as RegistryError);
    const estimatedDuration = 2000 + message.length * 100;

    this.matSnackBar.open(message, "Dismiss", {
      duration: Math.min(Math.max(estimatedDuration, 5000), 15000),
    });
  }

  clearCache(): void {
    this.storageService.clearAllStorage();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
