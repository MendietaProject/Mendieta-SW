const SubmissionController = require('./controllers/SubmissionController');
const ActivityController = require("./controllers/ActivityController");
const { Mendieta } = require("./models.js");
const Queue = require("./utils/queue.js");
const QueueManager = require("./uzi/queue_mgr.js");
const ws = require("express-ws");

const mendieta = new Mendieta();

const express = require('express'),
    app = express(),
    port = process.env.PORT || 3000;

// TODO(Richo): This seems like it should be inside a controller or something...
ws(app);
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TODO(Richo): This paths should be configurable
app.use(express.static("../frontend/src"));
app.use(express.static("../physicalbits/gui"));

// TODO(Richo): A class for each controller seems silly, maybe just group them in a services.js file?
SubmissionController.init(app, mendieta);
ActivityController.init(app, mendieta);

QueueManager.start(mendieta);

app.listen(port);

console.log(`Server started on: http://localhost:${port}`);
