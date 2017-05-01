import { rootFeature } from '../../entry_point';
import { Library } from './library';
import { LibraryResolutionContext } from './library_feature';
import { TaskMap, Task } from '../../task_map';
import { ModuleResolutionContext, ModuleLoader } from '../module_loaders/module_loader';
import { traverse } from '../../traverse';
import { FeatureReference } from '../feature_reference';

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
    /**
     * @param loadModuleForLibrary Can infer how to load a module given a library context.  If set, libraries cause their modules to preload.
     */
    constructor(public loadModuleForLibrary?: (libraryContext: ModuleResolutionContext) => Promise<any>) {
    }

    /**
     * Could filter by name, try-catch an import, etc...
     */
    async tryGetLibraryAsync(libraryLoad: LibraryLoad<TContext>): Promise<{ library?: Library, module: any }> {
        let result = await this._taskMap.ensureOrCreateAsync(libraryLoad.libraryContext.key, libraryLoad);
        if (!result.library)
            return result.module;
        await this.applyLibraryAsync(libraryLoad, result.library);
        return result;
    }

    async applyLibraryAsync(libraryLoad: LibraryLoad<TContext>, library: Library): Promise<void> {
        let nexts = this.addDependencies(libraryLoad, library);
        await nexts.map(async n => {
            await this.tryGetLibraryAsync(<LibraryLoad<TContext>>{
                libraryModuleLoader: libraryLoad.libraryModuleLoader,
                libraryContext: { key: n },
                moduleLoader: libraryLoad.moduleLoader,
                context: libraryLoad.libraryContext,
                next: this.loadModuleForLibrary ? ((context) => (<any>this.loadModuleForLibrary)(context)) : undefined
            });
            if (this.loadModuleForLibrary)
                this.loadModuleForLibrary(libraryLoad.libraryContext); // trigger preload
        });
    }

    private _taskMap = new TaskMap<string, LibraryLoad<TContext>, { library?: Library, module: any }>((key, source) =>
        new Task<any>(() => this.loadLibraryAsync(source)));

    protected abstract loadLibraryAsync(libraryLoad: LibraryLoad<TContext>): Promise<{ library?: Library, module: any }>;

    /**
     * Traverses the known libraries to add all dependencies.
     * Returns an array of all discovered nextLibraryModules.
     */
    addDependencies(libraryLoad: LibraryLoad<TContext>, library: Library): string[] {
        let nexts: string[] = [];
        let featureReferences: FeatureReference[] = [];
        this.forEachLibrary(libraryLoad.libraryContext.key, library, (name, lib) => {
            if (this._taskMap.tryGetSource(name))
                return;
            this._taskMap.setResult(name, libraryLoad, { library: lib, module: <any>undefined });
            if (lib.nextLibraryModule)
                nexts.push(lib.nextLibraryModule);
            if (lib.featureReferences)
                featureReferences.push(...lib.featureReferences);
        });
        if (featureReferences.length > 0)
            rootFeature.addFeatures(featureReferences);
        return nexts;
    }

    /**
     * Features handle dependency graphs, not libraries.  Therefore this simply produces a flat list of all libraries.
     */
    forEachLibrary(name: string, library: Library, func: (name: string, lib: Library) => any) {
        let libraries: [string, Library][] = [];
        traverse<[string, Library]>([name, library], l => Object.keys(l[1].childLibraries).map(n => <[string, Library]>[n, (<any>l[1].childLibraries)[n]]), f => libraries.push(f));
        return libraries.map(l => func(l[0], l[1]));
    }
}
