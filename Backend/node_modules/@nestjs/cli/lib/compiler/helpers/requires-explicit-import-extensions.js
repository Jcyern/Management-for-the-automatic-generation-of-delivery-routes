/**
 * Returns `true` when the consuming project uses an ESM-style module
 * resolution strategy (`node16` / `nodenext`). Under those resolution
 * modes, dynamic `import()` specifiers MUST include the file extension
 * (typically `.js`) for the runtime resolver to find the module. Without
 * the extension, executing the generated metadata file fails with
 * `ERR_MODULE_NOT_FOUND`, and TypeScript reports a diagnostic.
 */
export function requiresExplicitImportExtensions(options, tsBinary) {
    const moduleResolution = options.moduleResolution;
    return (moduleResolution === tsBinary.ModuleResolutionKind.Node16 ||
        moduleResolution === tsBinary.ModuleResolutionKind.NodeNext);
}
