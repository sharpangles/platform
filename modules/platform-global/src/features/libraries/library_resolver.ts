import { rootFeature } from '../../entry_point';
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
    async tryGetLibraryAsync(moduleLoader: ModuleLoader<TContext>, context: TContext, next: (context: ModuleResolutionContext) => Promise<any>): Promise<{ library?: Library, module: any }> {
        let result = await this._taskMap.ensureOrCreateAsync(context.key, { moduleLoader: moduleLoader, context: context, next: next });
        if (!result.library)
            return result.module;
        this._forEachLibrary(context.key, result.library, (name, lib) => {
            this._taskMap.setResult(name, { moduleLoader: moduleLoader, context: context, next: <any>undefined }, { library: lib, module: <any>undefined });
            this.applyFeaturesAsync(name, moduleLoader, context, lib);
        });
        return result;
    }

    async applyFeaturesAsync(libraryName: string, moduleLoader: ModuleLoader<TContext>, context: TContext, library: Library): Promise<void> {
        if (!library.featureReferences)
            return;
        rootFeature.addFeaturesAsync(library.featureReferences);
    }

    private _taskMap = new TaskMap<string, { moduleLoader: ModuleLoader<TContext>, context: TContext, next: (context: ModuleResolutionContext) => Promise<any> }, { library?: Library, module: any }>((key, source) =>
        new Task<any>(() => this.loadLibraryAsync(source.moduleLoader, source.context, source.next)));

    protected abstract loadLibraryAsync(moduleLoader: ModuleLoader<TContext>, context: TContext, next: (context: ModuleResolutionContext) => Promise<any>): Promise<{ library?: Library, module: any }>;

    private _forEachLibrary(name: string, library: Library, func: (name: string, lib: Library) => void) {
        func(name, library);
        if (!library.childLibraries)
            return;
        for (let childName in Object.keys(library.childLibraries))
            this._forEachLibrary(childName, library.childLibraries[childName], func);
    }
}
