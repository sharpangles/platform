import { FeatureReference } from '../feature';
import { ModuleLoader, ModuleResolutionContext } from './module_loader';

export interface CommonJSModuleResolutionContext extends ModuleResolutionContext {
}

export class CommonJSModuleLoader extends ModuleLoader<CommonJSModuleResolutionContext> {
    static create(): FeatureReference {
        return new FeatureReference(CommonJSModuleLoader);
    }

    onLoadModuleAsync(context: CommonJSModuleResolutionContext): Promise<any> {
        return Promise.resolve(require(context.key));
    }
}
// @todo tsconfigpath resolution?

        // constructor(tsconfigPaths?: string[], baseUrl?: string) {
        //     super();
        //     if (!tsconfigPaths || tsconfigPaths.length === 0) {
        //         return;
        //     }
        //     baseUrl = baseUrl || process.cwd();
        //     const path = require('path');
        //     let paths: { [ key: string ]: string[] } = {};
        //     for (let tsconfigPath in tsconfigPaths) {
        //         let tsconfig = require(path.isAbsolute(tsconfigPath) ? tsconfigPath : path.resolve(baseUrl, tsconfigPath));
        //         let tsconfigPathSettings = tsconfig && tsconfig.compilerOptions && tsconfig.compilerOptions.paths;
        //         if (!tsconfigPathSettings) {
        //             continue;
        //         }
        //         for (let attrname in tsconfigPathSettings) {
        //             // For each path in the tsconfig, push its unique values in the array onto a new or existing array for that module.
        //             let existing: string[] = paths.hasOwnProperty(attrname) ? paths[attrname] : (paths[attrname] = []);
        //             existing = existing.concat(tsconfigPathSettings[attrname]).filter((val, ind, self) => self.indexOf(val) === ind);
        //             paths[attrname] = tsconfigPathSettings[attrname];
        //         }
        //     }
        //     require('tsconfig-paths').register({ baseUrl, paths: paths });
        // }
