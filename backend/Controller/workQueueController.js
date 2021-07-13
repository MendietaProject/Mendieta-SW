const workQueueIO = require('../IO/workQueueIO');

function workQueueController() {

    let result = {}
    let wkQueueIO = workQueueIO();

    result.getAll = (req, res) => {
        wkQueueIO.getAll(res);
    }

    result.getById = (req, res) => {
        wkQueueIO.getById(req.params.teamId, res);
    }

    result.put = (req, res) => {
        wkQueueIO.write(req.body, res);
    }

    result.delete = (req, res) => {
        wkQueueIO.deleteFile(res);
    }

    result.deleteById = (req, res) => {
        wkQueueIO.deleteById(req.params.teamId, res);
    }

    result.patch = (req, res) => {
        wkQueueIO.patch(req.params.teamId, req.body, res)
    }

    return result;
}
module.exports = workQueueController;