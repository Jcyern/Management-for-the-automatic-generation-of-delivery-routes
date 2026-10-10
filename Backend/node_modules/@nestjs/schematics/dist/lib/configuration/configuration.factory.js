import { join, strings } from '@angular-devkit/core';
import { apply, mergeWith, move, template, url, } from '@angular-devkit/schematics';
import { DEFAULT_LANGUAGE } from '../defaults.js';
export function main(options) {
    return mergeWith(generate(transform(options)));
}
function transform(options) {
    const target = Object.assign({}, options);
    target.language =
        target.language !== undefined ? target.language : DEFAULT_LANGUAGE;
    target.collection =
        target.collection !== undefined ? target.collection : '@nestjs/schematics';
    return target;
}
function generate(options) {
    const projectOrPath = options.project ?? '.';
    return apply(url(join('./files', options.language)), [
        template({
            ...strings,
            ...options,
        }),
        move(projectOrPath),
    ]);
}
