const button = document.getElementById("BotStart");
const labelName = document.getElementById("labelText");
let loadStudentsTimer = true;
startStudentsTimer();
loadClassAssignments();

button.addEventListener("click", () => {
    let connectionAttempt = 0;

    function connect() {
      connectionAttempt++;
      let name = labelName.value;
      return Mendieta.registerStudent({name:name})
        .then(Mendieta.connectToServer)
        .then(() => connectionAttempt = 0);
    }

    function reconnect() {
      let timeout = Math.min(connectionAttempt * 1000, 5000);
      setTimeout(() => connect().catch(reconnect), timeout);
    }

    document.getElementById("pre").style.display = "none";
    loadStudentsTimer = false;

    Mendieta.on("server-disconnect", reconnect);
    return connect().catch(reconnect);
});

labelName.addEventListener("keyup", () => {
  button.disabled = labelName.value == "" || labelName.value.length > 15;
  console.log("en teoria esta listo");
});

function startStudentsTimer() {
  if (!loadStudentsTimer) return;
  loadStudents().then(() => {
    setTimeout(startStudentsTimer, 1000);
  });
}

function loadStudents() {
  console.log("BUSCANDO ESTUDIANTES!!!");
  return Mendieta.getStudents().then(students => {
    $("#student-list").html('<div class="card text-white bg-dark mb-3"><div class="card-header">Students</div></div>');
    for (let i = 0; i < students.length; i++) {
      /*
      <div class="card text-white bg-primary mb-3">
        <div class="card-header">Bob</div>
        <div class="card-body">
          <h5 class="card-title">Connected</h5>
        </div>
      </div>
      */
      let card = $("<div>").addClass("card text-white bg-primary mb-3");
      let header = $("<div>").addClass("card-header").text(students[i].name);
      let body = $('<div class="card-body"><h5 class="card-title">Connected</h5></div>');
      card.append(header);
      card.append(body);
      $("#student-list").append(card);
    }
  });
}

function loadClassAssignments()
{
  return Mendieta.getCurrentActivity().then(activity => {
    /*
      <div class="card text-white bg-dark mb-3">
        <div class="card-header">Class</div>
      </div>
    */

    let card = $("<div>").addClass("card text-white bg-dark mb-3");
    let header = $("<div>").addClass("card-header").text(activity.name);
    let body = $("<div>").addClass("card-body");
    let text = $("<p>").addClass("card-text").text("Aca el profesor va a escribir la actividad de hoy");
    card.append(header);
    body.append(text);
    card.append(body);
    $("#class-assignment").append(card);
    /*
    card = $("<div>").addClass("card text-white bg-dark mb-3");
    header = $("<div>").addClass("card-header").text("Aca el profesor va a escribir la actividad de hoy");
    card.append(header);
    $("#class-assignment").append(card);*/
  });
}