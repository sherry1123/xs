exports.findOne = (model, param) => {
    return new Promise((resolve, reject) => {
        model.findOne(param, (error, docs) => {
            error ? reject(error) : resolve(docs);
        });
    });
};
exports.findAll = (model, param) => {
    return new Promise((resolve, reject) => {
        model.find(param, (error, docs) => {
            error ? reject(error) : resolve(docs);
        });
    });
};
exports.createOne = (model, param) => {
    return new Promise((resolve, reject) => {
        model.create(param, (error, docs) => {
            error ? reject(error) : resolve(docs);
        });
    });
};
exports.updateOne = (model, query, param) => {
    return new Promise((resolve, reject) => {
        model.findOneAndUpdate(query, param, (error, docs) => {
            error ? reject(error) : resolve(docs);
        });
    });
};
exports.updateAll = (model, query, param) => {
    return new Promise((resolve, reject) => {
        model.update(query, param, (error, docs) => {
            error ? reject(error): resolve(docs);
        });
    });
};
exports.deleteOne = (model, param) => {
    return new Promise((resolve, reject) => {
        model.findOneAndRemove(param, (error, docs) => {
            error ? reject(error) : resolve(docs);
        });
    });
};
exports.deleteAll = (model, param) => {
    return new Promise((resolve, reject) => {
        model.remove(param, (error, docs) => {
            error ? reject(error) : resolve(docs);
        });
    });
};