const bytestoSizeApi = () => {
    /*
     * @param {number} data
     * @param {number} num (how many digits to see)
     * @param {boolean} returnNum // if returnNum is true, return an object include value and unit; if returnNum is false, return an string
     * @param {string} unitFrom // old unit
     * @param {string} unitTo // new unit
     * @returns {obj or string}
     */
    const getSize = (data, num, k, unitFrom, unitTo, returnNum, showBit) => {
        let i = 0;
        let sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        if (typeof data === typeof "0") {
            return 'n/a';
        }
        if ((data < 1 && unitFrom === 'B') || data === 0){
            if (returnNum) {
                return {value: 0, unit: 'B', pow: 0};
            }
            if (showBit){
                return '0 b';
            }
            return '0 ' + unitFrom;
        }
        let pow = 0;
        for (let j = 0; j < sizes.length; j ++){
            pow = j;
            if (unitFrom === sizes[j]){
                break;
            }
        }
        data = data * Math.pow(k, pow);
        if (unitTo === 'auto'){
            i = parseInt(Math.floor(Math.log(data) / Math.log(k)), 0);
        } else {
            for (i = 0; i < sizes.length; i ++){
                if (unitTo === sizes[i]){
                    break;
                }
            }
        }
        if (i === 0){
            if (returnNum){
                return {value: data.toFixed(num), unit: sizes[i], pow: i};
            }
            return data.toFixed(num) + ' ' + sizes[i];
        }
        if (returnNum){
            return {value: (data / Math.pow(k, i)).toFixed(num), unit: sizes[i], pow: i};
        }
        // in order to round down, use the next function
        let cleaner = Math.pow(10, num);
        let size_result = showBit ? Math.round((data / Math.pow(k, i))*cleaner)/cleaner * 8 : Math.round((data / Math.pow(k, i))*cleaner)/cleaner;
        let size_unit = showBit ? sizes[i].replace('B', 'b') : sizes[i];
        return ((size_result).toFixed(num) || 0) + ' ' + size_unit;
        // return (data / Math.pow(k, i)).toFixed(num) + ' ' + sizes[i];
    };

    return {
        storage (data, num, returnNum, unitFrom, unitTo){
            if (typeof data !== 'number') {
                let original = data;
                data = Number(data);
                if (isNaN(data)) {
                    return original;
                }
            }
            if (num === undefined || typeof num !== 'number') {
                num = 2;
            }
            if (unitFrom === undefined) {
                unitFrom = 'B';
            }
            if (unitTo === undefined) {
                unitTo = 'auto';
            }
            if (returnNum === undefined) {
                returnNum = false;
            }
            return getSize(data, num, 1024, unitFrom, unitTo, returnNum);
        },
        network (data, num, returnNum, unitFrom, unitTo, showBit){
            if (typeof data !== 'number') {
                let original = data;
                data = Number(data);
                if (isNaN(data)) {
                    return original;
                }
            }
            if (num === undefined || typeof num !== 'number') {
                num = 2;
            }
            if (unitFrom === undefined) {
                unitFrom = 'B';
            }
            if (unitTo === undefined) {
                unitTo = 'auto';
            }
            if (returnNum === undefined) {
                returnNum = false;
            }
            return getSize(data, num, 1000, unitFrom, unitTo, returnNum, showBit);
        },

        combineUnit (val, unit){
            switch (unit) {
                case 'B':
                    return val + unit;
                default:
                    return val + unit.substring(0, 1);
            }
        }
    };
};

export const storageSizeFilter = (bytes, unitTo, returnNum, unitFrom, num) => {
    if (bytes === null || bytes === '' || bytes === undefined){
        return '';
    }
    return bytestoSizeApi().storage(bytes, num, returnNum, unitFrom, unitTo);
};

export const networkSizeFilter = (bytes, unitTo, returnNum, showBit) => {
    if (bytes === null || bytes === '' || bytes === undefined){
        return '';
    }
    return bytestoSizeApi().network(bytes, undefined, returnNum, undefined, unitTo, showBit);
};