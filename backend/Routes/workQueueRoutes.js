function workQueueRoutes(app) {
    let result = {};
    const workQueueController = require('../Controller/workQueueController')
    let wkQueueController = workQueueController();

    app.route('/work-queue')
        .get(wkQueueController.getAll)
        .put(wkQueueController.put)
        .delete(wkQueueController.delete);

    app.route('/work-queue/:teamId')
        .get(wkQueueController.getById)
        .delete(wkQueueController.deleteById)
        .patch(wkQueueController.patch);
    return result;
}
module.exports = workQueueRoutes;

