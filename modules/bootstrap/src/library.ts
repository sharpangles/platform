/// <reference path="./library_capability.ts" />

namespace __sharpangles {
    /**
     *
     */
    export interface Library {
        name: string;

        getLibraryFeatures(libraryCapability: LibraryCapability, referencingLibrary: Library): any;

        /**
         * When explicitly set, child libraries are not resolved via module loading.
         * A build process can be used to populate this at compile-time with static dependencies.
         */
        childLibraries?: { [key: string]: Library };
    }
}
