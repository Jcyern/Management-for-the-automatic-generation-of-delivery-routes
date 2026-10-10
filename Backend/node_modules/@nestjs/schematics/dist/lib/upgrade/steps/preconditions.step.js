import { SchematicsException } from '@angular-devkit/schematics';
import { getPackageJsonDependency } from '../../../utils/dependencies.utils.js';
import { MIGRATION_GUIDE_URL, parseMajor, parseVersion, } from '../upgrade.utils.js';
export function isSupportedNodeVersion(version) {
    const [major, minor] = parseVersion(version);
    if (major === undefined) {
        return true;
    }
    if (major === 20) {
        return minor >= 19;
    }
    if (major === 22) {
        return minor >= 12;
    }
    return major > 22;
}
export function checkNodeVersion(report, version = process.versions.node) {
    if (!isSupportedNodeVersion(version)) {
        throw new SchematicsException(`NestJS 12 requires Node.js v20.19+ or v22.12+ (the ESM packages rely on "require(esm)"), ` +
            `but you are running v${version}. Please upgrade Node.js (the latest active LTS is recommended) and re-run the upgrade.`);
    }
    const [major] = parseVersion(version);
    if (major < 22) {
        report.warn(`You are running Node.js v${version}. NestJS 12 works on v20.19+, but the latest active LTS (v22.12+) is strongly recommended.`);
    }
}
export function assertUpgradeable(tree, report) {
    if (!tree.exists('package.json')) {
        throw new SchematicsException('Could not find "package.json". Run the upgrade from the root of your NestJS project.');
    }
    const core = getPackageJsonDependency(tree, '@nestjs/core') ??
        getPackageJsonDependency(tree, '@nestjs/common');
    if (!core) {
        throw new SchematicsException('Could not find "@nestjs/core" (or "@nestjs/common") in "package.json". ' +
            'Is this a NestJS project? Run the upgrade from the project root.');
    }
    const major = parseMajor(core.version);
    if (major === null) {
        report.warn(`Could not determine the installed NestJS version from "${core.name}": "${core.version}". Assuming v11.`);
        return;
    }
    if (major < 11) {
        throw new SchematicsException(`Detected NestJS v${major} ("${core.name}": "${core.version}"). ` +
            'This schematic upgrades from v11 to v12 only. Please upgrade to v11 first ' +
            `(see https://github.com/nestjs/nest/releases/tag/v11.0.0 and ${MIGRATION_GUIDE_URL}), then re-run the upgrade.`);
    }
    if (major >= 12) {
        report.note(`"${core.name}" is already on v${major}; re-applying the v12 migrations (they are idempotent).`);
    }
}
