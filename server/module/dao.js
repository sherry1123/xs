exports.findOne = (model, conditions, projection = {}, options = {}) => {
    return new Promise((resolve, reject) => {
        model.findOne(conditions, projection, options, (error, doc) => {
            error ? reject(error) : resolve(doc);
        });
    });
};
exports.findById = (model, id, projection = {}, options = {}) => {
    return new Promise((resolve, reject) => {
        model.findById(id, projection, options, (error, doc) => {
            error ? reject(error) : resolve(doc);
        });
    });
};
exports.findAll = (model, conditions, projection = {}, options = {}) => {
    return new Promise((resolve, reject) => {
        model.find(conditions, projection, options, (error, docs) => {
            error ? reject(error) : resolve(docs);
        });
    });
};
exports.count = (model, conditions) => {
    return new Promise((resolve, reject) => {
        model.count(conditions, (error, count) => {
            error ? reject(error) : resolve(count);
        });
    });
};
exports.createOne = (model, doc) => {
    return new Promise((resolve, reject) => {
        model.create(doc, (error, doc) => {
            error ? reject(error) : resolve(doc);
        });
    });
};
exports.createSome = (model, docs) => {
    return new Promise((resolve, reject) => {
        model.create(docs, (error, docs) => {
            error ? reject(error) : resolve(docs);
        });
    });
};
exports.updateOne = (model, conditions, update, options = {}) => {
    return new Promise((resolve, reject) => {
        model.updateOne(conditions, update, options, (error, raw) => {
            error ? reject(error) : resolve(raw);
        });
    });
};
exports.updateById = (model, id, update, options = {}) => {
    return new Promise((resolve, reject) => {
        model.updateOne({ _id: id }, update, options, (error, raw) => {
            error ? reject(error) : resolve(raw);
        });
    });
};
exports.updateAll = (model, conditions, update, options = {}) => {
    return new Promise((resolve, reject) => {
        model.updateMany(conditions, update, options, (error, raws) => {
            error ? reject(error) : resolve(raws);
        });
    });
};
exports.deleteOne = (model, conditions) => {
    return new Promise((resolve, reject) => {
        model.deleteOne(conditions, error => {
            error ? reject(error) : resolve();
        });
    });
};
exports.deleteById = (model, id) => {
    return new Promise((resolve, reject) => {
        model.deleteOne({ _id: id }, error => {
            error ? reject(error) : resolve();
        });
    });
};
exports.deleteAll = (model, conditions) => {
    return new Promise((resolve, reject) => {
        model.deleteMany(conditions, error => {
            error ? reject(error) : resolve();
        });
    });
};