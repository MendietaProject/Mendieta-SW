const baseStorage = require('./baseStorage');

class WorkQueueStorage extends baseStorage {
    constructor(fileName) {
        super(fileName);
    }
}
module.exports = WorkQueueStorage;