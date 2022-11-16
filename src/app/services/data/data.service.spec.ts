import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { format } from 'date-fns';

import { DataService } from './data.service';

describe('NpmRegistryService', () => {
	let service: DataService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			providers: [DataService],
			imports: [HttpClientTestingModule],
		}).compileComponents();

		service = TestBed.inject(DataService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('isToday()', () => {
		it('should return true if given todays date in date-fns yyyy-MM-dd format', () => {
			expect(service.isToday(format(new Date(), 'yyyy-MM-dd'))).toBe(true);
		});
		it('should return true if NOT given todays date in date-fns yyyy-MM-dd format', () => {
			expect(service.isToday('not-today')).toBe(false);
		});
	});

	describe('getQuerySlug()', () => {
		it('should return formatted string', () => {
			const packageName = 'amazon';
			const start = 'start';
			const end = 'end';
			expect(service.getQuerySlug(packageName, start, end)).toEqual(`${packageName}__${start}__${end}`);
		});
	});
});
