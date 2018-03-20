const request = require('request');
const querystring = require('querystring');
const initSearchUrl = (url, param) => (param ? url + '?' + querystring.stringify(param) : url);
exports.get = (url, param, token={}, isJson) => {
    return new Promise((resolve, reject) => {
        request.get(initSearchUrl(url, param), {headers: token}, (error, response, body) => {
            !error && response.statusCode === 200 ? resolve(isJson ? JSON.parse(body) : body) : reject(error); 
        });
    });
};
exports.post = (url, param, token={}, isJson) => {
    return new Promise((resolve, reject) => {
        request.post(url,{headers: token, form: param}, (error, response, body) => {
            !error && response.statusCode === 200 ? resolve(isJson ? JSON.parse(body) : body) : reject(error); 
        });
    });
};
exports.put = (url, param, token={}, isJson) => {
    return new Promise((resolve, reject) => {
        request.put(url, {headers: token, form: param}, (error, response, body) => {
            !error && response.statusCode === 200 ? resolve(isJson ? JSON.parse(body) : body) : reject(error);
        });
    });
};
exports.delete = (url, param, token={}, isJson) => {
    return new Promise((resolve, reject) => {
        request.del(url, {headers: token, form: param}, (error, response, body) => {
            !error && response.statusCode === 200 ? resolve(isJson ? JSON.parse(body) : body) : reject(error);
        });
    });
};