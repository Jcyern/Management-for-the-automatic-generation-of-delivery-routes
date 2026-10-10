import { basename, dirname, relative } from '@angular-devkit/core';
export class PathSolver {
    relative(from, to) {
        const placeholder = '/placeholder';
        const relativeDir = relative(dirname((placeholder + from)), dirname((placeholder + to)));
        return (relativeDir.startsWith('.') ? relativeDir : './' + relativeDir).concat(relativeDir.length === 0 ? basename(to) : '/' + basename(to));
    }
}
