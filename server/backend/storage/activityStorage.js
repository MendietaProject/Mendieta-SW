const BaseStorage = require("./baseStorage");

class ActivityStorage extends BaseStorage {
    constructor(fileName) {
        super(fileName);
    }
}
module.exports = ActivityStorage;