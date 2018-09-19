import json

from mongoengine import connect

from lib.model import (CifsShare, ClusterThroughputAndIops, LocalAuthUser,
                       LocalAuthUserGroup, NasServer, NfsShare,
                       NodeCpuAndMemory, NodeThroughputAndIops, Setting,
                       Snapshot, SnapshotSchedule, StoragePool, User)
from lib.module import handler


class DatabaseError(Exception):
    def __init__(self, errorinfo):
        self.errorinfo = errorinfo

    def __str__(self):
        return self.errorinfo


def connect_database(host='127.0.0.1', port=27017):
    connect('storage', host=host, port=port)


def get_setting(key):
    setting = Setting.objects(setting_key=key).first()
    if setting:
        return handler.unicode2str(json.loads(setting.setting_value))
    else:
        raise DatabaseError('No such setting!')


def create_setting(key, value):
    setting = Setting.objects(setting_key=key).first()
    if setting:
        raise DatabaseError('Setting already exists!')
    else:
        Setting(setting_key=key, setting_value=json.dumps(value)).save()


def update_setting(key, value):
    setting = Setting.objects(setting_key=key).first()
    if setting:
        setting.update(set__setting_value=json.dumps(value))
    else:
        raise DatabaseError('No such setting!')


def login(username, password):
    user = User.objects(user_name=username, user_passwd=password).first()
    if user:
        return {'username': user.user_name, 'password': user.user_passwd}
    else:
        raise DatabaseError('Username or password error!')


def logout(username):
    user = User.objects(user_name=username).first()
    if not user:
        raise DatabaseError('No such user!')


def list_user():
    users = []
    for user in User.objects.order_by('-id'):
        users.append({'username': user.user_name,
                      'password': user.user_passwd})
    return users


def get_user(username):
    user = User.objects(user_name=username).first()
    if user:
        return {'username': user.user_name, 'password': user.user_passwd}
    else:
        raise DatabaseError('No such user!')


def create_user(username, password):
    user = User.objects(user_name=username).first()
    if user:
        raise DatabaseError('User already exists!')
    else:
        User(user_name=username, user_passwd=password).save()


def update_user(username, password):
    user = User.objects(user_name=username).first()
    if user:
        user.update(set__user_passwd=password)
    else:
        raise DatabaseError('No such user!')


def delete_user(username):
    user = User.objects(user_name=username).first()
    if user:
        user.delete()
    else:
        raise DatabaseError('No such user!')


def create_cluster_throughput_and_iops(time, throughput, iops):
    ClusterThroughputAndIops(
        cluster_time=time, cluster_throughput=throughput, cluster_iops=iops).save()


def get_cluster_throughput():
    total = []
    time = []
    for throughput in ClusterThroughputAndIops.objects.order_by('-id')[:60]:
        total.append(throughput.cluster_throughput)
        time.append(throughput.cluster_time)
    total.reverse()
    time.reverse()
    return {'total': total, 'time': time}


def get_cluster_iops():
    total = []
    time = []
    for throughput in ClusterThroughputAndIops.objects.order_by('-id')[:60]:
        total.append(throughput.cluster_iops)
        time.append(throughput.cluster_time)
    total.reverse()
    time.reverse()
    return {'total': total, 'time': time}


def create_node_cpu_and_memory(time, host_list, data_list):
    NodeCpuAndMemory(
        node_time=time, node_host_list=host_list, node_data_list=data_list).save()


def get_node_cpu(hostname):
    host_list = []
    data_list = []
    time = []
    for item in NodeCpuAndMemory.objects.order_by('-id')[:60]:
        host_list.append(item.node_host_list)
        data_list.append(item.node_data_list)
        time.append(item.node_time)
    host_list.reverse()
    data_list.reverse()
    time.reverse()
    first_host_list = host_list[0]
    index = first_host_list.index(
        hostname) if first_host_list.count(hostname) else -1
    total = map(lambda item: item[index]['cpu']
                if len(item) >= index and index != -1 else 0, data_list)
    return {'total': total, 'time': time}


def get_node_memory(hostname):
    host_list = []
    data_list = []
    time = []
    for item in NodeCpuAndMemory.objects.order_by('-id')[:60]:
        host_list.append(item.node_host_list)
        data_list.append(item.node_data_list)
        time.append(item.node_time)
    host_list.reverse()
    data_list.reverse()
    time.reverse()
    first_host_list = host_list[0]
    index = first_host_list.index(
        hostname) if first_host_list.count(hostname) else -1
    total = map(lambda item: item[index]['memory']
                if len(item) >= index and index != -1 else 0, data_list)
    return {'total': total, 'time': time}


def create_node_throughput_and_iops(time, host_list, data_list):
    NodeThroughputAndIops(
        node_time=time, node_host_list=host_list, node_data_list=data_list).save()


def get_node_throughput(hostname):
    host_list = []
    data_list = []
    time = []
    for item in NodeThroughputAndIops.objects.order_by('-id')[:60]:
        host_list.append(item.node_host_list)
        data_list.append(item.node_data_list)
        time.append(item.node_time)
    host_list.reverse()
    data_list.reverse()
    time.reverse()
    first_host_list = host_list[0]
    index = first_host_list.index(
        hostname) if first_host_list.count(hostname) else -1
    read = map(lambda item: item[index]['throughput']['read']
               if len(item) >= index and index != -1 else 0, data_list)
    write = map(lambda item: item[index]['throughput']['write']
                if len(item) >= index and index != -1 else 0, data_list)
    return {'read': read, 'write': write, 'time': time}


def get_node_iops(hostname):
    host_list = []
    data_list = []
    time = []
    for item in NodeThroughputAndIops.objects.order_by('-id')[:60]:
        host_list.append(item.node_host_list)
        data_list.append(item.node_data_list)
        time.append(item.node_time)
    host_list.reverse()
    data_list.reverse()
    time.reverse()
    first_host_list = host_list[0]
    index = first_host_list.index(
        hostname) if first_host_list.count(hostname) else -1
    total = map(lambda item: item[index]['iops']
                if len(item) >= index and index != -1 else 0, data_list)
    return {'total': total, 'time': time}


def list_storage_pool():
    storage_pools = []
    for storage_pool in StoragePool.objects.order_by('-id'):
        storage_pools.append({'poolId': storage_pool.storage_pool_id, 'name': storage_pool.storage_pool_name, 'description': storage_pool.storage_pool_description,
                              'createTime': storage_pool.storage_pool_create_time})
    return storage_pools


def get_storage_pool(name):
    storage_pool = StoragePool.objects(storage_pool_name=name).first()
    if storage_pool:
        return {'poolId': storage_pool.storage_pool_id, 'name': storage_pool.storage_pool_name, 'description': storage_pool.storage_pool_description,
                'createTime': storage_pool.storage_pool_create_time}
    else:
        raise DatabaseError('No such storagePool!')


def create_storage_pool(pool_id, name, description):
    storage_pool = StoragePool.objects(storage_pool_name=name).first()
    if storage_pool:
        raise DatabaseError('StoragePool already exists!')
    else:
        StoragePool(storage_pool_id=pool_id, storage_pool_name=name, storage_pool_description=description,
                    storage_pool_create_time=handler.current_time()).save()


def update_storage_pool_name_and_desc(pool_id, name, description):
    storage_pool = StoragePool.objects(storage_pool_id=pool_id).first()
    if storage_pool:
        storage_pool.update(set__storage_pool_name=name,
                            set__storage_pool_description=description)
    else:
        raise DatabaseError('No such storagePool!')


def delete_storage_pool(pool_id):
    storage_pool = StoragePool.objects(storage_pool_id=pool_id).first()
    if storage_pool:
        storage_pool.delete()
    else:
        raise DatabaseError('No such storagePool!')


def list_snapshot():
    snapshots = []
    for snapshot in Snapshot.objects.order_by('-id'):
        snapshots.append({'name': snapshot.snapshot_name, 'description': snapshot.snapshot_desc, 'isAuto': snapshot.snapshot_is_auto, 'creating': snapshot.snapshot_is_creating,
                          'deleting': snapshot.snapshot_is_deleting, 'rollbacking': snapshot.snapshot_is_rollbacking, 'createTime': snapshot.snapshot_create_time})
    return snapshots


def get_snapshot(name):
    snapshot = Snapshot.objects(snapshot_name=name).first()
    if snapshot:
        return {'name': snapshot.snapshot_name, 'description': snapshot.snapshot_desc, 'isAuto': snapshot.snapshot_is_auto, 'creating': snapshot.snapshot_is_creating,
                'deleting': snapshot.snapshot_is_deleting, 'rollbacking': snapshot.snapshot_is_rollbacking, 'createTime': snapshot.snapshot_create_time}
    else:
        raise DatabaseError('No such snapshot!')


def get_auto_snapshot():
    snapshots = []
    for snapshot in Snapshot.objects(snapshot_is_auto=True):
        snapshots.append({'name': snapshot.snapshot_name, 'description': snapshot.snapshot_desc, 'isAuto': snapshot.snapshot_is_auto, 'creating': snapshot.snapshot_is_creating,
                          'deleting': snapshot.snapshot_is_deleting, 'rollbacking': snapshot.snapshot_is_rollbacking, 'createTime': snapshot.snapshot_create_time})
    return snapshots


def count_snapshot(is_auto):
    return Snapshot.objects(snapshot_is_auto=is_auto).count()


def create_snapshot(name, desc, is_auto, create_time):
    snapshot = Snapshot.objects(snapshot_name=name).first()
    if snapshot:
        raise DatabaseError('Snapshot already exists!')
    else:
        Snapshot(snapshot_name=name, snapshot_desc=desc, snapshot_is_auto=is_auto, snapshot_is_creating=True,
                 snapshot_is_deleting=False, snapshot_is_rollbacking=False, snapshot_create_time=create_time).save()


def update_snapshot_status(name, is_creating=False, is_deleting=False, is_rollbacking=False):
    snapshot = Snapshot.objects(snapshot_name=name).first()
    if snapshot:
        snapshot.update(set__snapshot_is_creating=is_creating,
                        set__snapshot_is_deleting=is_deleting, set__snapshot_is_rollbacking=is_rollbacking)
    else:
        raise DatabaseError('No such snapshot!')


def update_snapshot_desc(name, desc):
    snapshot = Snapshot.objects(snapshot_name=name).first()
    if snapshot:
        snapshot.update(set__snapshot_desc=desc)
    else:
        raise DatabaseError('No such snapshot!')


def delete_snapshot(name):
    snapshot = Snapshot.objects(snapshot_name=name).first()
    if snapshot:
        snapshot.delete()
    else:
        raise DatabaseError('No such snapshot!')


def list_snapshot_schedule():
    schedules = []
    for schedule in SnapshotSchedule.objects.order_by('-id'):
        schedules.append({'name': schedule.schedule_name, 'description': schedule.schedule_desc, 'createTime': schedule.schedule_create_time, 'startTime': schedule.schedule_start_time,
                          'autoDisableTime': schedule.schedule_auto_disable_time, 'interval': schedule.schedule_interval, 'deleteRound': schedule.schedule_delete_round, 'isRunning': schedule.schedule_is_running})
    return schedules


def get_snapshot_schedule(name):
    schedule = SnapshotSchedule.objects(schedule_name=name).first()
    if schedule:
        return {'name': schedule.schedule_name, 'description': schedule.schedule_desc, 'createTime': schedule.schedule_create_time, 'startTime': schedule.schedule_start_time,
                'autoDisableTime': schedule.schedule_auto_disable_time, 'interval': schedule.schedule_interval, 'deleteRound': schedule.schedule_delete_round, 'isRunning': schedule.schedule_is_running}
    else:
        raise DatabaseError('No such snapshot schedule!')


def get_is_running_snapshot_schedule():
    schedule = SnapshotSchedule.objects(schedule_is_running=True).first()
    if schedule:
        return {'name': schedule.schedule_name, 'description': schedule.schedule_desc, 'createTime': schedule.schedule_create_time, 'startTime': schedule.schedule_start_time,
                'autoDisableTime': schedule.schedule_auto_disable_time, 'interval': schedule.schedule_interval, 'deleteRound': schedule.schedule_delete_round, 'isRunning': schedule.schedule_is_running}
    else:
        return None


def create_snapshot_schedule(name, desc, auto_disable_time, interval, delete_round):
    schedule = SnapshotSchedule.objects(schedule_name=name).first()
    if schedule:
        raise DatabaseError('Snapshot schedule already exists!')
    else:
        SnapshotSchedule(schedule_name=name, schedule_desc=desc, schedule_create_time=handler.current_time(), schedule_start_time=handler.start_time(),
                         schedule_auto_disable_time=auto_disable_time, schedule_interval=interval, schedule_delete_round=delete_round, schedule_is_running=False).save()


def update_snapshot_schedule(name, desc):
    schedule = SnapshotSchedule.objects(schedule_name=name).first()
    if schedule:
        schedule.update(set__schedule_desc=desc)
    else:
        raise DatabaseError('No such snapshot schedule!')


def enable_snapshot_schedule(name):
    schedule = SnapshotSchedule.objects(schedule_name=name).first()
    if schedule:
        schedule_is_running = SnapshotSchedule.objects(
            schedule_is_running=True).first()
        if schedule_is_running:
            raise DatabaseError('There are already running schedules here!')
        else:
            schedule.update(set__schedule_start_time=handler.start_time(
            ), set__schedule_is_running=True)
    else:
        raise DatabaseError('No such snapshot schedule!')


def disable_snapshot_schedule(name):
    schedule = SnapshotSchedule.objects(schedule_name=name).first()
    if schedule:
        schedule.update(set__schedule_is_running=False)
    else:
        raise DatabaseError('No such snapshot schedule!')


def delete_snapshot_schedule(name):
    schedule = SnapshotSchedule.objects(schedule_name=name).first()
    if schedule:
        schedule.delete()
    else:
        raise DatabaseError('No such snapshot schedule!')


def add_node_to_cluster(node_ip, node_type):
    node_list = get_setting('NODE-LIST')
    node_list[node_type].append(node_ip)
    update_setting('NODE-LIST', node_list)


def list_nas_server():
    nas_servers = []
    for nas_server in NasServer.objects.order_by('-id'):
        nas_servers.append({'ip': nas_server.nas_server_ip,
                            'path': nas_server.nas_server_path, 'description': nas_server.nas_server_desc})
    return nas_servers


def get_nas_server(ip):
    nas_server = NasServer.objects(nas_server_ip=ip).first()
    if nas_server:
        return {'ip': nas_server.nas_server_ip, 'path': nas_server.nas_server_path, 'description': nas_server.nas_server_desc}
    else:
        raise DatabaseError('No such nas server!')


def create_nas_server(ip, path, desc):
    nas_server = NasServer.objects(nas_server_ip=ip).first()
    if nas_server:
        raise DatabaseError('Nas server already exists!')
    else:
        NasServer(nas_server_ip=ip, nas_server_path=path,
                  nas_server_desc=desc).save()


def update_nas_server(ip, desc):
    nas_server = NasServer.objects(nas_server_ip=ip).first()
    if nas_server:
        nas_server.update(set__nas_server_desc=desc)
    else:
        raise DatabaseError('No such nas server!')


def list_local_auth_user():
    users = []
    for user in LocalAuthUser.objects.order_by('user_name'):
        users.append({'name': user.user_name, 'description': user.user_desc, 'password': user.user_passwd,
                      'primaryGroup': user.user_primary_group, 'secondaryGroup': user.user_secondary_group})
    return users


def get_local_auth_user(name):
    user = LocalAuthUser.objects(user_name=name).first()
    if user:
        return {'name': user.user_name, 'description': user.user_desc, 'password': user.user_passwd, 'primaryGroup': user.user_primary_group, 'secondaryGroup': user.user_secondary_group}
    else:
        raise DatabaseError('No such local auth user!')


def create_local_auth_user(name, desc, passwd, primary, secondary):
    user = LocalAuthUser.objects(user_name=name).first()
    if user:
        raise DatabaseError('Local auth user already exists!')
    else:
        LocalAuthUser(user_name=name, user_desc=desc, user_passwd=passwd,
                      user_primary_group=primary, user_secondary_group=secondary).save()


def update_local_auth_user_desc(name, desc):
    user = LocalAuthUser.objects(user_name=name).first()
    if user:
        user.update(set__user_desc=desc)
    else:
        raise DatabaseError('No such local auth user!')


def update_local_auth_user_passwd(name, passwd):
    user = LocalAuthUser.objects(user_name=name).first()
    if user:
        user.update(set__user_passwd=passwd)
    else:
        raise DatabaseError('No such local auth user!')


def update_local_auth_user_primary_group(name, primary):
    user = LocalAuthUser.objects(user_name=name).first()
    if user:
        user.update(set__user_primary_group=primary)
    else:
        raise DatabaseError('No such local auth user!')


def update_local_auth_user_secondary_group(name, secondary):
    user = LocalAuthUser.objects(user_name=name).first()
    if user:
        user.update(set__user_secondary_group=secondary)
    else:
        raise DatabaseError('No such local auth user!')


def delete_local_auth_user(name):
    user = LocalAuthUser.objects(user_name=name).first()
    if user:
        user.delete()
    else:
        raise DatabaseError('No such local auth user!')


def list_local_auth_user_group():
    user_groups = []
    for user_group in LocalAuthUserGroup.objects.order_by('user_group_name'):
        user_groups.append({'name': user_group.user_group_name,
                            'description': user_group.user_group_desc})
    return user_groups


def get_local_auth_user_group(name):
    user_group = LocalAuthUserGroup.objects(user_group_name=name).first()
    if user_group:
        return {'name': user_group.user_group_name, 'description': user_group.user_group_desc}
    else:
        raise DatabaseError('No such local auth user group!')


def create_local_auth_user_group(name, desc):
    user_group = LocalAuthUserGroup.objects(user_group_name=name).first()
    if user_group:
        raise DatabaseError('Local auth user group already exists!')
    else:
        LocalAuthUserGroup(user_group_name=name, user_group_desc=desc).save()


def update_local_auth_user_group(name, desc):
    user_group = LocalAuthUserGroup.objects(user_group_name=name).first()
    if user_group:
        user_group.update(set__user_group_desc=desc)
    else:
        raise DatabaseError('No such local auth user group!')


def delete_local_auth_user_group(name):
    user_group = LocalAuthUserGroup.objects(user_group_name=name).first()
    if user_group:
        user_group.delete()
    else:
        raise DatabaseError('No such local auth user group!')


def get_local_auth_user_from_group(group_name):
    user_group = LocalAuthUserGroup.objects(user_group_name=group_name).first()
    if user_group:
        users = list_local_auth_user()
        user_in_primary_group = filter(
            lambda user: user['primaryGroup'] == group_name, users)
        user_in_secondary_group = filter(
            lambda user: group_name in user['secondaryGroup'], users)
        return user_in_primary_group + user_in_secondary_group
    else:
        raise DatabaseError('No such local auth user group!')


def add_local_auth_user_to_group(name, group_name):
    user_group = LocalAuthUserGroup.objects(user_group_name=group_name).first()
    if user_group:
        user = get_local_auth_user(name)
        secondary_group = user['secondaryGroup'] + [group_name]
        update_local_auth_user_secondary_group(name, secondary_group)
    else:
        raise DatabaseError('No such local auth user group!')


def remove_local_auth_user_from_group(name, group_name):
    user_group = LocalAuthUserGroup.objects(user_group_name=group_name).first()
    if user_group:
        user = get_local_auth_user(name)
        secondary_group = filter(
            lambda group: group != group_name, user['secondaryGroup'])
        update_local_auth_user_secondary_group(name, secondary_group)
    else:
        raise DatabaseError('No such local auth user group!')


def list_nfs_share():
    shares = []
    for share in NfsShare.objects.order_by('path'):
        shares.append({'path': share.share_path, 'description': share.share_desc,
                       'clientList': share.share_client_list})
    return shares


def get_nfs_share(path):
    share = NfsShare.objects(share_path=path).first()
    if share:
        return {'path': share.share_path, 'description': share.share_desc, 'clientList': share.share_client_list}
    else:
        raise DatabaseError('No such nfs share!')


def create_nfs_share(path, desc, client_list):
    share = NfsShare.objects(share_path=path).first()
    if share:
        raise DatabaseError('Nfs share already exists!')
    else:
        NfsShare(share_path=path, share_desc=desc,
                 share_client_list=client_list).save()


def update_nfs_share_desc(path, desc):
    share = NfsShare.objects(share_path=path).first()
    if share:
        share.update(set__share_desc=desc)
    else:
        raise DatabaseError('No such nfs share!')


def update_nfs_share_client_list(path, client_list):
    share = NfsShare.objects(share_path=path).first()
    if share:
        share.update(set__share_client_list=client_list)
    else:
        raise DatabaseError('No such nfs share!')


def delete_nfs_share(path):
    share = NfsShare.objects(share_path=path).first()
    if share:
        share.delete()
    else:
        raise DatabaseError('No such nfs share!')


def get_client_in_nfs_share(path):
    share = NfsShare.objects(share_path=path).first()
    if share:
        return share.share_client_list
    else:
        raise DatabaseError('No such nfs share!')


def create_client_in_nfs_share(client_type, ip, permission, write_mode, permission_constraint, root_permission_constraint, path):
    share = NfsShare.objects(share_path=path).first()
    if share:
        client_list = get_client_in_nfs_share(path)
        client_ip_list = map(lambda client: client['ip'], client_list)
        if ip in client_ip_list:
            raise DatabaseError('Client already exists!')
        else:
            client_list.append({'type': client_type, 'ip': ip, 'permission': permission, 'writeMode': write_mode,
                                'permissionConstraint': permission_constraint, 'rootPermissionConstraint': root_permission_constraint})
        update_nfs_share_client_list(path, client_list)
    else:
        raise DatabaseError('No such nfs share!')


def update_client_in_nfs_share(client_type, ip, permission, write_mode, permission_constraint, root_permission_constraint, path):
    share = NfsShare.objects(share_path=path).first()
    if share:
        client_list = get_client_in_nfs_share(path)
        client_ip_list = map(lambda client: client['ip'], client_list)

        def create_new_client():
            return {'type': client_type, 'ip': ip, 'permission': permission, 'writeMode': write_mode, 'permissionConstraint': permission_constraint, 'rootPermissionConstraint': root_permission_constraint}
        if ip in client_ip_list:
            client_list = map(
                lambda client: client if client['ip'] != ip else create_new_client(), client_list)
            update_nfs_share_client_list(path, client_list)
        else:
            raise DatabaseError('No such client share!')
    else:
        raise DatabaseError('No such nfs share!')


def delete_client_in_nfs_share(ip, path):
    share = NfsShare.objects(share_path=path).first()
    if share:
        client_list = get_client_in_nfs_share(path)
        client_ip_list = map(lambda client: client['ip'], client_list)
        if ip in client_ip_list:
            client_list = filter(
                lambda client: client['ip'] != ip, client_list)
            update_nfs_share_client_list(path, client_list)
        else:
            raise DatabaseError('No such client share!')
    else:
        raise DatabaseError('No such nfs share user!')


def list_cifs_share():
    shares = []
    for share in CifsShare.objects.order_by('name'):
        shares.append({'name': share.share_name, 'path': share.share_path, 'description': share.share_desc, 'oplock': share.share_oplock,
                       'notify': share.share_notify, 'offlineCacheMode': share.share_offline_cache_mode, 'userOrGroupList': share.share_user_or_group_list})
    return shares


def get_cifs_share(name):
    share = CifsShare.objects(share_name=name).first()
    if share:
        return {'name': share.share_name, 'path': share.share_path, 'description': share.share_desc, 'oplock': share.share_oplock, 'notify': share.share_notify, 'offlineCacheMode': share.share_offline_cache_mode, 'userOrGroupList': share.share_user_or_group_list}
    else:
        raise DatabaseError('No such cifs share!')


def create_cifs_share(name, path, desc, oplock, notify, offline_cache_mode, user_or_group_list=None):
    share = CifsShare.objects(share_name=name).first()
    if share:
        raise DatabaseError('Cifs share already exists!')
    else:
        CifsShare(share_name=name, share_path=path, share_desc=desc, share_oplock=oplock,
                  share_notify=notify, share_offline_cache_mode=offline_cache_mode, share_user_or_group_list=user_or_group_list).save()


def update_cifs_share_desc_and_permission(name, desc, oplock, notify, offline_cache_mode):
    share = CifsShare.objects(share_name=name).first()
    if share:
        share.update(set__share_desc=desc, set__share_oplock=oplock,
                     set__share_notify=notify, set__share_offline_cache_mode=offline_cache_mode)
    else:
        raise DatabaseError('No such cifs share!')


def update_cifs_share_user_or_group_list(name, user_or_group_list):
    share = CifsShare.objects(share_name=name).first()
    if share:
        share.update(set__share_user_or_group_list=user_or_group_list)
    else:
        raise DatabaseError('No such cifs share!')


def delete_cifs_share(name):
    share = CifsShare.objects(share_name=name).first()
    if share:
        share.delete()
    else:
        raise DatabaseError('No such cifs share!')


def get_user_or_group_from_cifs_share(share_name):
    share = CifsShare.objects(share_name=share_name).first()
    if share:
        return share.share_user_or_group_list
    else:
        raise DatabaseError('No such cifs share!')


def add_user_or_group_to_cifs_share(share_name, user_or_group):
    share = CifsShare.objects(share_name=share_name).first()
    if share:
        user_or_group_list = get_user_or_group_from_cifs_share(share_name)
        user_or_group_name_list = map(
            lambda item: item['name'] + item['type'], user_or_group_list)
        user_or_group_name = user_or_group['name'] + user_or_group['type']
        if user_or_group_name in user_or_group_name_list:
            raise DatabaseError('User or group already exists!')
        else:
            user_or_group_list.append(user_or_group)
            update_cifs_share_user_or_group_list(
                share_name, user_or_group_list)
    else:
        raise DatabaseError('No such cifs share!')


def update_user_or_group_in_cifs_share(share_name, name, user_or_group_type, permission):
    share = CifsShare.objects(share_name=share_name).first()
    if share:
        user_or_group_list = get_user_or_group_from_cifs_share(share_name)
        user_or_group_name_list = map(
            lambda item: item['name'] + item['type'], user_or_group_list)
        user_or_group_name = name + user_or_group_type
        if user_or_group_name in user_or_group_name_list:
            user_or_group_list = map(lambda user_or_group: {'name': name, 'type': user_or_group_type, 'permission': permission}
                                     if user_or_group['name'] + user_or_group['type'] == user_or_group_name else user_or_group, user_or_group_list)
            update_cifs_share_user_or_group_list(
                share_name, user_or_group_list)
        else:
            raise DatabaseError('No such user or group hare!')
    else:
        raise DatabaseError('No such cifs share!')


def remove_user_or_group_from_cifs_share(share_name, name, user_or_group_type):
    share = CifsShare.objects(share_name=share_name).first()
    if share:
        user_or_group_list = get_user_or_group_from_cifs_share(share_name)
        user_or_group_name_list = map(
            lambda item: item['name'] + item['type'], user_or_group_list)
        user_or_group_name = name + user_or_group_type
        if user_or_group_name in user_or_group_name_list:
            user_or_group_list = filter(
                lambda user_or_group: user_or_group['name'] + user_or_group['type'] != user_or_group_name, user_or_group_list)
            update_cifs_share_user_or_group_list(
                share_name, user_or_group_list)
        else:
            raise DatabaseError('No such user or group hare!')
    else:
        raise DatabaseError('No such cifs share!')
