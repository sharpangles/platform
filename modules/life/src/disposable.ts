const disposableMetadataKey = Symbol('Disposable');

export function Disposable() {
  return function (target: Function) {
      (<any>Reflect).defineMetadata(disposableMetadataKey, true, target);
  };
}

export function isDisposable(target: any): boolean {
    return !!(<any>Reflect).getMetadata(disposableMetadataKey, target);
}

export interface Disposable {
    dispose(): void;
}
