const logger = require('./logger');
const config = require('../config');
const cryptoJS = require('crypto-js');
const model = {
    currentTime() {
        return new Date(new Date().toISOString().replace(/:\d+\.\d+/, ':00.000'));
    },
    startTime() {
        return new Date(new Date(new Date().getTime() + 60000).toISOString().replace(/:\d+\.\d+/, ':00.000'));
    },
    emptyObject(object) {
        return Object.keys(object).length === 0;
    },
    toByte(value, unit) {
        let unitList = ['B', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
        return Math.floor(value * Math.pow(1024, unitList.indexOf(unit)));
    },
    cookie(value) {
        return value ? value === 'true' : undefined;
    },
    user(context) {
        return context.cookies.get('user');
    },
    clientIP(context) {
        return context.get('x-real-ip');
    },
    error(code, message, param = {}) {
        logger.error(`${config.error[code]}, message: ${message}, param: ${JSON.stringify(param)}`);
    },
    response(code, result, param) {
        if (code) {
            model.error(code, result, param);
            return { code, msg: result ? typeof result === 'object' ? result.message || '' : result : '' };
        } else {
            return { code, data: result };
        }
    },
    responseWithoutLog(...args) {
        let [code, index] = [...args];
        return { code, msg: typeof index === 'undefined' ? config.error[code] : config.error[code][index] };
    },
    i18n(text) {
        let wordList = text.split(' ');
        let unique = word => (word.includes('(s)') ? word.replace('(s)', '') : word);
        let measure = word => (String(Number(word)) === word ? word + '个' : word);
        let flip = (word, sentence) => (sentence.includes(word) ? sentence.splice(sentence.indexOf(word), sentence.length - sentence.indexOf(word) - 1).concat(['中'], sentence) : sentence);
        wordList = wordList.includes('to') ? flip('to', wordList) : wordList.includes('in') ? flip('in', wordList) : wordList.includes('from') ? flip('from', wordList) : wordList;
        return wordList.map(word => (unique(word))).map(word => (config.i18n.hasOwnProperty(word) ? config.i18n[word] : measure(word))).join('');
    },
    bypass(array) {
        if (array.length > 5) {
            array = array.slice(0, 5);
            array.push('...');
        }
        return array;
    },
    checkRoot(path, root) {
        return path.split('/')[1] === root.split('/')[1];
    },
    md5(text) {
        return cryptoJS.MD5(text).toString();
    },
    tripleDes(text) {
        return cryptoJS.TripleDES.decrypt(text, config.user.key).toString(cryptoJS.enc.Utf8);
    }
};
module.exports = model;