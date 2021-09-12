const express = require('express');
const ws = require("express-ws");
const { Activity, Submission } = require("./core.js");
const JSONX = require("./utils/jsonx.js");

function start (mendieta) {
  const app = express();
  ws(app);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // TODO(Richo): This paths should be configurable
  app.use(express.static("../frontend/src"));
  app.use(express.static("../physicalbits/gui"));

  initUpdateStreamController(app, mendieta);
  initActivityController(app, mendieta);
  initSubmissionController(app, mendieta);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
  });
}

function handleError(fn) {
  return (req, res) => {
    try {
      fn(req, res);
    } catch (err) {
      res.status(err.statusCode || 500);
      res.send(err);
      console.error(err);
    }
  }
}

function initUpdateStreamController(app, mendieta) {
  let clients = [];

  app.ws('/updates', (ws, req) => {
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
    .get(handleError((req, res) => res.send(mendieta.activities)));

  app.route("/activities/current")
    .get(handleError((req, res) => {
      if (mendieta.currentActivity) {
        res.send(mendieta.currentActivity);
      } else {
        res.sendStatus(404);
      }
    }))
    .delete(handleError((req, res) => {
      if (!mendieta.currentActivity){
        res.sendStatus(400);
      } else {
        mendieta.currentActivity = null;
        res.sendStatus(200);
      }
    }))
    .post(handleError((req, res) => {
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
    }));
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


  let withSubmission = fn => {
    return ({params: {id}}, res) => {
      let submission = mendieta.findSubmission(id);
      if (submission) {
        fn(submission, res);
      } else {
        res.sendStatus(404);
      }
    };
  }

  app.route('/submissions/:id')
    .get(handleError(withSubmission((submission, res) => {
      res.send(submission);
    })));

  app.route('/submissions/:id/cancel')
    .post(handleError(withSubmission((submission, res) => {
      mendieta.cancelSubmission(submission);
      res.send(submission);
    })));

  app.route('/submissions/:id/start')
    .post(handleError(withSubmission((submission, res) => {
      mendieta.startSubmission(submission);
      res.send(submission);
    })));

  app.route('/submissions/:id/pause')
    .post(handleError(withSubmission((submission, res) => {
      mendieta.pauseSubmission(submission);
      res.send(submission);
    })));

  app.route('/submissions/:id/stop')
    .post(handleError(withSubmission((submission, res) => {
      mendieta.stopSubmission(submission);
      res.send(submission);
    })));
}

module.exports = {start: start};
