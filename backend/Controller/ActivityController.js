const { v4: uuid } = require('uuid');

function initActivityController(app, state) {

  app.route("/activities")
    .get((req, res) => {
      // TODO(Richo): Devolver todas las actividades para que el docente elija
      //TODO(Nico): No se como devolver las actividades
      res.send(state.activities);
    });

  app.route("/activities/current")
    .get((req, res) => {
      if (state.currentActivity) {
        res.send(state.currentActivity);
      } else {
        res.sendStatus(404);
      }
    })
    .post((req, res) => {
      if(req.body.id) {
        var activity = state.activities.find(activity => activity.id == req.body.id);
        if(activity) {
          state.currentActivity = activity;
          res.send(activity);
          state.updateClients();
        } else {
          res.sendStatus(404);
        }
      } else {
        let activity = {
          name: req.body.name,
          id: uuid(),
          students: [],
          submissions: []
        };
        state.currentActivity = activity;
        state.activities.push(activity);
        res.send(state.currentActivity);        
        state.updateClients();
      }
    });
}

module.exports = initActivityController;
