module.exports = {
	// source: https://github.com/thymikee/jest-preset-angular#configuration
	// 'jest-preset-angular' is normally configured through '@angular-builders/jest' cli builder
	// but to allow for using jest-runner, it needs to be setup in base jest.config.js
	preset: 'jest-preset-angular',
	setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
	globalSetup: 'jest-preset-angular/global-setup',
	testEnvironment: 'jsdom',
	maxWorkers: 1,
	collectCoverage: true,
	coverageReporters: ['html', 'json-summary'],
	globals: {
		'ts-jest': {
			tsconfig: 'tsconfig.spec.json',
			// required to allow for babel-jest on js files
			allowSyntheticDefaultImports: true,
		},
	},
	transform: {
		'^.+\\.js$': 'babel-jest',
	},
};
