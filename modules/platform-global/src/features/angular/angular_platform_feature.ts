import { ModuleLoader } from '../module_loaders/module_loader';
import { Feature, FeatureReference } from '../feature';
import { EntryPoint } from '../../entry_point';

export abstract class AngularPlatformFeature extends Feature {
    /**
     * Denotes an angular app from the provided module type or string module reference.
     * Although a module is directly accepted and may feel more accurate, you should almost always you should use a string to prevent coupling the entrypoint and app builds.
     * The entrypoint capabilities would otherwise not be wired up until the app module and dependencies were already pulled in.
     * @param rootModuleReference
     */
    constructor(public rootModuleReference: string | any) {
        super();
    }

    protected async onInitAsync(entryPoint: EntryPoint) {
        await super.onInitAsync(entryPoint);
        let rootModuleType = typeof this.rootModuleReference === 'string' ? await FeatureReference.getFeature<ModuleLoader>(ModuleLoader).loadModuleAsync({ key: this.rootModuleReference }) : this.rootModuleReference;
        this.bootstrap(rootModuleType);
    }

    protected abstract bootstrap(rootModule: any): void;
}

// import { ModuleLoader } from '../module_loaders/module_loader';
// import { Feature, FeatureReference } from '../feature';
// import { EntryPoint } from '../../entry_point';

// /**
//  * Angular features.
//  */
// export abstract class AngularPlatformFeature extends Feature {
//     constructor(public platformModuleName: string, public entryModuleName: string, public entryModuleExport: string = 'default') {
//         super();
//     }

//     protected async onInitAsync(entryPoint: EntryPoint) {
//         let moduleLoader = FeatureReference.getFeature<ModuleLoader>(ModuleLoader);
//         let platformModule = await moduleLoader.loadModuleAsync({ key: this.platformModuleName });
//         let entryModule = await (<any>moduleLoader.loadModuleAsync({ key: this.entryModuleName }))[this.entryModuleExport];
//         this.bootstrap(platformModule, entryModule);
//     }

//     protected abstract bootstrap(platformModule: any, entryModule: any): void;
// }
