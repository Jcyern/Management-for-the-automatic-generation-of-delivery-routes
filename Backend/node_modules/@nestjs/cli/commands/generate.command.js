import { bold, cyan, green } from 'ansis';
import Table from 'cli-table3';
import { CollectionFactory, } from '../lib/schematics/index.js';
import { loadConfiguration } from '../lib/utils/load-configuration.js';
import { AbstractCommand } from './abstract.command.js';
export class GenerateCommand extends AbstractCommand {
    async load(program) {
        program
            .command('generate <schematic> [name] [path]')
            .alias('g')
            .description(await this.buildDescription())
            .option('-d, --dry-run', 'Report actions that would be taken without writing out results.')
            .option('-p, --project [project]', 'Project in which to generate files.')
            .option('--flat', 'Enforce flat structure of generated element.', () => true)
            .option('--no-flat', 'Enforce that directories are generated.', () => false)
            .option('--spec', 'Enforce spec files generation.', () => {
            return { value: true, passedAsInput: true };
        }, { value: true, passedAsInput: false })
            .option('--spec-file-suffix [suffix]', 'Use a custom suffix for spec files.')
            .option('--skip-import', 'Skip importing', () => true, false)
            .option('--format', 'Format generated files using Prettier.', false)
            .option('--no-spec', 'Disable spec files generation.', () => {
            return { value: false, passedAsInput: true };
        })
            .option('-c, --collection [collectionName]', 'Schematics collection to use.')
            .option('--type <type>', 'Transport layer type (rest, graphql, microservice)')
            .option('--crud [value]', 'Generate CRUD entry points')
            .action(async (schematic, name, path, options) => {
            const context = {
                schematic,
                name,
                path,
                dryRun: !!options.dryRun,
                flat: options.flat,
                spec: options.spec,
                specFileSuffix: options.specFileSuffix,
                collection: options.collection,
                project: options.project,
                skipImport: options.skipImport,
                format: options.format === true,
                type: options.type,
                // `--crud [value]` yields a string whenever a value is supplied,
                // so `--crud false` must still be forwarded (as false) rather than
                // dropped, which would let the schematic apply its own default.
                crud: options.crud === undefined
                    ? undefined
                    : options.crud === true || options.crud === 'true',
            };
            await this.action.handle(context);
        });
    }
    async buildDescription() {
        const collection = await this.getCollection();
        return ('Generate a Nest element.\n' +
            `  Schematics available on ${bold(collection)} collection:\n` +
            this.buildSchematicsListAsTable(await this.getSchematics(collection)));
    }
    buildSchematicsListAsTable(schematics) {
        const leftMargin = '    ';
        if ((process.stdout.columns ?? 80) < 80) {
            return schematics
                .map((schematic) => {
                const header = `${leftMargin}${green(schematic.name)} ${cyan(schematic.alias)}`;
                return schematic.description
                    ? `${header}\n${leftMargin}  ${schematic.description}`
                    : header;
            })
                .join('\n');
        }
        const tableConfig = {
            head: ['name', 'alias', 'description'],
            wordWrap: true,
            chars: {
                'left': leftMargin.concat('│'),
                'top-left': leftMargin.concat('┌'),
                'bottom-left': leftMargin.concat('└'),
                'mid': '',
                'left-mid': '',
                'mid-mid': '',
                'right-mid': '',
            },
        };
        const table = new Table(tableConfig);
        for (const schematic of schematics) {
            table.push([
                green(schematic.name),
                cyan(schematic.alias),
                schematic.description,
            ]);
        }
        return table.toString();
    }
    async getCollection() {
        const configuration = await loadConfiguration();
        return configuration.collection;
    }
    async getSchematics(collection) {
        const abstractCollection = CollectionFactory.create(collection);
        return abstractCollection.getSchematics();
    }
}
