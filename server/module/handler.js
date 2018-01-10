exports.database = (error, docs) => (error ? {code: -1, result: error} : docs ? {code: 1, result: docs} : {code: 0, result: docs});
exports.response = result => ({result});