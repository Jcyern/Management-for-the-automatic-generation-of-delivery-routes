import { AbstractCollection } from './abstract.collection.js';
export class NestCollection extends AbstractCollection {
    static schematics = [
        {
            name: 'application',
            alias: 'application',
            description: 'Generate a new application workspace',
        },
        {
            name: 'angular-app',
            alias: 'ng-app',
            description: '',
        },
        {
            name: 'class',
            alias: 'cl',
            description: 'Generate a new class',
        },
        {
            name: 'configuration',
            alias: 'config',
            description: 'Generate a CLI configuration file',
        },
        {
            name: 'controller',
            alias: 'co',
            description: 'Generate a controller declaration',
        },
        {
            name: 'decorator',
            alias: 'd',
            description: 'Generate a custom decorator',
        },
        {
            name: 'filter',
            alias: 'f',
            description: 'Generate a filter declaration',
        },
        {
            name: 'gateway',
            alias: 'ga',
            description: 'Generate a gateway declaration',
        },
        {
            name: 'guard',
            alias: 'gu',
            description: 'Generate a guard declaration',
        },
        {
            name: 'interceptor',
            alias: 'itc',
            description: 'Generate an interceptor declaration',
        },
        {
            name: 'interface',
            alias: 'itf',
            description: 'Generate an interface',
        },
        {
            name: 'library',
            alias: 'lib',
            description: 'Generate a new library within a monorepo',
        },
        {
            name: 'middleware',
            alias: 'mi',
            description: 'Generate a middleware declaration',
        },
        {
            name: 'module',
            alias: 'mo',
            description: 'Generate a module declaration',
        },
        {
            name: 'pipe',
            alias: 'pi',
            description: 'Generate a pipe declaration',
        },
        {
            name: 'provider',
            alias: 'pr',
            description: 'Generate a provider declaration',
        },
        {
            name: 'resolver',
            alias: 'r',
            description: 'Generate a GraphQL resolver declaration',
        },
        {
            name: 'resource',
            alias: 'res',
            description: 'Generate a new CRUD resource',
        },
        {
            name: 'service',
            alias: 's',
            description: 'Generate a service declaration',
        },
        {
            name: 'sub-app',
            alias: 'app',
            description: 'Generate a new application within a monorepo',
        },
        // Invoked by "nest update", not "nest generate" - see getSchematics().
        {
            name: 'upgrade',
            alias: 'upgrade',
            description: 'Upgrade the project to the latest NestJS version',
        },
    ];
    constructor(runner) {
        super('@nestjs/schematics', runner);
    }
    async execute(name, options) {
        const schematic = this.validate(name);
        await super.execute(schematic, options);
    }
    getSchematics() {
        // "upgrade" is executed through "nest update"; it is not offered as a
        // "nest generate" schematic.
        return NestCollection.schematics.filter((item) => item.name !== 'angular-app' && item.name !== 'upgrade');
    }
    validate(name) {
        const schematic = NestCollection.schematics.find((s) => s.name === name || s.alias === name);
        if (schematic === undefined || schematic === null) {
            throw new Error(`Invalid schematic "${name}". Please, ensure that "${name}" exists in this collection.`);
        }
        return schematic.name;
    }
}
