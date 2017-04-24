import { Feature } from '../Feature';

export interface ModuleResolutionContext {
    key: string;
    parentKey?: string;
}

/**
 * Implements a mechanism to track the loading of dependencies.
 * This wraps, but is not synonymous with, es2015 (static) and es2017+ (dynamic) module loading (or dynamically adding script tags for that matter).
 * It further extends it with the notion of applying platform-level customizations between parent and child libraries.
 */
export abstract class ModuleLoader<TContext extends ModuleResolutionContext = ModuleResolutionContext> extends Feature {
    constructor() {
        super();
        this.resolver = this.onLoadModuleAsync.bind(this);
    }

    async loadModuleAsync(context: TContext): Promise<any> {
        return await this.resolver(context);
    }

    abstract onLoadModuleAsync(context: TContext): Promise<any>;

    resolver: (context: TContext) => Promise<any>;

    /**
     * Allows registering a new resolver in front of the current.  The current will be the 'next' during resolution.
     */
    registerResolver(resolver: (moduleLoader: ModuleLoader<TContext>, context: TContext, next: (context: TContext) => Promise<any>) => Promise<any>) {
        let oldResolver = this.resolver;
        this.resolver = (context: TContext) => resolver(this, context, context => oldResolver(context));
    }
}
