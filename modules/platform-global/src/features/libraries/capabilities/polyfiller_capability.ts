import { Library } from '../library';
import { LibraryCapability } from './library_capability';
import { Polyfill, Polyfiller } from '../../polyfills/polyfiller';

export interface PolyfillerLibraryContext {
    polyfills: Polyfill[];

    /** If true, the resolution will wait for the references to load, otherwise it will simply trigger them. */
    waitForLoad?: boolean;
}

/**
 * Loads dependencies via the browser module loader.
 */
export class PolyfillerCapability implements LibraryCapability<PolyfillerLibraryContext, Polyfiller> {
    get name(): any { return 'Polyfiller'; }
    get featureType(): any { return Polyfiller; }

    async applyAsync(libraryName: string, library: Library, libraryContext: PolyfillerLibraryContext, feature: Polyfiller): Promise<any> {
        libraryContext.polyfills.map(p => feature.registerPolyfill(p));
        if (libraryContext.waitForLoad)
            await feature.ensureAllAsync();
    }
}
