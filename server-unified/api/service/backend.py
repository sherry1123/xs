from api.module import handler, request


class BackendError(Exception):
    def __init__(self, errorinfo):
        self.errorinfo = errorinfo

    def __str__(self):
        return self.errorinfo


def backend_handler(response):
    if response['errorId']:
        raise BackendError(response['message'])
    else:
        return response['data']


def get_token():
    return request.get('http://localhost:9090/token/get', {}, {}, {'tokenId': '4a2d34ad-399e-4591-a55b-18acf8cf8712'})


def get_create_status():
    return request.get('http://localhost:9090/cluster/createstatus', {}, get_token())


def get_disk_list(ip):
    disk_list = backend_handler(request.get(
        'http://localhost:9090/disk/list/' + ip, {}, get_token())) or []

    def revise_disk_space(disk):
        disk['totalSpace'] = int(handler.to_byte(float(handler.replace(
            '\Si{0,1}B', '', disk['totalSpace'])), handler.replace('\S+\d', '', disk['totalSpace'])[0]))
        return disk
    disk_list = filter(lambda disk: not disk['isUsed'], disk_list)
    disk_list = map(revise_disk_space, disk_list)
    disk_list = sorted(disk_list, key=lambda disk: disk['diskName'])
    return disk_list


def initialize_cluster(param):
    return request.post('http://localhost:9090/cluster/create', param, get_token())


def deinitialize_cluster():
    return request.post('http://localhost:9090/cluster/destroy', {}, get_token())


def create_buddy_group(param):
    return backend_handler(request.post('http://localhost:9090/cluster/createbuddymirror', param, get_token()))


def get_version():
    return backend_handler(request.get('http://localhost:9090/cluster/getversion', {}, get_token()))


def get_storage_disk_space():
    disk_space = backend_handler(request.get(
        'http://localhost:9090/cluster/getstoragespace', {}, get_token()))
    space_usage = '%s%%' % round(
        float(disk_space['used']) / disk_space['total'] * 100, 2)
    return {'total': disk_space['total'], 'used': disk_space['used'], 'free': disk_space['free'], 'usage': space_usage}


def get_meta_status():
    return backend_handler(request.get('http://localhost:9090/cluster/listmetanodes', {}, get_token()))


def get_storage_status():
    return backend_handler(request.get('http://localhost:9090/cluster/liststoragenodes', {}, get_token()))


def get_target_list():
    target_list = backend_handler(request.get(
        'http://localhost:9090/cluster/listtargets', {}, get_token()))

    def modify_target_info(target):
        target['service'] = 'metadata' if target['service'] == 'meta' else target['service']
        space_usage = '%s%%' % round(
            float(target['usedSpace']) / target['totalSpace'] * 100, 2)
        return {'targetId': target['targetId'], 'mountPath': target['mountPath'], 'node': target['hostname'], 'service': target['service'], 'isUsed': target['isUsed'], 'nodeId': target['nodeId'], 'space': {'total': target['totalSpace'], 'used': target['usedSpace'], 'free': target['freeSpace'], 'usage': space_usage}}
    target_list = map(modify_target_info, target_list)
    return target_list


def get_cluster_throughput_and_iops():
    return backend_handler(request.get('http://localhost:9090/cluster/getclusteriostat', {}, get_token(), {'errorId': 0, 'data': {'throughput': [], 'iops': []}}))


def get_node_list():
    node_list = backend_handler(request.get(
        'http://localhost:9090/cluster/listallnodes', {}, get_token()))

    def modify_node_info(node):
        node['service'] = map(lambda service: 'metadata' if service == 'meta' else service, filter(
            lambda service: service != 'client', node['service']))
        is_pure_mgmt = True if len(
            node['service']) == 1 and 'mgmt' in node['service'] else False
        cpu_usage = '%s%%' % round(node['cpuUsage'], 2)
        memory_usage = '%s%%' % round(node['memUsage'], 2)
        space_usage = '%s%%' % round(
            float(node['spaceUsed']) / node['spaceTotal'] * 100, 2) if node['spaceTotal'] else '0%'
        return {'hostname': node['hostname'], 'ip': node['ip'], 'service': node['service'], 'isPureMgmt': is_pure_mgmt, 'status': node['status'], 'cpuUsage': cpu_usage, 'memoryUsage': memory_usage, 'space': {'total': node['spaceTotal'], 'used': node['spaceUsed'], 'free': node['spaceFree'], 'usage': space_usage}}
    node_list = map(modify_node_info, node_list)
    node_list = sorted(node_list, key=lambda node: node['hostname'])
    return node_list


def get_node_service(hostname):
    node_service = backend_handler(request.get(
        'http://localhost:9090/cluster/getnodeservice', {'hostname': hostname}, get_token()))
    return {'metadata': node_service['meta'], 'storage': node_service['storage']}


def get_node_cpu_and_memory(hostname):
    node_cpu_and_memory = backend_handler(request.get(
        'http://localhost:9090/cluster/getphysicresource', {'hostname': hostname}, get_token(), {'errorId': 0, 'data': {'cpu': 0, 'memory': 0}}))
    return {'cpu': round(node_cpu_and_memory['cpu'], 2), 'memory': round(node_cpu_and_memory['memory'], 2)}


def get_node_throughput_and_iops(hostname):
    return backend_handler(request.get('http://localhost:9090/cluster/getiostat', {'hostname': hostname}, get_token(), {'errorId': 0, 'data': {'throughput': [], 'iops': []}}))


def get_node_target(hostname):
    node_target = backend_handler(request.get(
        'http://localhost:9090/cluster/listnodetargets', {'hostname': hostname}, get_token())) or []

    def modify_target_info(target):
        target['service'] = 'metadata' if target['service'] == 'meta' else target['service']
        space_usage = '%s%%' % round(
            float(target['usedSpace']) / target['totalSpace'] * 100, 2)
        return {'targetId': target['targetId'], 'mountPath': target['mountPath'], 'node': target['hostname'], 'service': target['service'], 'isUsed': target['isUsed'], 'nodeId': target['nodeId'], 'space': {'total': target['totalSpace'], 'used': target['usedSpace'], 'free': target['freeSpace'], 'usage': space_usage}}
    node_target = map(modify_target_info, node_target)
    return node_target


def create_storage_pool(name, targets, buddy_groups):
    data = backend_handler(request.post('http://localhost:9090/cluster/createpool', {
                           'nameDesc': name, 'targets': targets, 'mirrorGroups': buddy_groups}, get_token()))
    return data['poolId']


def update_storage_pool_name(pool_id, name):
    return backend_handler(request.post('http://localhost:9090/cluster/modifypooldesc', {'poolId': pool_id, 'nameDesc': name}, get_token()))


def delete_storage_pool(pool_id):
    return backend_handler(request.post('http://localhost:9090/cluster/deletepool', {'poolId': pool_id}, get_token()))


def get_targets_in_storage_pool(pool_id=None):
    param = {'poolId': pool_id} if pool_id is not None else {}
    data = backend_handler(request.get(
        'http://localhost:9090/cluster/gettargetsinfo', param, get_token()))
    targets = data['poolInfoList']

    def revise_capacity(item):
        item['capacity'] = int(handler.to_byte(float(handler.replace(
            '\Si{0,1}B', '', item['capacity'])), handler.replace('\S+\d', '', item['capacity'])[0]))
        return item
    if targets is None:
        targets = []
    targets = map(revise_capacity, targets)
    return targets


def get_buddy_groups_in_storage_pool(pool_id=None):
    param = {'poolId': pool_id} if pool_id is not None else {}
    data = backend_handler(request.get(
        'http://localhost:9090/cluster/getgroupsinfo', param, get_token()))
    buddy_groups = data['poolInfoList']

    def revise_capacity(item):
        item['capacity'] = int(handler.to_byte(float(handler.replace(
            '\Si{0,1}B', '', item['capacity'])), handler.replace('\S+\d', '', item['capacity'])[0]))
        return item
    if buddy_groups is None:
        buddy_groups = []
    buddy_groups = map(revise_capacity, buddy_groups)
    return buddy_groups


def update_snapshot_setting(total, manual, auto):
    return backend_handler(request.post('http://localhost:9090/cluster/applysnapconf', {'total': total, 'manual': manual, 'schedule': auto}, get_token()))


def create_snapshot(name, is_auto):
    return request.post('http://localhost:9090/cluster/createsnapshot', {'name': name, 'schedule': is_auto}, get_token())


def delete_snapshot(name):
    return request.post('http://localhost:9090/cluster/deletesnapshot', {'name': name}, get_token())


def batch_delete_snapshot(names):
    return request.post('http://localhost:9090/cluster/batchdeletesnap', {'names': names}, get_token())


def rollback_snapshot(name):
    return request.post('http://localhost:9090/cluster/rollbacksnapshot', {'name': name}, get_token())


def add_client_to_cluster(ip):
    return backend_handler(request.post('http://localhost:9090/cluster/addclientnode', {'ip': ip}, get_token()))


def get_client():
    return backend_handler(request.get('http://localhost:9090/cluster/getclientlist', {}, get_token()))


def create_nas_server(ip, path):
    return backend_handler(request.post('http://localhost:9090/cluster/nasmanager', {'opt': 'nasAdd', 'nasServerList': [{'clientIp': ip, 'nasRoot': path}]}, get_token()))


def get_buddy_group():
    buddy_groups = backend_handler(request.get(
        'http://localhost:9090/cluster/listmirrorgroup', {}, get_token())) or []

    def modify_buddy_group_info(buddy_group):
        group_type = buddy_group['type']
        group_id = buddy_group['groupId']
        primary_target = buddy_group['primary']
        secondary_target = buddy_group['secondary']
        primary_target = {'targetId': primary_target['targetId'], 'mountPath': primary_target['mountPath'], 'node': primary_target['hostname'], 'service': 'metadata' if primary_target['service'] == 'meta' else primary_target['service'], 'isUsed': primary_target['isUsed'],
                          'nodeId': primary_target['nodeId'], 'space': {'total': primary_target['totalSpace'], 'used': primary_target['usedSpace'], 'free': primary_target['freeSpace'], 'usage': '%s%%' % round(float(primary_target['usedSpace']) / primary_target['totalSpace'] * 100, 2)}}
        secondary_target = {'targetId': secondary_target['targetId'], 'mountPath': secondary_target['mountPath'], 'node': secondary_target['hostname'], 'service': 'metadata' if secondary_target['service'] == 'meta' else secondary_target['service'], 'isUsed': secondary_target['isUsed'],
                            'nodeId': secondary_target['nodeId'], 'space': {'total': secondary_target['totalSpace'], 'used': secondary_target['usedSpace'], 'free': secondary_target['freeSpace'], 'usage': '%s%%' % round(float(secondary_target['usedSpace']) / secondary_target['totalSpace'] * 100, 2)}}
        return {'type': group_type, 'groupId': group_id, 'primary': primary_target, 'secondary': secondary_target}
    buddy_groups = map(modify_buddy_group_info, buddy_groups)
    buddy_groups = sorted(
        buddy_groups, key=lambda buddy_group: buddy_group['groupId'])
    return buddy_groups


def get_files(path):
    files = backend_handler(request.get(
        'http://localhost:9090/cluster/getdirs', {'dir': path}, get_token())) or []
    files = sorted(files, key=lambda f: f['name'])
    return files


def get_entry_info(path):
    entry_info = backend_handler(request.get(
        'http://localhost:9090/cluster/getentryinfo', {'dir': path}, get_token()))
    entry_info['chunkSize'] = handler.to_byte(int(handler.replace(
        '[a-zA-Z]', '', entry_info['chunkSize'])), handler.replace('\d+', '', entry_info['chunkSize']))
    entry_info['numTargets'] = int(entry_info['numTargets'])
    entry_info['storagePoolName'] = entry_info['storagePoolDesc']
    return entry_info


def set_pattern(dir_path, num_targets, chunk_size, buddy_mirror):
    return backend_handler(request.post('http://localhost:9090/cluster/setpattern', {'dirPath': dir_path, 'numTargets': str(num_targets), 'chunkSize': str(chunk_size), 'buddyMirror': buddy_mirror}, get_token()))


def create_local_auth_user(name, desc, passwd, primary, secondary):
    return backend_handler(request.post('http://localhost:9090/cluster/nasusermanager', {'opt': 'localuseradd', 'userInfo': {'localUserList': [{'userName': name, 'passWord': passwd, 'desc': desc, 'primaryGroup': primary, 'secondaryGroup': secondary}]}}, get_token()))


def update_local_auth_user_desc_and_primary_group(name, desc, primary):
    return backend_handler(request.post('http://localhost:9090/cluster/nasusermanager', {'opt': 'localuserchange', 'userInfo': {'localUserList': [{'userName': name, 'desc': desc, 'primaryGroup': primary}]}}, get_token()))


def update_local_auth_user_passwd(name, passwd):
    return backend_handler(request.post('http://localhost:9090/cluster/nasusermanager', {'opt': 'localuserchange', 'userInfo': {'localUserList': [{'userName': name, 'passWord': passwd}]}}, get_token()))


def delete_local_auth_user(name):
    return backend_handler(request.post('http://localhost:9090/cluster/nasusermanager', {'opt': 'localuserdelete', 'userInfo': {'localUserList': [{'userName': name}]}}, get_token()))


def create_local_auth_user_group(name, desc):
    return backend_handler(request.post('http://localhost:9090/cluster/nasusermanager', {'opt': 'localgroupadd', 'userInfo': {'localGroupList': [{'groupName': name, 'desc': desc}]}}, get_token()))


def update_local_auth_user_group(name, desc):
    return backend_handler(request.post('http://localhost:9090/cluster/nasusermanager', {'opt': 'localgroupchange', 'userInfo': {'localGroupList': [{'groupName': name, 'desc': desc}]}}, get_token()))


def delete_local_auth_user_group(name):
    return backend_handler(request.post('http://localhost:9090/cluster/nasusermanager', {'opt': 'localgroupdelete', 'userInfo': {'localGroupList': [{'groupName': name}]}}, get_token()))


def add_local_auth_user_to_group(name, group):
    return backend_handler(request.post('http://localhost:9090/cluster/nasusermanager', {'opt': 'localgroupadduser', 'userInfo': {'localUserList': [{'userName': name, 'secondaryGroup': [group]}]}}, get_token()))


def remove_local_auth_user_from_group(name, group):
    return backend_handler(request.post('http://localhost:9090/cluster/nasusermanager', {'opt': 'localgroupremoveuser', 'userInfo': {'localUserList': [{'userName': name, 'secondaryGroup': [group]}]}}, get_token()))


def create_nfs_share(server, path, description, client_list):
    return backend_handler(request.post('http://localhost:9090/cluster/addshareinfo', {'server': server, 'path': path, 'description': description, 'clientList': client_list}, get_token()))


def update_nfs_share(server, path, description):
    return backend_handler(request.post('http://localhost:9090/cluster/nfsmodifyshare', {'server': server, 'path': path, 'description': description}, get_token()))


def delete_nfs_share(server, path):
    return backend_handler(request.post('http://localhost:9090/cluster/nfsdeleteshare', {'shareList': [{'server': server, 'path': path}]}, get_token()))


def create_client_in_nfs_share(server, client_type, ip, permission, write_mode, permission_constraint, root_permission_constraint, path):
    return backend_handler(request.post('http://localhost:9090/cluster/addclientinfo', {'server': server, 'path': path, 'clientList': [{'type': client_type, 'ip': ip, 'permission': permission, 'writeMode': write_mode, 'permissionConstraint': permission_constraint, 'rootPermissionConstraint': root_permission_constraint}]}, get_token()))


def update_client_in_nfs_share(server, client_type, ip, permission, write_mode, permission_constraint, root_permission_constraint, path):
    return backend_handler(request.post('http://localhost:9090/cluster/modifyclientinfo', {'server': server, 'path': path, 'clientList': [{'type': client_type, 'ip': ip, 'permission': permission, 'writeMode': write_mode, 'permissionConstraint': permission_constraint, 'rootPermissionConstraint': root_permission_constraint}]}, get_token()))


def delete_client_in_nfs_share(server, ip, path):
    return backend_handler(request.post('http://localhost:9090/cluster/nfsdeleteclient', {'server': server, 'path': path, 'clientList': [ip]}, get_token()))


def create_cifs_share(server, share_name, path, desc, oplock, notify, offline_cache_mode):
    return backend_handler(request.post('http://localhost:9090/cluster/nascifssharemanager', {'opt': 'cifsaddshare', 'clientCifsInfo': {'serverIp': server, 'cifsShareList': [{'path': path, 'name': share_name, 'desc': desc, 'oplock': oplock, 'notify': notify, 'cacheMode': offline_cache_mode}]}}, get_token()))


def update_cifs_share(server, share_name, desc, oplock, notify, offline_cache_mode):
    return backend_handler(request.post('http://localhost:9090/cluster/nascifssharemanager', {'opt': 'cifschangeshare', 'clientCifsInfo': {'serverIp': server, 'cifsShareList': [{'name': share_name, 'desc': desc, 'oplock': oplock, 'notify': notify, 'cacheMode': offline_cache_mode}]}}, get_token()))


def delete_cifs_share(server, share_name):
    return backend_handler(request.post('http://localhost:9090/cluster/nascifssharemanager', {'opt': 'cifsdeleteshare', 'clientCifsInfo': {'serverIp': server, 'cifsShareList': [{'name': share_name}]}}, get_token()))


def add_user_or_group_to_cifs_share(server, share_name, user_or_group_list):
    return backend_handler(request.post('http://localhost:9090/cluster/nascifssharemanager', {'opt': 'cifsaddclient', 'clientCifsInfo': {'serverIp': server, 'cifsShareList': [{'name': share_name, 'userList': map(lambda user_or_group: {'name': user_or_group['name'], 'clientType': user_or_group['type'], 'permission': user_or_group['permission']}, user_or_group_list)}]}}, get_token()))


def update_user_or_group_in_cifs_share(server, share_name, name, user_or_group_type, permission):
    return backend_handler(request.post('http://localhost:9090/cluster/nascifssharemanager', {'opt': 'cifschangeclient', 'clientCifsInfo': {'serverIp': server, 'cifsShareList': [{'name': share_name, 'userList': [{'name': name, 'clientType': user_or_group_type, 'permission': permission}]}]}}, get_token()))


def remove_user_or_group_from_cifs_share(server, share_name, name, user_or_group_type):
    return backend_handler(request.post('http://localhost:9090/cluster/nascifssharemanager', {'opt': 'cifsdeleteclient', 'clientCifsInfo': {'serverIp': server, 'cifsShareList': [{'name': share_name, 'userList': [{'name': name, 'clientType': user_or_group_type}]}]}}, get_token()))


def create_dir(path, no_mirror):
    return backend_handler(request.post('http://localhost:9090/cluster/createdir', {'dirInfos': [{'path': path, 'noMirror': no_mirror}]}, get_token()))


def update_local_auth_user_status(name, status):
    opt = 'locallockuserrecover' if status else 'localuserlock'
    return backend_handler(request.post('http://localhost:9090/cluster/nasusermanager', {'opt': opt, 'userInfo': {'localUserList': [{'userName': name}]}}, get_token()))


def get_local_auth_user_validity_period(name):
    users = backend_handler(request.post(
        'http://localhost:9090/cluster/nasusermanager', {'opt': 'localuserquery'}, get_token()))
    users = map(lambda user: {
                'name': user['userName'], 'validityPeriod': user['passwdindate']}, users)
    user = filter(lambda user: user['name'] == name, users)[0]
    return user['validityPeriod']


def get_local_auth_user_setting():
    user_name_setting = backend_handler(request.post(
        'http://localhost:9090/cluster/nasusermanager', {'opt': 'globaluserattrquery'}, get_token()))
    user_passwd_setting = backend_handler(request.post(
        'http://localhost:9090/cluster/nasusermanager', {'opt': 'globalpasswordattrquery'}, get_token()))
    user_setting = {}
    user_setting.update(user_name_setting)
    user_setting.update(user_passwd_setting)
    return user_setting


def update_local_auth_user_setting(user_name_min_len, pass_min_len, pass_max_len, pass_complexity, pass_repeat_char_max, pass_available_day, pass_change_interval_minute):
    backend_handler(request.post('http://localhost:9090/cluster/nasusermanager',
                                 {'opt': 'globaluserattrset', 'userInfo': {'gUserAttr': {'userNameMinLen': user_name_min_len}}}, get_token()))
    backend_handler(request.post('http://localhost:9090/cluster/nasusermanager', {'opt': 'globalpasswordattrset', 'userInfo': {'gUserPasswordAttr': {'passMinLen': pass_min_len, 'passMaxLen': pass_max_len,
                                                                                                                                                     'passComplexity': pass_complexity, 'passRepeatCharMax': pass_repeat_char_max, 'passAvailableDay': pass_available_day, 'passChangeIntervalMinute': pass_change_interval_minute}}}, get_token()))


def add_metadata_to_cluster(ip, disk_group):
    return backend_handler(request.post('http://localhost:9090/cluster/addmetanode', {'ip': ip, 'diskGroup': disk_group}, get_token()))


def add_storage_to_cluster(ip, disk_group):
    return backend_handler(request.post('http://localhost:9090/cluster/addstoragenode', {'ip': ip, 'diskGroup': disk_group}, get_token()))


def create_target(ip, disk_group):
    return backend_handler(request.post('http://localhost:9090/cluster/addstoragetarget', {'ip': ip, 'diskGroup': disk_group}, get_token()))


def add_targets_to_storage_pool(pool_id, targets):
    return backend_handler(request.post('http://localhost:9090/cluster/poolexpand', {'poolId': str(pool_id), 'targets': targets, 'buddyGroups': ''}, get_token()))


def remove_targets_from_storage_pool(pool_id, targets):
    return backend_handler(request.post('http://localhost:9090/cluster/poolshrink', {'poolId': str(pool_id), 'targets': targets, 'buddyGroups': ''}, get_token()))


def add_buddy_groups_to_storage_pool(pool_id, buddy_groups):
    return backend_handler(request.post('http://localhost:9090/cluster/poolexpand', {'poolId': str(pool_id), 'targets': '', 'buddyGroups': buddy_groups}, get_token()))


def remove_buddy_groups_from_storage_pool(pool_id, buddy_groups):
    return backend_handler(request.post('http://localhost:9090/cluster/poolshrink', {'poolId': str(pool_id), 'targets': '', 'buddyGroups': buddy_groups}, get_token()))


def delete_nas_server(ip, path):
    return backend_handler(request.post('http://localhost:9090/cluster/nasmanager', {'opt': 'nasDelete', 'nasServerList': [{'clientIp': ip, 'nasRoot': path}]}, get_token()))
