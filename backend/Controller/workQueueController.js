const workQueueIO = require('../IO/workQueueIO');

function workQueueController() {

    let result = {}
    let wkQueueIO = workQueueIO();

    result.getAll = (req, res) => {
        res.send(wkQueueIO.getAll());
    }

    result.getById = (req, res) => {
        res.send(wkQueueIO.getById(req.params.teamId));
    }

    result.put = (req, res) => {
        res.send(wkQueueIO.write(req.body));
    }

    result.delete = (req, res) => {
        res.send(wkQueueIO.deleteFile());
    }

    result.deleteById = (req, res) => {
        res.send(wkQueueIO.deleteById(req.params.teamId));
    }

    result.patch = (req, res) => {
        res.send(wkQueueIO.patch(req.params.teamId, req.body));
    }

    return result;
}
module.exports = workQueueController;
