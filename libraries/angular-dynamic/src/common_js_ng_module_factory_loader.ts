import { Compiler, Injectable, Optional, NgModuleFactory, NgModuleFactoryLoader } from '@angular/core';

const _SEPARATOR = '#';

const FACTORY_CLASS_SUFFIX = 'NgFactory';

/**
 * Configuration for CommonJsNgModuleLoader.
 * token.
 *
 * @experimental
 */
export abstract class CommonJsNgModuleLoaderConfig {
  /**
   * Prefix to add when computing the name of the factory module for a given module name.
   */
  factoryPathPrefix: string;

  /**
   * Suffix to add when computing the name of the factory module for a given module name.
   */
  factoryPathSuffix: string;
}

const DEFAULT_CONFIG: CommonJsNgModuleLoaderConfig = {
  factoryPathPrefix: '',
  factoryPathSuffix: '.ngfactory',
};

/**
 * NgModuleFactoryLoader that uses CommonJs to load NgModuleFactory
 * @experimental
 */
@Injectable()
export class CommonJsNgModuleLoader implements NgModuleFactoryLoader {
  private _config: CommonJsNgModuleLoaderConfig;

  constructor(private _compiler: Compiler, @Optional() config?: CommonJsNgModuleLoaderConfig) {
    this._config = config || DEFAULT_CONFIG;
  }

  load(path: string): Promise<NgModuleFactory<any>> {
    const offlineMode = this._compiler instanceof Compiler;
    return offlineMode ? this.loadFactory(path) : this.loadAndCompile(path);
  }

  private loadAndCompile(path: string): Promise<NgModuleFactory<any>> {
    let [module, exportName] = path.split(_SEPARATOR);
    if (exportName === undefined) {
      exportName = 'default';
    }

    let type = require(module)[exportName];
    return this._compiler.compileModuleAsync(checkNotEmpty(type, module, exportName));
  }

  private loadFactory(path: string): Promise<NgModuleFactory<any>> {
    let [module, exportName] = path.split(_SEPARATOR);
    let factoryClassSuffix = FACTORY_CLASS_SUFFIX;
    if (exportName === undefined) {
      exportName = 'default';
      factoryClassSuffix = '';
    }

    let factory = require(this._config.factoryPathPrefix + module + this._config.factoryPathSuffix)[exportName + factoryClassSuffix];
    return checkNotEmpty(factory, module, exportName);
  }
}

function checkNotEmpty(value: any, modulePath: string, exportName: string): any {
  if (!value) {
    throw new Error(`Cannot find '${exportName}' in '${modulePath}'`);
  }
  return value;
}