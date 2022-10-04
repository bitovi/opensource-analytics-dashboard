import { ChangeDetectionStrategy, Component, forwardRef, inject, Input, OnDestroy, OnInit } from '@angular/core';
import {
	ControlValueAccessor,
	FormControl,
	NG_VALIDATORS,
	NG_VALUE_ACCESSOR,
	ValidationErrors,
	Validators,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ErrorHandlerService } from '../../services';

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
export class AutocompleteComponent implements OnInit, OnDestroy, ControlValueAccessor, Validators {
	/*
    package names that should be displayed as options in the select
  */
	@Input() autocomplateOptions: string[] | null = [];

	private readonly errorHandlerService = inject(ErrorHandlerService);
	private readonly unsubscribe$ = new Subject<void>();

	/* Form control to allow user search packages  */
	readonly addPackage: FormControl<string> = new FormControl('', {
		nonNullable: true,
	});

	/* errors that may occur when searching for a package name */
	readonly packageErrorsHandler = this.errorHandlerService.getInputErrorsHandler('package name');

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onChange = (value: string) => {
		/* empty */
	};
	onTouched = () => {
		/* empty */
	};

	ngOnInit(): void {
		this.addPackage.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((value) => this.onChange(value));
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	writeValue(value?: string): void {
		this.addPackage.setValue(value ?? '');
	}
	registerOnChange(fn: (value: string) => void): void {
		this.onChange = fn;
	}
	registerOnTouched(fn: (value: void) => void): void {
		this.onTouched = fn;
	}

	onSelectionChange(value: string): void {
		this.onChange(value);
	}

	validate(): ValidationErrors | null {
		if (this.addPackage.errors) {
			return this.addPackage.errors;
		}
		return null;
	}
}
