const request = require('request');
const handler = require('./handler');
const querystring = require('querystring');
const initSearchUrl = (url, param) => (handler.emptyObject(param) ? url : url + '?' + querystring.stringify(param));
exports.get = (url, param, token = {}, isJson) => {
    return new Promise((resolve, reject) => {
        request.get(initSearchUrl(url, param), { headers: token }, (error, response, body) => {
            !error && response.statusCode === 200 ? resolve(isJson ? JSON.parse(body) : body) : reject(error);
        });
    });
};
exports.post = (url, param, token = {}, isJson) => {
    return new Promise((resolve, reject) => {
        request.post(url, { headers: token, json: isJson, body: param }, (error, response, body) => {
            !error && response.statusCode === 200 ? resolve(body) : reject(error);
        });
    });
};
exports.put = (url, param, token = {}, isJson) => {
    return new Promise((resolve, reject) => {
        request.put(url, { headers: token, json: isJson, body: param }, (error, response, body) => {
            !error && response.statusCode === 200 ? resolve(body) : reject(error);
        });
    });
};
exports.delete = (url, param, token = {}, isJson) => {
    return new Promise((resolve, reject) => {
        request.del(url, { headers: token, json: isJson, body: param }, (error, response, body) => {
            !error && response.statusCode === 200 ? resolve(body) : reject(error);
        });
    });
};