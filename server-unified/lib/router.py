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


@app.route('/api/getnodethroughput', methods=['GET', 'POST'])
def get_node_throughput():
    return jsonify(controller.get_node_throughput(request.params))


@app.route('/api/getnodeiops', methods=['GET', 'POST'])
def get_node_iops():
    return jsonify(controller.get_node_iops(request.params))


@app.route('/api/getnodetarget', methods=['GET', 'POST'])
def get_node_target():
    return jsonify(controller.get_node_target(request.params))


@app.route('/api/getclusterserviceandclientip', methods=['GET', 'POST'])
def get_cluster_service_and_client_ip():
    return jsonify(controller.get_cluster_service_and_client_ip())


@app.route('/api/getstoragepool', methods=['GET', 'POST'])
def get_storage_pool():
    return jsonify(controller.get_storage_pool(request.params))


@app.route('/api/createstoragepool', methods=['GET', 'POST'])
def create_storage_pool():
    return jsonify(controller.create_storage_pool(request.params))


@app.route('/api/updatestoragepool', methods=['GET', 'POST'])
def update_storage_pool():
    return jsonify(controller.update_storage_pool(request.params))


@app.route('/api/deletestoragepool', methods=['GET', 'POST'])
def delete_storage_pool():
    return jsonify(controller.delete_storage_pool(request.params))


@app.route('/api/gettargetsinstoragepool', methods=['GET', 'POST'])
def get_targets_in_storage_pool():
    return jsonify(controller.get_targets_in_storage_pool(request.params))


@app.route('/api/getbuddygroupsinstoragepool', methods=['GET', 'POST'])
def get_buddy_groups_in_stoarge_pool():
    return jsonify(controller.get_buddy_groups_in_storage_pool(request.params))


@app.route('/api/getsnapshotsetting', methods=['GET', 'POST'])
def get_snapshot_setting():
    return jsonify(controller.get_snapshot_setting())


@app.route('/api/updatesnapshotsetting', methods=['GET', 'POST'])
def update_snapshot_setting():
    return jsonify(controller.update_snapshot_setting(request.params))


@app.route('/api/getsnapshot', methods=['GET', 'POST'])
def get_snapshot():
    return jsonify(controller.get_snapshot(request.params))


@app.route('/api/createsnapshot', methods=['GET', 'POST'])
def create_snapshot():
    process.do(controller.create_snapshot, request.params)
    return jsonify(handler.response(0, 'Start to create the snapshot!'))


@app.route('/api/updatesnapshot', methods=['GET', 'POST'])
def update_snapshot():
    return jsonify(controller.update_snapshot(request.params))


@app.route('/api/deletesnapshot', methods=['GET', 'POST'])
def delete_snapshot():
    process.do(controller.delete_snapshot, request.params)
    return jsonify(handler.response(0, 'Start to delete the snapshot!'))


@app.route('/api/batchdeletesnapshot', methods=['GET', 'POST'])
def batch_delete_snapshot():
    process.do(controller.batch_delete_snapshot, request.params)
    return jsonify(handler.response(0, 'Start to batch delete snapshots!'))


@app.route('/api/rollbacksnapshot', methods=['GET', 'POST'])
def rollback_snapshot():
    process.do(controller.rollback_snapshot, request.params)
    return jsonify(handler.response(0, 'Start to rollback the snapshot!'))


@app.route('/api/getsnapshotschedule', methods=['GET', 'POST'])
def get_snapshot_schedule():
    return jsonify(controller.get_snapshot_schedule(request.params))


@app.route('/api/createsnapshotschedule', methods=['GET', 'POST'])
def create_snapshot_schedule():
    return jsonify(controller.create_snapshot_schedule(request.params))


@app.route('/api/updatesnapshotschedule', methods=['GET', 'POST'])
def update_snapshot_schedule():
    return jsonify(controller.update_snapshot_schedule(request.params))


@app.route('/api/enablesnapshotschedule', methods=['GET', 'POST'])
def enable_snapshot_schedule():
    return jsonify(controller.enable_snapshot_schedule(request.params))


@app.route('/api/disablesnapshotschedule', methods=['GET', 'POST'])
def disable_snapshot_schedule():
    return jsonify(controller.disable_snapshot_schedule(request.params))


@app.route('/api/deletesnapshotschedule', methods=['GET', 'POST'])
def delete_snapshot_schedule():
    return jsonify(controller.delete_snapshot_schedule(request.params))


@app.route('/api/batchdeletesnapshotschedule', methods=['GET', 'POST'])
def batch_delete_snapshot_schedule():
    return jsonify(controller.batch_delete_snapshot_schedule(request.params))


@app.route('/api/addclienttocluster', methods=['GET', 'POST'])
def add_client_to_cluster():
    return jsonify(controller.add_client_to_cluster(request.params))


@app.route('/api/getclient', methods=['GET', 'POST'])
def get_client():
    return jsonify(controller.get_client())


@app.route('/api/getnasserver', methods=['GET', 'POST'])
def get_nas_server():
    return jsonify(controller.get_nas_server(request.params))


@app.route('/api/createnasserver', methods=['GET', 'POST'])
def create_nas_server():
    return jsonify(controller.create_nas_server(request.params))


@app.route('/api/updatenasserver', methods=['GET', 'POST'])
def update_nas_server():
    return jsonify(controller.update_nas_server(request.params))


@app.route('/api/getfiles', methods=['GET', 'POST'])
def get_files():
    return jsonify(controller.get_files(request.params))


@app.route('/api/getentryinfo', methods=['GET', 'POST'])
def get_entry_info():
    return jsonify(controller.get_entry_info(request.params))


@app.route('/api/setpattern', methods=['GET', 'POST'])
def set_pattern():
    return jsonify(controller.set_pattern(request.params))
