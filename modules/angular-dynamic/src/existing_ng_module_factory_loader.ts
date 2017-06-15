import { Compiler, Injectable, Optional, NgModuleFactory, NgModuleFactoryLoader, getModuleFactory } from '@angular/core';

/**
 * Relies on modules that are already loaded.
 */
@Injectable()
export class ExistingNgModuleLoader implements NgModuleFactoryLoader {
    load(path: string): Promise<NgModuleFactory<any>> {
        return Promise.resolve(getModuleFactory(path));
    }
}
