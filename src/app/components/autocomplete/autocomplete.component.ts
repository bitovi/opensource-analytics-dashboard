import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	forwardRef,
	inject,
	Input,
	OnDestroy,
	OnInit,
	Output,
} from '@angular/core';
import {
	ControlValueAccessor,
	FormControl,
	NG_VALIDATORS,
	NG_VALUE_ACCESSOR,
	ValidationErrors,
	Validators,
} from '@angular/forms';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ErrorHandlerService } from '../../services';

export const autocompleteComponentFn = () => AutocompleteComponent;

@Component({
	selector: 'app-autocomplete',
	templateUrl: './autocomplete.component.html',
	styleUrls: ['./autocomplete.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(autocompleteComponentFn),
			multi: true,
		},
		{
			provide: NG_VALIDATORS,
			useExisting: forwardRef(autocompleteComponentFn),
			multi: true,
		},
	],
})
export class AutocompleteComponent implements OnInit, OnDestroy, ControlValueAccessor, Validators {
	/**
	 * Emites selected option from the autocomplete by the user
	 */
	@Output() selectedOption: EventEmitter<void> = new EventEmitter<void>();

	/*
    package names that should be displayed as options in the select
  */
	@Input() autocomplateOptions: string[] | null = [];

	/*
    entity objects (package names) that are already loaded, to prevent duplicated loading
  */
	@Input() loadedEntities$!: Observable<string[]>;

	private readonly errorHandlerService = inject(ErrorHandlerService);
	private readonly unsubscribe$ = new Subject<void>();

	/* Form control to allow user search packages  */
	addOption!: FormControl<string>;

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
		this.addOption = new FormControl('', {
			nonNullable: true,
			asyncValidators: this.errorHandlerService.noDuplicatesValidator(this.loadedEntities$),
		});
		this.addOption.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((value) => this.onChange(value));
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	/**
	 * On enter click, select first element from the autocomplete dropdown if exists
	 */
	onChooseFirstOption() {
		const value = this.autocomplateOptions?.[0];

		if (value) {
			// save package name to parent's form control
			this.onChange(value);
		}

		// emit to parent that a package has been chosen
		this.selectedOption.emit();
	}

	writeValue(value?: string): void {
		this.addOption.setValue(value ?? '');
	}

	registerOnChange(fn: (value: string) => void): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: (value: void) => void): void {
		this.onTouched = fn;
	}

	validate(): ValidationErrors | null {
		if (this.addOption.errors) {
			return this.addOption.errors;
		}
		return null;
	}
}
