const rawBodyParser = (req, _res, buffer) => {
    if (Buffer.isBuffer(buffer)) {
        req.rawBody = buffer;
    }
    return true;
};
export function getBodyParserOptions(parser, rawBody, options) {
    if (rawBody === true) {
        return {
            ...options,
            verify: rawBodyParser,
        };
    }
    return options || {};
}
