let init = false;
const model = {
    getInitStatus() {
        return init;
    },
    checkInitStatus() {
        //todo
        model.setInitStatus(true);
        return init;
    },
    setInitStatus(status) {
        init = status;
    }
}
module.exports = model;