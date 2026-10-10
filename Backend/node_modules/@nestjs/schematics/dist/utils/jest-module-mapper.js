export function createModuleNameMapper(packageKey, packageRoot) {
    const moduleNameMapper = {};
    const packageKeyRegex = '^' + packageKey + '(|/.*)$';
    moduleNameMapper[packageKeyRegex] = packageRoot + '/$1';
    return moduleNameMapper;
}
