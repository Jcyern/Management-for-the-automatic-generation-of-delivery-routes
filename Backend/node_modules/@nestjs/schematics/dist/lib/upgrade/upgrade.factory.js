import { chain, noop, } from '@angular-devkit/schematics';
import { formatFiles } from '../../utils/format-files.rule.js';
import { migrateCliConfig } from './steps/cli-config.step.js';
import { migrateConfigModule } from './steps/config.step.js';
import { reviewSources } from './steps/diagnostics.step.js';
import { installDependencies, updateNestDependencies, } from './steps/dependencies.step.js';
import { migrateGraphql } from './steps/graphql.step.js';
import { migrateNats } from './steps/nats.step.js';
import { setupObserve } from './steps/observe.step.js';
import { migrateTestRunner } from './steps/testing.step.js';
import { checkTsConfig } from './steps/tsconfig.step.js';
import { assertUpgradeable, checkNodeVersion, } from './steps/preconditions.step.js';
import { UpgradeReport } from './upgrade.utils.js';
export function main(options) {
    const report = new UpgradeReport();
    return chain([
        (tree) => {
            checkNodeVersion(report);
            assertUpgradeable(tree, report);
            return tree;
        },
        updateNestDependencies(options, report),
        migrateTestRunner(report),
        migrateCliConfig(report),
        migrateGraphql(report),
        migrateNats(report),
        migrateConfigModule(report),
        options.observe ? setupObserve(report) : noop(),
        checkTsConfig(report),
        reviewSources(report),
        options.format ? formatFiles() : noop(),
        installDependencies(options, report),
        (tree, context) => {
            report.print(context);
            return tree;
        },
    ]);
}
