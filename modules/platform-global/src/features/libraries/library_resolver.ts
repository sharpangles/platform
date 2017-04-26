import { Feature, FeatureReference } from '../feature';
import { LibraryCapability } from './capabilities/library_capability';
import { Library } from './library';
import { TaskMap, Task } from '../../task_map';
import { ModuleResolutionContext, ModuleLoader } from '../module_loaders/module_loader';

/**
 * Manages resolution of a Library object for a particular module load activity.
 */
export abstract class LibraryResolver<TContext extends ModuleResolutionContext = ModuleResolutionContext> {
    initAsync() {
        return Promise.resolve();
    }

    /**
     * Could filter by name, try-catch an import, etc...
     */
    async tryGetLibraryAsync(moduleLoader: ModuleLoader<TContext>, context: TContext): Promise<Library | undefined> {
        let library = await this._taskMap.ensureOrCreateAsync(context.key, { moduleLoader: moduleLoader, context: context });
        if (!library)
            return;
        this._forEachChildLibrary(context.key, library, (name, lib) => {
            this._taskMap.setResult(name, { moduleLoader: moduleLoader, context: context }, lib);
            this.applyCapabilitiesAsync(name, moduleLoader, context, lib);
        });
        return library;
    }

    private _capabilities = new Map<string, LibraryCapability>();

    registerCapability(capability: LibraryCapability) {
        this._capabilities.set(capability.name, capability);
    }

    async applyCapabilitiesAsync(libraryName: string, moduleLoader: ModuleLoader<TContext>, context: TContext, library: Library): Promise<void> {
        if (!library.capabilityContexts)
            return;
        for (let ctx in library.capabilityContexts) {
            let capability = this._capabilities.get(ctx);
            if (capability)
                await capability.applyAsync(libraryName, library, library.capabilityContexts[ctx], FeatureReference.getFeature<Feature>(capability.featureType));
        }
    }

    private _taskMap = new TaskMap<string, { moduleLoader: ModuleLoader<TContext>, context: TContext }, Library | undefined>((key, source) => new Task<any>(() => this.loadLibraryAsync(source.moduleLoader, source.context)));

    protected abstract loadLibraryAsync(moduleLoader: ModuleLoader<TContext>, context: TContext): Promise<Library | undefined>;

    private _forEachChildLibrary(name: string, library: Library, func: (name: string, lib: Library) => void) {
        func(name, library);
        if (!library.childLibraries)
            return;
        for (let childName in Object.keys(library.childLibraries))
            this._forEachChildLibrary(childName, library.childLibraries[childName], func);
    }
}
