import { ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntilDestroy } from '../../operators';
import { RegistryData } from '../../services/npm-registry/npm-registry.model';

enum SelectKeydown {
	SPACE = 'Space',
	SPACE_2 = ' ',
	ENTER = 'Enter',
}

const POSSIBLE_KEYDOWNS = [SelectKeydown.ENTER, SelectKeydown.SPACE, SelectKeydown.SPACE_2];

@Component({
	selector: 'app-package-list',
	templateUrl: './package-list.component.html',
	styleUrls: ['./package-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => PackageListComponent),
			multi: true,
		},
	],
})
export class PackageListComponent implements OnInit, ControlValueAccessor {
	@Output() removePackageName: EventEmitter<string> = new EventEmitter<string>();
	@Input() registryData: RegistryData[] | null = [];

	readonly selectedPackageNames = new FormControl<string[]>([], {
		nonNullable: true,
	});

	private selectedPackageNames$ = this.selectedPackageNames.valueChanges.pipe(takeUntilDestroy());

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onChange = (value: string[]) => {
		/* empty */
	};
	onTouched = () => {
		/* empty */
	};

	ngOnInit(): void {
		// notify parent that package visibility has been toggled
		this.selectedPackageNames$.subscribe((packages) => {
			this.onChange(packages);
		});
	}
	writeValue(value?: string[]): void {
		this.selectedPackageNames.patchValue([...(value ?? [])], { emitEvent: false });
	}

	registerOnChange(fn: (value: string[]) => void): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: (value: void) => void): void {
		this.onTouched = fn;
	}

	onRemovePackageName(packageName: string): void {
		this.removePackageName.emit(packageName);
	}

	/**
	 * ngForOf trackBy for packageNames
	 */
	trackByPackageName(_index: number, hasPackageName: { packageName: string }): string {
		return hasPackageName.packageName;
	}

	keydownIsSelect(event: KeyboardEvent): boolean {
		return POSSIBLE_KEYDOWNS.includes((event.key ?? event.code) as SelectKeydown);
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
}
