/* tslint:disable */
/* eslint-disable */

export class BinaryImageConverter {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    init(): void;
    static new_with_string(params: string): BinaryImageConverter;
    progress(): number;
    tick(): boolean;
}

export class ColorImageConverter {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    init(): void;
    static new_with_string(params: string): ColorImageConverter;
    progress(): number;
    tick(): boolean;
}

export function main(): void;
