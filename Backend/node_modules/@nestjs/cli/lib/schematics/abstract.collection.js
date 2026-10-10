export class AbstractCollection {
    collection;
    runner;
    constructor(collection, runner) {
        this.collection = collection;
        this.runner = runner;
    }
    async execute(name, options, extraFlags) {
        let command = this.buildCommandLine(name, options);
        command = extraFlags ? command.concat(` ${extraFlags}`) : command;
        await this.runner.run(command);
    }
    buildCommandLine(name, options) {
        return `${this.collection}:${name}${this.buildOptions(options)}`;
    }
    buildOptions(options) {
        return options.reduce((line, option) => {
            return line.concat(` ${option.toCommandString()}`);
        }, '');
    }
}
