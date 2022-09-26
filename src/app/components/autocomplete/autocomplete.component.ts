import { ChangeDetectionStrategy, Component, forwardRef, Input } from '@angular/core';
import {
	AbstractControl,
	ControlValueAccessor,
	FormControl,
	NG_VALIDATORS,
	NG_VALUE_ACCESSOR,
	ValidationErrors,
	Validators,
} from '@angular/forms';
import { combineLatest, debounceTime, map, Observable, of, startWith, switchMap } from 'rxjs';
import { ArrayObservable } from 'src/app/classes';
import { ErrorHandlerService, NpmRegistryService } from '../../services';

@Component({
	selector: 'app-autocomplete',
	templateUrl: './autocomplete.component.html',
	styleUrls: ['./autocomplete.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => AutocompleteComponent),
			multi: true,
		},
		{
			provide: NG_VALIDATORS,
			useExisting: forwardRef(() => AutocompleteComponent),
			multi: true,
		},
	],
})
export class AutocompleteComponent implements ControlValueAccessor, Validators {
	/*
    keep track of package names that has been already loaded and show them
    as suggestion for the user
  */
	@Input() autocompletePackageNames: string[] | null = [];

	/*
    Pacakge names that are already loaded to prevent selecting same library
    multiple times
  */
	private alreadyLoadedPackageName: ArrayObservable<string> = new ArrayObservable();

	/* Observale that will display loaded packages from NPM */
	readonly autocompleteOptions$!: Observable<string[]>;

	/* Form control to allow user search packages  */
	readonly addPackage: FormControl<string> = new FormControl('', {
		asyncValidators: this.errorHandlerService.noDuplicatesValidator(this.alreadyLoadedPackageName.observable$),
		nonNullable: true,
	});

	/* errors that may occur when searching for a package name */
	readonly packageErrorsHandler = this.errorHandlerService.getInputErrorsHandler('package name');

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onChange = (value: string[]) => {
		/* empty */
	};
	onTouched = () => {
		/* empty */
	};
	constructor(
		private readonly npmRegistryService: NpmRegistryService,
		private readonly errorHandlerService: ErrorHandlerService
	) {
		// npm library suggestions on user input
		const suggestions$ = this.searchLibraryOnInputChange();

		this.autocompleteOptions$ = combineLatest([
			// All suggestions
			suggestions$.pipe(startWith([])),
			// packages that already have been loaded
			this.alreadyLoadedPackageName.observable$,
			// Partial npm package name to filter options
			this.addPackage.valueChanges.pipe(startWith('')),
		]).pipe(
			map(([suggestions, alreadyLoadedPackageName, query]) =>
				this.getAutocompleteOptions(
					[...new Set([...(this.autocompletePackageNames ?? []), ...suggestions])],
					alreadyLoadedPackageName,
					query
				)
			)
		);
	}

	writeValue(value?: string[]): void {
		this.alreadyLoadedPackageName.set([...(value ?? [])]);
	}
	registerOnChange(fn: (value: string[]) => void): void {
		this.onChange = fn;
	}
	registerOnTouched(fn: (value: void) => void): void {
		this.onTouched = fn;
	}

	validate(c: AbstractControl): ValidationErrors | null {
		return c.validator;
	}

	onSubmit(): void {
		this.alreadyLoadedPackageName.push(this.addPackage.value);
		this.onChange(this.alreadyLoadedPackageName.getValue());

		// Clear value
		this.addPackage.setValue('');
		this.addPackage.markAsUntouched();
	}

	private searchLibraryOnInputChange(): Observable<string[]> {
		return this.addPackage.valueChanges.pipe(
			debounceTime(300),
			switchMap((query) => {
				if (!query) {
					return of([]);
				}
				return this.npmRegistryService.getSuggestions(query).pipe(
					map((suggestions) =>
						// prevent displaying already loaded packages
						suggestions.filter((suggestion) => !this.alreadyLoadedPackageName.getValue().includes(suggestion))
					)
				);
			})
		);
	}

	/**
	 * @param source - npm packages that can be displayed in the select
	 * @param skip - npm packages that are already loaded and we dont want to display them again
	 * @param query - npm package prefix that we are looking for.
	 *                Filters our from source only packages that match query
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
}
