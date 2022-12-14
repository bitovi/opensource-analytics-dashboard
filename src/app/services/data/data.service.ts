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

	isToday(date: string): boolean {
		return date === format(new Date(), 'yyyy-MM-dd');
	}

	getCacheStorageType(endDate: string): StorageType | undefined {
		if (this.isToday(endDate)) {
			return StorageType.SERVICE_STORAGE;
		}

		return undefined; // Use default
	}

	getQuerySlug(packageName: string, start: string, end: string): string {
		return `${packageName}__${start}__${end}`;
	}

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
	 * @Returns data about a github repository package
	 *
	 * @repositoryName - name of the repository: angular/angular-cli , vuejs/vuex
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
