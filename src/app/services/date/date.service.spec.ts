import { TestBed } from '@angular/core/testing';
import { isEqual } from 'date-fns';
import { DateFormat } from '../../models';

import { DateService } from './date.service';

describe('DateService', () => {
	let service: DateService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(DateService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('getDate()', () => {
		it('should return a Date instance based on format', () => {
			const date = service.getDate('1980-03-20', DateFormat.YEAR_MONTH_DAY);
			expect(date).toEqual(new Date(1980, 3 - 1, 20));
			expect(date.getFullYear()).toBe(1980);
			expect(date.getMonth()).toBe(3 - 1);
			expect(date.getDate()).toBe(20);
		});
	});

	describe('getDateString()', () => {
		it('should return a date string based on format', () => {
			const dateString = service.getDateString(new Date(2001, 8 - 1, 29), DateFormat.YEAR_MONTH_DAY);
			expect(dateString).toBe('2001-08-29');
		});
	});

	// When running tests with node 14, Array.prototype.at doesn't exist
	// Running the tests with node 16 resolves this issue when testing `getDateRange()`
	describe('getDateRange()', () => {
		it('should return an array of dates from `start` to `end` (inclusive)', () => {
			const start = new Date(2013, 5 - 1, 28);
			const end = new Date(2013, 6 - 1, 2);

			const range = service.getDateRange(start, end);

			expect(range.length).toBe(6);
			expect(range[0]).toEqual(start);
			expect(range[0]).toEqual(new Date(2013, 5 - 1, 28));
			expect(range[1]).toEqual(new Date(2013, 5 - 1, 29));
			expect(range[2]).toEqual(new Date(2013, 5 - 1, 30));
			expect(range[3]).toEqual(new Date(2013, 5 - 1, 31));
			expect(range[4]).toEqual(new Date(2013, 6 - 1, 1));
			expect(range[5]).toEqual(new Date(2013, 6 - 1, 2));
			expect(range[5]).toEqual(end);
		});

		it('should have the last element of the array equal `end`', () => {
			const start = new Date(2014, 4 - 1, 22);
			const end = new Date(2014, 7 - 1, 10);

			const range = service.getDateRange(start, end);
			const last = range[range.length - 1];
			expect(isEqual(last, end)).toBe(true);
		});

		it('should have one element that is equal with `start` and `end` if `start` and `end` are equal', () => {
			const start = new Date(2014, 5 - 1, 12);
			const end = new Date(2014, 5 - 1, 12);
			const range = service.getDateRange(start, end);
			const last = range[range.length - 1];

			expect(isEqual(start, end)).toBe(true);
			expect(isEqual(start, last)).toBe(true);
			expect(isEqual(end, last)).toBe(true);
		});

		it('should throw if `end` is before `start`', () => {
			const start = new Date(2011, 5 - 1, 14);
			const end = new Date(1999, 5 - 1, 14);
			expect(() => service.getDateRange(start, end)).toThrowError('Unexpected getDateRange end mismatch');
		});
	});
});
