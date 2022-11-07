import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
	DownloadsPoint,
	DownloadsRange,
	DownloadsRangeData,
	GithubRepositoryContributor,
	GithubRepositoryLanguages,
	GithubRepositoryOverview,
	Suggestion,
} from '../../models';

/** API Endpoints */
export enum ENDPOINTS {
	NPMJS_REGISTRY = 'https://api.npmjs.org',
	NPM_REGISTRY = 'https://api.npms.io',
	GITHUB = 'https://api.github.repos',
}

@Injectable({
	providedIn: 'root',
})
export class ApiService {
	constructor(private readonly httpClient: HttpClient) {}

	/**
	 * Get GitHub contributors for package
	 *
	 * @param repositoryName - name of the repository: angular/angular-cli , vuejs/vuex
	 * @return top contributors for a github repository
	 *
	 * example: https://api.github.com/repos/vuejs/pinia/contributors
	 */
	getGithubPackageContributors(repositoryName: string): Observable<GithubRepositoryContributor[]> {
		return this.httpClient
			.get<GithubRepositoryContributor[]>(`${ENDPOINTS.GITHUB}/${repositoryName}/contributors`)
			.pipe(
				catchError((error: unknown) => {
					console.error(error);

					return of([]);
				})
			);
	}

	/**
	 * Get programming languages for GitHub package
	 * example: https://api.github.com/repos/vuejs/pinia/languages
	 *
	 * @param repositoryName - name of the repository: angular/angular-cli , vuejs/vuex
	 * @return languages that the github repository is written
	 */
	getGithubPackageLanguages(repositoryName: string): Observable<GithubRepositoryLanguages> {
		return this.httpClient.get<GithubRepositoryLanguages>(`${ENDPOINTS.GITHUB}/${repositoryName}/languages`);
	}

	/**
	 * Get GitHub Package Overview
	 * example: https://api.github.com/repos/angular/angular-cli
	 *
	 * @param repositoryName - name of the repository: angular/angular-cli , vuejs/vuex
	 * @return overview of some github repository
	 */
	getGithubPackageOverview(repositoryName: string): Observable<GithubRepositoryOverview> {
		return this.httpClient.get<GithubRepositoryOverview>(`${ENDPOINTS.GITHUB}/${repositoryName}`);
	}

	/**
	 * Get the total downloads of some NPM package in the interval of 'start' and 'end' date
	 * source: https://github.com/npm/registry/blob/master/docs/download-counts.md#point-values
	 */
	getDownloadsPoint(packageName: string, start: string, end: string): Observable<number> {
		return this.httpClient
			.get<DownloadsPoint>(`${ENDPOINTS.NPMJS_REGISTRY}/downloads/point/${start}:${end}/${packageName}`)
			.pipe(map((res) => res.downloads));
	}

	getDownloadsRange(packageName: string, start: string, end: string): Observable<DownloadsRangeData[]> {
		return this.httpClient
			.get<DownloadsRange>(`${ENDPOINTS.NPMJS_REGISTRY}/downloads/range/${start}:${end}/${packageName}`)
			.pipe(map((res) => res.downloads));
	}

	getSuggestions(query: string): Observable<string[]> {
		return this.httpClient
			.get<Suggestion[]>(`${ENDPOINTS.NPM_REGISTRY}/v2/search/suggestions`, { params: { q: query } })
			.pipe(
				map((suggestions) => suggestions.map((suggestion) => suggestion.package.name)),
				catchError((error: unknown) => {
					console.error(error);

					return of([]);
				})
			);
	}
}
