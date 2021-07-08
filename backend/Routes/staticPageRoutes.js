function staticPageRoutes(app) {
    let result = {};
    const staticPageController = require('../Controller/staticPageController')
    let sticPageController = staticPageController();

    app.route('/')
        .get(sticPageController.get)
    return result;
}
module.exports = staticPageRoutes;