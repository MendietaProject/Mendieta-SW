class ActivityError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = "ActivityError";
        this.statusCode = statusCode;
    }
}
module.exports = ActivityError;