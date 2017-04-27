import { FeatureReference } from '../feature_reference';

/**
 * An interface provided by dependencies that wish to participate in entry point features.
 */
export interface Library {
    featureReferences?: FeatureReference[];

    /**
     * When explicitly set, child libraries are not resolved via module loading.
     * A build process can be used to populate this at compile-time with static dependencies.
     */
    childLibraries?: { [key: string]: Library };
}
