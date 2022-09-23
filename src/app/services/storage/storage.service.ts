import { Injectable } from '@angular/core';

// source: https://www.reddit.com/r/javascript/comments/2z06aq/local_storage_is_not_supported_with_safari_in/
// We can't just depend on localStorage since it may not always be available

export enum StorageType {
	SERVICE_STORAGE = 'SERVICE_STORAGE',
	LOCAL_STORAGE = 'LOCAL_STORAGE',
	SESSION_STORAGE = 'SESSION_STORAGE',
}

interface Storage {
	[keys: string]: string;
}

@Injectable({
	providedIn: 'root',
})
export class StorageService {
	storage: Storage;

	readonly defaultStorageType: StorageType; // = StorageType.SERVICE_STORAGE;

	readonly canLocalStorage = this.localStorageIsWorking();
	readonly canSessionStorage = this.sessionStorageIsWorking();

	constructor() {
		this.storage = {};

		if (this.canLocalStorage) {
			this.defaultStorageType = StorageType.LOCAL_STORAGE;
		} else if (this.canSessionStorage) {
			console.warn("localStorage doesn't seem to be working, using sessionStorage instead");
			this.defaultStorageType = StorageType.SESSION_STORAGE;
		} else {
			console.warn("sessionStorage doesn't seem to be working, using storageService's storage instead");
			this.defaultStorageType = StorageType.SERVICE_STORAGE;
		}
	}

	private localStorageIsWorking(): boolean {
		if (!window.localStorage) {
			return false;
		}

		try {
			window.localStorage.setItem('__test__', '__test__');
			window.localStorage.removeItem('__test__');

			return true;
		} catch (error) {
			console.error(error);

			return false;
		}
	}

	private sessionStorageIsWorking(): boolean {
		if (!window.sessionStorage) {
			return false;
		}

		try {
			window.sessionStorage.setItem('__test__', '__test__');
			window.sessionStorage.removeItem('__test__');

			return true;
		} catch (error) {
			console.error(error);
			return false;
		}
	}

	setItem(key: string, value: unknown, storageType?: StorageType): void {
		if (!storageType) {
			this.setItem(key, value, this.defaultStorageType);
			return;
		}

		const stringifiedValue = JSON.stringify(value);

		if (storageType === StorageType.LOCAL_STORAGE) {
			window.localStorage.setItem(key, stringifiedValue);
			return;
		}

		if (storageType === StorageType.SESSION_STORAGE) {
			window.sessionStorage.setItem(key, stringifiedValue);
			return;
		}

		this.storage[key] = stringifiedValue;
	}

	getItem(key: string, storageType?: StorageType): string | null {
		if (!storageType) {
			return this.getItem(key, this.defaultStorageType);
		}

		if (storageType === StorageType.LOCAL_STORAGE) {
			return window.localStorage.getItem(key);
		}

		if (storageType === StorageType.SESSION_STORAGE) {
			return window.sessionStorage.getItem(key);
		}

		return this.storage[key] ?? null;
	}

	removeItem(key: string, storageType?: StorageType): void {
		if (!storageType) {
			this.removeItem(key, this.defaultStorageType);
			return;
		}

		if (storageType === StorageType.LOCAL_STORAGE) {
			window.localStorage.removeItem(key);
			return;
		}

		if (storageType === StorageType.SESSION_STORAGE) {
			window.sessionStorage.removeItem(key);
			return;
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.storage[key] = undefined as any;
		delete this.storage[key];
	}

	clear(storageType?: StorageType): void {
		if (!storageType) {
			this.removeItem(this.defaultStorageType);
			return;
		}

		if (storageType === StorageType.LOCAL_STORAGE) {
			window.localStorage.clear();
			return;
		}

		if (storageType === StorageType.SESSION_STORAGE) {
			window.sessionStorage.clear();
		}

		this.storage = {};
	}

	/**
	 * Clears all forms of storage
	 */
	clearAllStorage(): void {
		try {
			this.clear(StorageType.LOCAL_STORAGE);
		} catch (error) {
			/** pass */
		}
		try {
			this.clear(StorageType.SESSION_STORAGE);
		} catch (error) {
			/** pass */
		}
		try {
			this.clear(StorageType.SERVICE_STORAGE);
		} catch (error) {
			/** pass */
		}
	}
}
