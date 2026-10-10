export var PackageManager;
(function (PackageManager) {
    PackageManager["NPM"] = "npm";
    PackageManager["YARN"] = "yarn";
    PackageManager["PNPM"] = "pnpm";
    PackageManager["BUN"] = "bun";
})(PackageManager || (PackageManager = {}));
