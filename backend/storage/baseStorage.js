const fs = require('fs');
const { v4: uuid } = require('uuid');
const path = require('path');
const storageError = require('./storageError');

class BaseStorage {
    #file;
    #fileEntityMap;

    // TODO: find way to somehow load map async on startup.
    constructor(fileName) {
        this.#file = path.join(__dirname, `../files/${fileName}.json`);
        this.#fileEntityMap = new Map();
    }

    async #read() {
        try {
            let result = await fs.promises.readFile(this.#file);
            return JSON.parse(result);
        } catch (err) {
            if (err.code == "ENOENT") {
                await fs.promises.mkdir(path.dirname(this.#file), { recursive: true });
                return Promise(this.#write([]));
            }
            throw err;
        }
    }

    // TODO: set schedule to write on file? 
    async #write(data) {
        await fs.promises.writeFile(this.#file, JSON.stringify(data));
        return data;
    }

    #addToMap(id, entity) {
        this.#fileEntityMap.set(id, entity);
    }

    #getFromMap(id) {
        return this.#fileEntityMap.get(id);
    }

    async getAll() {
        return await this.#read();
    }

    async getById(id) {
        let entity = this.#getFromMap(id)
        if (entity === undefined) {
            const data = await this.#read();
            entity = data.find(element => element.id == id);
            if (entity === undefined) {
                throw new storageError("Element with solicited id not found", 404);
            }
            this.#addToMap(id, entity);
        }
        return entity;
    }

    async add(entity) {
        const data = await this.#read();
        entity["id"] = uuid()
        data.push(entity);
        this.#addToMap(entity["id"], entity);
        this.#write(data)
        return entity;
    }

    async deleteFile() {
        try {
            await fs.promises.unlink(this.#file);
            this.#fileEntityMap = new Map();
            return "File deleted";
        } catch (err) {
            throw new storageError("File doesn't exist", 404);
        }
    }

    async deleteById(id) {
        const data = await this.#read();
        let entity = data.find(team => team.id == id);

        if (entity === undefined) {
            throw new storageError("Element with solicited id not found", 404);
        } else {
            entity = await data.splice(data.indexOf(entity), 1);
            await this.#write(data);
        }

        let mapEntity = this.#getFromMap(id);
        if (mapEntity != undefined) {
            this.#fileEntityMap.delete(id);
        }

        return entity;
    }

    // TODO: set schedule to modify on file? 
    async modify(id, modifiedEntity) {
        const data = await this.#read();
        let entity = data.find(element => element.id == id);
        if (entity === undefined) {
            throw new storageError("Team with solicited id not found", 404);
        } else {
            modifiedEntity["id"] = id;
            data[data.indexOf(entity)] = modifiedEntity;
            await this.#write(data);
        }
        let mapEntity = this.#getFromMap(id);
        if (mapEntity != undefined) {
            this.#fileEntityMap[id] = modifiedEntity;
        }
        return entity;
    }
}
module.exports = BaseStorage;