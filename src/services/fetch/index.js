import {stringify} from 'querystring';

const initRequest = (url, options) => {
    return new Promise(async (resolve, reject) => {
        options.credentials = 'same-origin';
        options.headers = {'Content-Type': 'application/json; charset=utf-8'};
        try {
            let response = await fetch(url, options);
            if (response.ok) {
                let data = await response.json();
                resolve(data);
            } else {
                reject(response.statusText);
            }
        } catch (error) {
            reject(error);
        }
    });
};

const initSearchUrl = (url, param) => (param ? url + '?' + stringify(param) : url);

const fetchGet = (url, param) => (initRequest(initSearchUrl(url, param), {method: 'GET'}));

const fetchPost = (url, param) => (initRequest(url, {method: 'POST', body: JSON.stringify(param)}));

export {fetchGet, fetchPost};