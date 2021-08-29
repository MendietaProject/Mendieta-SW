const baseStorage = require('./baseStorage');

// TODO: find a better name?

class ActivityPointerStorage extends baseStorage {
    constructor(fileName) {
        super(fileName);
    }
    getById(id) {
        let entity = super(id);
        let temp = this.file;
        this.file = path.join(__dirname, `../files/${entity.id}.json`);
        let result = this.read();
        this.file = temp;
        return result;
    }
    add() {
        const data = this.read();
        let id = uuid()
        data.push(id);
        this.write(data);
        fs.mkdir(path.dirname(this.file), { recursive: true });
        return id;
    }
}
module.exports = ActivityPointerStorage;