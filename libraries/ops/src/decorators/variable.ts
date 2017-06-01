import 'reflect-metadata';

const variableMetadataKey = Symbol('Variable');

export interface VariableConfig {
    displayName?: string;
    description?: string;
}

/** Exposes a value to an editor. */
export function Variable(config?: VariableConfig) {
    return Reflect.metadata(variableMetadataKey, config || {});
}

export function getVariable(target: any, propertyKey: string): VariableConfig | undefined {
    let config = Reflect.getMetadata(variableMetadataKey, target, propertyKey);
    return <VariableConfig>{
        displayName: config.displayName || propertyKey,
        description: config.description
    };
}
