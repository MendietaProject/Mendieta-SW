const workQueueController = require('./controller/workQueueController');
const initActivityController = require("./controller/ActivityController");
const ws = require("express-ws");

const serverState = {
  activities: [],
  currentActivity: null,
  clients: [],

  updateClients: function () {
    console.log("Se actualizó el servidor! " + serverState.clients.length.toString());

    // TODO(Richo): Qué info le tenemos que mandar a los clientes??
    let jsonState = JSON.stringify({
      activities: serverState.activities,
      currentActivity: serverState.currentActivity
    });
    for (let i = 0; i < serverState.clients.length; i++) {
      let ws = serverState.clients[i];
      try {
        ws.send(jsonState);
      } catch (err){
        console.error(err);
      }
    }
  }
};

const express = require('express'),
    app = express(),
    port = process.env.PORT || 3000;

ws(app);

app.ws('/updates', function(ws, req) {
  console.log("Se conectó un cliente!");
  serverState.clients.push(ws);
  ws.onclose = () => {
    console.log("Se desconectó un cliente!");
    serverState.clients = serverState.clients.filter(e => e != ws);
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("../frontend/src"));
app.use(express.static("../physicalbits/gui"));

workQueueController(app);
initActivityController(app, serverState);

app.listen(port);

console.log(`RESTful API server started on: http://localhost:${port}`);
