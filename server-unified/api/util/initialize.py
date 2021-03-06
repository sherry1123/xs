import json
import math

from mongoengine import connect

from api.module import handler, process, request
from api.service import backend, database


def get_orcafs_status():
    response = backend.get_create_status()
    if response['errorId']:
        status = False
    else:
        data = response['data']
        status = True if data['currentStep'] and data['currentStep'] == data['totalStep'] else False
    return status


def check_cluster_env(metadatas, storages):
    def check_server(server):
        token = handler.unicode2str(request.get(
            'http://%s:9090/token/get' % server, {}, {}, {'tokenId': ''}))
        result = {'status': '', 'help': ''} if token['tokenId'] else {
            'status': 'error', 'help': 1}
        return result

    def filter_result(server):
        return True if server['status'] else False
    metadataServerIPsError = map(check_server, metadatas)
    storageServerIPsError = map(check_server, storages)
    result = not bool(len(filter(filter_result, metadataServerIPsError +
                                 storageServerIPsError)))
    return {'metadataServerIPsError': metadataServerIPsError, 'storageServerIPsError': storageServerIPsError, 'result': result}


def get_recommended_raid_configuration(metadatas, storages):
    ip_list = list(set(metadatas + storages))

    def create_disk_group(ip):
        return {'ip': ip, 'diskList': backend.get_disk_list(ip)}

    def create_mock_disk_group(ip):
        disk_list = []
        for i in range(28):
            disk_list.append(
                {'diskName': '/dev/nvme%sn1' % i, 'totalSpace': 11489037516})
        return {'ip': ip, 'diskList': disk_list}
    disk_group = map(create_disk_group, ip_list)
    metadata_configuration = {}
    storage_configuration = {}

    def get_configuration(disk_list, service_type):
        disk_list_length = len(disk_list)
        container_list = []
        container_list_length = len(container_list)
        raid_level = 0
        stripe_size = 1024 * 8
        disk_type = 'ssd'
        if service_type == 'metadata':
            if disk_list_length > 1:
                container_list_length = 1
            else:
                pass
            raid_level = 1
        else:
            container_list_length = int(math.floor(disk_list_length / 8))
            raid_level = 5
        container_list = range(container_list_length)

        def map_container_list(container):
            disks = disk_list[0:2] if service_type == 'metadata' else disk_list[0:8]
            total_space = 0
            for disk in disks:
                disk_list.remove(disk)
                total_space += disk['space']
            return {'raidLevel': raid_level, 'diskList': disks, 'totalSpace': total_space, 'stripeSize': stripe_size, 'diskType': disk_type}

        return map(map_container_list, container_list)

    for item in disk_group:
        ip = item['ip']
        disk_list = item['diskList']
        disk_list = filter(lambda disk: 'nvme' in disk['diskName'], disk_list)
        disk_list = map(lambda disk: {
                        'diskName': disk['diskName'], 'space': disk['totalSpace']}, disk_list)
        disk_list_length = len(disk_list)
        if ip in metadatas and ip in storages:
            metadata_configuration[ip] = get_configuration(
                disk_list, 'metadata') if disk_list_length else []
            storage_configuration[ip] = get_configuration(
                disk_list, 'storage') if disk_list_length else []
        elif ip in metadatas:
            metadata_configuration[ip] = get_configuration(
                disk_list, 'metadata') if disk_list_length else []
        elif ip in storages:
            storage_configuration[ip] = get_configuration(
                disk_list, 'storage') if disk_list_length else []
    return {'metadataServerIPs': metadata_configuration, 'storageServerIPs': storage_configuration}


def param_handler(metadataServerIPs, storageServerIPs, managementServerIPs, clientIPs, enableHA, floatIPs, hbIPs, enableCustomRAID, recommendedRAID, customRAID, enableCreateBuddyGroup):
    def empty_list_handler(data):
        return data if data[0] else []
    clientIPs = empty_list_handler(clientIPs)
    floatIPs = empty_list_handler(floatIPs)
    hbIPs = empty_list_handler(hbIPs)

    def mongodb_param_handler(mgmts, metadatas):
        ip_list = []
        replica_set = False
        if enableHA:
            ip_list = mgmts + metadatas[0:1]
            replica_set = True
        else:
            ip_list = mgmts
        return {'ip_list': ip_list, 'replica_set': replica_set}

    def service_param_handler(raid_config, service_type):
        service_raid_config = raid_config.get('metadataServerIPs') or raid_config['metadataNodes'] if service_type == 'metadata' else raid_config.get(
            'storageServerIPs') or raid_config['storageNodes']
        param = []
        if enableCustomRAID:
            for service in service_raid_config:
                param.append({'ip': service['ip'], 'diskGroup': map(lambda raid: {'diskList': map(lambda disk: disk['diskName'], raid['selectedDisks']), 'raidLevel': raid['arrayLevel']['name'].lower(
                ).replace(' ', ''), 'stripeSize': raid['arrayStripeSize'].replace(' ', '').replace('B', '').lower()}, service['raidList'])})
        else:
            for service in dict.keys(service_raid_config):
                param.append({'ip': service, 'diskGroup': map(lambda raid: {'diskList': map(
                    lambda disk: disk['diskName'], raid['diskList']), 'raidLevel': 'raid%s' % raid['raidLevel'], 'stripeSize': '%sk' % (raid['stripeSize'] / 1024)}, service_raid_config[service])})
        return param

    def mgmt_param_handler(mgmts, heart_beat_ips):
        param = []
        if enableHA:
            param.append({'ip': mgmts[0], 'heartBeatIp': heart_beat_ips[0]})
            param.append({'ip': mgmts[1], 'heartBeatIp': heart_beat_ips[1]})
        else:
            param.append({'ip': mgmts[0], 'heartBeatIp': ''})
        return param

    metadata = {'type': 'meta', 'hosts': service_param_handler(
        customRAID if enableCustomRAID else recommendedRAID, 'metadata')}
    storage = {'type': 'storage', 'hosts': service_param_handler(
        customRAID if enableCustomRAID else recommendedRAID, 'storage')}
    mgmt = {'type': 'mgmt', 'hosts': mgmt_param_handler(
        managementServerIPs, hbIPs), 'floatIp': floatIPs[0] if enableHA else ''}
    client = {'type': 'client', 'hosts': map(lambda ip: {'ip': ip}, clientIPs)}
    mongodb_param = mongodb_param_handler(
        managementServerIPs, metadataServerIPs)
    orcafs_param = [metadata, storage, mgmt,
                    client] if len(clientIPs) else [metadata, storage, mgmt]
    node_list = {'mgmt': managementServerIPs, 'meta': metadataServerIPs,
                 'storage': storageServerIPs, 'client': clientIPs}
    param = {'metadataServerIPs': metadataServerIPs, 'storageServerIPs': storageServerIPs, 'managementServerIPs': managementServerIPs, 'clientIPs': clientIPs, 'enableHA': enableHA,
             'floatIPs': floatIPs, 'hbIPs': hbIPs, 'enableCustomRAID': enableCustomRAID, 'recommendedRAID': recommendedRAID, 'customRAID': customRAID, 'enableCreateBuddyGroup': enableCreateBuddyGroup}
    return {'mongodb_param': mongodb_param, 'orcafs_param': orcafs_param, 'node_list': node_list, 'enable_create_buddy_group': enableCreateBuddyGroup, 'param': param}


def initialize_mongodb(param):
    ip_list = param['ip_list']
    replica_set = param['replica_set']
    if not replica_set:
        process.run('mv /etc/mongod.conf /etc/mongod.conf.bak')
        process.run(
            'cp /var/orcafs-gui/server-unified/conf/mongod.single.conf /etc/mongod.conf')
        process.run('service mongod start')
        process.run('sed -i "/MongoDB/ a service mongod start" /etc/rc.local')
    else:
        def create_members_config(members):
            param = []
            for i in range(len(members)):
                param.append({'_id': i, 'host': members[i], 'priority': 2 - i})
            return param
        config = {'_id': 'orcafs', 'members': create_members_config(ip_list)}
        for ip in ip_list:
            process.run('mv /etc/mongod.conf /etc/mongod.conf.bak', ip)
            process.run(
                'cp /var/orcafs-gui/server-unified/conf/mongod.replset.conf /etc/mongod.conf', ip)
            process.run('service mongod start', ip)
            process.run(
                'sed -i "/MongoDB/ a service mongod start" /etc/rc.local', ip)
        process.run('/usr/bin/mongod --quiet --eval "rs.initiate(%s)"' %
                    json.dumps(config))
    process.run('sleep 20')


def save_initialize_information(param, node_list):
    connect_database()
    database.create_setting('INITIALIZE-PARAMETER', param)
    database.create_setting('NODE-LIST', node_list)
    database.create_setting(
        'SNAPSHOT-SETTING', {'total': 64, 'manual': 25, 'auto': 39})
    database.create_user('admin', 'e10adc3949ba59abbe56e057f20f883e')
    database.create_local_auth_user_group('everyone', 'everyone')
    database.create_data_level(1, 'high')
    database.create_data_level(2, 'medium')
    database.create_data_level(3, 'low')


def disable_node_service(node_list):
    mgmt = node_list['mgmt']
    meta_and_storage = list(set(node_list['meta'] + node_list['storage']))
    for ip in mgmt:
        if ip in meta_and_storage:
            meta_and_storage.remove(ip)
    for ip in meta_and_storage:
        process.run('sed -i "/orcafs-gui/d" /etc/rc.local', ip)
        process.run('sed -i "/nginx/d" /etc/rc.local', ip)
        process.run('service orcafs-gui stop', ip)
        process.run('service nginx stop', ip)


def enable_node_service(node_list):
    mgmt = node_list['mgmt']
    meta_and_storage = list(set(node_list['meta'] + node_list['storage']))
    for ip in mgmt:
        if ip in meta_and_storage:
            meta_and_storage.remove(ip)
    for ip in meta_and_storage:
        process.run(
            'sed -i "/OrcaFS/ a service orcafs-gui start" /etc/rc.local', ip)
        process.run('sed -i "/Nginx/ a service nginx start" /etc/rc.local', ip)
        process.run('service orcafs-gui start', ip)
        process.run('service nginx start', ip)


def deinitialize_mongodb(ip_list):
    for ip in ip_list:
        process.run('service mongod stop', ip)
        process.run('sleep 5', ip)
        process.run('rm -rf /var/lib/mongo/*', ip)
        process.run('mv -f /etc/mongod.conf.bak /etc/mongod.conf', ip)
        process.run('sed -i "/mongod/d" /etc/rc.local', ip)


def get_mongodb_process():
    command = 'ps aux|grep /usr/bin/mongod|grep grep -v|awk \'{print $2}\''
    return bool(process.run(command))


def get_mongodb_status():
    command = '/usr/bin/mongo --quiet --eval "db.serverStatus().ok"'
    if get_mongodb_process():
        return process.run(command) == '1'
    else:
        return False


def get_mongodb_is_master_or_not():
    command = '/usr/bin/mongo --quiet --eval "db.isMaster().ismaster"'
    if get_mongodb_process():
        return process.run(command) == 'true'
    else:
        return False


def get_mongodb_type():
    command = '/usr/bin/mongo --quiet --eval "rs.status().ok"'
    return int(process.run(command))  # 0 => single, 1 => replset


def get_mongodb_replset_config():
    command = '/usr/bin/mongo --quiet --eval "db.isMaster().hosts"'
    return json.loads(process.run(command))


def connect_database():
    try:
        mongodb_type = get_mongodb_type()
        if mongodb_type:
            mongodb_replset_config = get_mongodb_replset_config()
            connect(host='mongodb://%s/storage?replicaSet=orcafs' %
                    handler.list2str(mongodb_replset_config))
        else:
            connect(host='mongodb://localhost/storage')
    except Exception as error:
        handler.log(handler.error(error), 2)
        handler.log('Connect to the database failed!')


def add_node_to_cluster(node_ip, node_type):
    if node_type == 'client':
        pass
    elif node_type == 'mgmt':
        pass
    else:
        node_list = database.get_setting('NODE-LIST')
        ip_list = node_list['mgmt'] + node_list['meta'] + node_list['storage']
        if node_ip not in ip_list:
            process.run('sed -i "/orcafs-gui/d" /etc/rc.local', node_ip)
            process.run('sed -i "/nginx/d" /etc/rc.local', node_ip)
            process.run('service orcafs-gui stop', node_ip)
            process.run('service nginx stop', node_ip)
    database.add_node_to_cluster(node_ip, node_type)


def reload_mongodb():
    mongodb_status = get_mongodb_status()
    mongodb_need_run = bool(int(process.run('grep -c "mongod" /etc/rc.local')))
    if not mongodb_status and mongodb_need_run:
        process.run('service mongod start')


def empty_log(ip):
    process.run('> /var/log/mongodb/mongod.log', ip)
    process.run('> /var/log/orcafs-gui.log', ip)
