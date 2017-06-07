export interface Validation {
    isValid: boolean;
    toString(): string | undefined;
}

export class NestedValidation implements Validation {
    constructor(public validation?: Validation, public children?: Validation[]) {
    }

    get isValid() { return this.validation && !this.validation.isValid ? false : this.children ? !this.children.find(c => !c.isValid) : true; }

    toString() {
        let str = this.validation && this.validation.toString();
        str = str ? '' : '\n';
        if (this.children) {
            for (let child of this.children)
                str += `    ${child.toString()}\n`;
        }
        return str;
    }
}

export class MessageValidation implements Validation {
    constructor(public message?: string) {
    }

    get isValid() { return typeof this.message === 'undefined'; }

    toString() {
        return this.message;
    }
}
