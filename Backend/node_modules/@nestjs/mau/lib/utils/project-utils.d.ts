import { Answers } from 'inquirer';
import { Configuration } from '../configuration';
export declare function askForProjectName(promptQuestion: string, projects: string[]): Promise<Answers>;
export declare function moveDefaultProjectToStart(configuration: Configuration, defaultProjectName: string, defaultLabel: string): string[];
