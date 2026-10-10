import { normalizeToKebabOrSnakeCase } from '../utils/formatting.js';
export class SchematicOption {
    name;
    value;
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
    get normalizedName() {
        return normalizeToKebabOrSnakeCase(this.name);
    }
    toCommandString() {
        if (typeof this.value === 'string') {
            if (this.name === 'name') {
                return `--${this.normalizedName}=${this.format()}`;
            }
            else if (this.name === 'version' || this.name === 'path') {
                return `--${this.normalizedName}=${this.value}`;
            }
            else {
                return `--${this.normalizedName}="${this.value}"`;
            }
        }
        else if (typeof this.value === 'boolean') {
            const str = this.normalizedName;
            // Must stay `=false` rather than `--no-<flag>`: schematics-cli parses
            // with parseArgs under `allowNegative`, which turns `--no-x` into `x`
            // with no value and then coerces it to true — inverting the option.
            return this.value ? `--${str}` : `--${str}=false`;
        }
        else {
            return `--${this.normalizedName}=${this.value}`;
        }
    }
    format() {
        return normalizeToKebabOrSnakeCase(this.value)
            .split('')
            .reduce((content, char) => {
            if (char === '(' || char === ')' || char === '[' || char === ']') {
                return `${content}\\${char}`;
            }
            return `${content}${char}`;
        }, '');
    }
}
