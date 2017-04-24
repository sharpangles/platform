import { Feature } from '../feature';
import { Library } from './library';

/**  */
export interface LibraryCapability {
    name: string;
    featureType: any;

    /**
     * @param libraryContext Stored with the remotely-retrieved library.
     */
    applyAsync(library: Library, libraryContext: any, feature: Feature): Promise<any>;
}
