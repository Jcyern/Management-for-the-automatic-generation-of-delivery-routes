import { createSourceFile, forEachChild, isIdentifier, isImportDeclaration, isNoSubstitutionTemplateLiteral, isStringLiteral, } from 'typescript';
import { JSONFile } from '../../utils/json-file.util.js';
import { findNestCliConfigPath, readJsonFile, } from '../../utils/nest-cli-config.util.js';
import { getPackageJsonDependency, } from '../../utils/dependencies.utils.js';
export { findNestCliConfigPath, readJsonFile };
export const MIGRATION_GUIDE_URL = 'https://docs.nestjs.com/migration-guide';
export class UpgradeReport {
    changes = [];
    notes = [];
    warnings = [];
    actions = [];
    change(message) {
        this.changes.push(message);
    }
    note(message) {
        this.notes.push(message);
    }
    warn(message) {
        this.warnings.push(message);
    }
    action(message) {
        this.actions.push(message);
    }
    print(context) {
        const { logger } = context;
        const section = (title, items, bullet, level) => {
            if (items.length === 0) {
                return;
            }
            logger[level]('');
            logger[level](title);
            items.forEach((item) => logger[level](`  ${bullet} ${item}`));
        };
        section('Changes applied:', this.changes, '✔', 'info');
        section('Notes:', this.notes, 'ℹ', 'info');
        section('Please review:', this.warnings, '⚠', 'warn');
        section('Action required:', this.actions, '➜', 'warn');
        logger.info('');
        logger.info(`Full migration guide: ${MIGRATION_GUIDE_URL}`);
    }
}
export function parseMajor(range) {
    if (!range) {
        return null;
    }
    const match = /^\s*(?:[\^~]|>=?|=)?\s*v?(\d+)(?:\.|$|\s|-|x)/.exec(range.trim());
    return match ? Number(match[1]) : null;
}
export function parseMajorMinor(range) {
    if (!range) {
        return null;
    }
    const match = /^\s*(?:[\^~]|>=?|=)?\s*v?(\d+)\.(\d+)/.exec(range.trim());
    return match ? [Number(match[1]), Number(match[2])] : null;
}
export function parseVersion(version) {
    const match = /(\d+)\.(\d+)\.(\d+)/.exec(version);
    return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : [];
}
export function readPackageJson(tree) {
    return readJsonFile(tree, 'package.json');
}
export function readNestCliConfig(tree) {
    const path = findNestCliConfigPath(tree);
    const config = path ? (readJsonFile(tree, path) ?? {}) : {};
    return {
        sourceRoot: config.sourceRoot ?? 'src',
        entryFile: config.entryFile ?? 'main',
        projects: config.projects ?? {},
    };
}
export function removePackageJsonDependency(tree, name) {
    const dependency = getPackageJsonDependency(tree, name);
    if (!dependency) {
        return null;
    }
    const json = new JSONFile(tree, '/package.json');
    json.remove([dependency.type, name]);
    return dependency.type;
}
export function getSourceRoots(tree) {
    const config = readNestCliConfig(tree);
    const roots = new Set([
        config.sourceRoot,
        'src',
        'apps',
        'libs',
        'test',
    ]);
    Object.values(config.projects).forEach((project) => {
        if (project?.sourceRoot) {
            roots.add(project.sourceRoot);
        }
    });
    return [...roots].map((root) => root.replace(/^\.?\//, '').replace(/\/$/, ''));
}
export function isTsSourceFile(path) {
    return path.endsWith('.ts') && !path.endsWith('.d.ts');
}
export function collectSourceFiles(tree, roots) {
    const files = new Set();
    for (const root of roots) {
        tree.getDir(root).visit((path) => {
            if (isTsSourceFile(path) &&
                !path.includes('/node_modules/') &&
                !path.includes('/dist/')) {
                files.add(path);
            }
        });
    }
    return [...files].sort();
}
export function parseSource(path, content) {
    return createSourceFile(path, content, 99, true);
}
export function forEachDescendant(node, visitor) {
    visitor(node);
    forEachChild(node, (child) => forEachDescendant(child, visitor));
}
export function importsAnyOf(source, modules) {
    return source.statements.some((statement) => isImportDeclaration(statement) &&
        isStringLiteral(statement.moduleSpecifier) &&
        modules.includes(statement.moduleSpecifier.text));
}
export function getPropertyName(property) {
    const name = property.name;
    if (!name) {
        return undefined;
    }
    if (isIdentifier(name) ||
        isStringLiteral(name) ||
        isNoSubstitutionTemplateLiteral(name)) {
        return name.text;
    }
    return undefined;
}
export function findProperty(literal, name) {
    return literal.properties.find((property) => getPropertyName(property) === name);
}
export function removePropertyEdit(content, property) {
    const start = property.getFullStart();
    let end = property.getEnd();
    while (end < content.length && /\s/.test(content[end])) {
        end++;
    }
    if (content[end] === ',') {
        end++;
    }
    else {
        end = property.getEnd();
    }
    return { start, end, text: '' };
}
export function applyEdits(content, edits) {
    const sorted = [...edits].sort((a, b) => b.start - a.start);
    let result = content;
    for (const edit of sorted) {
        result = result.slice(0, edit.start) + edit.text + result.slice(edit.end);
    }
    return result;
}
export function quoteOf(node, source) {
    const text = node.getText(source);
    return text.startsWith('"') ? '"' : "'";
}
