#!/usr/bin/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export interface MainOptions {
    args: string[];
    stdout?: NodeJS.WritableStream;
    stderr?: NodeJS.WritableStream;
}
export declare function main({ args, stdout, stderr, }: MainOptions): Promise<0 | 1>;
