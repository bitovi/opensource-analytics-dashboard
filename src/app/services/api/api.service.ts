import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
	ApiEndpoints,
	DownloadsPoint,
	DownloadsRange,
	DownloadsRangeData,
	GithubRepositoryContributor,
	GithubRepositoryLanguages,
	GithubRepositoryOverview,
	Suggestion,
} from '../../models';

@Injectable({
	providedIn: 'root',
})
export class ApiService {
	constructor(private readonly httpClient: HttpClient) {}

	/**
	 * Get GitHub contributors for package; return empty array on server error
	 * example: https://api.github.com/repos/vuejs/pinia/contributors
	 *
	 * @param repositoryName name of the repository: angular/angular-cli , vuejs/vuex
	 * @returns top contributors for a github repository
	 */
	getGithubPackageContributors(repositoryName: string): Observable<GithubRepositoryContributor[]> {
		return this.httpClient
			.get<GithubRepositoryContributor[]>(`${ApiEndpoints.GITHUB}/${repositoryName}/contributors`)
			.pipe(
				catchError((error: unknown) => {
					console.error(error);

					return of([]);
				})
			);
	}

	/**
	 * Get programming language use for GitHub package
	 * example: https://api.github.com/repos/vuejs/pinia/languages
	 *
	 * @param repositoryName name of the repository: angular/angular-cli , vuejs/vuex
	 * @returns languages that the github repository is written
	 */
	getGithubPackageLanguages(repositoryName: string): Observable<GithubRepositoryLanguages> {
		return this.httpClient.get<GithubRepositoryLanguages>(`${ApiEndpoints.GITHUB}/${repositoryName}/languages`);
	}

	/**
	 * Get GitHub Package Overview
	 * example: https://api.github.com/repos/angular/angular-cli
	 *
	 * @param repositoryName name of the repository: angular/angular-cli , vuejs/vuex
	 * @returns overview of some github repository
	 */
	getGithubPackageOverview(repositoryName: string): Observable<GithubRepositoryOverview> {
		return this.httpClient.get<GithubRepositoryOverview>(`${ApiEndpoints.GITHUB}/${repositoryName}`);
	}

	/**
	 * Get the total downloads of some NPM package in the interval of 'start' and 'end' date
	 * source: https://github.com/npm/registry/blob/master/docs/download-counts.md#point-values
	 *
	 * @param packageName name of repository
	 * @param start download range start date (YYYY-MM-DD)
	 * @param end download range end date (YYYY-MM-DD)
	 */
	getDownloadsPoint(packageName: string, start: string, end: string): Observable<number> {
		return this.httpClient
			.get<DownloadsPoint>(`${ApiEndpoints.NPMJS_REGISTRY}/downloads/point/${start}:${end}/${packageName}`)
			.pipe(map((res) => res.downloads));
	}

	/**
	 * Get total downloads of NPM package for each day in given interval of 'start' and 'end' dates
	 *
	 * @param packageName name of package
	 * @param start download range start date (YYYY-MM-DD)
	 * @param end download range end date (YYYY-MM-DD)
	 * @returns array of download range data objects for given range
	 */
	getDownloadsRange(packageName: string, start: string, end: string): Observable<DownloadsRangeData[]> {
		return this.httpClient
			.get<DownloadsRange>(`${ApiEndpoints.NPMJS_REGISTRY}/downloads/range/${start}:${end}/${packageName}`)
			.pipe(map((res) => res.downloads));
	}

	/**
	 * Get package names from search suggestions for a query from NPM
	 *
	 * @param query search query string
	 * @returns array of package names, or empty array on failure
	 */
	getSuggestions(query: string): Observable<string[]> {
		return this.httpClient
			.get<Suggestion[]>(`${ApiEndpoints.NPM_REGISTRY}/v2/search/suggestions`, { params: { q: query } })
			.pipe(
				map((suggestions) => suggestions.map((suggestion) => suggestion.package.name)),
				catchError((error: unknown) => {
					console.error(error);

					return of([]);
				})
			);
	}
}
