const fs = require('fs');
const path = require('path');

function workQueueIO() {
    const file = path.join(__dirname, "../Files/workTeams.json");
    let result = {};

    function read() {
      try {
        return JSON.parse(fs.readFileSync(file));
      } catch (err) {
        if (err.code == "ENOENT") {
          fs.mkdirSync(path.dirname(file), {recursive: true});
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
          team = "Team with solicited id not found"; // TODO(Richo): Proper error handling!
        }
        return team;
    }

    result.write = (entity) => {
        const data = read();
        data.push(entity);
        write(data);
        return entity;
    }

    result.deleteFile = () => {
        try {
            fs.unlinkSync(file);
            return "File deleted";
        } catch (e) {
            return "File doesn't exist"; // TODO(Richo): Proper error handling!
        }
    }

    result.deleteById = (id) => {
        const data = read();
        team = data.find(team => team.id == id);
        if (team === undefined) {
            team = "Team with solicited id not found"; // TODO(Richo): Proper error handling!
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
            team = "Team with solicited id not found"; // TODO(Richo): Proper error handling!
        } else {
            data[data.indexOf(team)] = entity;
            write(data);
        }
        return team;
    }

    return result;
}

module.exports = workQueueIO;
