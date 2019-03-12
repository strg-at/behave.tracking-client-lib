# STRG.BeHave Tracking Module

Simple event tracking in the browser for the `tracking-api` Service via WebSocket.

## Dependencies

Currently there are no external dependencies.

## ENV Variables

Currently a variable NAMESPACE is necessary with the same value as in the customer config.js.
Example .env File: "NAMESPACE=strgBeHave"

## Development and Build

Modules are usually concatenated and minified by a simple build system using UglifyJS. So all code must be written in ES5 with browser-feature awareness.

ESLint configuration is available using `eslint:recommended`. New files should include `/* eslint-env browser */` in the first line.

ESLint should be set up properly in your IDE or editor, also make sure to use the local installation. You can also call the linter from the shell via npm script:

```
$ npm run lint
```

## API

TODO: insert link to sphinx docs

## Roadmap

### Version 1.0.0
  - Make use of UMD syntax so the module can be included in modern build-environments like Webpack.
  - Refactor module to make unit-tests possible

## Tests

Currently no tests are implemented.

```
npm run test
```

© Copyright 2018, strg.at GmbH.
