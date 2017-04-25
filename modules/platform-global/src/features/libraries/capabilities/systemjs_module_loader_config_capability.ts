import { Library } from '../library';
import { ModuleLoaderCapability } from './module_loader_capability';
import { SystemJSModuleLoader, SystemJSModuleResolutionContext } from '../../module_loaders/systemjs_module_loader';

export interface SystemJSLibraryContext {
    /** Configuration to merge into SystemJS. */
    systemConfig?: { [key: string]: any };

    /** A shallow-merge of the map configuration using the library name. */
    systemMapConfig?: { [key: string]: any };

    /** A shallow-merge of the package configuration using the library name. */
    systemPackageConfig?: { [key: string]: any };
}

/**
 * Allows libraries to affect configuration of systemjs for their dependencies.
 */
export class SystemJSModuleLoaderConfigCapability extends ModuleLoaderCapability<SystemJSModuleLoader, SystemJSLibraryContext, SystemJSModuleResolutionContext> {
    get name(): any { return 'SystemJSModuleLoaderConfigCapability'; }
    get featureType(): any { return SystemJSModuleLoader; }

    resolve(libraryName: string, library: Library, libraryContext: SystemJSLibraryContext, feature: SystemJSModuleLoader, resolutionContext: SystemJSModuleResolutionContext, next: (context: SystemJSModuleResolutionContext) => Promise<any>): Promise<any> {
        if (libraryContext.systemConfig)
            System.config(libraryContext.systemConfig);
        let config = { map: <{ [key: string]: string }>{}, packages: <{ [key: string]: any }>{}, paths: {} };
        System.config(config);
        if (libraryContext.systemMapConfig)
            this._writeConfig(config.packages, libraryName, libraryContext.systemMapConfig);
        if (libraryContext.systemPackageConfig)
            this._writeConfig(config.packages, libraryName, libraryContext.systemPackageConfig);
        return Promise.resolve();
    }

    private _writeConfig(target: any, name: string, config: { [key: string]: any }) {
        if (!target[name])
            target[name] = {};
        for (let key of Object.keys(config))
            target[name][key] = (<any>config)[key];
    }
}
