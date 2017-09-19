<a name="1.0.0-alpha.7"></a>
# 1.0.0-alpha.7 (2017-09-19)
Minor fix, plus moved commonjs factory loader to specs for now to get rid of static analysis warnings.  Can re-add in separate library later if needed.

<a name="1.0.0-alpha.6"></a>
# 1.0.0-alpha.6 (2017-09-19)
Get stuff working with 'static' dynamic (ie. ng cli with AOT).
In this mode, there is no need to register any specific NgModuleFactoryLoader.
Ng-cli basically transforms your typescript to plug its factories in during AOT.
It discovers components by using the router, so you'll have to add fake (or possibly real) routes.
In the root module, add routes like: { path: 'makeupsomething', loadChildren: '../../relative-path-to/some.module#SomeModule', component: SomeModule }.
Obviously this goes against the grain of what this library is trying to do, but sometimes you want it to run in an ng-cli devops environment, perhaps in anticipation of a better way later that wont cause you to change library code.
- Don't use a @scopename absolute reference in loadChildren, its not supported by ng cli yet.
- The component type is required, so if there are multiple types add multiple paths.  Remember, this is just a hack to make it work in the static analysis culture without changing library code.
- It adds an unfortunate private member access to get the component type, but only when the NgModule attribute is gone (ie. webpack output from the cli).

<a name="1.0.0-alpha.5"></a>
# 1.0.0-alpha.5 (2017-08-30)
Angular 5

<a name="1.0.0-alpha.4"></a>
# 1.0.0-alpha.4 (2017-06-15)
Added more NgModuleFactoryLoaders.
- Existing: Simply wraps getModuleFactory from @angular/core
- Explicit: Use this to register types directly as 'dynamic' (even though you have them statically resolved).  Useful for running tests and samples with webpack/ng-cli.

<a name="1.0.0-alpha.3"></a>
# 1.0.0-alpha.3 (2017-06-14)
State is now supplied in StateChange.

<a name="1.0.0-alpha.2"></a>
# 1.0.0-alpha.2 (2017-06-13)
Export @Control, @State, and @Stateful.

<a name="1.0.0-alpha.1"></a>
# 1.0.0-alpha.1 (2017-06-13)
Removed dependency on angular internal Reflector.

<a name="1.0.0-alpha.0"></a>
# 1.0.0-alpha.0 (2017-04-13)
