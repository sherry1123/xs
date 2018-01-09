const test = require('../model/test');
const dao = require('../module/dao');
const model = {
    async get() {
        let result = await dao.find(test);
        return result;
    },
    async post(param) {
        let result = await dao.create(test, param);
        return result;
    }
}

module.exports = model;