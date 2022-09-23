# Open Source Analytics Dashboard

[Open source analytical tool](https://bitovi.github.io/opensource-analytics-dashboard) to see NPM package downloads

# How it works

1. For each keyword in `npm package name` input field dispatch an HTTP request by the `NpmRegistryService.getSuggestions()` method for loading coresponding npm package names
2. By selecting and adding a suggested packages, the following happens:
   1. A package name is saved into `packageNames: ArrayObservable<string>`
   2. Url query params are updated with the additional package name
   3. When `packageNames` emits by the added package name, `getApiDates()` is called to load daily and total npm download for the defined date range
   4. Graph is redrawn by the fetched NPM package point values
   5. Every displayed NPM package is cached in localStorage
3. Each displayed package can
   1. Be shown/hidden from the chart
   2. Be permanently removed
   3. Redirect the user to the NPM registry for that package

## ArrayObservable

A generic value storage class similar to `BehaviourSubject` however, it is based on the redux pattern. Every exposed method/action (`push`, `removeValue`, ...) triggers a corresponding subject's value change that modifies the class state, as reducers work in the redux pattern.

## Query param persistance

On application reload, `getCachedPackageNames()` runs to collect NPM package names saved in the URL query params and merges with ones persisted in localstorage. \
When a new package name is added into `packageNames.observable$` it is persisted into localstorage (`onPackageNamesChanged()`) and also added to query params (`setPackageNamesInParams()`)

## Error handling

Thrown errors, for example, like fetching daily and total NPM downloads for a specific package, are handled in `displayErrorMessage(error: unknown)` method. The received error message is then shown in [MatSnackBar](https://material.angular.io/components/snack-bar/examples).

# How to Use Services / API

Service `NpmRegistryService` is used to fetch data about npm packages from the following methods:

- `getSuggestions(...)` - Fetch npm package names for suggestion by the provided `query` from endpoint: `https://api.npms.io/v2/search/suggestions?q=${query}`, [check out docs](https://api-docs.npms.io/#api-Search-SearchSuggestions)
- `getDownloadsPoint(...)` - Fetch the total npm downloads for a `packageName` from `start` to `end` period using endpoint: `https://api.npmjs.org/downloads/point/${start}:${end}/${packageName}`, [check out docs](https://github.com/npm/registry/blob/master/docs/download-counts.md#point-values)

- `getDownloadsRange(...)` - Fetch daily downloads for a `packageName` from `start` to `end` period using endpoint: `https://api.npmjs.org/downloads/range/${start}:${end}/${packageName}`, [check out docs](https://github.com/npm/registry/blob/master/docs/download-counts.md#ranges)

# Application dependency

Application is based on the following dependencies:

- [Angular material](https://material.angular.io/) - UI component library
- [Angular google charts](https://www.npmjs.com/package/angular-google-charts) - Package to display charts, mainly [line chart](https://developers.google.com/chart/interactive/docs/gallery/linechart) that is used to show npm package downloads

# Contributing

Before adding any new feature or a fix, make sure to open an issue first :)

Make sure to use the expected node/npm versions.

```bash
node -v # v14.17.1
npm -v # 6.14.13
```

If you have the wrong versions, I suggest using nvm or volta for node version management.

Clone the project and install dependencies

```bash
git clone https://github.com/bitovi/opensource-analytics-dashboard.git
```

```bash
npm install
```

Create a new branch

```bash
git checkout -b feature/some-feature
```
