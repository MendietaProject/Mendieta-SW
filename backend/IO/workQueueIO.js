const fs = require('fs');
const { parse } = require('path');

function workQueueIO() {
    const path = "./Files/workTeams.json";
    let result = {};

    function execute(func) {
        fs.readFile(path, func);
    }

    result.getAll = (res) => {
        const func = (error, data) => {
            if (!error) {
                res.send(JSON.parse(data));
                return;
            }
            res.send(JSON.parse('{}'));
        }
        execute(func);
    }


    result.getById = (id, res) => {
        const func = (error, data) => {
            if (!error) {
                let jsonData = JSON.parse(data);
                team = jsonData.find(team => team.id == id);
                if (team === undefined) team = "Team with solicited id not found";
                res.send(team);
                return;
            }
            res.send(JSON.parse('{}'));
        }
        execute(func);
    }

    result.write = (entity, res) => {
        const func = (error, data) => {
            let jsonData = [];
            if (!error) jsonData = JSON.parse(data);
            jsonData.push(entity);
            fs.writeFileSync(path, JSON.stringify(jsonData));
            res.send(entity);
        }
        execute(func);

    }

    result.deleteFile = (res) => {
        try {
            fs.unlinkSync(path);
            res.send("File deleted");
        }
        catch (e) {
            res.send("File doesn't exist");
        }
    }

    result.deleteById = (id, res) => {
        const func = (error, data) => {
            if (!error) {
                jsonData = JSON.parse(data);
                team = jsonData.find(team => team.id == id);
                if (team === undefined) {
                    team = "Team with solicited id not found";
                }
                else {
                    team = jsonData.splice(jsonData.indexOf(team), 1);
                    fs.unlinkSync(path);
                    if (jsonData.length != 0) {
                        fs.writeFileSync(path, JSON.stringify(jsonData));
                    }
                }
                res.send(team);
                return;
            }
            res.send(data);
        }
        execute(func);
    }

    result.patch = (id, entity, res) => {
        const func = (error, data) => {
            if (!error) {
                jsonData = JSON.parse(data);
                team = jsonData.find(team => team.id == id);
                if (team === undefined) {
                    team = "Team with solicited id not found";
                }
                else {
                    jsonData[jsonData.indexOf(team)] = entity;
                    fs.unlinkSync(path);
                    fs.writeFileSync(path, JSON.stringify(jsonData));
                }
                res.send(team);
                return;
            }
            res.send(data);
        }
        execute(func);
    }

    return result;
}

module.exports = workQueueIO;