import { extname } from 'path';
export function appendTsExtension(path) {
    return extname(path) === '.ts' ? path : path + '.ts';
}
