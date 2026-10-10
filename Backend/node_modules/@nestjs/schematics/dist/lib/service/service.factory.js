import { join, strings } from '@angular-devkit/core';
import { apply, branchAndMerge, chain, filter, mergeWith, move, noop, SchematicsException, template, url, } from '@angular-devkit/schematics';
import { formatFiles } from '../../utils/format-files.rule.js';
import { normalizeToKebabOrSnakeCase } from '../../utils/formatting.js';
import { ModuleDeclarator, } from '../../utils/module.declarator.js';
import { ModuleFinder } from '../../utils/module.finder.js';
import { NameParser } from '../../utils/name.parser.js';
import { isEsmProject, mergeSourceRoot, } from '../../utils/source-root.helpers.js';
function isNullOrUndefined(value) {
    return value === null || value === undefined;
}
export function main(options) {
    options = transform(options);
    return (tree, context) => {
        options.isEsm = isEsmProject(tree);
        return branchAndMerge(chain([
            mergeSourceRoot(options),
            addDeclarationToModule(options),
            mergeWith(generate(options)),
            options.format === true ? formatFiles() : noop(),
        ]))(tree, context);
    };
}
function transform(source) {
    const target = Object.assign({}, source);
    target.metadata = 'providers';
    target.type = 'service';
    if (isNullOrUndefined(target.name)) {
        throw new SchematicsException('Option (name) is required.');
    }
    const location = new NameParser().parse(target);
    target.name = normalizeToKebabOrSnakeCase(location.name);
    target.path = normalizeToKebabOrSnakeCase(location.path);
    target.language = target.language !== undefined ? target.language : 'ts';
    target.specFileSuffix = normalizeToKebabOrSnakeCase(source.specFileSuffix || 'spec');
    target.path = target.flat
        ? target.path
        : join(target.path, target.name);
    return target;
}
function generate(options) {
    return (context) => apply(url(join('./files', options.language)), [
        options.spec
            ? noop()
            : filter((path) => {
                const languageExtension = options.language || 'ts';
                const suffix = `.__specFileSuffix__.${languageExtension}`;
                return !path.endsWith(suffix);
            }),
        template({
            ...strings,
            ...options,
        }),
        move(options.path),
    ])(context);
}
function addDeclarationToModule(options) {
    return (tree) => {
        if (options.skipImport !== undefined && options.skipImport) {
            return tree;
        }
        options.module =
            new ModuleFinder(tree).find({
                name: options.name,
                path: options.path,
            }) ?? undefined;
        if (!options.module) {
            return tree;
        }
        const content = tree.read(options.module).toString();
        const declarator = new ModuleDeclarator();
        tree.overwrite(options.module, declarator.declare(content, {
            ...options,
            isEsm: isEsmProject(tree),
        }));
        return tree;
    };
}
