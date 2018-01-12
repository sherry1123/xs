const request = require('request');
const querystring = require('querystring');
const initSearchUrl = (url, param) => (param ? url + '?' + querystring.stringify(param) : url);
const model = {
    get(url, param) {
        return new Promise((resolve, reject) => {
            request.get(initSearchUrl(url, param), (error, response, body) => {
                !error && response.statusCode === 200 ? resolve(JSON.parse(body)) : reject(error); 
            });
        });
    },
    post(url, param) {
        return new Promise((resolve, reject) => {
            request.post(url, {form: param}, (error, response, body) => {
                !error && response.statusCode === 200 ? resolve(JSON.parse(body)) : reject(error); 
            });
        });
    }
};
module.exports = model;