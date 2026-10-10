import { gray } from 'ansis';
export function listenForManualRestart(callback) {
    const stdinListener = (data) => {
        if (data.toString().trim() === 'rs') {
            process.stdin.removeListener('data', stdinListener);
            callback();
        }
    };
    process.stdin.on('data', stdinListener);
}
export function displayManualRestartTip() {
    console.log(`To restart at any time, enter ${gray `rs`}.\n`);
}
