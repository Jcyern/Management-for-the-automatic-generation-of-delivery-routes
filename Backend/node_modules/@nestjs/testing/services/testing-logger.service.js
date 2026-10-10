import { ConsoleLogger } from '@nestjs/common';
/**
 * @publicApi
 */
export class TestingLogger extends ConsoleLogger {
    constructor() {
        super('Testing');
    }
    log(message) { }
    warn(message) { }
    debug(message) { }
    verbose(message) { }
    error(message, ...optionalParams) {
        return super.error(message, ...optionalParams);
    }
}
