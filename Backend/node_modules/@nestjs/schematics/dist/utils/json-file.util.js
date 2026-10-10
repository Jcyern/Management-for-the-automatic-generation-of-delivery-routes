import { applyEdits, findNodeAtLocation, getNodeValue, modify, parseTree, printParseErrorCode, } from 'jsonc-parser';
export class JSONFile {
    host;
    path;
    content;
    constructor(host, path) {
        this.host = host;
        this.path = path;
        const buffer = this.host.read(this.path);
        if (buffer) {
            this.content = buffer.toString();
        }
        else {
            throw new Error(`Could not read '${path}'.`);
        }
    }
    _jsonAst;
    get JsonAst() {
        if (this._jsonAst) {
            return this._jsonAst;
        }
        const errors = [];
        this._jsonAst = parseTree(this.content, errors, {
            allowTrailingComma: true,
        });
        if (errors.length) {
            const { error, offset } = errors[0];
            throw new Error(`Failed to parse "${this.path}" as JSON AST Object. ${printParseErrorCode(error)} at location: ${offset}.`);
        }
        return this._jsonAst;
    }
    get(jsonPath) {
        const jsonAstNode = this.JsonAst;
        if (!jsonAstNode) {
            return undefined;
        }
        if (jsonPath.length === 0) {
            return getNodeValue(jsonAstNode);
        }
        const node = findNodeAtLocation(jsonAstNode, jsonPath);
        return node === undefined ? undefined : getNodeValue(node);
    }
    modify(jsonPath, value, insertInOrder) {
        let getInsertionIndex;
        if (insertInOrder === undefined) {
            const property = jsonPath.slice(-1)[0];
            getInsertionIndex = (properties) => [...properties, property].sort().findIndex((p) => p === property);
        }
        else if (insertInOrder !== false) {
            getInsertionIndex = insertInOrder;
        }
        const edits = modify(this.content, jsonPath, value, {
            getInsertionIndex,
            formattingOptions: {
                insertSpaces: true,
                tabSize: 2,
            },
        });
        this.content = applyEdits(this.content, edits);
        this.host.overwrite(this.path, this.content);
        this._jsonAst = undefined;
    }
    remove(jsonPath) {
        if (this.get(jsonPath) !== undefined) {
            this.modify(jsonPath, undefined);
        }
    }
}
