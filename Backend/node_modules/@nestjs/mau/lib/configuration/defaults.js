"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultOutDir = exports.defaultConfiguration = void 0;
exports.defaultConfiguration = {
    language: 'ts',
    sourceRoot: 'src',
    collection: '@nestjs/schematics',
    entryFile: 'main',
    exec: 'node',
    projects: {},
    monorepo: false,
    compilerOptions: {
        builder: {
            type: 'tsc',
        },
        webpack: false,
        plugins: [],
        assets: [],
        manualRestart: false,
    },
    generateOptions: {},
};
exports.defaultOutDir = 'dist';
