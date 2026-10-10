import { join, strings } from '@angular-devkit/core';
import { apply, chain, filter, mergeWith, move, noop, template, url, } from '@angular-devkit/schematics';
import { basename, parse } from 'path';
import { formatFiles } from '../../utils/format-files.rule.js';
import { normalizeToKebabOrSnakeCase } from '../../utils/formatting.js';
import { DEFAULT_AUTHOR, DEFAULT_DESCRIPTION, DEFAULT_LANGUAGE, DEFAULT_VERSION, } from '../defaults.js';
export function main(options) {
    options.name = normalizeToKebabOrSnakeCase(options.name.toString());
    const path = !options.directory || options.directory === 'undefined'
        ? options.name
        : options.directory;
    options = transform(options);
    return chain([
        mergeWith(generate(options, path)),
        options.format === true ? formatFiles() : noop(),
    ]);
}
function transform(options) {
    const target = Object.assign({}, options);
    target.author = target.author ? target.author : DEFAULT_AUTHOR;
    target.description = target.description
        ? target.description
        : DEFAULT_DESCRIPTION;
    target.language = target.language ? target.language : DEFAULT_LANGUAGE;
    target.name = resolvePackageName(target.name.toString());
    target.version = target.version ? target.version : DEFAULT_VERSION;
    target.type = target.type ?? 'esm';
    target.observe = target.observe ?? false;
    target.specFileSuffix = normalizeToKebabOrSnakeCase(options.specFileSuffix || 'spec');
    target.packageManager =
        !target.packageManager || target.packageManager === 'undefined'
            ? 'npm'
            : target.packageManager;
    target.dependencies = target.dependencies ? target.dependencies : '';
    target.devDependencies = target.devDependencies ? target.devDependencies : '';
    return target;
}
function resolvePackageName(path) {
    const { base: baseFilename, dir: dirname } = parse(path);
    if (baseFilename === '.') {
        return basename(process.cwd());
    }
    if (dirname.match(/^@[^\s]/)) {
        return `${dirname}/${baseFilename}`;
    }
    return baseFilename;
}
function generate(options, path) {
    const templateDir = options.type === 'esm' && options.language === 'ts'
        ? 'ts-esm'
        : options.language;
    return apply(url(join('./files', templateDir)), [
        options.spec
            ? noop()
            : filter((path) => {
                const languageExtension = options.language || 'ts';
                const suffix = `__specFileSuffix__.${languageExtension}`;
                return !path.endsWith(suffix);
            }),
        template({
            ...strings,
            ...options,
        }),
        move(path),
    ]);
}
