# @sharpangles/platform-global

## Bootstrapping global environments

### Simplify entry points across browsers, servers, tests, and platforms.

#### Entry points:
Entry points are a simple drop-in to start your app.  Their purpose is to share common configuration behaviors across packages.
A browser app might have entry points for server (node) testing, browser (karma/protractor) testing, local development,
development deployment, and production deployment.  The common build behavior is to output a single minimal entrypoint for each scenario.
The library publishes the typescript to simplify this build process.

#### Features:
Features inject asynchronous bootstrapping capabilities into your app.
A library of available features enables quick setups for a variety of module loaders, dynamic library loaders, test environments, polyfills, and platforms.
Features can have dependency chains between them, built at compile-time or discovered from available features at runtime.

#### Usage
Module loading is still a long way off.  Back in the day we dropped in a script tag.  In es2015 we get real modules with imports and exports.
It's still not until es2017 when we may see imperative dynamic imports (```const stuff = await import('stuff')```).
Even when we get all these capabilities, there are other potential complexities, such as adding custom hooks to these features.
For this reason, the library is built around the premise that it will usually be a global script inclusion.
It is still written using module syntax instead of global namespaces, and as such the build must use a mechanism that supports global, such as UMD.
TypeScript does not have [UMD global fallback](https://github.com/Microsoft/TypeScript/issues/8436), so either one of the provided bundles or a tool like rollup should be used.
Of course, you can still use it as a module if a module loader is natively present.

#### tslib
When using platform-global in the global scope, tslib requires some special consideration.
- If you intend to support modules that use noEmitHelpers, you can simply include tslib.js or tslib.es6.js in the build at global scope.  This will cover all module and global usage.
  - platform-global.globaltslib.umd.js includes tslib.js.
- If you intend to support modules that use importHelpers, you can use the special umd distribution of tslib here, or compile your own by building tslib.es6.js into umd.
  - tslib.umd.js is provided (which is es5-safe).  platform-global.moduletslib.umd.js combines tslib.umd.js and platform-global.umd.js
- Nothing special is required for modules that emit their own tslib polyfills (the default behavior), however this creates a great deal of duplication.
  - platform-global.defaulttslib.umd.js has no pollution.
- If you want to support all scenarios, you can use the noEmitHelpers approach and set 'global.tslib = global' immediately after it.
  - platform-global.all.umd.js does this for you.

The builds provide a simple way to get started.
The recommended approach is to build single file entrypoints directly from the npm-published typescript, using the last option.
See build.js for a simple way to compose tslib per the above options.

### Single-file entrypoints
This library publishes the typescript directly with the package to enable simpler and quicker builds for single-file entries.  See the sample web app for an example.
