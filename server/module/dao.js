exports.findOne = (model, param) => {
    return new Promise((resolve, reject) => {
        model.findOne(param, (error, docs) => {
            error ? reject(error) : resolve(docs);
        });
    });
};
exports.findSome = (model, param) => {
    return new Promise((resolve, reject) => {
        model.find(param, (error, docs) => {
            error ? reject(error) : resolve(docs);
        });
    });
};
exports.findAll = model => {
    return new Promise((resolve, reject) => {
        model.find({}, (error, docs) => {
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
exports.deleteOne = (model, param) => {
    return new Promise((resolve, reject) => {
        model.remove(param, (error, docs) => {
            error ? reject(error) : resolve(docs);
        });
    });
};
exports.deleteAll = model => {
    return new Promise((resolve, reject) => {
        model.remove({}, (error, docs) => {
            error ? reject(error) : resolve(docs);
        });
    });
};