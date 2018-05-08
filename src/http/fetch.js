import {stringify} from 'querystring';
import routerPath from '../views/routerPath';
import {ckGet} from '../services/cookie/index';

// this url is always allowed to access
const alwaysAllowURL = '/api/syncsystemstatus';

const initRequest = (url, options) => {
    let isDeInit = ckGet('deInit');
    let isRollingBack = ckGet('rollbacking');
    // if system is de-initializing or rolling back, all HTTP requests shouldn't be sent,
    // only except the alwaysAllowURL, it can go through properly.
    if ((isDeInit !== 'true' && isRollingBack  !== 'true') || url === alwaysAllowURL){
        return new Promise(async (resolve, reject) => {
            options.credentials = 'same-origin';
            options.headers = {'Content-Type': 'application/json; charset=utf-8'};
            try {
                let response = await fetch(url, options);
                if (response.ok){
                    let {code, data, msg} = await response.json();
                    if (!window.location.hash.match(routerPath.Init)){
                        // if not on initialize page, need to verify system status
                        let isInitialized = ckGet('init');
                        let isLoggedIn = ckGet('login');
                        if (!isInitialized || (isInitialized !== 'true')){
                            window.location.hash = routerPath.Init;
                        } else {
                            if (!isLoggedIn || (isLoggedIn === 'false')){
                                window.location.hash = routerPath.Login;
                            }
                        }
                    }
                    if (code === 0){
                        resolve(data);
                    } else {
                        reject({code, msg});
                    }

                } else {
                    reject({msg: response.statusText});
                }
            } catch (error){
                reject(error);
            }
        });
    }
};

const initSearchUrl = (url, param) => (param ? url + '?' + stringify(param) : url);

export const fetchGet = (url, param) => (initRequest(initSearchUrl(url, param), {method: 'GET'}));

export const fetchPost = (url, param) => (initRequest(url, {method: 'POST', body: JSON.stringify(param)}));

export const fetchMock = (data) => new Promise(resolve => setTimeout(() => resolve(data || true), 1500));