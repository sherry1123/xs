exports.find = (model) => {
    return new Promise(resolve => {
        model.find({}, (err, docs) => {
            resolve(err ? {result: false, message: err} : {result: true, message: docs});
        })
    })
};
exports.create = (model, param) => {
    return new Promise(resolve => {
        model.create(param, (err, docs) => {
            resolve(err ? {result: false, message: err} : {result: true, message: docs});  
        });
    })
};