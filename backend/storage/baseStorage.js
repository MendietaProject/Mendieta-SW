const fs = require('fs');
const { v4: uuid } = require('uuid');
const path = require('path');
const storageError = require('./storageError');

class BaseStorage {
    constructor(fileName) {
        this.file = path.join(__dirname, `../files/${fileName}.json`);
    }

    async read() {
        try {
            return await JSON.parse(fs.promises.readFile(this.file));
        } catch (err) {
            if (err.code == "ENOENT") {
                await fs.promises.mkdir(path.dirname(this.file), { recursive: true });
                return this.write([]);
            }
            throw err;
        }
    }

    async write(data) {
        await fs.writeFile.promises.writeFile(this.file, JSON.stringify(data));
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

    async deleteFile() {
        try {
            await fs.promises.unlink(this.file);
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