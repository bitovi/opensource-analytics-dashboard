import { ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { POSSIBLE_KEYDOWNS, SelectKeydown } from 'src/app/models/chart.model';
import { RegistryData } from 'src/app/services/npm-registry/npm-registry.model';

@Component({
	selector: 'app-selected-libraries',
	templateUrl: './selected-libraries.component.html',
	styleUrls: ['./selected-libraries.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => SelectedLibrariesComponent),
			multi: true,
		},
	],
})
export class SelectedLibrariesComponent implements ControlValueAccessor {
	@Output() removePackageName: EventEmitter<string> = new EventEmitter<string>();
	@Input() apiDatas: RegistryData[] = [];

	hiddenPackageName: string[] = [];

	onChange = (value: string[]) => {
		/* empty */
	};
	onTouched = () => {
		/* empty */
	};

	constructor() {}

	toggleVisibility(registryData: RegistryData): void {
		if (this.hiddenPackageName.includes(registryData.packageName)) {
			// make library visible
			this.hiddenPackageName = this.hiddenPackageName.filter((packageName) => packageName !== registryData.packageName);
		} else {
			// hide library from chart
			this.hiddenPackageName = [...this.hiddenPackageName, registryData.packageName];
		}

		this.onChange(this.hiddenPackageName);
	}

	writeValue(value: string[]): void {
		this.hiddenPackageName = [...(value ?? [])];
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

	onRemovePackageName(packageName: string): void {
		this.removePackageName.emit(packageName);
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

	/**
	 * ngForOf trackBy for packageNames
	 */
	trackByPackageName(_index: number, hasPackageName: { packageName: string }): string {
		return hasPackageName.packageName;
	}
}
