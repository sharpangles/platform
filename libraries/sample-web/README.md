# @sharpangles/sample-web

## A sample web app that uses dynamic dependencies

This app demonstrates one of many ways to put together a dynamic web app.

### Building an endpoint
tsconfig.entrypoint.json builds its own custom_entry\_point.ts directly referencing @sharpangles/bootstrap typescript.
The output includes the tslib polyfills globally, so no other dependencies will ever need to worry about these helpers and can remove them from their builds.
This setup also gives us the maximum amount of minification for a single global library since we will never need to reference other external types, except for the method call to dynamically load a module.

todo: pre-pack other polyfills as well (systemjs)


### Dependencies.ts
This provides our child module configurations.  It may seem unecessary, since we could just configure the module loader (systemjs in this case) directly in our entrypoint.
There is nothing wrong with choosing this approach, but flowing through dependencies.ts allows us to stay in the same culture of multi-environment, multi-moduleloader configuration provided by the bootstrapper.
It does not cause any extra requests, since it will be bundled with the pre-loaded static app.