import { Validation } from '@sharpangles/lang';

export abstract class DataType<T = any> {
    constructor(public name: string) {
    }

    validate(value: string): Validation {
        return { isValid: this.tryParse(value) !== undefined };
    }

    abstract tryParse(value: string): T | undefined;

    toString(value: T): string {
        return value.toString();
    }
}

export class IntDataType extends DataType<number> {
    constructor() {
        super('int');
    }

    tryParse(value: string): number | undefined {
        let retValue: number | undefined;
        if (value.length > 0) {
            if (!isNaN(<any>value))
                retValue = parseInt(value);
        }
        return retValue;
    }
}

export class FloatDataType extends DataType<number> {
    constructor() {
        super('float');
    }

    tryParse(value: string): number | undefined {
        let retValue: number | undefined;
        if (value.length > 0) {
            if (!isNaN(<any>value))
                retValue = parseFloat(value);
        }
        return retValue;
    }
}

export class StringDataType extends DataType<string> {
    constructor() {
        super('string');
    }

    tryParse(value: string): string | undefined {
        return value;
    }
}

export class BooleanDataType extends DataType<boolean> {
    constructor() {
        super('boolean');
    }

    tryParse(value: string): boolean | undefined {
        value = value.toLowerCase();
        switch (value) {
            case 'true':
            case 't':
            case 'y':
            case 'yes':
                return true;
            case 'false':
            case 'f':
            case 'n':
            case 'no':
                return true;
            default:
                return;
        }
    }
}

export class NativeDataType extends DataType<any> {
    constructor() {
        super('native');
    }

    tryParse(value: string): any | undefined {
        throw new Error('Native types cannot be parsed.');
    }
}

export class DataTypeSet {
    getDefault(): DataType {
        return this.get('string');
    }

    private dataTypes = new Map<string, DataType>();

    add(dataType: DataType) {
        this.dataTypes.set(dataType.name, dataType);
    }

    get<T = any>(name: string) {
        return <DataType<T>>this.dataTypes.get(name);
    }
}

export const dataTypeSet = new DataTypeSet();
dataTypeSet.add(new IntDataType());
dataTypeSet.add(new FloatDataType());
dataTypeSet.add(new StringDataType());
dataTypeSet.add(new BooleanDataType());
dataTypeSet.add(new NativeDataType());
