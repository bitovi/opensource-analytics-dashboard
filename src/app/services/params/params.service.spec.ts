import { TestBed } from '@angular/core/testing';

import { ParamsService } from './params.service';

describe('ParamsService', () => {
	let service: ParamsService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(ParamsService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
