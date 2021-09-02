let socket = new WebSocket("ws://localhost:3000/updates");

socket.onerror = function (err) {
  console.error(err);
}
socket.onopen = function () {
  console.log("OPEN!");
}
socket.onmessage = function (msg) {
  let newState = JSON.parse(msg.data);
  console.log(newState);
}
