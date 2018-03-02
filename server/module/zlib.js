const zlib = require('zlib');
exports.gzip = (data, option = {}) => {
    return new Promise((resolve, reject) => {
        zlib.gzip(JSON.stringify(data), option, (error, result) => {
            error ? reject(error) : resolve(result);
        });
    });
};