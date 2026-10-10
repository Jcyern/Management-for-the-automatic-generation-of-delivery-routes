import { SchematicContext, Tree } from '@angular-devkit/schematics';
import type { Node, ObjectLiteralElementLike, ObjectLiteralExpression, SourceFile } from 'typescript';
import { findNestCliConfigPath, readJsonFile } from '../../utils/nest-cli-config.util.js';
import { NodeDependencyType } from '../../utils/dependencies.utils.js';
export { findNestCliConfigPath, readJsonFile };
export declare const MIGRATION_GUIDE_URL = "https://docs.nestjs.com/migration-guide";
export interface TextEdit {
    start: number;
    end: number;
    text: string;
}
export declare class UpgradeReport {
    readonly changes: string[];
    readonly notes: string[];
    readonly warnings: string[];
    readonly actions: string[];
    change(message: string): void;
    note(message: string): void;
    warn(message: string): void;
    action(message: string): void;
    print(context: SchematicContext): void;
}
export declare function parseMajor(range: string | undefined | null): number | null;
export declare function parseMajorMinor(range: string | undefined | null): [number, number] | null;
export declare function parseVersion(version: string): number[];
export declare function readPackageJson(tree: Tree): Record<string, any> | null;
export interface NestCliProject {
    type?: string;
    root?: string;
    sourceRoot?: string;
    entryFile?: string;
}
export interface NestCliConfig {
    sourceRoot: string;
    entryFile: string;
    projects: Record<string, NestCliProject>;
}
export declare function readNestCliConfig(tree: Tree): NestCliConfig;
export declare function removePackageJsonDependency(tree: Tree, name: string): NodeDependencyType | null;
export declare function getSourceRoots(tree: Tree): string[];
export declare function isTsSourceFile(path: string): boolean;
export declare function collectSourceFiles(tree: Tree, roots: string[]): string[];
export declare function parseSource(path: string, content: string): SourceFile;
export declare function forEachDescendant(node: Node, visitor: (node: Node) => void): void;
export declare function importsAnyOf(source: SourceFile, modules: string[]): boolean;
export declare function getPropertyName(property: ObjectLiteralElementLike): string | undefined;
export declare function findProperty(literal: ObjectLiteralExpression, name: string): ObjectLiteralElementLike | undefined;
export declare function removePropertyEdit(content: string, property: ObjectLiteralElementLike): TextEdit;
export declare function applyEdits(content: string, edits: TextEdit[]): string;
export declare function quoteOf(node: Node, source: SourceFile): string;
