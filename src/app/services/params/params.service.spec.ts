import { TestBed } from '@angular/core/testing';

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
			jest.spyOn(URLSearchParams.prototype, 'get').mockImplementationOnce(() => {
				throw new Error('mock error');
			});
			expect(service.getParam('p')).toBeNull();
		});
	});
});
