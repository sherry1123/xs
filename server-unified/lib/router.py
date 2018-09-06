from flask import jsonify, make_response, request

from lib import controller
from lib.module import handler, process
from lib.util.socket import app


@app.route('/api/syncsystemstatus', methods=['GET', 'POST'])
def sync_status():
    return jsonify(controller.sync_status())


@app.route('/api/checkclusterenv', methods=['POST'])
def check_env():
    return jsonify(controller.check_env(request.params))


@app.route('/api/getraidrecommendedconfiguration', methods=['POST'])
def get_raid():
    return jsonify(controller.get_raid(request.params))


@app.route('/api/getdisklist', methods=['GET', 'POST'])
def get_disklist():
    return jsonify(controller.get_disklist(request.params))


@app.route('/api/receiveevent', methods=['POST'])
def receive_event():
    return jsonify(controller.receive_event(request.params))


@app.route('/api/init', methods=['POST'])
def initialize_cluster():
    process.do(controller.initialize_cluster, request.params)
    return jsonify(handler.response(0, 'Start to initialize the cluster!'))


@app.route('/api/deinit', methods=['GET', 'POST'])
def deinitialize_cluster():
    process.do(controller.deinitialize_cluster, 1)
    return jsonify(handler.response(0, 'Start to de-initialize the cluster!'))


@app.route('/api/getdefaultuser', methods=['GET', 'POST'])
def get_default_user():
    return jsonify(controller.get_default_user())


@app.route('/api/login', methods=['POST'])
def login():
    result = controller.login(request.params)
    response = make_response(jsonify(result))
    if not result['code']:
        response.set_cookie('login', 'true')
        response.set_cookie('user', result['data']['username'])
    return response


@app.route('/api/logout', methods=['POST'])
def logout():
    result = controller.logout(request.params)
    response = make_response(jsonify(result))
    if not result['code']:
        response.set_cookie('login', 'false')
        response.set_cookie('user', '')
    return response


@app.route('/api/getuser', methods=['GET', 'POST'])
def get_user():
    return jsonify(controller.get_user(request.params))


@app.route('/api/createuser', methods=['POST'])
def create_user():
    return jsonify(controller.create_user(request.params))


@app.route('/api/updateuser', methods=['POST'])
def update_user():
    return jsonify(controller.update_user(request.params))


@app.route('/api/deleteuser', methods=['POST'])
def delete_user():
    return jsonify(controller.delete_user(request.params))
