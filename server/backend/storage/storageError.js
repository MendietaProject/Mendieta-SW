class StorageError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = "StorageError";
        this.statusCode = statusCode;
    }
}
module.exports = StorageError;