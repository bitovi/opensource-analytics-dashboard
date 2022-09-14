import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, Observable, of, switchMap } from 'rxjs';
import { ErrorHandlerService, NpmRegistryService } from 'src/app/services';

@Component({
	selector: 'app-search-library',
	templateUrl: './search-library.component.html',
	styleUrls: ['./search-library.component.scss'],
})
export class SearchLibraryComponent implements OnInit {
	@Output() selectLibrary: EventEmitter<string> = new EventEmitter<string>();
	autocompleteOptions$!: Observable<string[]>;
	private readonly errorHandlerService = inject(ErrorHandlerService);
	readonly addPackage: FormControl<string> = new FormControl('', {
		nonNullable: true,
	});
	readonly packageErrorsHandler = this.errorHandlerService.getInputErrorsHandler('package name');

	constructor(private npmRegistryService: NpmRegistryService) {}

	ngOnInit(): void {
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

	onLibrarySelect(e: string) {
		this.selectLibrary.emit(e);
		this.addPackage.patchValue('');
	}
}
