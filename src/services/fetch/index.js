import {stringify} from 'querystring';

const initRequest = (url, options) => {
    return new Promise(async (resolve, reject) => {
        options.credentials = 'same-origin';
        options.headers = {'Content-Type': 'application/json; charset=utf-8'};
        try {
            let response = await fetch(url, options);
            if (response.ok) {
                let {code, data, message} = await response.json();
                if (code === 0){
                    resolve(data);
                } else {
                    reject({code, message});
                }
            } else {
                reject({message: response.statusText});
            }
        } catch (error){
            reject(error);
        }
    });
};

const initSearchUrl = (url, param) => (param ? url + '?' + stringify(param) : url);

const fetchGet = (url, param) => (initRequest(initSearchUrl(url, param), {method: 'GET'}));

const fetchPost = (url, param) => (initRequest(url, {method: 'POST', body: JSON.stringify(param)}));

const fetchMock = () => new Promise(resolve => setTimeout(resolve(true), 1500));

export {fetchGet, fetchPost, fetchMock};