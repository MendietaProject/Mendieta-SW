
function initActivityController(app, state) {

  app.route("/activities")
    .get((req, res) => {
      // TODO(Richo): Devolver todas las actividades para que el docente elija
    })

  app.route("/activities/current")
    .get((req, res) => {
      // TODO(Richo): Si no hay actividad qué devolvemos?
      res.send(state.currentActivity);
    })
    .post((req, res) => {
      let activity = {
        name: req.body.name,
        students: [],
        submissions: []
      };
      state.currentActivity = activity;
      res.send(state.currentActivity)
    });
}

module.exports = initActivityController;
