import { rootFeature } from '../../entry_point';
import { Library } from './library';
import { LibraryResolutionContext } from './library_feature';
import { TaskMap, Task } from '../../task_map';
import { ModuleResolutionContext, ModuleLoader } from '../module_loaders/module_loader';

export interface LibraryLoad<TContext extends ModuleResolutionContext = ModuleResolutionContext> {
    libraryModuleLoader: ModuleLoader<LibraryResolutionContext>;
    libraryContext: LibraryResolutionContext;
    moduleLoader: ModuleLoader<TContext>;
    context: TContext;
    next: (context: ModuleResolutionContext) => Promise<any>;
}

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
    async tryGetLibraryAsync(libraryLoad: LibraryLoad<TContext>): Promise<{ library?: Library, module: any }> {
        let result = await this._taskMap.ensureOrCreateAsync(libraryLoad.libraryContext.key, libraryLoad);
        if (!result.library)
            return result.module;
        await this.applyLibraryAsync(libraryLoad, result.library);
        if (result.library.nextLibraryModule)
            return this.tryGetLibraryAsync(libraryLoad);
        return result;
    }

    async applyLibraryAsync(libraryLoad: LibraryLoad<TContext>, library: Library): Promise<void> {
        await this._forEachLibraryAsync(libraryLoad.libraryContext.key, library, async (name, lib) => {
            this._taskMap.setResult(name, libraryLoad, { library: lib, module: <any>undefined });
            await this.applyFeaturesAsync(name, lib);
        });
    }

    async applyFeaturesAsync(libraryName: string, library: Library): Promise<void> {
        if (!library.featureReferences)
            return;
        rootFeature.addFeaturesAsync(library.featureReferences);
    }

    private _taskMap = new TaskMap<string, LibraryLoad<TContext>, { library?: Library, module: any }>((key, source) =>
        new Task<any>(() => this.loadLibraryAsync(source)));

    protected abstract loadLibraryAsync(libraryLoad: LibraryLoad<TContext>): Promise<{ library?: Library, module: any }>;

    private _forEachLibraryAsync(name: string, library: Library, func: (name: string, lib: Library) => Promise<void>) {
        func(name, library);
        if (!library.childLibraries)
            return;
        for (let childName in Object.keys(library.childLibraries))
            this._forEachLibraryAsync(childName, library.childLibraries[childName], func);
    }
}
