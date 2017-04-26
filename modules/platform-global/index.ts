export { EntryPoint } from './src/entry_point';
export { Task, TaskMap } from './src/task_map';

export { Feature, FeatureReference } from './src/features/feature';

export { Library } from './src/features/libraries/library';
export { LibraryFeature } from './src/features/libraries/library_feature';
export { ImportingLibraryResolver } from './src/features/libraries/importing_library_resolver';
export { LibraryResolver } from './src/features/libraries/library_resolver';

export { ModuleLoaderCapability } from './src/features/libraries/capabilities/module_loader_capability';
export { BrowserModuleLoaderCapability, BrowserLibraryContext } from './src/features/libraries/capabilities/browser_module_loader_capability';
export { LibraryCapability } from './src/features/libraries/capabilities/library_capability';
export { PolyfillerCapability, PolyfillerLibraryContext } from './src/features/libraries/capabilities/polyfiller_capability';
export { SystemJSModuleLoaderConfigCapability, SystemJSLibraryContext } from './src/features/libraries/capabilities/systemjs_module_loader_config_capability';
export { LazyFeatureCapability, LazyFeatureContext } from './src/features/libraries/capabilities/lazy_feature_capability';

export { AngularPlatformBrowserFeature } from './src/features/angular/angular_platform_browser_feature';
