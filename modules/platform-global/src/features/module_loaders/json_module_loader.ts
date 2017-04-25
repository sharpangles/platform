import { ModuleLoader, ModuleResolutionContext } from './module_loader';

/**
 * A module loader that requests the url-endpoint for json.
 * The module returned will have its default set to the json value returned.
 * By supporting json-only, no code is ever executed.
 * This is useful when modules are just data and might be from an untrusted source.
 * A use-case might be to load the library for the library feature to validate before executing code.
 */
export class JsonModuleLoader extends ModuleLoader {
    onLoadModuleAsync(context: ModuleResolutionContext): Promise<any> {
        // let xhr = new XMLHttpRequest();
        throw 'Not implemented';
    }
}
