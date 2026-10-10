import { LOG_LEVELS } from '../log-levels.constant.js';
/**
 * @publicApi
 */
export function isLogLevel(maybeLogLevel) {
    return LOG_LEVELS.includes(maybeLogLevel);
}
