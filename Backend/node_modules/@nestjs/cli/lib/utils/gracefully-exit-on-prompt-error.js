export function gracefullyExitOnPromptError(err) {
    if (err.name === 'ExitPromptError') {
        process.exit(1);
    }
    else {
        throw err;
    }
}
