const test = require('../model/test');
const dao = require('../module/dao');
const model = {
    async get() {
        let result = await dao.findAll(test);
        return result;
    },
    async post(param) {
        let result = await dao.findOne(test, param);
        return result;
    }
}

module.exports = model;