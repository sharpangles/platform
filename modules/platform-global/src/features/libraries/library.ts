import { Feature } from '../feature';
import { LibraryCapabilityContext } from './library_context';

export interface Library {
    capabilityContexts?: { [capabilityName: string]: any };

    /**
     * When explicitly set, child libraries are not resolved via module loading.
     * A build process can be used to populate this at compile-time with static dependencies.
     */
    childLibraries?: { [key: string]: Library };
}
