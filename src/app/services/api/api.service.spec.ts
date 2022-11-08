import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import {
	ApiEndpoints,
	DownloadsPoint,
	DownloadsRange,
	GithubRepositoryContributor,
	GithubRepositoryLanguages,
	GithubRepositoryOverview,
	Suggestion,
} from '../../models';
import { ApiService } from './api.service';

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
			const mockReq = httpMock.expectOne(`${ApiEndpoints.GITHUB}/name/contributors`);
			// Make sure GET method is used
			expect(mockReq.request.method).toBe('GET');
			mockReq.flush(mockResponse);
		});

		it('should return an empty array on failure', () => {
			service.getGithubPackageContributors('name').subscribe((resp) => {
				expect(resp).toStrictEqual([]);
			});

			const mockReq = httpMock.expectOne(`${ApiEndpoints.GITHUB}/name/contributors`);
			mockReq.flush('error', { status: 404, statusText: 'Error' });
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
			const mockReq = httpMock.expectOne(`${ApiEndpoints.GITHUB}/${repoName}/languages`);
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
			} as GithubRepositoryOverview;

			const repoName = 'robert';

			service.getGithubPackageOverview(repoName).subscribe((overview) => {
				expect(overview).toStrictEqual(mockResponse);
			});

			// Expect correct endpoint to be hit
			const mockReq = httpMock.expectOne(`${ApiEndpoints.GITHUB}/${repoName}`);
			// Make sure GET method is used
			expect(mockReq.request.method).toBe('GET');
			mockReq.flush(mockResponse);
		});
	});

	describe('getDownloadsPoint()', () => {
		it('should GET total downloads of package within range from NPMJS', () => {
			const mockResponse: DownloadsPoint = {
				downloads: 42,
			};

			const packageName = 'amazon-package';
			const startDate = '2021-10-24';
			const endDate = '2022-03-12';

			service.getDownloadsPoint(packageName, startDate, endDate).subscribe((downloadCount) => {
				expect(downloadCount).toStrictEqual(mockResponse.downloads);
			});

			// Expect correct endpoint to be hit
			const mockReq = httpMock.expectOne(
				`${ApiEndpoints.NPMJS_REGISTRY}/downloads/point/${startDate}:${endDate}/${packageName}`
			);
			// Make sure GET method is used
			expect(mockReq.request.method).toBe('GET');
			mockReq.flush(mockResponse);
		});
	});

	describe('getDownloadsRange()', () => {
		it('should GET download info for package within range from NPMJS', () => {
			const mockResponse: DownloadsRange = {
				downloads: [
					{ day: '2021-10-24', downloads: 4 },
					{ day: '2021-10-25', downloads: 10 },
				],
			};

			const packageName = 'amazon-package';
			const startDate = '2021-10-24';
			const endDate = '2022-03-12';

			service.getDownloadsRange(packageName, startDate, endDate).subscribe((range) => {
				expect(range).toStrictEqual(mockResponse.downloads);
			});

			// Expect correct endpoint to be hit
			const mockReq = httpMock.expectOne(
				`${ApiEndpoints.NPMJS_REGISTRY}/downloads/range/${startDate}:${endDate}/${packageName}`
			);
			// Make sure GET method is used
			expect(mockReq.request.method).toBe('GET');
			mockReq.flush(mockResponse);
		});
	});

	describe('getSuggestions()', () => {
		it('should GET search suggestion package names from NPM', () => {
			const mockResponse: Suggestion[] = [
				{
					package: {
						name: 'usps',
						version: '1.0.0',
						links: {
							repository: 'https://localhost/usps',
						},
					},
				},
				{
					package: {
						name: 'ups',
						version: '1.0.0',
						links: {
							repository: 'https://localhost/ups',
						},
					},
				},
			];

			const query = 'name';

			service.getSuggestions(query).subscribe((suggestions) => {
				expect(suggestions).toStrictEqual(mockResponse.map((r) => r.package.name));
			});

			// Expect correct endpoint to be hit
			const mockReq = httpMock.expectOne(`${ApiEndpoints.NPM_REGISTRY}/v2/search/suggestions?q=${query}`);
			// Ensure query is passed
			expect(mockReq.request.params.get('q')).toBe(query);
			// Make sure GET method is used
			expect(mockReq.request.method).toBe('GET');
			mockReq.flush(mockResponse);
		});

		it('should return an empty array on failure', () => {
			const query = 'name';

			service.getSuggestions(query).subscribe((resp) => {
				expect(resp).toStrictEqual([]);
			});

			const mockReq = httpMock.expectOne(`${ApiEndpoints.NPM_REGISTRY}/v2/search/suggestions?q=${query}`);
			mockReq.flush('error', { status: 404, statusText: 'Error' });
		});
	});
});
