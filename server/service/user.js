const dao = require('../module/dao');
const user = require('../model/user');
const handler = require('../module/handler');
const model = {
    async get(param) {
        let result = {};
        try {
            let data = await dao.findSome(user, param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(1, error);
        }
        return result;
    },
    async post(param) {
        let result = {};
        try {
            let data = await dao.createOne(user, param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(1, error);
        }
        return result;
    },
    async put(query, param) {
        let result = {};
        try {
            let data = await dao.updateOne(user, query, param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(1, error);
        }
        return result;
    },
    async delete(param) {
        let result = {};
        try {
            let data = await dao.deleteOne(user, param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(1, error);
        }
        return result;
    }
}
module.exports = model;