"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveDefaultProjectToStart = exports.askForProjectName = void 0;
const inquirer = require("inquirer");
const questions_1 = require("../questions/questions");
async function askForProjectName(promptQuestion, projects) {
    const questions = [
        (0, questions_1.generateSelect)('appName')(promptQuestion)(projects),
    ];
    const prompt = inquirer.createPromptModule();
    return prompt(questions);
}
exports.askForProjectName = askForProjectName;
function moveDefaultProjectToStart(configuration, defaultProjectName, defaultLabel) {
    let projects = configuration.projects != null ? Object.keys(configuration.projects) : [];
    if (configuration.sourceRoot !== 'src') {
        projects = projects.filter((p) => p !== defaultProjectName.replace(defaultLabel, ''));
    }
    projects.unshift(defaultProjectName);
    return configuration.projects
        ? projects.filter((projectName) => {
            if (projectName === defaultProjectName) {
                return true;
            }
            return configuration.projects[projectName].type === 'application';
        })
        : [];
}
exports.moveDefaultProjectToStart = moveDefaultProjectToStart;
