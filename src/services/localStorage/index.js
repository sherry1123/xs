const localStorage = window.localStorage;

export const lsGet = (keys) => {
    if (!Array.isArray(keys)){
        let val = localStorage.getItem(keys);
        try {
            return JSON.parse(val) || undefined;
        } catch (e){
            return val;
        }
    } else {
        return keys.map(key => {
            let val = JSON.parse(localStorage.getItem(key));
            try {
                return JSON.parse(val) || undefined;
            } catch (e){
                return val;
            }
        });
    }
};

export const lsSet = (key, val) => {
    localStorage.setItem(key, JSON.stringify(val));
};

export const lsRemove = (keys) => {
    !Array.isArray(keys) && (keys = [keys]);
    for (let key of keys){
        localStorage.removeItem(key);
    }
};

export const lsClearAll = () => {
    localStorage.clear();
};

// this tool is based on localStorage API, supports single or batch set/get/remove operations on one key