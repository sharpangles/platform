import { FeatureReference, Type } from '../feature_reference';

/**
 * An interface provided by dependencies that wish to participate in entry point features.
 */
export interface Library {
    featureReferences?: FeatureReference[];

    /**
     * Sometimes a library requires multiple stages.  This allows such a chain.
     * For example, if configuring a module loader, this may have to occur first because the following library may
     * be included as part of a bundle that would start resolving dependencies that require that configuration.
     */
    nextLibraryModule?: { key: string, resolver?: Type };

    /**
     * When explicitly set, child libraries are not resolved via module loading.
     * A build process can be used to populate this at compile-time with static dependencies.
     */
    childLibraries?: { [key: string]: Library };
}
