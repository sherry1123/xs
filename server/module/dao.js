const handler = require('./handler');
exports.findOne = (model, param) => {
    return new Promise(resolve => {
        model.findOne(param, (error, docs) => {
            resolve(handler.database(error, docs));
        });
    });
};
exports.findSome = (model, param) => {
    return new Promise(resolve => {
        model.find(param, (error, docs) => {
            resolve(handler.database(error, docs));
        });
    });
};
exports.findAll = model => {
    return new Promise(resolve => {
        model.find({}, (error, docs) => {
            resolve(handler.database(error, docs));
        });
    });
};
exports.createOne = (model, param) => {
    return new Promise(resolve => {
        model.create(param, (error, docs) => {
            resolve(handler.database(error, docs));  
        });
    });
};
exports.updateOne = (model, query, param) => {
    return new Promise(resolve => {
        model.findOneAndUpdate(query, param, (error, docs) => {
            resolve(handler.database(error, docs));
        });
    });
};
exports.deleteOne = (model, param) => {
    return new Promise(resolve => {
        model.remove(param, (error, docs) => {
            resolve(handler.database(error, docs));
        });
    });
};
exports.deleteAll = model => {
    return new Promise(resolve => {
        model.remove({}, (error, docs) => {
            resolve(handler.database(error, docs));
        });
    });
};