import { Feature } from '../../feature';
import { Library } from '../library';

/**  */
export interface LibraryCapability<TLibraryContext = any, TFeature extends Feature = Feature> {
    name: string;

    /**
     * The feature type (TFeature).
     */
    featureType: any;

    /**
     * @param libraryContext Stored with the remotely-retrieved library.
     */
    applyAsync(libraryName: string, library: Library, libraryContext: TLibraryContext, feature: TFeature): Promise<any>;
}
