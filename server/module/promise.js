const fs = require('fs');
const child = require('child_process');
exports.runCommandInPromise = command => {
  return new Promise((resolve, reject) => {
    child.exec(command, (error, stdout, stderr) => {
      error ? reject(stderr) : resolve(stdout);
    });
  });
};
exports.runCommandInRemoteNodeInPromise = (ip, command) => {
  command = `ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no denali@${ip} -i /home/denali/denali/insecure_private_key '${command}'`;
  return new Promise((resolve, reject) => {
    child.exec(command, (error, stdout, stderr) => {
      error ? reject(stderr) : resolve(stdout);
    });
  });
};
exports.readFileInPromise = path => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (error, data) => {
      error ? reject(error) : resolve(data);
    });
  });
};
exports.writeFileInPromise = (path, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, 'utf8', error => {
      error ? reject(error) : resolve();
    });
  });
};