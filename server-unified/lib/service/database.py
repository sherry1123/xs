import json

from mongoengine import connect

from lib.model import (ClusterThroughputAndIops, NodeCpuAndMemory,
                       NodeThroughputAndIops, Setting, Snapshot,
                       SnapshotSchedule, StoragePool, User)
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
    storage_pool = StoragePool.objects(name=name).first()
    if storage_pool:
        raise DatabaseError('StoragePool already exists!')
    else:
        StoragePool(storage_pool_id=pool_id, storage_pool_name=name, storage_pool_description=description,
                    storage_pool_create_time=handler.current_time()).save()


def update_storage_pool_name_and_desc(name, description):
    storage_pool = StoragePool.objects(stoprage_pool_name=name).first()
    if storage_pool:
        storage_pool.update(set__stoprage_pool_description=description)
    else:
        raise DatabaseError('No such storagePool!')


def delete_storage_pool(name):
    storage_pool = StoragePool.objects(storage_pool_name=name).first()
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
