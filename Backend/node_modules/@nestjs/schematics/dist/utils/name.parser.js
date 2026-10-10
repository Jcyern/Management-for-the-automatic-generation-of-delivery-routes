import { basename, dirname, normalize } from '@angular-devkit/core';
export class NameParser {
    parse(options) {
        const nameWithoutPath = basename(options.name);
        const namePath = dirname((options.path === undefined ? '' : options.path)
            .concat('/')
            .concat(options.name));
        return {
            name: nameWithoutPath,
            path: normalize('/'.concat(namePath)),
        };
    }
}
