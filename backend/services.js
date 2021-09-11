const { Activity, Submission } = require("./core.js");
const JSONX = require("./utils/jsonx.js");

function start (mendieta) {
  const express = require('express');
  const ws = require("express-ws");
  const app = express();
  const port = process.env.PORT || 3000;

  ws(app);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // TODO(Richo): This paths should be configurable
  app.use(express.static("../frontend/src"));
  app.use(express.static("../physicalbits/gui"));

  initUpdateStreamController(app, mendieta);
  initActivityController(app, mendieta);
  initSubmissionController(app, mendieta);

  app.listen(port);

  console.log(`Server started on: http://localhost:${port}`);
}

function handleError(fn) {
  return (req, res) => {
    try {
      fn(req, res);
    } catch (err) {
      res.status(err.statusCode || 500);
      res.send(JSON.stringify(`${err.name}: ${err.message}`));
    }
  }
}

function initUpdateStreamController(app, mendieta) {
  let clients = [];

  app.ws('/updates', function(ws, req) {
    console.log("Se conectó un cliente!");
    clients.push(ws);
    ws.onclose = () => {
      console.log("Se desconectó un cliente!");
      clients = clients.filter(e => e != ws);
    }
  });

  mendieta.onUpdate(() => {
    console.log("Se actualizó el servidor! " + clients.length.toString());

    // TODO(Richo): Qué info le tenemos que mandar a los clientes??
    let jsonState = JSON.stringify(mendieta.currentActivity);
    for (let i = 0; i < clients.length; i++) {
      let ws = clients[i];
      try {
        ws.send(jsonState);
      } catch (err){
        console.error(err);
      }
    }
  });
}

function initActivityController(app, mendieta) {

  app.route("/activities")
    .get((req, res) => res.send(mendieta.activities));

  app.route("/activities/current")
    .get((req, res) => {
      if (mendieta.currentActivity) {
        res.send(mendieta.currentActivity);
      } else {
        res.sendStatus(404);
      }
    })
    .delete((req, res) => {
      if (!mendieta.currentActivity){
        res.sendStatus(400);
      } else {
        mendieta.currentActivity = null;
        res.sendStatus(200);
      }
    })
    .post((req, res) => {
      if(req.body.id) {
        var activity = mendieta.findActivity(req.body.id);
        if(activity) {
          mendieta.currentActivity = activity;
          res.send(activity);
        } else {
          res.sendStatus(404);
        }
      } else {
        if(req.body.name){
          mendieta.currentActivity = new Activity(req.body.name);
          res.send(mendieta.currentActivity);
        }else{
          res.sendStatus(400);
        }
      }
    });
}

function initSubmissionController(app, mendieta) {

  app.route('/submissions')
    .get(handleError((_, res) => {
      res.send(mendieta.submissions);
    }))
    .post(handleError(({body: {author, program}}, res) => {
      let submission = new Submission(author, JSONX.parse(program));
      mendieta.addSubmission(submission);
      res.send(submission);
    }));

  app.route('/submissions/:id')
    .get(handleError(({params: {id}}, res) => {
      let submission = mendieta.findSubmission(id);
      if (submission) {
        res.send(submission);
      } else {
        res.sendStatus(404);
      }
    }))
    .delete(handleError(({params: {id}}, res) => {
      let submission = mendieta.findSubmission(id);
      if (submission) {
        mendieta.cancelSubmission(submission);
        res.send(submission);
      } else {
        res.sendStatus(404);
      }
    }));
}

module.exports = {start: start};
