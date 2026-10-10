import { AbstractAction } from './abstract.action.js';
export declare class InfoAction extends AbstractAction {
    private manager;
    private warningMessageDependenciesWhiteList;
    handle(): Promise<void>;
    private displayBanner;
    private displaySystemInformation;
    private displayPackageManagerVersion;
    private displayNestInformation;
    private displayNestInformationFromPackage;
    private displayCliVersion;
    private readProjectPackageDependencies;
    private displayNestVersions;
    private displayWarningMessage;
    private buildNestVersionsWarningMessage;
    private buildNestVersionsMessage;
    private collectNestDependencies;
    /**
     * Reads the installed version of a package, or returns undefined when it
     * cannot be determined (package not installed, or its "exports" map does
     * not expose "./package.json" — as with @nestjs/* v12+).
     */
    private readInstalledVersion;
    private format;
}
