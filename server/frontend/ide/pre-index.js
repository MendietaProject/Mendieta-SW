const button = document.getElementById("BotStart");
const labelName = document.getElementById("labelText");
button.addEventListener("click", () => Motor())

function Motor()
{
    let connectionAttempt = 0;

    function connect() {
      connectionAttempt++;
      let name = LabelName();
      return Mendieta.registerStudent({name:name})
        .then(Mendieta.connectToServer)
        .then(() => connectionAttempt = 0);
    }

    function reconnect() {
      let timeout = Math.min(connectionAttempt * 1000, 5000);
      setTimeout(() => connect().catch(reconnect), timeout);
    }

    document.getElementById("pre").style.display = "none";

    Mendieta.on("server-disconnect", reconnect);
    return connect().catch(reconnect);
}

function LabelName() {
    return labelName.value;
  }


labelName.addEventListener("change", () => yaTengoNombre());

function yaTengoNombre() {
  button.disabled = false;
  console.log("en teoria esta listo");
}