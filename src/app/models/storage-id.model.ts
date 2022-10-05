/**
 * Used to storage data using StorageService
 */
export enum StorageId {
	/**
	 * Cached package names that have either been searched
	 * for or at one point was used to populate the chart
	 */
	PACKAGE_NAMES = 'package-names',
	/**
	 * Cached package names that should be used to
	 * populate chart and show up as selected packages
	 */
	ACTIVE_PACKAGE_NAMES = 'active-package-names',
}
