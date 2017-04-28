// import { LibraryResolver } from './library_resolver';
// import { Library } from './library';
// import { ModuleResolutionContext, ModuleLoader } from '../module_loaders/module_loader';

// /**
//  * Resolves a chain of libraries in order.
//  */
// export class StagedLibraryResolver<TContext extends ModuleResolutionContext = ModuleResolutionContext> extends LibraryResolver<TContext> {
//     constructor(public libraryResolvers: LibraryResolver<TContext>[]) {
//         super();
//     }

//     protected async loadLibraryAsync(libraryLoad: LibraryLoad<TContext>): Promise<{ library?: Library, module: any }> {
//         let last: any = undefined;
//         for (let libraryResolver of this.libraryResolvers)
//             last = await libraryResolver.tryGetLibraryAsync(moduleLoader, context, next);
//         if (!last.module)
//             last.module = await next(context);
//         return last;
//     }
// }
