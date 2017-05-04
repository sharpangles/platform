import { rootFeature } from '../../entry_point';
import { Library } from './library';
import { TaskMap, Task } from '../../task_map';
import { ModuleResolutionContext, ModuleLoader } from '../module_loaders/module_loader';
import { traverse } from '../../traverse';
import { FeatureReference, Type } from '../feature_reference';

export class LibraryResolutionContext implements ModuleResolutionContext {
    constructor(public originalContext: ModuleResolutionContext) {
        this.key = originalContext.key;
        this.parentKey = originalContext.parentKey;
    }

    key: string;
    parentKey?: string;
}

/**
 * Manages resolution of a Library object for a particular module load activity.
 */
export abstract class LibraryResolver {
    constructor(private preload?: boolean) {
    }

    static libraryResolvers = new Map<any, LibraryResolver>(); // @todo factory

    async resolveAsync(context: ModuleResolutionContext): Promise<Library | undefined>;
    async resolveAsync(key: string): Promise<Library | undefined>;
    async resolveAsync(contextOrKey: ModuleResolutionContext | string): Promise<Library | undefined> {
        if (contextOrKey instanceof LibraryResolutionContext)
            return;
        let context = typeof contextOrKey === 'string' ? this.createLibraryContext(contextOrKey) : contextOrKey;
        return await this.tryGetLibraryAsync(context);
    }

    /**
     * @param context The context for the module that may contain libraries.
     */
    protected async tryGetLibraryAsync(context: ModuleResolutionContext): Promise<Library | undefined> {
        let libContext = context instanceof LibraryResolutionContext ? context : new LibraryResolutionContext(context);
        let library = await this._taskMap.ensureOrCreateAsync(libContext.key, libContext);
        if (!library)
            return;
        await this.applyLibraryAsync(libContext, library);
        return library;
    }

    async applyLibraryAsync(context: ModuleResolutionContext, library: Library): Promise<void> {
        let nexts = this.addDependencies(context, library);
        await Promise.all(nexts.map(next => this.getResolver(next.resolver).tryGetLibraryAsync(this.createLibraryContext(next.key, context))));
    }

    private _taskMap = new TaskMap<string, LibraryResolutionContext, Library | undefined>((key, source) =>
        new Task<any>(() => this.loadLibraryAsync(source)));

    protected abstract loadLibraryAsync(context: LibraryResolutionContext): Promise<Library | undefined>;

    getResolver(type?: Type): LibraryResolver {
        return name ? LibraryResolver.libraryResolvers.get(name) || this : this;
    }

    createLibraryContext(key: string, sourceLoadContext?: ModuleResolutionContext) {
        return { key: key };
    }

    /**
     * Traverses the known libraries to add all dependencies.
     * Returns an array of all discovered nextLibraryModules.
     */
    addDependencies(context: ModuleResolutionContext, library: Library) {
        let nexts: { key: string, resolver?: Type }[] = [];
        let featureReferences: FeatureReference[] = [];
        this.forEachLibrary(context.key, library, (name, lib) => {
            let existing = this._taskMap.tryGetSource(name);
            let ctx = new LibraryResolutionContext(this.createLibraryContext(name, context));
            if (!existing)
                this._taskMap.setResult(name, ctx, lib);
            if (lib.nextLibraryModule) {
                nexts.push(lib.nextLibraryModule);
                if (this.preload)
                    FeatureReference.getFeature<ModuleLoader>(ModuleLoader).loadModuleAsync(ctx); // @todo leaky task
            }
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
