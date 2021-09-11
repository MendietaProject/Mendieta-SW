
let clients = [];

class UpdateStreamController {
  static init(app, mendieta) {

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
}

module.exports = UpdateStreamController;
