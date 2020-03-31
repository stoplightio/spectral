// Karma configuration
// Generated on Tue Jul 02 2019 17:18:30 GMT+0200 (Central European Summer Time)

module.exports = (config: any) => {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'karma-typescript'],

    // list of files / patterns to load in the browser
    files: ['./karma-jest.ts', './setupKarma.ts', './setupTests.ts', 'src/**/*.ts'],

    // list of files / patterns to exclude
    exclude: ['src/cli/**', 'src/formatters/**', 'src/**/*.jest.test.ts'],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'src/**/*.ts': ['karma-typescript'],
      './karma-jest.ts': ['karma-typescript'],
      './setupKarma.ts': ['karma-typescript'],
      './setupTests.ts': ['karma-typescript'],
    },

    karmaTypescriptConfig: {
      ...require('./tsconfig.karma.json'),
      bundlerOptions: {
        resolve: {
          alias: {
            'node-fetch': require.resolve('./__karma__/fetch'),
          },
        },
        acornOptions: {
          ecmaVersion: 9,
        },
      },
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'karma-typescript'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeHeadless'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,
  });
};
