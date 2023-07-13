MessageBox.prompt("¡Bienvenido!", "¿Cuál es tu nombre?").then(name => {
  Mendieta.registerStudent({name: name})
    .then(Mendieta.connectToServer);
  Mendieta.on("activity-update", evt => {
    const activity = evt.data;
    showCurrentActivity(activity);
  });
  Mendieta.getCurrentActivity().then(showCurrentActivity);
});

function showCurrentActivity(activity) {
  $("#class-assignment").html("");
  if (!activity) return;
  let card = $("<div>").addClass("card text-white bg-dark mb-3");
  let header = $("<div>").addClass("card-header").text("Actividad del Dia");
  let body = $("<div>").addClass("card-body");
  let text = $("<p>").addClass("card-text").text(activity.name);
  card.append(header);
  body.append(text);
  card.append(body);
  $("#class-assignment").append(card);
}

const button = document.getElementById("BotStart");
const labelName = document.getElementById("labelText");
let loadStudentsTimer = true;
startStudentsTimer();


button.addEventListener("click", () => {
  document.getElementById("pre").style.display = "none";
  loadStudentsTimer = false;
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