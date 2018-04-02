const localStorage = window.localStorage;

export const lsGet = (keys) => {
    if (!Array.isArray(keys)){
        let val = localStorage.getItem(keys);
        try {
            return JSON.parse(val);
        } catch (e){
            return val;
        }
    } else {
        return keys.map(key => {
            let val = JSON.parse(localStorage.getItem(key));
            try {
                return JSON.parse(val);
            } catch (e){
                return val;
            }
        });
    }
};

export const lsSet = (keys, vals) => {
    !Array.isArray(keys) && (keys = [keys]);
    !Array.isArray(vals) && (vals = [vals]);
    keys.forEach((key, i) => {
        let valStr = JSON.stringify(vals[i] || []);
        localStorage.setItem(key, valStr);
    });
};

export const lsRemove = (keys) => {
    !Array.isArray(keys) && (keys = [keys]);
    for (let key of keys){
        localStorage.removeItem(key);
    }
};

// this tool is based on localStorage API, supports single or batch set/get/remove operations on one key