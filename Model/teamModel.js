function team(id, teamName, students, program) {
    let result = {};
    result.id = id;
    result.teamName = teamName;
    result.students = students;
    result.program = program;
    return result;
}
module.exports = team