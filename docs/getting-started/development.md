# Development

It's nice to see you here. Every contribution is always more than welcome and very appreciated.
The current development process for Spectral might seem to be complicated and make you feel overwhelmed.

We prepared a common list of gotchas and things to keep in mind when writing any code.

## Introduction

Although, it might not be very obvious, Spectral is meant to be run in any ES2017 and above JS environment, therefore there are a few rules you need to be aware of.

One of the main principle is to be very strict on using any Node.js exclusive modules, so if you can help it, avoid using it.
The same applies to globals specific to particular environment, such as fetch in a browser, etc.
In general, Spectral should run in a similar manner regardless of the environment it's executed in.
If you feel like there is really no other way than to use a Node module, i.e. a fs call is needed, you need to make sure to provide an alternative solution for other environments.
Obviously, there are a few exceptions from that rule as for instance CLI usage of Spectral yet that portion of code is only executed in Node.js, 
thus no particular restrictions apply.

Moreover, try our best to make the code integrate well with modern bundlers, such as Webpack or Rollup.js.
If possible, avoid any require or import calls that cannot be determined at build-time. 
While, Node.js will handle such calls just fine during the run-time, Webpack or Rollup.js might have issues with that.

Note, we ship code that makes use of CJS modules, this will change as soon as Node.js brings official of ES modules.    

## Testing

We have a bunch of unit and integration tests.
Most of them are executed in Chrome browser run in headless mode (Karma test runner) and Node.js (Jest test runner).
You need to be aware of limitations that apply.

If you'd like to have a test that can be run in both test runners, you should be avoid using Node.js modules such as fs, and naturally any fs calls.
When you need to read a json file, you can just use import it as a module.
Unless, you are not testing Node.js or browser specific execution path, you should be able to share the tests pretty easily.
You cannot use snapshots or jest.mock, though, but other than these there shouldn't be any significant differences.

Although, sharing tests is usually possible, there are valid cases when you need to write separate tests for each test runner.
To do so, just create a file with `karma.test.ts` suffix or `jest.test.ts` respectively.
A good example of test that would be executed only in Jest, is a test covering CLI mode - something that is obviously missing in a browser.

