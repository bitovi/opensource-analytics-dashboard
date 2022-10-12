import { TestBed } from '@angular/core/testing';
import { QueryParams } from '../../models';

import { ParamsService } from './params.service';

describe('ParamsService', () => {
	let service: ParamsService;
	// Used to restore window.location
	const originalLocation = window.location;

	afterEach(() => {
		// clean up mocks for window.location
		window.location = originalLocation;
	});

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(ParamsService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('getParam()', () => {
		it('should return query params if name and value exist in url', () => {
			Object.defineProperty(window, 'location', {
				value: new URL('https://website.com?test=a,b,c'),
				writable: true,
			});
			expect(service.getParam('test')).toBe('a,b,c');
		});

		it('should return null if name and value does NOT exist in url', () => {
			Object.defineProperty(window, 'location', {
				value: new URL('https://website.com'),
				writable: true,
			});
			expect(service.getParam('p')).toBeNull();
		});

		it('should return null if URLSearchParams is NOT supported', () => {
			const mockError = new Error('mock error');
			// Silence console.error
			const spy = jest.spyOn(console, 'error').mockReturnValueOnce();
			jest.spyOn(URLSearchParams.prototype, 'get').mockImplementationOnce(() => {
				throw mockError;
			});
			expect(service.getParam('p')).toBeNull();
			expect(spy).toBeCalledWith(mockError);
		});
	});

	describe('setParam()', () => {
		it('should replace a param by name with value without navigation', () => {
			Object.defineProperty(window, 'location', {
				value: new URL('https://website.com/?first=a&second=b'),
				writable: true,
			});

			const spy = jest.spyOn(window.history, 'replaceState').mockImplementationOnce(() => {
				/** stub */
			});

			service.setParam('second', 'new-value');
			expect(spy).toHaveBeenCalledWith({}, '', 'https://website.com/?first=a&second=new-value');
		});

		it('should replace duplicate params with single new value', () => {
			Object.defineProperty(window, 'location', {
				value: new URL('https://website.com/?a=1&a=2&a=3'),
				writable: true,
			});

			const spy = jest.spyOn(window.history, 'replaceState').mockImplementationOnce(() => {
				/** stub */
			});

			service.setParam('a', 'single-value');
			expect(spy).toHaveBeenCalledWith({}, '', 'https://website.com/?a=single-value');
		});

		it('should sort params', () => {
			Object.defineProperty(window, 'location', {
				value: new URL('https://website.com/?z=1&x=2&y=3'),
				writable: true,
			});

			const spy = jest.spyOn(window.history, 'replaceState').mockImplementationOnce(() => {
				/** stub */
			});

			service.setParam('a', 'first');
			expect(spy).toHaveBeenCalledWith({}, '', 'https://website.com/?a=first&x=2&y=3&z=1');
		});
	});

	describe('getPackageNames()', () => {
		it('should get package names from query params', () => {
			const spy = jest.spyOn(service, 'getParam').mockReturnValueOnce('a,b,c');

			expect(service.getPackageNames()).toStrictEqual(['a', 'b', 'c']);
			expect(spy).toBeCalledWith(QueryParams.PACKAGE_NAMES);
		});

		it('should return empty array if there are no package names query params', () => {
			const spy = jest.spyOn(service, 'getParam').mockReturnValueOnce(null);

			expect(service.getPackageNames()).toStrictEqual([]);
			expect(spy).toBeCalledWith(QueryParams.PACKAGE_NAMES);
		});

		it('should remove empty package names', () => {
			const spy = jest.spyOn(service, 'getParam').mockReturnValueOnce(',,b,,,c,,,,');

			expect(service.getPackageNames()).toStrictEqual(['b', 'c']);
			expect(spy).toBeCalledWith(QueryParams.PACKAGE_NAMES);
		});
	});

	describe('setPackageNames()', () => {
		it('should set package names query params', () => {
			const spy = jest.spyOn(service, 'setParam');
			service.setPackageNames(['x', 'y', 'z']);

			expect(spy).toBeCalledWith(QueryParams.PACKAGE_NAMES, 'x,y,z');
		});
	});

	describe('getDateRange()', () => {
		it('should get date range from query params', () => {
			const spy = jest.spyOn(service, 'getParam').mockReturnValueOnce('1990-02-10,2001-03-21');
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const dateRange = service.getDateRange()!;

			expect(dateRange.length).toBe(2);
			expect(dateRange[0]).toEqual(new Date(1990, 2 - 1, 10));
			expect(dateRange[1]).toEqual(new Date(2001, 3 - 1, 21));
			expect(spy).toBeCalledWith(QueryParams.DATE_RANGE);
		});

		it('should return null if there are no date range query params', () => {
			const spy = jest.spyOn(service, 'getParam').mockReturnValueOnce(null);

			expect(service.getDateRange()).toBeNull();
			expect(spy).toBeCalledWith(QueryParams.DATE_RANGE);
		});

		it('should return null if date range query params does NOT have 2 values', () => {
			const spy = jest.spyOn(service, 'getParam').mockReturnValueOnce('2000-03-04');

			expect(service.getDateRange()).toBeNull();
			expect(spy).toBeCalledWith(QueryParams.DATE_RANGE);
		});
	});

	describe('setDateRange()', () => {
		it('should set date range query params', () => {
			const spy = jest.spyOn(service, 'setParam');
			service.setDateRange([new Date(1990, 9 - 1, 9), new Date(1999, 9 - 1, 9)]);
			expect(spy).toBeCalledWith(QueryParams.DATE_RANGE, '1990-09-09,1999-09-09');
		});
	});
});
