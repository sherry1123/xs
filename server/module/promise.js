const fs = require('fs');
const child = require('child_process');
const model = {
  runCommandInPromise(command) {
    return new Promise(resolve => {
      child.exec(command, (error, stdout, stderr) => {
        resolve(error ? {result: false, message: stderr} : {result: true, message: stdout});
      });
    });
  },
  readFileInPromise(path) {
    return new Promise(resolve => {
      fs.readFile(path, 'utf8', (error, data) => {
        resolve(error ? {result: false, message: error} : {result: true, message: data}); 
      });
    });
  },
  writeFileInPromise(path, data) {
    return new Promise(resolve => {
      fs.writeFile(path, data, 'utf8', error => {
        resolve(error? {result: false, message: error} : {result: true, message: 'write file success'});
      });
    });
  }
}

module.exports = model;