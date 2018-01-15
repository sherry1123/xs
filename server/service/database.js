const dao = require('../module/dao');
const user = require('../model/user');
const model = {
    async getUser(param) {
        return await dao.findOne(user, param);
    },
    async addUser(param) {
        return await dao.createOne(user, param);
    },
    async updateUser(query, param) {
        return await dao.updateOne(user, query, param);
    },
    async deleteUser(param) {
        return await dao.deleteOne(user, param);
    }
}
module.exports = model;