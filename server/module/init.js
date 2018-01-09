let init = false;
const model = {
    status: {
        get() {
            return init;
        },
        check() {
            //todo
            model.status.set(true);
            return init;
        },
        set(status) {
            init = status;
        }
    },
    process: {

    },
    step: {
        
    }
}
module.exports = model;