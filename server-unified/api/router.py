from flask import jsonify, make_response, request

from api import controller
from api.module import handler, process
from api.util.cache import cache
from api.util.socket import app


@app.route('/api/syncsystemstatus', methods=['GET', 'POST'])
def sync_status():
    result = controller.sync_status()
    response = make_response(jsonify(result))
    response.set_cookie('origin_host', request.host)
    return response


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


@app.route('/api/getbuddygroup', methods=['GET', 'POST'])
def get_buddy_group():
    return jsonify(controller.get_buddy_group())


@app.route('/api/getfiles', methods=['GET', 'POST'])
def get_files():
    return jsonify(controller.get_files(request.params))


@app.route('/api/getentryinfo', methods=['GET', 'POST'])
def get_entry_info():
    return jsonify(controller.get_entry_info(request.params))


@app.route('/api/setpattern', methods=['GET', 'POST'])
def set_pattern():
    return jsonify(controller.set_pattern(request.params))


@app.route('/api/geteventlog', methods=['GET', 'POST'])
def get_event_log():
    return jsonify(controller.get_event_log())


@app.route('/api/getauditlog', methods=['GET', 'POST'])
def get_audit_log():
    return jsonify(controller.get_audit_log())


@app.route('/api/getlocalauthuser', methods=['GET', 'POST'])
def get_local_auth_user():
    return jsonify(controller.get_local_auth_user(request.params))


@app.route('/api/createlocalauthuser', methods=['GET', 'POST'])
def create_local_auth_user():
    return jsonify(controller.create_local_auth_user(request.params))


@app.route('/api/updatelocalauthuser', methods=['GET', 'POST'])
def update_local_auth_user():
    return jsonify(controller.update_local_auth_user(request.params))


@app.route('/api/deletelocalauthuser', methods=['GET', 'POST'])
def delete_local_auth_user():
    return jsonify(controller.delete_local_auth_user(request.params))


@app.route('/api/batchdeletelocalauthuser', methods=['GET', 'POST'])
def batch_delete_local_auth_user():
    return jsonify(controller.batch_delete_local_auth_user(request.params))


@app.route('/api/getlocalauthusergroup', methods=['GET', 'POST'])
def get_local_auth_user_group():
    return jsonify(controller.get_local_auth_user_group(request.params))


@app.route('/api/createlocalauthusergroup', methods=['GET', 'POST'])
def create_local_auth_user_group():
    return jsonify(controller.create_local_auth_user_group(request.params))


@app.route('/api/updatelocalauthusergroup', methods=['GET', 'POST'])
def update_local_auth_user_group():
    return jsonify(controller.update_local_auth_user_group(request.params))


@app.route('/api/deletelocalauthusergroup', methods=['GET', 'POST'])
def delete_local_auth_user_group():
    return jsonify(controller.delete_local_auth_user_group(request.params))


@app.route('/api/getlocalauthuserfromgroup', methods=['GET', 'POST'])
def get_local_auth_user_from_group():
    return jsonify(controller.get_local_auth_user_from_group(request.params))


@app.route('/api/addlocalauthusertogroup', methods=['GET', 'POST'])
def add_local_auth_user_to_group():
    return jsonify(controller.add_local_auth_user_to_group(request.params))


@app.route('/api/removelocalauthuserfromgroup', methods=['GET', 'POST'])
def remove_local_auth_user_from_group():
    return jsonify(controller.remove_local_auth_user_from_group(request.params))


@app.route('/api/getnfsshare', methods=['GET', 'POST'])
def get_nfs_share():
    return jsonify(controller.get_nfs_share(request.params))


@app.route('/api/createnfsshare', methods=['GET', 'POST'])
def create_nfs_share():
    return jsonify(controller.create_nfs_share(request.params))


@app.route('/api/updatenfsshare', methods=['GET', 'POST'])
def update_nfs_share():
    return jsonify(controller.update_nfs_share(request.params))


@app.route('/api/deletenfsshare', methods=['GET', 'POST'])
def delete_nfs_share():
    return jsonify(controller.delete_nfs_share(request.params))


@app.route('/api/batchdeletenfsshare', methods=['GET', 'POST'])
def batch_delete_nfs_share():
    return jsonify(controller.batch_delete_nfs_share(request.params))


@app.route('/api/getclientinnfsshare', methods=['GET', 'POST'])
def get_client_in_nfs_share():
    return jsonify(controller.get_client_in_nfs_share(request.params))


@app.route('/api/createclientinnfsshare', methods=['GET', 'POST'])
def create_client_in_nfs_share():
    return jsonify(controller.create_client_in_nfs_share(request.params))


@app.route('/api/updateclientinnfsshare', methods=['GET', 'POST'])
def update_client_in_nfs_share():
    return jsonify(controller.update_client_in_nfs_share(request.params))


@app.route('/api/deleteclientinnfsshare', methods=['GET', 'POST'])
def delete_client_in_nfs_share():
    return jsonify(controller.delete_client_in_nfs_share(request.params))


@app.route('/api/getcifsshare', methods=['GET', 'POST'])
def get_cifs_share():
    return jsonify(controller.get_cifs_share(request.params))


@app.route('/api/createcifsshare', methods=['GET', 'POST'])
def create_cifs_share():
    return jsonify(controller.create_cifs_share(request.params))


@app.route('/api/updatecifsshare', methods=['GET', 'POST'])
def update_cifs_share():
    return jsonify(controller.update_cifs_share(request.params))


@app.route('/api/deletecifsshare', methods=['GET', 'POST'])
def delete_cifs_share():
    return jsonify(controller.delete_cifs_share(request.params))


@app.route('/api/batchdeletecifsshare', methods=['GET', 'POST'])
def batch_delete_cifs_share():
    return jsonify(controller.batch_delete_cifs_share(request.params))


@app.route('/api/getuserorgroupfromcifsshare', methods=['GET', 'POST'])
def get_user_or_group_from_cifs_share():
    return jsonify(controller.get_user_or_group_from_cifs_share(request.params))


@app.route('/api/adduserorgrouptocifsshare', methods=['GET', 'POST'])
def add_user_or_group_to_cifs_share():
    return jsonify(controller.add_user_or_group_to_cifs_share(request.params))


@app.route('/api/updateuserorgroupincifsshare', methods=['GET', 'POST'])
def update_user_or_group_in_cifs_share():
    return jsonify(controller.update_user_or_group_in_cifs_share(request.params))


@app.route('/api/removeuserorgroupfromcifsshare', methods=['GET', 'POST'])
def remove_user_or_group_from_cifs_share():
    return jsonify(controller.remove_user_or_group_from_cifs_share(request.params))


@app.route('/api/createdir', methods=['GET', 'POST'])
def create_dir():
    return jsonify(controller.create_dir(request.params))


@app.route('/api/updatelocalauthuserstatus', methods=['GET', 'POST'])
def update_local_auth_user_status():
    return jsonify(controller.update_local_auth_user_status(request.params))


@app.route('/api/getlocalauthusersetting', methods=['GET', 'POST'])
def get_local_auth_user_setting():
    return jsonify(controller.get_local_auth_user_setting())


@app.route('/api/updatelocalauthusersetting', methods=['GET', 'POST'])
def update_local_auth_user_setting():
    return jsonify(controller.update_local_auth_user_setting(request.params))


@app.route('/api/getdatalevel', methods=['GET', 'POST'])
def get_data_level():
    return jsonify(controller.get_data_level(request.params))


@app.route('/api/createdatalevel', methods=['GET', 'POST'])
def create_data_level():
    return jsonify(controller.create_data_level(request.params))


@app.route('/api/updatedatalevel', methods=['GET', 'POST'])
def update_data_level():
    return jsonify(controller.update_data_level(request.params))


@app.route('/api/deletedatalevel', methods=['GET', 'POST'])
def delete_data_level():
    return jsonify(controller.delete_data_level(request.params))


@app.route('/api/addmetadatatocluster', methods=['GET', 'POST'])
def add_metadata_to_cluster():
    return jsonify(controller.add_metadata_to_cluster(request.params))


@app.route('/api/addstoragetocluster', methods=['GET', 'POST'])
def add_storage_to_cluster():
    return jsonify(controller.add_storage_to_cluster(request.params))


@app.route('/api/createbuddygroup', methods=['GET', 'POST'])
def create_buddy_group():
    return jsonify(controller.create_buddy_group(request.params))


@app.route('/api/createtarget', methods=['GET', 'POST'])
def create_target():
    return jsonify(controller.create_target(request.params))


@app.route('/api/addtargetstostoragepool', methods=['GET', 'POST'])
def add_targets_to_storage_pool():
    return jsonify(controller.add_targets_to_storage_pool(request.params))


@app.route('/api/removetargetsfromstoragepool', methods=['GET', 'POST'])
def remove_targets_from_storage_pool():
    return jsonify(controller.remove_targets_from_storage_pool(request.params))


@app.route('/api/addbuddygroupstostoragepool', methods=['GET', 'POST'])
def add_buddy_groups_to_storage_pool():
    return jsonify(controller.add_buddy_groups_to_storage_pool(request.params))


@app.route('/api/removebuddygroupsfromstoragepool', methods=['GET', 'POST'])
def remove_buddy_groups_from_storage_pool():
    return jsonify(controller.remove_buddy_groups_from_storage_pool(request.params))


@app.route('/api/deletenasserver', methods=['GET', 'POST'])
def delete_nas_server():
    return jsonify(controller.delete_nas_server(request.params))


@app.route('/api/getusersquota', methods=['GET', 'POST'])
def get_users_quota():
    return jsonify(controller.get_users_quota(request.params))


@app.route('/api/updateusersquota', methods=['GET', 'POST'])
def update_users_quota():
    return jsonify(controller.update_users_quota(request.params))


@app.route('/api/deleteusersquota', methods=['GET', 'POST'])
def delete_users_quota():
    return jsonify(controller.delete_users_quota(request.params))


@app.route('/api/getgroupsquota', methods=['GET', 'POST'])
def get_groups_quota():
    return jsonify(controller.get_groups_quota(request.params))


@app.route('/api/updategroupsquota', methods=['GET', 'POST'])
def update_groups_quota():
    return jsonify(controller.update_groups_quota(request.params))


@app.route('/api/deletegroupsquota', methods=['GET', 'POST'])
def delete_groups_quota():
    return jsonify(controller.delete_groups_quota(request.params))


@app.route('/api/checkfilesystem', methods=['GET', 'POST'])
def check_file_system():
    flag = cache.inspect('file-system-flag')
    if flag and flag['value']:
        return jsonify(handler.response(1, handler.error('Check or repair file system is running!')))
    else:
        process.do(controller.check_file_system)
        return jsonify(handler.response(0, 'Start to check the file system!'))


@app.route('/api/repairfilesystem', methods=['GET', 'POST'])
def repair_file_system():
    flag = cache.inspect('file-system-flag')
    if flag and flag['value']:
        return jsonify(handler.response(1, handler.error('Check or repair file system is running!')))
    else:
        process.do(controller.repair_file_system)
        return jsonify(handler.response(0, 'Start to repair the file system!'))


@app.route('/api/getfilesystemlog', methods=['GET', 'POST'])
def get_file_system_log():
    return jsonify(controller.get_file_system_log())


@app.route('/api/getdatacheckingandrecoveryhistory', methods=['GET', 'POST'])
def get_data_checking_and_recovery_history():
    return jsonify(controller.get_data_checking_and_recovery_history())
