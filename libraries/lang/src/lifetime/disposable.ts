import 'reflect-metadata';

const disposableMetadataKey = Symbol('Disposable');

export function Disposable() {
  return function (target: Function) {
      Reflect.defineMetadata(disposableMetadataKey, true, target);
  };
}

export function isDisposable(target: any): boolean {
    return !!Reflect.getMetadata(disposableMetadataKey, target);
}

export interface Disposable {
    dispose(): void;
}
