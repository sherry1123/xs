const child = require('child_process');
const model = {
  runCommandInPromise(command) {
    return new Promise(resolve => {
      child.exec(command, (error, stdout, stderr) => {
        error ? resolve({result: false, message: stderr}):resolve({result: true, message: stdout})
      });
    });
  }
}

module.exports = model;