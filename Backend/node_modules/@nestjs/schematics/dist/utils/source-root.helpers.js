import { join, normalize } from '@angular-devkit/core';
import { DEFAULT_PATH_NAME } from '../lib/defaults.js';
export function isEsmProject(host) {
    const packageJsonPath = 'package.json';
    const buffer = host.read(packageJsonPath);
    if (!buffer) {
        return false;
    }
    try {
        const packageJson = JSON.parse(buffer.toString());
        return packageJson.type === 'module';
    }
    catch {
        return false;
    }
}
export function isInRootDirectory(host, extraFiles = []) {
    const files = ['nest-cli.json', 'nest.json'].concat(extraFiles || []);
    return files.map((file) => host.exists(file)).some((isPresent) => isPresent);
}
export function mergeSourceRoot(options) {
    return (host) => {
        const isInRoot = isInRootDirectory(host, ['tsconfig.json', 'package.json']);
        if (!isInRoot) {
            return host;
        }
        const defaultSourceRoot = options.sourceRoot !== undefined ? options.sourceRoot : DEFAULT_PATH_NAME;
        options.path =
            options.path !== undefined
                ? join(normalize(defaultSourceRoot), options.path)
                : normalize(defaultSourceRoot);
        return host;
    };
}
