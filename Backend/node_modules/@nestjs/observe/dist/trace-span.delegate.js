export class TraceSpanDelegate {
    _id;
    _name;
    _tags;
    get id() {
        return this._id;
    }
    get name() {
        return this._name;
    }
    constructor(_id, _name, _tags) {
        this._id = _id;
        this._name = _name;
        this._tags = _tags;
    }
    /**
     * Sets a tag on the trace span.
     * @param key - The key for the tag.
     * @param value - The value for the tag. This can be a string, number, or boolean.
     * @returns The current instance of the TraceSpanDelegate for method chaining.
     */
    setTag(key, value) {
        this._tags[key] = value;
        return this;
    }
    /**
     * Adds multiple tags to the trace span.
     * @param tags - An object containing key-value pairs for the tags.
     * @returns The current instance of the TraceSpanDelegate for method chaining.
     */
    addTags(tags) {
        Object.assign(this._tags, tags);
        return this;
    }
}
