const team = require('../Model/teamModel');

function teamRoutes(app) {
    let result = {};
    const teamController = require('../Controller/teamController')
    let tmController = teamController();

    app.route('/teams')
        .get(tmController.getAll)
        .post(tmController.post)
        .delete(tmController.delete);

    return result;
}
module.exports = teamRoutes;

