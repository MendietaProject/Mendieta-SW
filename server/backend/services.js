const express = require('express');
const ws = require("express-ws");
const { Activity, Submission } = require("./core.js");
const JSONX = require("./utils/jsonx.js");

function start (mendieta, port) {
  const app = express();
  ws(app);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(express.static("frontend"));

  initUpdateStreamController(app, mendieta);
  initActivityController(app, mendieta);
  initSubmissionController(app, mendieta);
  initStudentController(app, mendieta);

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

  function createUpdateMsg(type, data) {
    return JSONX.stringify({
      type: type,
      timestamp: Date.now(),
      data: data
    });
  }

  app.ws('/updates', (ws, req) => {
    let client = {id: null, socket: ws};
    clients.push(client);
    console.log(`Se conectó un cliente! (# clientes: ${clients.length})`);
    ws.onmessage = (msg) => {
      if (client.id) return;
      client.id = msg.data;

      try {
        const submission = mendieta.submissions.find(s => s.isActive());
        if (submission && submission.author.id == client.id) {
          const msg = createUpdateMsg("submission-update", submission);
          client.socket.send(msg);
        }
      } catch (err) {
        console.error(err);
      }
    };
    ws.onclose = () => {
      clients = clients.filter(c => c != client);
      mendieta.removeStudent(client.id);

      console.log(`Se desconectó un cliente! (# clientes: ${clients.length})`);
    };
  });

  mendieta.on("activity-update", activity => {
    console.log(`Se actualizó la actividad! (# clientes: ${clients.length})`);

    const msg = createUpdateMsg("activity-update", activity);
    clients.forEach(client => {
      try {
        const ws = client.socket;
        ws.send(msg);
      } catch (err) {
        console.error(err);
      }
    })
  });

  mendieta.on("submission-update", submission => {
    console.log(`Se actualizó una submission! (# clientes: ${clients.length})`);

    const msg = createUpdateMsg("submission-update", submission);
    clients.filter(c => c.id == null || c.id == submission.author.id).forEach(client => {
      try {
        const ws = client.socket;
        ws.send(msg);
      } catch (err){
        console.error(err);
      }
    });
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
          mendieta.currentActivity = new Activity(req.body.name, req.body.duration);
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

function initStudentController(app, mendieta) {

  app.route('/students')
    .get(handleError((_, res) => {
      res.send(mendieta.students);
    }))
    .post(handleError(({body: {id, name}}, res) => {
      let student = mendieta.registerStudent(id, name);
      res.send(student);
    }));
}

module.exports = {start: start};
