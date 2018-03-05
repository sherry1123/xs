const config = require('../config');
const request = require('../module/request');
const model = {
    async getToken() {
        let result = await request.get(config.api.orcafs.gettoken);
        return result;
    }
};
module.exports = model;