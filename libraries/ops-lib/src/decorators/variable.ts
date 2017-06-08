import { DataType, dataTypeSet } from './data_type';
import 'reflect-metadata';

const variableMetadataKey = Symbol('Variable');

export interface VariableConfig {
    dataType?: string | DataType;
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
        dataType: config.dataType || dataTypeSet.getDefault(),
        displayName: config.displayName || propertyKey,
        description: config.description
    };
}
