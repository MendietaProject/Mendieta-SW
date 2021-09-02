const WorkQueueStorage = require('../storage/workQueueStorage');
const { v4: uuid } = require('uuid');
const storageError = require('../storage/storageError');

function workQueueController(app) {

    // TODO (IAN): Sometime in the future change passed parameter 
    const wkQueueStorage = new WorkQueueStorage('workTeams');

    app.route('/work-queue')
        .get(getAll)
        .put(put)
        .delete(deleteQueue);

    app.route('/work-queue/:teamId')
        .get(getById)
        .delete(deleteById)
        .patch(patch);

    function handleError(res, err) {
        res.status(500);
        if (err instanceof storageError)
            res.status(err.statusCode);
        res.send(JSON.stringify(`${err.name}: ${err.message}`));
    }

    async function getAll(req, res) {
        try {
            res.send(await wkQueueStorage.getAll());
        } catch (err) {
            handleError(res, err);
        }
    }

    async function getById(req, res) {
        try {
            res.send(await wkQueueStorage.getById(req.params.teamId));
        } catch (err) {
            handleError(res, err);
        }
    }

    async function put(req, res) {
        try {
            res.send(await wkQueueStorage.add(req.body));
        } catch (err) {
            handleError(res, err);
        }
    }

    async function deleteQueue(req, res) {
        try {
            res.send(await wkQueueStorage.deleteFile());
        } catch (err) {
            handleError(res, err);
        }
    }

    async function deleteById(req, res) {
        try {
            res.send(await wkQueueStorage.deleteById(req.params.teamId));
        } catch (err) {
            handleError(res, err);
        }
    }

    async function patch(req, res) {
        try {
            res.send(await wkQueueStorage.modify(req.params.teamId, req.body));
        } catch (err) {
            handleError(res, err);
        }
    }
}
module.exports = workQueueController;