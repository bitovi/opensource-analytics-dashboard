/**
 * Used to storage data using StorageService
 */
export enum StorageId {
	/**
	 * Cached package names that have either been searched
	 * for or at one point was used to populate the chart
	 */
	PackageNames = 'autocomplete-package-names',
	/**
	 * Cached package names that should be used to
	 * populate chart and show up as selected packages
	 */
	ActivePackageNames = 'package-names',
}
