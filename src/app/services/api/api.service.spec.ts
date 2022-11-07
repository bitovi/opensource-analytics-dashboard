import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GithubRepositoryContributor, GithubRepositoryLanguages, GithubRepositoryOverview } from 'src/app/models';

import { ApiService, ENDPOINTS } from './api.service';

describe('ApiService', () => {
	let service: ApiService;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
		});
		service = TestBed.inject(ApiService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('getGithubPackageContributors()', () => {
		it('should GET package contributors from GitHub', () => {
			const mockResponse: GithubRepositoryContributor[] = [
				{
					avatar_url: 'http://localhost/donaldduck.gif',
					contributions: 64,
					events_url: 'http://localhost/events',
					followers_url: 'http://localhost/followers',
					following_url: 'http://localhost/following',
					type: 'pickle',
					gists_url: 'http://localhost/gists',
					gravatar_id: 'x',
					html_url: 'http://localhost',
					id: 4,
					login: 'codeduck',
					node_id: 'fred',
					organizations_url: 'a',
					received_events_url: 'b',
					repos_url: 'c',
					site_admin: false,
					starred_url: 'x',
					subscriptions_url: 'y',
					url: 'z',
				},
			];

			service.getGithubPackageContributors('name').subscribe((contributors) => {
				expect(contributors).toStrictEqual(mockResponse);
			});

			// Expect correct endpoint to be hit
			const mockReq = httpMock.expectOne(`${ENDPOINTS.GITHUB}/name/contributors`);
			// Make sure GET method is used
			expect(mockReq.request.method).toBe('GET');
			mockReq.flush(mockResponse);
		});
	});

	describe('getGithubPackageLanguages()', () => {
		it('should GET package language use from GitHub', () => {
			const mockResponse: GithubRepositoryLanguages = {
				ruby: 50,
				typescript: 50,
			};

			const repoName = 'robert';

			service.getGithubPackageLanguages(repoName).subscribe((languages) => {
				expect(languages).toStrictEqual(mockResponse);
			});

			// Expect correct endpoint to be hit
			const mockReq = httpMock.expectOne(`${ENDPOINTS.GITHUB}/${repoName}/languages`);
			// Make sure GET method is used
			expect(mockReq.request.method).toBe('GET');
			mockReq.flush(mockResponse);
		});
	});

	describe('getGithubPackageOverview()', () => {
		it('should GET package overview from GitHub', () => {
			const mockResponse: GithubRepositoryOverview = {
				allow_forking: true,
				archive_url: 'http://localhost/archive',
				archived: false,
				assignees_url: 'http://localhost/assignees',
				blobs_url: 'http://localhost/blobs',
				branches_url: 'http://localhost/branches',
				clone_url: 'http://localhost/clone',
			} as unknown as GithubRepositoryOverview;

			const repoName = 'robert';

			service.getGithubPackageOverview(repoName).subscribe((overview) => {
				expect(overview).toStrictEqual(mockResponse);
			});

			// Expect correct endpoint to be hit
			const mockReq = httpMock.expectOne(`${ENDPOINTS.GITHUB}/${repoName}`);
			// Make sure GET method is used
			expect(mockReq.request.method).toBe('GET');
			mockReq.flush(mockResponse);
		});
	});
});
