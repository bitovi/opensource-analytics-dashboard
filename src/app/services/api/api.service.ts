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

@Injectable({
	providedIn: 'root',
})
export class ApiService {
	private readonly NPM_REGISTRY_ENDPOINT = `https://api.npmjs.org`;
	private readonly GITHUB_ENDPOINT = `https://api.github.com/repos`;
	constructor(private readonly httpClient: HttpClient) {}

	/**
	 * @Returns top contributors for a github repository
	 *
	 * @repositoryName - name of the repository: angular/angular-cli , vuejs/vuex
	 *
	 * example: https://api.github.com/repos/vuejs/pinia/contributors
	 */
	getGithubPackageContributors(repositoryName: string): Observable<GithubRepositoryContributor[]> {
		return this.httpClient
			.get<GithubRepositoryContributor[]>(`${this.GITHUB_ENDPOINT}/${repositoryName}/contributors`)
			.pipe(
				catchError((error: unknown) => {
					console.error(error);

					return of([]);
				})
			);
	}

	/**
	 * @Returns languages that the github repository is written
	 *
	 * @repositoryName - name of the repository: angular/angular-cli , vuejs/vuex
	 *
	 * example: https://api.github.com/repos/vuejs/pinia/languages
	 */
	getGithubPackageLanguages(repositoryName: string): Observable<GithubRepositoryLanguages> {
		return this.httpClient.get<GithubRepositoryLanguages>(`${this.GITHUB_ENDPOINT}/${repositoryName}/languages`);
	}

	/**
	 * @Returns overview of some github repository
	 *
	 * @repositoryName - name of the repository: angular/angular-cli , vuejs/vuex
	 *
	 * example: https://api.github.com/repos/angular/angular-cli
	 */
	getGithubPackageOverview(repositoryName: string): Observable<GithubRepositoryOverview> {
		return this.httpClient.get<GithubRepositoryOverview>(`${this.GITHUB_ENDPOINT}/${repositoryName}`);
	}

	/**
	 * @Returns the total downloads of some NPM package in the interval of 'start' and 'end' date
	 * source: https://github.com/npm/registry/blob/master/docs/download-counts.md#point-values
	 */
	getDownloadsPoint(packageName: string, start: string, end: string): Observable<number> {
		return this.httpClient
			.get<DownloadsPoint>(`${this.NPM_REGISTRY_ENDPOINT}/downloads/point/${start}:${end}/${packageName}`)
			.pipe(map((res) => res.downloads));
	}

	getDownloadsRange(packageName: string, start: string, end: string): Observable<DownloadsRangeData[]> {
		return this.httpClient
			.get<DownloadsRange>(`${this.NPM_REGISTRY_ENDPOINT}/downloads/range/${start}:${end}/${packageName}`)
			.pipe(map((res) => res.downloads));
	}

	getSuggestions(query: string): Observable<string[]> {
		return this.httpClient
			.get<Suggestion[]>(`${this.NPM_REGISTRY_ENDPOINT}/v2/search/suggestions`, { params: { q: query } })
			.pipe(
				map((suggestions) => suggestions.map((suggestion) => suggestion.package.name)),
				catchError((error: unknown) => {
					console.error(error);

					return of([]);
				})
			);
	}
}
