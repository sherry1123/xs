const child = require('child_process');
const model = {
  runCommandInPromise(command) {
    return new Promise(resolve => {
      child.exec(command, (error, stdout, stderr) => {
        resolve(error ? {result: false, message: stderr} : {result: true, message: stdout});
      });
    });
  }
}

module.exports = model;