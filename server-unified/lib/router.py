from flask import jsonify, make_response, request

from lib import controller
from lib.module import handler, process
from lib.util.socket import app


@app.route('/api/syncsystemstatus', methods=['GET', 'POST'])
def sync_status():
    return jsonify(controller.sync_status())


@app.route('/api/checkclusterenv', methods=['GET', 'POST'])
def check_env():
    return jsonify(controller.check_env(request.params))


@app.route('/api/getraidrecommendedconfiguration', methods=['GET', 'POST'])
def get_raid():
    return jsonify(controller.get_raid(request.params))


@app.route('/api/getdisklist', methods=['GET', 'POST'])
def get_disk_list():
    return jsonify(controller.get_disk_list(request.params))


@app.route('/api/init', methods=['GET', 'POST'])
def initialize_cluster():
    process.do(controller.initialize_cluster, request.params)
    return jsonify(handler.response(0, 'Start to initialize the cluster!'))


@app.route('/api/deinit', methods=['GET', 'POST'])
def deinitialize_cluster():
    process.do(controller.deinitialize_cluster, 1)
    return jsonify(handler.response(0, 'Start to de-initialize the cluster!'))


@app.route('/api/receiveevent', methods=['GET', 'POST'])
def receive_event():
    return jsonify(controller.receive_event(request.params))


@app.route('/api/login', methods=['GET', 'POST'])
def login():
    result = controller.login(request.params)
    response = make_response(jsonify(result))
    if not result['code']:
        response.set_cookie('login', 'true')
        response.set_cookie('user', result['data']['username'])
    return response


@app.route('/api/logout', methods=['GET', 'POST'])
def logout():
    result = controller.logout(request.params)
    response = make_response(jsonify(result))
    if not result['code']:
        response.set_cookie('login', 'false')
        response.set_cookie('user', '')
    return response


@app.route('/api/getdefaultuser', methods=['GET', 'POST'])
def get_default_user():
    return jsonify(controller.get_default_user())


@app.route('/api/getuser', methods=['GET', 'POST'])
def get_user():
    return jsonify(controller.get_user(request.params))


@app.route('/api/createuser', methods=['GET', 'POST'])
def create_user():
    return jsonify(controller.create_user(request.params))


@app.route('/api/updateuser', methods=['GET', 'POST'])
def update_user():
    return jsonify(controller.update_user(request.params))


@app.route('/api/deleteuser', methods=['GET', 'POST'])
def delete_user():
    return jsonify(controller.delete_user(request.params))


@app.route('/api/getclusterinfo', methods=['GET', 'POST'])
def get_cluster_info():
    return jsonify(controller.get_cluster_info())


@app.route('/api/getmetanodestatus', methods=['GET', 'POST'])
def get_meta_status():
    return jsonify(controller.get_meta_status())


@app.route('/api/getstoragenodestatus', methods=['GET', 'POST'])
def get_storage_status():
    return jsonify(controller.get_storage_status())


@app.route('/api/getclustertarget', methods=['GET', 'POST'])
def get_target_list():
    return jsonify(controller.get_target_list(request.params))


@app.route('/api/getclusterthroughput', methods=['GET', 'POST'])
def get_cluster_throughput():
    return jsonify(controller.get_cluster_throughput())


@app.route('/api/getclusteriops', methods=['GET', 'POST'])
def get_cluster_iops():
    return jsonify(controller.get_cluster_iops())


@app.route('/api/getnodelist', methods=['GET', 'POST'])
def get_node_list():
    return jsonify(controller.get_node_list())


@app.route('/api/getnodeservice', methods=['GET', 'POST'])
def get_node_service():
    return jsonify(controller.get_node_service(request.params))


@app.route('/api/getnodecpu', methods=['GET', 'POST'])
def get_node_cpu():
    return jsonify(controller.get_node_cpu(request.params))


@app.route('/api/getnodememory', methods=['GET', 'POST'])
def get_node_memory():
    return jsonify(controller.get_node_memory(request.params))
