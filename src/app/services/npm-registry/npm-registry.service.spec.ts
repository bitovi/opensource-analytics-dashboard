import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { NpmRegistryService } from './npm-registry.service';

describe('NpmRegistryService', () => {
	let service: NpmRegistryService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			providers: [NpmRegistryService],
			imports: [HttpClientTestingModule],
		}).compileComponents();

		service = TestBed.inject(NpmRegistryService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
