const fs = require('fs');
const { v4: uuid } = require('uuid');
const path = require('path');
const requestError = require('../controller/requestError');

function workQueueStorage() {
    const file = path.join(__dirname, "../files/workTeams.json");
    let result = {};

    function read() {
        try {
            return JSON.parse(fs.readFileSync(file));
        } catch (err) {
            if (err.code == "ENOENT") {
                fs.mkdirSync(path.dirname(file), { recursive: true });
                return write([]);
            }
            throw err;
        }
    }

    function write(data) {
        fs.writeFileSync(file, JSON.stringify(data));
        return data;
    }

    result.getAll = () => {
        return read();
    }

    result.getById = (id) => {
        const data = read();
        team = data.find(team => team.id == id);
        if (team === undefined) {
            throw new requestError("Team with solicited id not found", 404);
        }
        return team;
    }

    result.write = (entity) => {
        const data = read();
        entity["id"] = uuid()
        data.push(entity);
        write(data);
        return entity;
    }

    result.deleteFile = () => {
        try {
            fs.unlinkSync(file);
            return "File deleted";
        } catch (err) {
            throw new requestError("File doesn't exist", 404);
        }
    }

    result.deleteById = (id) => {
        const data = read();
        team = data.find(team => team.id == id);
        if (team === undefined) {
            throw new requestError("Team with solicited id not found", 404);
        } else {
            team = data.splice(data.indexOf(team), 1);
            write(data);
        }
        return team;
    }

    result.patch = (id, entity) => {
        const data = read();
        team = data.find(team => team.id == id);
        if (team === undefined) {
            throw new requestError("Team with solicited id not found", 404);
        } else {
            entity["id"] = id;
            data[data.indexOf(team)] = entity;
            write(data);
        }
        return team;
    }

    return result;
}
module.exports = workQueueStorage;