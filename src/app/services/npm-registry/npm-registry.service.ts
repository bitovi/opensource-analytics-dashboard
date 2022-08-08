import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of, tap } from 'rxjs';
import { StorageService, StorageType } from '../storage';
import { format } from 'date-fns';
import { DownloadsPoint, DownloadsRange, RegistryData, Suggestion } from './npm-registry.model';

@Injectable({
  providedIn: 'root'
})
export class NpmRegistryService {
  private readonly base = `https://api.npmjs.org`;
  // private readonly httpClient = inject(HttpClient);
  private readonly storageService = inject(StorageService);

  constructor(private readonly httpClient: HttpClient) {}

  isToday(date: string): boolean {
    return date === format(new Date(), 'yyyy-MM-dd');
  }

  getCacheStorageType(endDate: string): StorageType | undefined {
    if (this.isToday(endDate)) {
      return StorageType.SERVICE_STORAGE;
    }

    return undefined;// Use default
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
      } catch(error) {
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
      this.getDownloadsPoint(packageName, start, end),
      this.getDownloadsRange(packageName, start, end),
    ]).pipe(
      map(([total, range]) => ({ total, range, packageName })),
      tap(data => this.setCache(data, packageName, start, end)),
    );
  }

  getSuggestions(query: string): Observable<string[]> {
    const url = 'https://api.npms.io/v2/search/suggestions';

    return this.httpClient.get<Suggestion[]>(url, { params: { q: query }}).pipe(
      map(suggestions => suggestions.map(suggestion => suggestion.package.name )),
      catchError((error: unknown) => {
        console.error(error);

        return of([]);
      })
    );
  }

  /**
   * source: https://github.com/npm/registry/blob/master/docs/download-counts.md#point-values
   */
  protected getDownloadsPoint(packageName: string, start: string, end: string): Observable<number> {
    return this.httpClient.get<DownloadsPoint>(`${this.base}/downloads/point/${start}:${end}/${packageName}`).pipe(
      map(res => res.downloads),
    );
  }

  protected getDownloadsRange(packageName: string, start: string, end: string): Observable<number[]> {
    return this.httpClient.get<DownloadsRange>(`${this.base}/downloads/range/${start}:${end}/${packageName}`).pipe(
      map(res => res.downloads.map(({ downloads }) => downloads)),
    );
  }
}
