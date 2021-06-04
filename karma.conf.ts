// Karma configuration
// Generated on Tue Jul 02 2019 17:18:30 GMT+0200 (Central European Summer Time)

import { Config } from 'karma';
import * as path from 'path';
import * as os from 'os';

module.exports = (config: Config): void => {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'webpack'],

    // list of files / patterns to load in the browser
    files: [
      { pattern: './__karma__/jest.ts' },
      { pattern: './setupKarma.ts' },
      { pattern: 'src/**/*.ts', watched: false },
    ],

    // list of files / patterns to exclude
    exclude: ['src/cli/**', 'src/formatters/**', 'src/**/*.jest.test.ts'],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'src/{formats,functions,guards,meta,parsers,resolvers,ruleset,rulesets,runner,types,utils}/**/*.{js,ts,json}': [
        'webpack',
      ],
      './__karma__/**/*.ts': ['webpack'],
      './setupKarma.ts': ['webpack'],
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

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

    // @ts-expect-error: non-standard
    webpack: {
      mode: 'development',
      output: {
        filename: '[name].js',
        path: path.join(os.tmpdir(), '_karma_webpack_') + Math.floor(Math.random() * 1000000),
      },
      stats: 'minimal',
      watch: false,
      module: {
        rules: [
          {
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: /node_modules/,
          },
        ],
      },
      resolve: {
        extensions: ['.ts', '.js'],
        alias: {
          nock: false,
          jest: require.resolve('jest-mock'),
        },
        fallback: {
          fs: require.resolve('./__karma__/fs.mjs'),
          path: require.resolve('@stoplight/path'),
          process: false,
          nock: false,
          util: false,
          stream: false,
          assert: false,
          url: false,
        },
      },
      optimization: {
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          minSize: 0,
          cacheGroups: {
            commons: {
              name: 'commons',
              chunks: 'initial',
              minChunks: 1,
            },
          },
        },
      },
      plugins: [
        new (require('webpack') as any).ProvidePlugin({
          test: require.resolve('./__karma__/jest.ts'),
          expect: require.resolve('expect'),
        }),
      ],
    },
  });
};
