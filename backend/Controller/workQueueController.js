const fs = require('fs');

// TODO: MIRAR ASYNC

function workQueueController() {
    const path = "Files/workTeams.json"
    let result = {}
    result.getAll = (req, res) => {
        fs.readFile(path, (err, data) => {
            if (err) {
                res.send("File doesn't exist");
                return;
            }
            jsonData = JSON.parse(data);
            res.send(jsonData);
        });
    }
    result.getById = (req, res) => {
        fs.readFile(path, (err, data) => {
            if (err) {
                res.send("File doesn't exist");
                return;
            }
            jsonData = JSON.parse(data);
            team = jsonData.find(team => team.id == req.params.teamId);
            if (team === undefined) team = "Team with solicited id not found";
            res.send(team);
        });
    }
    result.put = (req, res) => {
        fs.readFile(path, (err, data) => {
            if (err) {
                let array = [];
                array.push(req.body)
                fs.writeFileSync(path, JSON.stringify(array));
                return;
            }
            let jsonData = JSON.parse(data);
            jsonData.push(req.body);
            //jsonData.sort((a, b) => a.id - b.id);
            fs.writeFileSync(path, JSON.stringify(jsonData));
        });
        res.send(req.body);
    }
    result.delete = (req, res) => {
        try {
            fs.unlinkSync(path);
            res.send("File deleted");
        }
        catch (e) {
            res.send("File doesn't exist");
        }
    }
    result.deleteById = (req, res) => {
        fs.readFile(path, (err, data) => {
            if (err) {
                res.send("File doesn't exist");
                return;
            }
            jsonData = JSON.parse(data);
            team = jsonData.find(team => team.id == req.params.teamId);
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
        });

    }
    return result;
}
module.exports = workQueueController;