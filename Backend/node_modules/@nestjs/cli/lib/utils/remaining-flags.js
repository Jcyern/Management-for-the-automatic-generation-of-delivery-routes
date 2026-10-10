export function getRemainingFlags(cli) {
    const rawArgs = [...cli.rawArgs];
    const spliceIndex = rawArgs.findIndex((item) => item.startsWith('--'));
    if (spliceIndex === -1) {
        return [];
    }
    return rawArgs
        .splice(spliceIndex)
        .filter((item, index, array) => {
        // If the option is consumed by commander.js, then we skip it
        if (cli.options.find((o) => o.short === item || o.long === item)) {
            return false;
        }
        // If it's an argument of an option consumed by commander.js, then we
        // skip it too
        const prevKeyRaw = array[index - 1];
        if (prevKeyRaw?.startsWith('-')) {
            const previousKey = camelCase(prevKeyRaw.replace(/--/g, '').replace('no', ''));
            if (cli.getOptionValue(previousKey) === item) {
                return false;
            }
        }
        return true;
    });
}
/**
 * Camel-case the given `flag`
 *
 * @param {String} flag
 * @return {String}
 * @api private
 */
function camelCase(flag) {
    const words = flag.split('-').filter((word) => word.length > 0);
    if (words.length === 0) {
        return '';
    }
    return words.reduce((str, word) => {
        return str + word[0].toUpperCase() + word.slice(1);
    });
}
