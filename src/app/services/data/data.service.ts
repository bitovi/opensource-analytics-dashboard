import { inject, Injectable } from '@angular/core';
import { format } from 'date-fns';
import { forkJoin, map, Observable, of, tap } from 'rxjs';
import { GithubRepositoryData, RegistryData } from '../../models';
import { ApiService } from '../api';
import { StorageService, StorageType } from '../storage';

@Injectable({
	providedIn: 'root',
})
export class DataService {
	private readonly storageService = inject(StorageService);

	constructor(private apiService: ApiService) {}

	/**
	 * Check if a date string matches today's date
	 *
	 * @param date Date string
	 * @returns True if given date string matches todays date
	 */
	isToday(date: string): boolean {
		return date === format(new Date(), 'yyyy-MM-dd');
	}

	getCacheStorageType(endDate: string): StorageType | undefined {
		if (this.isToday(endDate)) {
			return StorageType.SERVICE_STORAGE;
		}

		return undefined; // Use default
	}

	/**
	 * Builds a query slug string from paramaters
	 *
	 * @param packageName Package name
	 * @param start Start date
	 * @param end End date
	 * @returns Query slug containing package name and start and end dates
	 */
	getQuerySlug(packageName: string, start: string, end: string): string {
		return `${packageName}__${start}__${end}`;
	}

	/**
	 * Attempt to read cached data for package and date range from storage service
	 *
	 * @param packageName Package name
	 * @param start Start date (yyyy-MM-dd)
	 * @param end End date (yyyy-MM-dd)
	 * @returns Cache object or null if not found or invalid
	 */
	getCache(packageName: string, start: string, end: string): unknown | null {
		const cacheStorageType = this.getCacheStorageType(end);

		const cache = this.storageService.getItem(this.getQuerySlug(packageName, start, end), cacheStorageType);

		if (cache) {
			try {
				return JSON.parse(cache);
			} catch (error) {
				console.error(error);
			}
		}

		return null;
	}

	setCache(value: RegistryData, packageName: string, start: string, end: string): void {
		const cacheStorageType = this.getCacheStorageType(end);

		this.storageService.setItem(this.getQuerySlug(packageName, start, end), value, cacheStorageType);
	}

	getRegistry(packageName: string, start: string, end: string): Observable<RegistryData> {
		const cache = this.getCache(packageName, start, end);

		if (cache) {
			return of(cache as RegistryData);
		}

		return forkJoin([
			this.apiService.getDownloadsPoint(packageName, start, end),
			this.apiService.getDownloadsRange(packageName, start, end),
		]).pipe(
			map(([total, range]) => ({ total, range, packageName })),
			tap((data) => this.setCache(data, packageName, start, end))
		);
	}

	/**
	 * Make multiple API requests to load information about a github repository
	 *
	 * @param repositoryName name of the repository: angular/angular-cli , vuejs/vuex
	 * @returns data about a github repository package
	 */
	getGithubRepositoryData(repositoryName: string): Observable<GithubRepositoryData> {
		// TODO implement caching
		return forkJoin([
			this.apiService.getGithubPackageOverview(repositoryName),
			this.apiService.getGithubPackageLanguages(repositoryName),
			this.apiService.getGithubPackageContributors(repositoryName),
		]).pipe(
			map(([overview, languages, contributors]) => {
				return { overview, languages, contributors };
			})
		);
	}
}
