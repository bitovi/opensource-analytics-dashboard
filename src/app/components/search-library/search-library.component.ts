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

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	writeValue(value: string): void {
		// this.addPackage.setValue(value);
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
		this.onChange(this.selectedLibraries);
		this.addPackage.patchValue('');
	}

	private searchLibraryOnInputChange(): void {
		this.autocompleteOptions$ = this.addPackage.valueChanges.pipe(
			debounceTime(200),
			switchMap((query) => {
				if (!query) {
					return of([]);
				}
				return this.npmRegistryService.getSuggestions(query);
			})
		);
	}
}
