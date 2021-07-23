const fs = require('fs');
const { v4: uuid } = require('uuid');
const path = require('path');
const storageError = require('./storageError');

class BaseStorage {
    constructor(fileName) {
        this.file = path.join(__dirname, `../files/${fileName}.json`);
    }

    read() {
        try {
            return JSON.parse(fs.readFileSync(this.file));
        } catch (err) {
            if (err.code == "ENOENT") {
                fs.mkdirSync(path.dirname(this.file), { recursive: true });
                return this.write([]);
            }
            throw err;
        }
    }

    write(data) {
        fs.writeFileSync(this.file, JSON.stringify(data));
        return data;
    }

    getAll() {
        return this.read();
    }

    getById(id) {
        const data = this.read();
        let entity = data.find(element => element.id == id);
        if (entity === undefined) {
            throw new storageError("Element with solicited id not found", 404);
        }
        return entity;
    }

    add(entity) {
        const data = this.read();
        entity["id"] = uuid()
        data.push(entity);
        this.write(data);
        return entity;
    }

    deleteFile() {
        try {
            fs.unlinkSync(this.file);
            return "File deleted";
        } catch (err) {
            throw new storageError("File doesn't exist", 404);
        }
    }

    deleteById(id) {
        const data = this.read();
        let entity = data.find(team => team.id == id);
        if (entity === undefined) {
            throw new storageError("Element with solicited id not found", 404);
        } else {
            entity = data.splice(data.indexOf(entity), 1);
            this.write(data);
        }
        return entity;
    }

    modify(id, modifiedEntity) {
        const data = this.read();
        let entity = data.find(element => element.id == id);
        if (entity === undefined) {
            throw new storageError("Team with solicited id not found", 404);
        } else {
            modifiedEntity["id"] = id;
            data[data.indexOf(entity)] = modifiedEntity;
            this.write(data);
        }
        return entity;
    }
}
module.exports = BaseStorage;