from flask import jsonify, make_response, request

from lib import controller
from lib.module import handler, terminal
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
    terminal.do(controller.initialize_cluster, request.params)
    return jsonify(handler.response(0, 'Start to initialize the cluster!'))


@app.route('/api/deinit', methods=['POST'])
def deinitialize_cluster():
    result = controller.deinitialize_cluster(request.params)
    response = make_response(jsonify(result))
    result['code'] or response.set_cookie('initialize', 'false')
    return response


@app.route('/api/login', methods=['POST'])
def login():
    result = controller.login(request.params)
    response = make_response(jsonify(result))
    result['code'] or response.set_cookie('login', 'true')
    return response


@app.route('/api/logout', methods=['POST'])
def logout():
    result = controller.logout(request.params)
    response = make_response(jsonify(result))
    result['code'] or response.set_cookie('login', 'false')
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
