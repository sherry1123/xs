const dao = require('../module/dao');
const test = require('../model/test');
const handler = require('../module/handler');
const model = {
    async get(param) {
        let result = {};
        try {
            let data = await dao.findSome(test, param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(1, error);
        }
        return result;
    },
    async post(param) {
        let result = {};
        try {
            let data = await dao.createOne(test, param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(1, error);
        }
        return result;
    },
    async put(query, param) {
        let result = {};
        try {
            let data = await dao.updateOne(test, query, param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(1, error);
        }
        return result;
    },
    async delete(param) {
        let result = {};
        try {
            let data = await dao.deleteOne(test, param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(1, error);
        }
        return result;
    }
}

module.exports = model;