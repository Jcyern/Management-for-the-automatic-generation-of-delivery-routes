#!/usr/bin/env node
"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const tools_1 = require("@angular-devkit/schematics/tools");
const node_fs_1 = require("node:fs");
const path = __importStar(require("node:path"));
const node_util_1 = require("node:util");
/**
 * Parse the name of schematic passed in argument, and return a {collection, schematic} named
 * tuple. The user can pass in `collection-name:schematic-name`, and this function will either
 * return `{collection: 'collection-name', schematic: 'schematic-name'}`, or it will error out
 * and show usage.
 *
 * In the case where a collection name isn't part of the argument, the default is to use the
 * schematics package (@angular-devkit/schematics-cli) as the collection.
 *
 * This logic is entirely up to the tooling.
 *
 * @param str The argument to parse.
 * @return {{collection: string, schematic: (string)}}
 */
function parseSchematicName(str) {
    let collection = '@angular-devkit/schematics-cli';
    let schematic = str;
    if (schematic?.includes(':')) {
        const lastIndexOfColon = schematic.lastIndexOf(':');
        [collection, schematic] = [
            schematic.slice(0, lastIndexOfColon),
            schematic.substring(lastIndexOfColon + 1),
        ];
    }
    return { collection, schematic };
}
function removeLeadingSlash(value) {
    return value[0] === '/' ? value.slice(1) : value;
}
function _listSchematics(workflow, collectionName, logger) {
    try {
        const collection = workflow.engine.createCollection(collectionName);
        logger.info(collection.listSchematicNames().join('\n'));
    }
    catch (error) {
        logger.fatal(error instanceof Error ? error.message : `${error}`);
        return 1;
    }
    return 0;
}
function _createPromptProvider() {
    return async (definitions) => {
        let prompts;
        const answers = {};
        for (const definition of definitions) {
            // Only load prompt package if needed
            prompts ??= await Promise.resolve().then(() => __importStar(require('@inquirer/prompts')));
            switch (definition.type) {
                case 'confirmation':
                    answers[definition.id] = await prompts.confirm({
                        message: definition.message,
                        default: definition.default,
                    });
                    break;
                case 'list':
                    if (!definition.items?.length) {
                        continue;
                    }
                    answers[definition.id] = await (definition.multiselect ? prompts.checkbox : prompts.select)({
                        message: definition.message,
                        validate: (values) => {
                            if (!definition.validator) {
                                return true;
                            }
                            return definition.validator(Object.values(values).map(({ value }) => value));
                        },
                        default: definition.multiselect ? undefined : definition.default,
                        choices: definition.items?.map((item) => typeof item == 'string'
                            ? {
                                name: item,
                                value: item,
                                checked: definition.multiselect && Array.isArray(definition.default)
                                    ? definition.default?.includes(item)
                                    : item === definition.default,
                            }
                            : {
                                ...item,
                                name: item.label,
                                value: item.value,
                                checked: definition.multiselect && Array.isArray(definition.default)
                                    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        definition.default?.includes(item.value)
                                    : item.value === definition.default,
                            }),
                    });
                    break;
                case 'input': {
                    let finalValue;
                    answers[definition.id] = await prompts.input({
                        message: definition.message,
                        default: definition.default,
                        async validate(value) {
                            if (definition.validator === undefined) {
                                return true;
                            }
                            let lastValidation = false;
                            for (const type of definition.propertyTypes) {
                                let potential;
                                switch (type) {
                                    case 'string':
                                        potential = String(value);
                                        break;
                                    case 'integer':
                                    case 'number':
                                        potential = Number(value);
                                        break;
                                    default:
                                        potential = value;
                                        break;
                                }
                                lastValidation = await definition.validator(potential);
                                // Can be a string if validation fails
                                if (lastValidation === true) {
                                    finalValue = potential;
                                    return true;
                                }
                            }
                            return lastValidation;
                        },
                    });
                    // Use validated value if present.
                    // This ensures the correct type is inserted into the final schema options.
                    if (finalValue !== undefined) {
                        answers[definition.id] = finalValue;
                    }
                    break;
                }
            }
        }
        return answers;
    };
}
function findUp(names, from) {
    const filenames = Array.isArray(names) ? names : [names];
    let currentDir = path.resolve(from);
    while (true) {
        for (const name of filenames) {
            const p = path.join(currentDir, name);
            if ((0, node_fs_1.existsSync)(p)) {
                return p;
            }
        }
        const parentDir = path.dirname(currentDir);
        if (parentDir === currentDir) {
            break;
        }
        currentDir = parentDir;
    }
    return null;
}
/**
 * return package manager' name by lock file
 */
function getPackageManagerName() {
    // order by check priority
    const LOCKS = {
        'package-lock.json': 'npm',
        'yarn.lock': 'yarn',
        'pnpm-lock.yaml': 'pnpm',
    };
    const lockPath = findUp(Object.keys(LOCKS), process.cwd());
    if (lockPath) {
        return LOCKS[path.basename(lockPath)];
    }
    return 'npm';
}
function createLogger(verbose, stdout, stderr) {
    const logger = new core_1.logging.IndentLogger('schematics');
    const colorLevels = {
        info: (s) => s,
        debug: (s) => s,
        warn: (s, stream) => (0, node_util_1.styleText)(['bold', 'yellow'], s, { stream }),
        error: (s, stream) => (0, node_util_1.styleText)(['bold', 'red'], s, { stream }),
        fatal: (s, stream) => (0, node_util_1.styleText)(['bold', 'red'], s, { stream }),
    };
    logger.subscribe((entry) => {
        if (entry.level === 'debug' && !verbose) {
            return;
        }
        const output = entry.level === 'warn' || entry.level === 'fatal' || entry.level === 'error'
            ? stderr
            : stdout;
        const color = colorLevels[entry.level];
        const message = color ? color(entry.message, output) : entry.message;
        output.write(message + '\n');
    });
    return logger;
}
async function main({ args, stdout = process.stdout, stderr = process.stderr, }) {
    const { cliOptions, schematicOptions, _ } = parseOptions(args);
    const logger = createLogger(!!cliOptions.verbose, stdout, stderr);
    if (cliOptions.help) {
        logger.info(getUsage());
        return 0;
    }
    /** Get the collection an schematic name from the first argument. */
    const { collection: collectionName, schematic: schematicName } = parseSchematicName(_.shift() || null);
    const isLocalCollection = collectionName.startsWith('.') || collectionName.startsWith('/');
    /** Gather the arguments for later use. */
    const debug = cliOptions.debug ?? isLocalCollection;
    const dryRunPresent = cliOptions['dry-run'] != null;
    const dryRun = cliOptions['dry-run'] ?? debug;
    const force = !!cliOptions.force;
    const allowPrivate = !!cliOptions['allow-private'];
    /** Create the workflow scoped to the working directory that will be executed with this run. */
    const workflow = new tools_1.NodeWorkflow(process.cwd(), {
        force,
        dryRun,
        resolvePaths: [process.cwd(), __dirname],
        schemaValidation: true,
        packageManager: getPackageManagerName(),
    });
    /** If the user wants to list schematics, we simply show all the schematic names. */
    if (cliOptions['list-schematics']) {
        return _listSchematics(workflow, collectionName, logger);
    }
    if (!schematicName) {
        logger.info(getUsage());
        return 1;
    }
    if (debug) {
        logger.info(`Debug mode enabled${isLocalCollection ? ' by default for local collections' : ''}.`);
    }
    // Indicate to the user when nothing has been done. This is automatically set to off when there's
    // a new DryRunEvent.
    let nothingDone = true;
    // Logging queue that receives all the messages to show the users. This only get shown when no
    // errors happened.
    let loggingQueue = [];
    let error = false;
    /**
     * Logs out dry run events.
     *
     * All events will always be executed here, in order of discovery. That means that an error would
     * be shown along other events when it happens. Since errors in workflows will stop the Observable
     * from completing successfully, we record any events other than errors, then on completion we
     * show them.
     *
     * This is a simple way to only show errors when an error occur.
     */
    workflow.reporter.subscribe((event) => {
        nothingDone = false;
        // Strip leading slash to prevent confusion.
        const eventPath = removeLeadingSlash(event.path);
        switch (event.kind) {
            case 'error':
                error = true;
                logger.error(`ERROR! ${eventPath} ${event.description == 'alreadyExist' ? 'already exists' : 'does not exist'}.`);
                break;
            case 'update':
                loggingQueue.push(
                // TODO: `as unknown` was necessary during TS 5.9 update. Figure out a long-term solution.
                `${(0, node_util_1.styleText)(['cyan'], 'UPDATE')} ${eventPath} (${event.content.length} bytes)`);
                break;
            case 'create':
                loggingQueue.push(
                // TODO: `as unknown` was necessary during TS 5.9 update. Figure out a long-term solution.
                `${(0, node_util_1.styleText)(['green'], 'CREATE')} ${eventPath} (${event.content.length} bytes)`);
                break;
            case 'delete':
                loggingQueue.push(`${(0, node_util_1.styleText)(['yellow'], 'DELETE')} ${eventPath}`);
                break;
            case 'rename':
                loggingQueue.push(`${(0, node_util_1.styleText)(['blue'], 'RENAME')} ${eventPath} => ${removeLeadingSlash(event.to)}`);
                break;
        }
    });
    /**
     * Listen to lifecycle events of the workflow to flush the logs between each phases.
     */
    workflow.lifeCycle.subscribe((event) => {
        if (event.kind == 'workflow-end' || event.kind == 'post-tasks-start') {
            if (!error) {
                // Flush the log queue and clean the error state.
                loggingQueue.forEach((log) => logger.info(log));
            }
            loggingQueue = [];
            error = false;
        }
    });
    workflow.registry.addPostTransform(core_1.schema.transforms.addUndefinedDefaults);
    // Show usage of deprecated options
    workflow.registry.useXDeprecatedProvider((msg) => logger.warn(msg));
    // Pass the rest of the arguments as the smart default "argv". Then delete it.
    workflow.registry.addSmartDefaultProvider('argv', (schema) => 'index' in schema ? _[Number(schema['index'])] : _);
    // Add prompts.
    if (cliOptions.interactive && isTTY()) {
        workflow.registry.usePromptProvider(_createPromptProvider());
    }
    /**
     *  Execute the workflow, which will report the dry run events, run the tasks, and complete
     *  after all is done.
     *
     *  The Observable returned will properly cancel the workflow if unsubscribed, error out if ANY
     *  step of the workflow failed (sink or task), with details included, and will only complete
     *  when everything is done.
     */
    try {
        await workflow
            .execute({
            collection: collectionName,
            schematic: schematicName,
            options: schematicOptions,
            allowPrivate: allowPrivate,
            debug: debug,
            logger: logger,
        })
            .toPromise();
        if (nothingDone) {
            logger.info('Nothing to be done.');
        }
        else if (dryRun) {
            logger.info(`Dry run enabled${dryRunPresent ? '' : ' by default in debug mode'}. No files written to disk.`);
        }
        return 0;
    }
    catch (err) {
        if (err instanceof schematics_1.UnsuccessfulWorkflowExecution) {
            // "See above" because we already printed the error.
            logger.fatal('The Schematic workflow failed. See above.');
        }
        else if (debug && err instanceof Error) {
            logger.fatal(`An error occured:\n${err.stack}`);
        }
        else {
            logger.fatal(`Error: ${err instanceof Error ? err.message : err}`);
        }
        return 1;
    }
}
/**
 * Get usage of the CLI tool.
 */
function getUsage() {
    return `
schematics [collection-name:]schematic-name [options, ...]

By default, if the collection name is not specified, use the internal collection provided
by the Schematics CLI.

Options:
    --debug             Debug mode. This is true by default if the collection is a relative
                        path (in that case, turn off with --debug=false).

    --allow-private     Allow private schematics to be run from the command line. Default to
                        false.

    --dry-run           Do not output anything, but instead just show what actions would be
                        performed. Default to true if debug is also true.

    --force             Force overwriting files that would otherwise be an error.

    --list-schematics   List all schematics from the collection, by name. A collection name
                        should be suffixed by a colon. Example: '@angular-devkit/schematics-cli:'.

    --no-interactive    Disables interactive input prompts.

    --verbose           Show more information.

    --help              Show this message.

Any additional option is passed to the Schematics depending on its schema.
`;
}
const CLI_OPTION_DEFINITIONS = {
    'allow-private': { type: 'boolean' },
    'debug': { type: 'boolean' },
    'dry-run': { type: 'boolean' },
    'force': { type: 'boolean' },
    'help': { type: 'boolean' },
    'list-schematics': { type: 'boolean' },
    'verbose': { type: 'boolean' },
    'interactive': { type: 'boolean', default: true },
};
/** Parse the command line. */
function parseOptions(args) {
    const { values, tokens } = (0, node_util_1.parseArgs)({
        args,
        strict: false,
        tokens: true,
        allowPositionals: true,
        allowNegative: true,
        options: CLI_OPTION_DEFINITIONS,
    });
    const schematicOptions = {};
    const positionals = [];
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.kind === 'positional') {
            positionals.push(token.value);
            continue;
        }
        if (token.kind !== 'option') {
            continue;
        }
        const name = token.name;
        let value = token.value ?? true;
        // `parseArgs` already handled known boolean args and their --no- forms.
        // Only process options not in CLI_OPTION_DEFINITIONS here.
        if (name in CLI_OPTION_DEFINITIONS) {
            continue;
        }
        if (/[A-Z]/.test(name)) {
            throw new Error(`Unknown argument ${name}. Did you mean ${schematics_1.strings.decamelize(name).replaceAll('_', '-')}?`);
        }
        // Handle --no-flag for unknown options, treating it as false
        if (name.startsWith('no-')) {
            const realName = name.slice(3);
            schematicOptions[schematics_1.strings.camelize(realName)] = false;
            continue;
        }
        // Handle value for unknown options
        if (token.inlineValue === undefined) {
            // Look ahead
            const nextToken = tokens[i + 1];
            if (nextToken?.kind === 'positional') {
                value = nextToken.value;
                i++; // Consume next token
            }
            else {
                value = true; // Treat as boolean if no value follows
            }
        }
        if (typeof value === 'string') {
            if (!isNaN(Number(value))) {
                // Type inference for numbers
                value = Number(value);
            }
            else if (value === 'true') {
                // Type inference for booleans
                value = true;
            }
            else if (value === 'false') {
                value = false;
            }
        }
        const camelName = schematics_1.strings.camelize(name);
        if (Object.prototype.hasOwnProperty.call(schematicOptions, camelName)) {
            const existing = schematicOptions[camelName];
            if (Array.isArray(existing)) {
                existing.push(value);
            }
            else {
                schematicOptions[camelName] = [existing, value];
            }
        }
        else {
            schematicOptions[camelName] = value;
        }
    }
    return {
        _: positionals,
        schematicOptions,
        cliOptions: values,
    };
}
function isTTY() {
    const isTruthy = (value) => {
        // Returns true if value is a string that is anything but 0 or false.
        return value !== undefined && value !== '0' && value.toUpperCase() !== 'FALSE';
    };
    // If we force TTY, we always return true.
    const force = process.env['NG_FORCE_TTY'];
    if (force !== undefined) {
        return isTruthy(force);
    }
    return !!process.stdout.isTTY && !isTruthy(process.env['CI']);
}
if (require.main === module) {
    const args = process.argv.slice(2);
    main({ args })
        .then((exitCode) => (process.exitCode = exitCode))
        .catch((e) => {
        throw e;
    });
}
//# sourceMappingURL=schematics.js.map