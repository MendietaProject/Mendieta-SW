const fs = require('fs');

// TODO: MIRAR ASYNC

function teamController() {
    const path = "workTeams.json"
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
    result.post = (req, res) => {
        fs.readFile(path, (err, data) => {
            if (err) {
                fs.writeFileSync(path, JSON.stringify([req.body]));
                return;
            }
            let jsonData = JSON.parse(data);
            jsonData.push(req.body);
            fs.writeFileSync(path, JSON.stringify(jsonData))
        });
        res.send(req.body);
    }
    result.delete = (req, res) => {
        try {
            fs.unlinkSync(path)
            res.send("File deleted");
        }
        catch (e) {
            res.send("File doesn't exist");
        }
    }
    return result;
}
module.exports = teamController;