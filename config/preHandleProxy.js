const chalk = require('chalk');
let [ , , serverPath] = process.argv;
const PROTOCOL_VALIDATE_REG = /http:|https:|ws:/;
const IPV4_EXTRACT_REG = /(\d+\.\d+\.\d+\.\d+)/;
const IPV4_VALIDATE_REG = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

module.exports = function(proxy) {
    if (serverPath){
        console.log(chalk.cyan('Validate server path ... \n'));
        if (!(PROTOCOL_VALIDATE_REG.test(serverPath))){
            console.error(chalk.red(`Validate server path failed: server path "${serverPath}" provided in "npm start" command needs a valid protocol, and like "http", "https" & "ws" are supported. \n`));
            process.exit(1);
        } else {
            let extractResult = serverPath.match(IPV4_EXTRACT_REG);
            if (!extractResult || !IPV4_VALIDATE_REG.test(extractResult[0])){
                console.error(chalk.red(`Validate server path failed: server path "${serverPath}" provided in "npm start" command does not have a valid IPv4. \n`));
                process.exit(1);
            }
            Object.keys(proxy).forEach(key => proxy[key].target = serverPath);
            console.log(chalk.cyan('Server path validation passes. \n'));
        }
    }
    return proxy;
};

// an example:
// $ npm (run) start http://192.168.100.233:3579