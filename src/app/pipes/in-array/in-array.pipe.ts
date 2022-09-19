import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'inArray' })
export class InArrayPipe implements PipeTransform {
	transform<T>(array: T[], value?: T | null): boolean {
		if (!value) {
			return false;
		}

		return array.includes(value);
	}
}
