import { TestBed } from '@angular/core/testing';

import { ErrorInterceptor } from './error-interceptor.service';

describe('ErrorInterceptor.Service.TsService', () => {
	let service: ErrorInterceptor.Service.TsService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(ErrorInterceptor.Service.TsService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
