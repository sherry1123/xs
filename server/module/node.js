const promise = require('./promise');
exports.isMaster = () => (true);
exports.updateNginxConf = async ip => {
    let path = '/etc/nginx/nginx.conf';
    let file = await promise.readFileInPromise(path);
    file.replace(/127\.0\.0\.1/g, `${ip}`)
        .replace(/try_files\s\$uri\s\/index\.html;/, 
        "proxy_pass $master;\n            proxy_set_header Host $host;\n            proxy_set_header Connection '';\n            proxy_set_header X-Real-IP  $remote_addr;\n            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;");
    await promise.writeFileInPromise(path, file);
}