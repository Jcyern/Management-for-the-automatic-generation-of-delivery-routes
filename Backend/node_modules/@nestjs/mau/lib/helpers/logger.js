"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.ERROR_PREFIX = void 0;
const chalk = require("chalk");
exports.ERROR_PREFIX = chalk.bgRgb(210, 0, 75).bold.rgb(0, 0, 0)(' Error ');
class Logger {
    static log(...args) {
        if (args?.[0] && typeof args[0] === 'string') {
            args[0] = `${chalk.green('>')} ${args[0]}`;
        }
        console.log(...args);
    }
    static error(...args) {
        if (args?.[0] && typeof args[0] === 'string') {
            args[0] = `${chalk.red('>')} ${exports.ERROR_PREFIX} ${args[0]}`;
        }
        console.error(...args);
    }
    static raw(...args) {
        console.info(...args);
    }
    static newLine() {
        console.log();
    }
}
exports.Logger = Logger;
