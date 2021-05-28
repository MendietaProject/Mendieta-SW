function program(sourceCode, isRunning) {
    let result = {};
    result.sourceCode = sourceCode;
    result.isRunning = isRunning;
    return result;
}
module.exports = program;