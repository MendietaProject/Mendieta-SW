const fs = require('fs');
const path = require('path');

function workQueueIO() {
    const file = path.join(__dirname, "../Files/workTeams.json");
    let result = {};

    function read(func) {
      try {
        return func(JSON.parse(fs.readFileSync(file)));
      } catch (err) {
        if (err.code == "ENOENT") {
          fs.mkdirSync(path.dirname(file), {recursive: true});
          return func(write([]));
        }
        throw err;
      }
    }

    function write(data) {
      fs.writeFileSync(file, JSON.stringify(data));
      return data;
    }

    result.getAll = (res) => {
        read(data => res.send(JSON.stringify(data)));
    }

    result.getById = (id, res) => {
        read(data => {
          team = data.find(team => team.id == id);
          if (team === undefined) {
            team = "Team with solicited id not found"; // TODO(Richo): Proper error handling!
          }
          res.send(team);
        });
    }

    result.write = (entity, res) => {
        read(data => {
          data.push(entity);
          write(data);
          res.send(entity);
        });
    }

    result.deleteFile = (res) => {
        try {
            fs.unlinkSync(file);
            res.send("File deleted");
        }
        catch (e) {
            res.send("File doesn't exist"); // TODO(Richo): Proper error handling!
        }
    }

    result.deleteById = (id, res) => {
        read(data => {
          team = data.find(team => team.id == id);
          if (team === undefined) {
              team = "Team with solicited id not found"; // TODO(Richo): Proper error handling!
          } else {
              team = data.splice(data.indexOf(team), 1);
              write(data);
          }
          res.send(team);
        });
    }

    result.patch = (id, entity, res) => {
        read(data => {
            team = data.find(team => team.id == id);
            if (team === undefined) {
                team = "Team with solicited id not found"; // TODO(Richo): Proper error handling!
            }
            else {
                data[data.indexOf(team)] = entity;
                write(data);
            }
            res.send(team);
        });
    }

    return result;
}

module.exports = workQueueIO;
