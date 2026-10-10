import { CommandLoader } from '../../commands/index.js';
export declare function localBinExists(): boolean;
export declare function loadLocalBinCommandLoader(): Promise<typeof CommandLoader>;
