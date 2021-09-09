const { v4: uuid } = require('uuid');

class ActivityController {
  static init(app, state) {

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
      .delete((req, res) => {
        let activity = state.currentActivity;
        if (!activity){
          res.sendStatus(400);
        } else {
          state.currentActivity = null;
          res.sendStatus(200);
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
          if(req.body.name){
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
          }else{
            res.sendStatus(400);
          }
        }
      });
  }
}

module.exports = ActivityController;
