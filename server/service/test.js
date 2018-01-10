const test = require('../model/test');
const dao = require('../module/dao');
const model = {
    async get(param) {
        let result = {};
        try {
            result = await dao.findSome(test, param);
        } catch (error) {
            result.result = {}
        }
        return result.result;
    },
    async post(param) {
        let result = {};
        try {
            result = await dao.createOne(test, param);
        } catch (error) {
            result.result = {};
        }
        return result.result;
    },
    async put(query, param) {
        let result = {};
        try {
            result = await dao.updateOne(test, query, param);
        } catch (error) {
            result.result = {};
        }
        return result.result;
    },
    async delete(param) {
        let result = {};
        try {
            result = await dao.deleteOne(test, param);
        } catch (error) {
            result.result = {};
        }
        return result.result;
    }
}

module.exports = model;