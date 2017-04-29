import { rootFeature } from '../../entry_point';
import { Library } from './library';
import { LibraryResolutionContext } from './library_feature';
import { TaskMap, Task } from '../../task_map';
import { ModuleResolutionContext, ModuleLoader } from '../module_loaders/module_loader';
import { traverse } from '../../traverse';

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
        await Promise.all(this.forEachLibrary(libraryLoad.libraryContext.key, library, async (name, lib) => {
            if (this._taskMap.tryGetSource(name))
                return;
            this._taskMap.setResult(name, libraryLoad, { library: lib, module: <any>undefined });
            await this.applyFeaturesAsync(name, lib);
        }));
    }

    async applyFeaturesAsync(libraryName: string, library: Library): Promise<void> {
        if (!library.featureReferences)
            return;
        rootFeature.addFeaturesAsync(library.featureReferences);
    }

    private _taskMap = new TaskMap<string, LibraryLoad<TContext>, { library?: Library, module: any }>((key, source) =>
        new Task<any>(() => this.loadLibraryAsync(source)));

    protected abstract loadLibraryAsync(libraryLoad: LibraryLoad<TContext>): Promise<{ library?: Library, module: any }>;

    /**
     * Features handle dependency graphs, not libraries.  Therefore this simply produces a flat list of all libraries.
     */
    forEachLibrary(name: string, library: Library, func: (name: string, lib: Library) => any) {
        let libraries: [string, Library][] = [];
        traverse<[string, Library]>([name, library], l => Object.keys(l[1].childLibraries).map(n => <[string, Library]>[n, (<any>l[1].childLibraries)[n]]), f => libraries.push(f));
        return libraries.map(l => func(l[0], l[1]));
    }
}
