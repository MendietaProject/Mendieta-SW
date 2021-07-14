const fs = require('fs');
const path = require('path');

function workQueueIO() {
    const file = path.join(__dirname, "../Files/workTeams.json");
    fs.mkdirSync(path.dirname(file), {recursive: true});
    let result = {};

    function execute(func) {
      try {
        let data = fs.readFileSync(file);
        func(null, data);
      } catch (err) {
        if (err.code == "ENOENT") {
          fs.writeFileSync(file, "[]");
          func(null, "[]");
          return;
        }
        throw err;
      }
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
            fs.writeFileSync(file, JSON.stringify(jsonData));
            res.send(entity);
        }
        execute(func);
    }

    result.deleteFile = (res) => {
        try {
            fs.unlinkSync(file);
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
                    fs.unlinkSync(file);
                    if (jsonData.length != 0) {
                        fs.writeFileSync(file, JSON.stringify(jsonData));
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
                    fs.unlinkSync(file);
                    fs.writeFileSync(file, JSON.stringify(jsonData));
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
