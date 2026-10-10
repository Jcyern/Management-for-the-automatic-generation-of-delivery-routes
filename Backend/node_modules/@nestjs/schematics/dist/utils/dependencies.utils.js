import { JSONFile } from './json-file.util.js';
const PKG_JSON_PATH = '/package.json';
export var NodeDependencyType;
(function (NodeDependencyType) {
    NodeDependencyType["Default"] = "dependencies";
    NodeDependencyType["Dev"] = "devDependencies";
    NodeDependencyType["Peer"] = "peerDependencies";
    NodeDependencyType["Optional"] = "optionalDependencies";
})(NodeDependencyType || (NodeDependencyType = {}));
const ALL_DEPENDENCY_TYPE = [
    NodeDependencyType.Default,
    NodeDependencyType.Dev,
    NodeDependencyType.Optional,
    NodeDependencyType.Peer,
];
export function addPackageJsonDependency(tree, dependency, pkgJsonPath = PKG_JSON_PATH) {
    const json = new JSONFile(tree, pkgJsonPath);
    const { overwrite, type, name, version } = dependency;
    const path = [type, name];
    if (overwrite || !json.get(path)) {
        json.modify(path, version);
    }
}
export function getPackageJsonDependency(tree, name, pkgJsonPath = PKG_JSON_PATH) {
    const json = new JSONFile(tree, pkgJsonPath);
    for (const depType of ALL_DEPENDENCY_TYPE) {
        const version = json.get([depType, name]);
        if (typeof version === 'string') {
            return {
                type: depType,
                name: name,
                version,
            };
        }
    }
    return null;
}
