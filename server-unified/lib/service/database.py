import json

from mongoengine import connect

from lib.model import (ClusterThroughputAndIops, NodeCpuAndMemory,
                       NodeThroughputAndIops, Setting, User, StoragePool)
from lib.module import handler


class DatabaseError(Exception):
    def __init__(self, errorinfo):
        self.errorinfo = errorinfo

    def __str__(self):
        return self.errorinfo


def connect_database(host='127.0.0.1', port=27017):
    connect('orcafs', host=host, port=port)


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
    for user in User.objects:
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


def create_storage_pool(poolId, name, description):
    storagePool = StoragePool.objects(name=name).first()
    if storagePool:
        raise DatabaseError('StoragePool already exists!')
    else:
        StoragePool(poolId, name, description).save()
