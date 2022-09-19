import { ChangeDetectionStrategy, Component, forwardRef, inject, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { debounceTime, Observable, of, switchMap } from 'rxjs';
import { ErrorHandlerService, NpmRegistryService } from 'src/app/services';

@Component({
	selector: 'app-search-library',
	templateUrl: './search-library.component.html',
	styleUrls: ['./search-library.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => SearchLibraryComponent),
			multi: true,
		},
	],
})
export class SearchLibraryComponent implements OnInit, ControlValueAccessor {
	autocompleteOptions$!: Observable<string[]>;
	private readonly errorHandlerService = inject(ErrorHandlerService);
	readonly addPackage: FormControl<string> = new FormControl('', {
		nonNullable: true,
	});
	readonly packageErrorsHandler = this.errorHandlerService.getInputErrorsHandler('package name');

	// keep track of selected libraries and send all of them to the parent
	private selectedLibraries: string[] = [];

	onChange = (value: string[]) => {
		/* empty */
	};
	onTouched = () => {
		/* empty */
	};

	constructor(private npmRegistryService: NpmRegistryService) {}

	ngOnInit(): void {
		this.searchLibraryOnInputChange();
	}

	writeValue(value: string[]): void {
		this.selectedLibraries = value ?? [];
	}
	registerOnChange(fn: any): void {
		this.onChange = fn;
	}
	registerOnTouched(fn: any): void {
		this.onTouched = fn;
	}

	setDisabledState?(): void {
		throw new Error('Method not implemented.');
	}

	onLibrarySelect(e: string) {
		this.selectedLibraries = [...this.selectedLibraries, e];

		// notify parent with list of packages
		this.onChange(this.selectedLibraries);

		// clear seach on package select
		this.addPackage.patchValue('');
	}

	private searchLibraryOnInputChange(): void {
		this.autocompleteOptions$ = this.addPackage.valueChanges.pipe(
			debounceTime(300),
			switchMap((query) => {
				if (!query) {
					return of([]);
				}
				return this.npmRegistryService.getSuggestions(query);
			})
		);
	}
}
