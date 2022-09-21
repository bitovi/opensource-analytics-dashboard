module.exports = {
    maxWorkers: 1,
    collectCoverage: true,
    coverageReporters: ['html', 'json-summary'],
    globals: {
        'ts-jest': {
        allowSyntheticDefaultImports: true,
        },
    },
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
};
