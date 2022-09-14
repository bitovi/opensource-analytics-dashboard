import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { POSSIBLE_KEYDOWNS, SelectKeydown } from 'src/app/models/chart.model';
import { RegistryData } from 'src/app/services/npm-registry/npm-registry.model';

@Component({
	selector: 'app-selected-libraries',
	templateUrl: './selected-libraries.component.html',
	styleUrls: ['./selected-libraries.component.scss'],
})
export class SelectedLibrariesComponent implements OnInit {
	@Output() removePackageName: EventEmitter<string> = new EventEmitter<string>();
	@Input() apiDatas?: RegistryData[] | null;

	constructor() {}

	ngOnInit(): void {}

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
