import { Feature, FeatureReference } from '../../feature';
import { rootFeature, RootFeature } from '../../../entry_point';
import { LibraryCapability } from './library_capability';
import { Library } from '../library';

export interface LazyFeatureContext {
    getFeatureReference(): FeatureReference;
}

/**
 * In larger enterprise systems, managing configuration across numerous entry points may require some amount of centralization.
 * Additionally, dynamically injected capabilities may bring their own feature baggage.
 * For example, perhaps there is an angular shared kernel that is shared across many apps.
 * Setting up this configuration is often opinionated and changes based on a variety of bundling scenarios and architectural philosophies.
 * While this configuration could be statically referenced in every endpoint, it would cause our build to traverse all angular, the bootstrapped module, and all their dependencies.
 */
export class LazyFeatureCapability implements LibraryCapability<LazyFeatureContext> {
    get name(): string { return this.constructor.name; }
    get featureType(): any { return RootFeature; }

    applyAsync(libraryName: string, library: Library, libraryContext: LazyFeatureContext, feature: Feature): Promise<any> {
        rootFeature.addFeatureAsync(libraryContext.getFeatureReference());
        return Promise.resolve();
    }
}
