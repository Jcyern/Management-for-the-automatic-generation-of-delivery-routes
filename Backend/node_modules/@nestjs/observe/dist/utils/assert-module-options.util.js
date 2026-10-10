import { Logger } from "@nestjs/common";
export function assertModuleOptions(options) {
    if (!options) {
        const errorMessage = `ObserveModule initialized without options. Ensure that you used the "forRoot" method to configure the module, as follows: "ObserveModule.forRoot()".`;
        Logger.error(errorMessage);
        throw new Error(errorMessage);
    }
}
