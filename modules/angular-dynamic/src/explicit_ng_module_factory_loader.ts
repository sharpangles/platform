import { Compiler, Injectable, NgModuleFactory, NgModuleFactoryLoader, Type } from '@angular/core';


/**
 * Explicitly set the module and its module id.
 */
@Injectable()
export class ExplicitNgModuleLoader implements NgModuleFactoryLoader {
    register(path: string, moduleType: Type<any>) {
        this.registered.set(path, moduleType);
    }

    private registered = new Map<string, Type<any>>();

    constructor(private _compiler: Compiler) {
    }

    load(path: string): Promise<NgModuleFactory<any>> {
        return this.loadAndCompile(path);
    }

    private loadAndCompile(path: string): Promise<NgModuleFactory<any>> {
        let type = this.registered.get(path);
        if (!type)
            throw new Error('Module not registered.');
        return this._compiler.compileModuleAsync(type);
    }
}
