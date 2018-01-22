const nodemailer = require('nodemailer');
const model = {
    sendMail(param) {
        let { host, port, secure, user, pass, from, to, subject, text, html } = param;
        return new Promise((resolve, reject) => {
            let transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
            transporter.sendMail({ from, to, subject, text, html }, (error, info) => {
                error ? reject(error) : resolve(info);
            });
        });
    }
}
module.exports = model;