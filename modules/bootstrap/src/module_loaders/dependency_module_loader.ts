/// <reference path="../__sharpangles.ts" />

namespace __sharpangles {
    export abstract class DependencyModuleLoader {
        registerDependencies(dependencies: { [key: string]: Dependency }): void {}
        abstract loadModuleAsync(module: string): Promise<any>;
    }
}
