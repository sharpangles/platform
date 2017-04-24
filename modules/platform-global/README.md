# @sharpangles/platform-global

## Bootstrapping global environments

### Simplify entry points across browsers, servers, tests, and platforms.

#### Entry points:
Entry points are a single call starts your app.  Their purpose is to share common configuration behaviors across packages.
A browser app might have entry points for server (node) testing, browser (karma/protractor) testing, local development,
development deployment, and production deployment.  The common build behavior is to output a single minimal entrypoint for each scenario.
The library publishes the typescript to simplify this build process.

#### Features:
Features inject asynchronous bootstrapping capabilities into your app.
A library of available features enables quick setups for a variety of module loaders, test environments, polyfills, and platforms.
Features can have dependency chains between them, built at compile-time or discovered from available features at runtime.

#### Usage
Module loading is still a long way off.  Back in the day we dropped in a script tag.  In es2015 we get real modules with imports and exports.
It's still not until es2017 when we may see imperative dynamic imports (```const stuff = await import('stuff')```).
Even when we get all these capabilities, there are other potential complexities, such as adding custom hooks to these features.
For this reason, the library is built around the premise that it will usually be a global script inclusion.
It is still written using module syntax instead of global namespaces, and as such the build must use a mechanism that supports global, such as UMD.
TypeScript does not have [UMD global fallback](https://github.com/Microsoft/TypeScript/issues/8436), so either one of the provided bundles or a tool like rollup should be used.
Of course, you can still use it as a module if a module loader is natively present.
