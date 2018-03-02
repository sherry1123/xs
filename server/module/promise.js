const fs = require('fs');
const zlib = require('zlib');
const child = require('child_process');
exports.runCommandInPromise = command => {
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
exports.copyFileInPromise = (src, dest) => {
  return new Promise((resolve, reject) => {
    fs.copyFile(src, dest, error => {
      error ? reject(error) : resolve();
    });
  });
};
exports.chmodFileInPromise = (path, mode) => {
  return new Promise((resolve, reject) => {
    child.exec(`sudo chmod ${mode} ${path}`, (error, stdout, stderr) => {
      error ? reject(stderr) : resolve(stdout);
    });
  });
};
exports.runCommandInRemoteNodeInPromise = (ip, command) => {
  command = `ssh -i /home/denali/denali/insecure_private_key -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -o LogLevel=quiet denali@${ip} "${command}"`;
  return new Promise((resolve, reject) => {
    child.exec(command, (error, stdout, stderr) => {
      error ? reject(stderr) : resolve(stdout);
    });
  });
};
exports.copyFileToRemoteNodeInPromise = (ip, src, dest) => {
  let command = `scp -i /home/denali/denali/insecure_private_key -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -o LogLevel=quiet ${src} denali@${ip}:${dest}`;
  return new Promise((resolve, reject) => {
    child.exec(command, (error, stdout, stderr) => {
      error ? reject(stderr) : resolve(stdout);
    });
  });
};
exports.copyFileFromRemoteNodeInPromise = (ip, src, dest) => {
  let command = `scp -i /home/denali/denali/insecure_private_key -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -o LogLevel=quiet denali@${ip}:${dest} ${src} `;
  return new Promise((resolve, reject) => {
    child.exec(command, (error, stdout, stderr) => {
      error ? reject(stderr) : resolve(stdout);
    });
  });
};
exports.gzipDataInPromise = (data, option = {}) => {
  return new Promise((resolve, reject) => {
      zlib.gzip(JSON.stringify(data), option, (error, result) => {
          error ? reject(error) : resolve(result);
      });
  });
};