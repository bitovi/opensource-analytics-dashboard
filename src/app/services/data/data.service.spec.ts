import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { format } from 'date-fns';
import { StorageService, StorageType } from '../storage';

import { DataService } from './data.service';

describe('DataService', () => {
	let service: DataService;
	let storageService: StorageService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			providers: [DataService],
			imports: [HttpClientTestingModule],
		}).compileComponents();

		service = TestBed.inject(DataService);
		storageService = TestBed.inject(StorageService);
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

	describe('getCacheStorageType()', () => {
		it('should return SERVICE_STORAGE if isToday returns true for endDate', () => {
			jest.spyOn(service, 'isToday').mockReturnValueOnce(true);
			expect(service.getCacheStorageType('fake-value')).toEqual(StorageType.SERVICE_STORAGE);
		});
		it('should return undefined if isToday returns false for endDate', () => {
			jest.spyOn(service, 'isToday').mockReturnValueOnce(false);
			expect(service.getCacheStorageType('fake-value')).toEqual(undefined);
		});
	});

	describe('getCache()', () => {
		it('should get cache from storageService', () => {
			const getItemSpy = jest.spyOn(storageService, 'getItem').mockReturnValue(null);
			service.getCache('package', 'start', 'end');
			expect(getItemSpy).toHaveBeenCalledWith('package__start__end', undefined);
		});
		describe('when cache exists', () => {
			it('should return parsed JSON from storage service when valid', () => {
				const obj = { value: 5 };
				jest.spyOn(storageService, 'getItem').mockReturnValue(JSON.stringify(obj));
				expect(service.getCache('package', 'start', 'end')).toMatchObject(obj);
			});
			it('should log error when JSON parsing fails', () => {
				jest.spyOn(storageService, 'getItem').mockReturnValue('-');
				const consoleSpy = jest.spyOn(console, 'error').mockImplementationOnce(() => ({}));
				service.getCache('package', 'start', 'end');
				expect(consoleSpy).toHaveBeenCalled();
			});
		});
		describe('when cache does not exist or is invalid', () => {
			it('should return null', () => {
				jest.spyOn(storageService, 'getItem').mockReturnValue(null);
				expect(service.getCache('package', 'start', 'end')).toBeNull();
			});
		});
	});
});
