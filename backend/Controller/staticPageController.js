function staticPageController() {
    let result = {};

    result.get = (req, res) => {
        res.sendFile('/index.html', { root: '.../frontend/src' });
    }
    return result;
}
module.exports = staticPageController;