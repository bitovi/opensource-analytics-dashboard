import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { catchError, combineLatest, forkJoin, map, mergeMap, Observable, of, shareReplay } from 'rxjs';
import { BitoviPackageNames } from './models/chart.model';
import { DateService, NpmRegistryService, StorageService } from './services';
import { RegistryData } from './services/npm-registry/npm-registry.model';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
	private readonly storageService = inject(StorageService);
	private readonly npmRegistryService = inject(NpmRegistryService);
	apiDatas$!: Observable<RegistryData[]>;

	//selectedLibraries$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
	readonly formGroup = this.initForm();

	get dateRange(): AbstractControl {
		return this.formGroup.get('dateRange') as AbstractControl;
	}

	get selectedLibrary(): AbstractControl {
		return this.formGroup.get('selectedLibrary') as AbstractControl;
	}

	constructor(private fb: FormBuilder, private dateService: DateService) {}

	ngOnInit(): void {
		this.persistDataOnPackageNameChange();
		this.loadDataFromNpm();
		const cachedLibs = this.getCachedPackageNames('autocomplete-package-names');
		console.log('cachedLibs', cachedLibs);
		this.selectedLibrary.patchValue(cachedLibs);

		this.formGroup.valueChanges.subscribe(console.log);
	}

	getDefaultPackageNames(): string[] {
		const packageNames = this.getPackageNamesFromParams().filter((packageName) => !!packageName);

		return (packageNames.length ? packageNames : BitoviPackageNames).sort();
	}

	private initForm(): FormGroup {
		return this.fb.group({
			dateRange: [],
			selectedLibrary: [],
		});
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
		console.log('removePackageName', packageName);
		// this.selectedLibraries$.next(this.selectedLibraries$.value.filter((v) => v !== packageName));
	}

	getApiDates(packageNames: string[], start: Date, end: Date): Observable<RegistryData[]> {
		if (!packageNames.length) {
			return of([]);
		}

		return forkJoin(
			packageNames.map((packageName) =>
				this.npmRegistryService
					.getRegistry(packageName, this.dateService.getFormattedDateString(start), this.dateService.getFormattedDateString(end))
					.pipe(
						catchError(() => {
							// Remove package name
							this.removePackageName(packageName);
							return of(null);
						})
					)
			)
			// Filter out errors
		).pipe(map((datas) => datas.filter((data): data is RegistryData => !!data)));
	}

	clearCache(): void {
		this.storageService.clearAllStorage();
		this.setPackageNamesInParams([]);
	}

	private persistDataOnPackageNameChange(): void {
		this.selectedLibrary.valueChanges.subscribe((libraries) => this.setPackageNamesInParams(libraries));
	}

	private getPackageNamesFromParams(): string[] {
		try {
			const params = new URLSearchParams(window.location.search);

			return params.get('p')?.split(',') ?? [];
		} catch (error) {
			console.error(error);
			return [];
		}
	}

	private setPackageNamesInParams(packageNames: string[]): void {
		let url = window.location.href.split('?')[0];
		url += `?p=${packageNames}`;
		window.history.replaceState({}, document.title, url);
	}

	private loadDataFromNpm(): void {
		this.apiDatas$ = combineLatest([this.dateRange.valueChanges, this.selectedLibrary.valueChanges]).pipe(
			mergeMap(([dateRange, packageNames]) => this.getApiDates(packageNames, dateRange[0], dateRange[1])),
			shareReplay({ refCount: false, bufferSize: 0 })
		);
	}
}
