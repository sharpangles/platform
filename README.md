# @sharpangles

Angular for the Enterprise.

Currently, the angular ecosystem is mostly focused on a consumer-facing culture, where small apps and sites are downloaded by a high percentage of unique users and every downloaded bit counts.
Sharpangles is in the beginning stages of offering an alternative ecosystem geared for the future, where 5G and gigabit connections will make static analysis feel like a premature optimization.
Even in the present day, enterprise scenarios rarely care if their consistent user base is caching 500k vs 1MB of javascript, especially when the latter enables them to push new user interface to their users on the fly.
We embrace the dynamic nature of ES6+ where module loading may not always be performed by a statically-anyalizable import statement at the top of a file.
Unfortunately, it touches alot more than just the module loading process.

## What works:
### [@sharpangles/angular-dynamic](https://github.com/sharpangles/platform/tree/master/modules/angular-dynamic)
Dynamic component loading for Angular.  Enables dynamic state and loading capabilities through a set of directives not achievable simply through the use of SystemJS

## What is in progress:

Everything discussed below.  The progress for this lives in separate public but unstable branches until it achieves some initial stable alpha usability.  Much of it is still in a creative phase, although it is starting to solidify.


### Bootstrapping
When dynamic libraries are loaded, they often need a means to inject low-level configuration into the executing environment before they are made available.
A simple example is in loading a library that requires a polyfill.  Since the library is dynamic, the environment knows nothing about the library or the polyfill let alone how and where to load it.
This requires modeling dynamic dependency graphs inside the executing environment.  When the library is loaded, it needs to inject new configuration into features already running in the environment.
Perhaps it appends further configuration into the active SystemJS instance.

Status: The majority of a first workable version is in @sharpangles/platform-* in a WIP branch.

### Libraries and Packaging
Libraries that participate in dynamic capabilities need to expose a variety of endpoints for various use-cases that contain the ability to configure the environment.
Ideally, this means we can still package each use-case into a single minified build output.
However, that output would need a way to inject features into the running environment prior to even being processed by a module loader.
It also means that packaging requires a context for minification and tree-shaking.  Libraries and Entrypoints provide the means to understand and describe this context.

Status: Mostly contained in the 'libraries' feature inside platform-global in a WIP branch.
It will rely on using only simple minifications for now, but ultimately extend into maintaining intermediate varable maps per context to permit cross-dynamic-library minification.

### DevOps
Enabling complex scenarios like this require new approaches to devops.  Dynamic libraries imply a larger ecosystem of code, with numerous overlapping development contexts and rapid switching between them.
The number of potential develop, build and test scenarios grows exponentially, to the point they must be actively monitored.  DevOps can no longer be an imperative sequence of command-line scripts.
It needs to evolve into a declarative operational model of the system, whether that system is a developers machine, a development shop, a build cluster, or perhaps even the executing environment itself.
It doesn't demonize imperative in favor of declarative, it simply separates those approaches into layers.
In the end, the system should be as capable of managing an automated home full of IoT devices just as well as a developers machine.

Status: @sharpangles/ops (still adapting from devops-build) is getting the majority of attention.
