from lib.module import handler
from lib.module.process import setinterval
from lib.service import backend, database
from lib.util import event, initialize, schedule, status


def sync_status():
    response = {}
    try:
        response = handler.response(0, None)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def check_env(params):
    response = {}
    try:
        metadataServerIPs, storageServerIPs = handler.request(
            params, metadataServerIPs=list, storageServerIPs=list)
        data = initialize.check_cluster_env(
            metadataServerIPs, storageServerIPs)
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_raid(params):
    response = {}
    try:
        metadataServerIPs, storageServerIPs = handler.request(
            params, metadataServerIPs=list, storageServerIPs=list)
        data = initialize.get_recommended_raid_configuration(
            metadataServerIPs, storageServerIPs)
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_disk_list(params):
    response = {}
    try:
        ip, = handler.request(params, ip=str)
        data = backend.get_disk_list(ip)
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def initialize_cluster(params):
    print('start')
    current = 0
    total = 8
    try:
        clientIPs, customRAID, enableCreateBuddyGroup, enableCustomRAID, enableHA, floatIPs, hbIPs, managementServerIPs, metadataServerIPs, recommendedRAID, storageServerIPs = handler.request(
            params, metadataServerIPs=list, storageServerIPs=list, managementServerIPs=list, clientIPs=list, enableHA=bool, floatIPs=list, hbIPs=list, enableCustomRAID=bool, recommendedRAID=dict, customRAID=dict, enableCreateBuddyGroup=bool)
        data = initialize.param_handler(metadataServerIPs, storageServerIPs, managementServerIPs, clientIPs,
                                        enableHA, floatIPs, hbIPs, enableCustomRAID, recommendedRAID, customRAID, enableCreateBuddyGroup)
        init_res = backend.initialize_cluster(data['orcafs_param'])
        if not init_res['errorId']:
            @setinterval(2)
            def send_initialize_status(callback):
                status_res = backend.get_create_status()
                current = status_res['data']['currentStep']
                fs_total = status_res['data']['totalStep']
                describle = status_res['data']['describle']
                error_message = status_res['data']['errorMessage']
                if not status_res['errorId']:
                    if status_res['data']['status']:
                        callback()
                        event.send('cluster', 0, 'cluster', False, {
                                   'current': current, 'status': -1, 'total': total})
                    elif current != fs_total:
                        print(current)
                        event.send('cluster', 0, 'cluster', True, {
                                   'current': current, 'status': status_res['data']['status'], 'total': total})
                    elif 'finish' in describle:
                        callback()
                        if data['enable_create_buddy_group']:
                            backend.create_buddy_group({})
                        current = 5
                        print(current)
                        event.send('cluster', 0, 'cluster', True, {
                                   'current': current, 'status': 0, 'total': total})
                        initialize.initialize_mongodb(data['mongodb_param'])
                        current = 6
                        print(current)
                        event.send('cluster', 0, 'cluster', True, {
                                   'current': current, 'status': 0, 'total': total})
                        initialize.save_initialize_information(
                            data['param'], data['node_list'])
                        current = 7
                        print(current)
                        event.send('cluster', 0, 'cluster', True, {
                                   'current': current, 'status': 0, 'total': total})
                        print('finish')
                else:
                    callback()
                    event.send('cluster', 0, 'cluster', False, {
                               'current': current, 'status': -1, 'total': total})

            def stop_get_initialize_status():
                start_get_initialize_status.set()
            start_get_initialize_status = send_initialize_status(
                stop_get_initialize_status)
        elif init_res['errorId'] != 111:
            event.send('cluster', 0, 'cluster', False, {
                       'current': current, 'status': -1, 'total': total})
    except Exception as error:
        print(handler.error(error))
        deinitialize_cluster(2)
        event.send('cluster', 0, 'cluster', False, {
                   'current': current, 'status': -1, 'total': total})


def deinitialize_cluster(mode):
    print('start')
    try:
        event.send('cluster', 1, 'cluster', True, {}, True)
        if mode == 1:
            backend.deinitialize_cluster()

        @setinterval(2)
        def send_deinitialize_status(callback):
            status_res = backend.get_create_status()
            current = status_res['data']['currentStep']
            describle = status_res['data']['describle']
            state = status_res['data']['status']
            error_message = status_res['data']['errorMessage']
            if not status_res['errorId']:
                print(current)
                if state:
                    callback()
                    event.send('cluster', 2, 'cluster', False, {}, True)
                elif not current and 'finish' in describle:
                    callback()
                    mongodb_status = initialize.get_mongodb_status()
                    node_list = ['127.0.0.1']
                    if mongodb_status:
                        node_list = database.get_setting('NODE-LIST')
                        node_list = node_list['mgmt'] if len(
                            node_list['mgmt']) == 1 else node_list['mgmt'] + node_list['meta'][0:1]
                        initialize.deinitialize_mongodb(node_list)
                    event.send('cluster', 2, 'cluster', True, {}, True)
                    print('finish')

        def stop_get_deinitialize_status():
            start_get_deinitialize_status.set()
        start_get_deinitialize_status = send_deinitialize_status(
            stop_get_deinitialize_status)
    except Exception as error:
        print(handler.error(error))
        event.send('cluster', 2, 'cluster', False, {}, True)


def receive_event(params):
    response = {}
    try:
        channel, code, data, notify, result, target = handler.request(
            params, channel=str, code=int, target=str, result=bool, data=dict, notify=bool)
        event.receive(channel, code, target, result, data, notify)
        response = handler.response(0, 'Receive event successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def login(params):
    response = {}
    try:
        password, username = handler.request(
            params, username=str, password=str)
        data = database.login(username, password)
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def logout(params):
    response = {}
    try:
        username, = handler.request(params, username=str)
        database.logout(username)
        response = handler.response(0, 'Logout successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_default_user():
    response = {}
    try:
        init_param = database.get_setting('INITIALIZE-PARAMETER')
        float_ips = init_param['floatIPs']
        float_ip = float_ips[0] if len(float_ips) else ''
        data = {'username': 'admin', 'password': '123456', 'floatIP': float_ip}
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_user(params):
    response = {}
    try:
        if params is not None and len(dict.keys(params)):
            username, = handler.request(params, username=str)
            data = database.get_user(username)
        else:
            data = database.list_user()
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def create_user(params):
    response = {}
    try:
        password, username = handler.request(
            params, username=str, password=str)
        database.create_user(username, password)
        response = handler.response(0, 'Create user successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def update_user(params):
    response = {}
    try:
        password, username = handler.request(
            params, username=str, password=str)
        database.update_user(username, password)
        response = handler.response(0, 'Update user successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def delete_user(params):
    response = {}
    try:
        username, = handler.request(params, username=str)
        database.delete_user(username)
        response = handler.response(0, 'Delete user successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_cluster_info():
    response = {}
    try:
        version = backend.get_version()
        node_list = backend.get_node_list()
        total = len(node_list)
        normal = len(filter(lambda node: node['status'], node_list))
        status = True if total == normal else False
        cluster_status = {'status': status, 'total': total,
                          'normal': normal, 'abnormal': total - normal}
        space = backend.get_storage_disk_space()
        data = {'clusterStatus': cluster_status,
                'clusterCapacity': space, 'version': version}
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_meta_status():
    response = {}
    try:
        data = backend.get_meta_status()
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_storage_status():
    response = {}
    try:
        data = backend.get_storage_status()
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_target_list(params):
    response = {}
    try:
        ranking = params.get('ranking')
        if ranking is not None:
            if isinstance(ranking, basestring):
                ranking = ranking == 'true'
            else:
                ranking = ranking == True
        else:
            ranking = False
        target_list = backend.get_target_list()
        if ranking:
            data = sorted(
                target_list, key=lambda target: target['space']['usage'], reverse=True)
        else:
            data = sorted(
                target_list, key=lambda target: target['targetId'])
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_cluster_throughput():
    response = {}
    try:
        data = database.get_cluster_throughput()
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_cluster_iops():
    response = {}
    try:
        data = database.get_cluster_iops()
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_node_list():
    response = {}
    try:
        data = backend.get_node_list()
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_node_service(params):
    response = {}
    try:
        hostname, = handler.request(params, hostname=str)
        data = backend.get_node_service(hostname)
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_node_cpu(params):
    response = {}
    try:
        hostname, = handler.request(params, hostname=str)
        data = database.get_node_cpu(hostname)
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_node_memory(params):
    response = {}
    try:
        hostname, = handler.request(params, hostname=str)
        data = database.get_node_memory(hostname)
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_node_throughput(params):
    response = {}
    try:
        hostname, = handler.request(params, hostname=str)
        data = database.get_node_throughput(hostname)
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_node_iops(params):
    response = {}
    try:
        hostname, = handler.request(params, hostname=str)
        data = database.get_node_iops(hostname)
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_node_target(params):
    response = {}
    try:
        hostname, = handler.request(params, hostname=str)
        data = backend.get_node_target(hostname)
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_cluster_service_and_client_ip():
    response = {}
    try:
        data = database.get_setting('NODE-LIST')
        response = handler.response(0, {'metadataServerIPs': data['meta'], 'storageServerIPs': data['storage'],
                                        'managementServerIPs': data['mgmt'], 'clientIPs': data['client']})
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_storage_pool(params):
    response = {}
    try:
        if params is not None and len(dict.keys(params)):
            name, = handler.request(params, name=str)
            data = database.get_storage_pool(name)
        else:
            data = database.list_storage_pool()
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def create_storage_pool(params):
    response = {}
    try:
        description, mirror_groups, name, targets = handler.request(
            params, name=str, description=str, targets=list, mirrorGroups=list)
        pool_id = backend.create_storage_pool(
            name, description, targets, mirror_groups)
        database.create_storage_pool(pool_id, name, description)
        response = handler.response(0, 'Create storagePool successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def update_storage_pool(params):
    response = {}
    try:
        description, name, pool_id = handler.request(
            params, poolId=int, name=str, description=str)
        backend.update_storage_pool_name(pool_id, name)
        database.update_storage_pool_name_and_desc(name, description)
        response = handler.response(0, 'Update storagePool successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def delete_storage_pool(params):
    response = {}
    try:
        name, pool_id = handler.request(params, poolId=int, name=str)
        backend.delete_storage_pool(name)
        database.delete_storage_pool(name)
        response = handler(0, 'Delete storagePool successfully!')
    except Exception as error:
        print(handler.error(error))
    return response


def get_targets_in_storage_pool(params):
    response = {}
    try:
        if params is not None and len(dict.keys(params)):
            pool_id, = handler.request(params, poolId=int)
            data = backend.get_targets_in_storage_pool(pool_id)
        else:
            data = backend.get_targets_in_storage_pool()
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_buddy_groups_in_storage_pool(params):
    response = {}
    try:
        if params is not None and len(dict.keys(params)):
            pool_id, = handler.request(params, poolId=int)
            data = backend.get_buddy_groups_in_storage_pool(pool_id)
        else:
            data = backend.get_buddy_groups_in_storage_pool()
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_snapshot_setting():
    response = {}
    try:
        data = database.get_setting('SNAPSHOT-SETTING')
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def update_snapshot_setting(params):
    response = {}
    try:
        auto, manual, total = handler.request(
            params, total=int, manual=int, auto=int)
        backend.update_snapshot_setting(total, manual, auto)
        database.update_setting(
            'SNAPSHOT-SETTING', {'total': total, 'manual': manual, 'auto': auto})
        response = handler.response(0, 'Update snapshot setting successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_snapshot(params):
    response = {}
    try:
        if params is not None and len(dict.keys(params)):
            name, = handler.request(params, name=str)
            data = database.get_snapshot(name)
        else:
            data = database.list_snapshot()
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def create_snapshot(params):
    try:
        description, name = handler.request(params, name=str, description=str)
        create_time = handler.current_time()
        setting = database.get_setting('SNAPSHOT-SETTING')
        limit = setting['manual']
        count = database.count_snapshot(False)
        if count < limit:
            database.create_snapshot(name, description, False, create_time)
            event.send('snapshot', 11, name, True)
            response = backend.create_snapshot(name, False)
            if not response['errorId']:
                database.update_snapshot_status(name)
                event.send('snapshot', 12, name, True, {}, True)
            else:
                database.delete_snapshot(name)
                event.send('snapshot', 12, name, False, {}, True)
                print(response['message'])
        else:
            event.send('snapshot', 12, name, False, {}, True)
    except Exception as error:
        print(handler.error(error))


def update_snapshot(params):
    response = {}
    try:
        description, name = handler.request(params, name=str, description=str)
        database.update_snapshot_desc(name, description)
        response = handler.response(0, 'Update snapshot successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def delete_snapshot(params):
    try:
        name, = handler.request(params, name=str)
        database.update_snapshot_status(name, False, True, False)
        response = backend.delete_snapshot(name)
        if not response['errorId']:
            database.delete_snapshot(name)
            event.send('snapshot', 13, name, True, {}, True)
        else:
            database.update_snapshot_status(name)
            event.send('snapshot', 14, name, False, {}, True)
    except Exception as error:
        print(handler.error(error))


def batch_delete_snapshot(params):
    try:
        names, = handler.request(params, names=list)
        for name in names:
            database.update_snapshot_status(name, False, True, False)
        names_str = ','.join(names)
        response = backend.batch_delete_snapshot(names_str)
        if not response['errorId']:
            for name in names:
                database.delete_snapshot(name)
            event.send('snapshot', 15, names_str, True,
                       {'total': len(names)}, True)
        else:
            for name in names:
                database.update_snapshot_status(name)
            event.send('snapshot', 16, names_str, False,
                       {'total': len(names)}, True)
    except Exception as error:
        print(handler.error(error))


def rollback_snapshot(params):
    try:
        name, = handler.request(params, name=str)
        event.send('snapshot', 17, name, True, {}, True)
        database.update_snapshot_status(name, False, False, True)
        response = backend.rollback_snapshot(name)
        database.update_snapshot_status(name)
        if not response['errorId']:
            event.send('snapshot', 18, name, True, {}, True)
        else:
            event.send('snapshot', 18, name, False, {}, True)
    except Exception as error:
        print(handler.error(error))


def get_snapshot_schedule(params):
    response = {}
    try:
        if params is not None and len(dict.keys(params)):
            name, = handler.request(params, name=str)
            data = database.get_snapshot_schedule(name)
        else:
            data = database.list_snapshot_schedule()
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def create_snapshot_schedule(params):
    response = {}
    try:
        autoDisable, autoDisableTime, deleteRound,  description, interval, name = handler.request(
            params, name=str, description=str, autoDisable=bool, autoDisableTime=int, interval=int, deleteRound=bool)
        autoDisableTime = autoDisableTime if autoDisable else 0
        database.create_snapshot_schedule(
            name, description, autoDisableTime, interval, deleteRound)
        response = handler.response(
            0, 'create snapshot schedule successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def update_snapshot_schedule(params):
    response = {}
    try:
        description, name = handler.request(params, name=str, description=str)
        database.update_snapshot_schedule(name, description)
        response = handler.response(
            0, 'update snapshot schedule successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def enable_snapshot_schedule(params):
    response = {}
    try:
        name, = handler.request(params, name=str)
        database.enable_snapshot_schedule(name)
        response = handler.response(
            0, 'enable snapshot schedule successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def disable_snapshot_schedule(params):
    response = {}
    try:
        name, = handler.request(params, name=str)
        database.disable_snapshot_schedule(name)
        response = handler.response(
            0, 'disable snapshot schedule successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def delete_snapshot_schedule(params):
    response = {}
    try:
        name, = handler.request(params, name=str)
        database.delete_snapshot_schedule(name)
        response = handler.response(
            0, 'delete snapshot schedule successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def batch_delete_snapshot_schedule(params):
    response = {}
    try:
        names, = handler.request(params, names=list)
        for name in names:
            database.delete_snapshot_schedule(name)
        response = handler.response(
            0, 'batch delete snapshot schedules successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def add_client_to_cluster(params):
    response = {}
    try:
        ip, = handler.request(params, ip=str)
        backend.add_client_to_cluster(ip)
        database.add_node_to_cluster(ip, 'client')
        response = handler.response(0, 'add client to cluster successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_client():
    response = {}
    try:
        clients = backend.get_client() or []
        nas_servers = database.list_nas_server()
        nas_servers = map(lambda nas_server: nas_server['ip'], nas_servers)
        data = map(lambda client: {
                   'hostname': client['name'], 'ip': client['ip'], 'isUsed': client['ip'] in nas_servers}, clients)
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_nas_server(params):
    response = {}
    try:
        if params is not None and len(dict.keys(params)):
            ip, = handler.request(params, ip=str)
            data = database.get_nas_server(ip)
        else:
            data = database.list_nas_server()
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def create_nas_server(params):
    response = {}
    try:
        description, ip, path = handler.request(
            params, ip=str, path=str, description=str)
        backend.create_nas_server(ip, path)
        database.create_nas_server(ip, path, description)
        response = handler.response(0, 'Create nas server successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def update_nas_server(params):
    response = {}
    try:
        description, ip = handler.request(params, ip=str, description=str)
        database.update_nas_server(ip, description)
        response = handler.response(0, 'Update nas server successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_buddy_group():
    response = {}
    try:
        data = backend.get_buddy_group()
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_files(params):
    response = {}
    try:
        path, = handler.request(params, dir=str)
        data = backend.get_files(path)
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_entry_info(params):
    response = {}
    try:
        path, = handler.request(params, dir=str)
        data = backend.get_entry_info(path)
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def set_pattern(params):
    response = {}
    try:
        buddyMirror, chunkSize, dirPath, numTargets = handler.request(
            params, dirPath=str, numTargets=int, chunkSize=int, buddyMirror=int)
        data = backend.set_pattern(dirPath, numTargets, chunkSize, buddyMirror)
        response = handler.response(0, 'Set pattern successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_event_log():
    response = {}
    try:
        data = []
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_audit_log():
    response = {}
    try:
        data = []
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_local_auth_user(params):
    response = {}
    try:
        if params is not None and len(dict.keys(params)):
            name, = handler.request(params, name=str)
            data = database.get_local_auth_user(name)
        else:
            data = database.list_local_auth_user()
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def create_local_auth_user(params):
    response = {}
    try:
        description, name, password, primaryGroup, secondaryGroup = handler.request(
            params, name=str, description=str, password=str, primaryGroup=str, secondaryGroup=list)
        backend.create_local_auth_user(
            name, description, password, primaryGroup, secondaryGroup)
        database.create_local_auth_user(
            name, description, password, primaryGroup, secondaryGroup)
        response = handler.response(0, 'Create local auth user successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def update_local_auth_user(params):
    response = {}
    try:
        changePassword, description, name, primaryGroup = handler.request(
            params, name=str, description=str, primaryGroup=str, changePassword=bool)
        backend.update_local_auth_user_desc_and_primary_group(
            name, description, primaryGroup)
        database.update_local_auth_user_desc(name, description)
        database.update_local_auth_user_primary_group(name, primaryGroup)
        if changePassword:
            password, = handler.request(params, password=str)
            backend.update_local_auth_user_passwd(name, password)
            database.update_local_auth_user_passwd(name, password)
        response = handler.response(0, 'Update local auth user successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def delete_local_auth_user(params):
    response = {}
    try:
        name, = handler.request(params, name=str)
        backend.delete_local_auth_user(name)
        database.delete_local_auth_user(name)
        response = handler.response(0, 'Delete local auth user successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def batch_delete_local_auth_user(params):
    response = {}
    try:
        names, = handler.request(params, names=list)
        for name in names:
            backend.delete_local_auth_user(name)
            database.delete_local_auth_user(name)
        response = handler.response(
            0, 'Batch delete local auth users successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_local_auth_user_group(params):
    response = {}
    try:
        if params is not None and len(dict.keys(params)):
            name, = handler.request(params, name=str)
            data = database.get_local_auth_user_group(name)
        else:
            data = database.list_local_auth_user_group()
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def create_local_auth_user_group(params):
    response = {}
    try:
        description, name = handler.request(params, name=str, description=str)
        backend.create_local_auth_user_group(name, description)
        database.create_local_auth_user_group(name, description)
        response = handler.response(
            0, 'Create local auth user group successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def update_local_auth_user_group(params):
    response = {}
    try:
        description, name = handler.request(params, name=str, description=str)
        backend.update_local_auth_user_group(name, description)
        database.update_local_auth_user_group(name, description)
        response = handler.response(
            0, 'Update local auth user group successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def delete_local_auth_user_group(params):
    response = {}
    try:
        name, = handler.request(params, name=str)
        backend.delete_local_auth_user_group(name)
        database.delete_local_auth_user_group(name)
        response = handler.response(
            0, 'Delete local auth user group successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_local_auth_user_from_group(params):
    response = {}
    try:
        groupName, = handler.request(params, groupName=str)
        data = database.get_local_auth_user_from_group(groupName)
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def add_local_auth_user_to_group(params):
    response = {}
    try:
        groupName, names = handler.request(params, names=list, groupName=str)
        for name in names:
            backend.add_local_auth_user_to_group(name, groupName)
            database.add_local_auth_user_to_group(name, groupName)
        response = handler.response(
            0, 'Add local auth user to group successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def remove_local_auth_user_from_group(params):
    response = {}
    try:
        groupName, name = handler.request(params, name=str, groupName=str)
        backend.remove_local_auth_user_from_group(name, groupName)
        database.remove_local_auth_user_from_group(name, groupName)
        response = handler.response(
            0, 'Remove local auth user from group successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_nfs_share(params):
    response = {}
    try:
        if params is not None and len(dict.keys(params)):
            path, = handler.request(params, path=str)
            data = database.get_nfs_share(path)
        else:
            data = database.list_nfs_share()
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def create_nfs_share(params):
    response = {}
    try:
        clientList, description, path = handler.request(
            params, path=str, description=str, clientList=list)
        nas_server_list = database.list_nas_server()
        server = filter(lambda nas_server: handler.check_root(
            path, nas_server['path']), nas_server_list)[0]['ip']
        backend.create_nfs_share(server, path, description, clientList)
        database.create_nfs_share(path, description, clientList)
        response = handler.response(0, 'Create nfs share successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def update_nfs_share(params):
    response = {}
    try:
        description, path = handler.request(params, path=str, description=str)
        nas_server_list = database.list_nas_server()
        server = filter(lambda nas_server: handler.check_root(
            path, nas_server['path']), nas_server_list)[0]['ip']
        backend.update_nfs_share(server, path, description)
        database.update_nfs_share_desc(path, description)
        response = handler.response(0, 'Update local auth user successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def delete_nfs_share(params):
    response = {}
    try:
        path, = handler.request(params, path=str)
        nas_server_list = database.list_nas_server()
        server = filter(lambda nas_server: handler.check_root(
            path, nas_server['path']), nas_server_list)[0]['ip']
        backend.delete_nfs_share(server, path)
        database.delete_nfs_share(path)
        response = handler.response(0, 'Delete nfs share successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def batch_delete_nfs_share(params):
    response = {}
    try:
        paths, = handler.request(params, paths=list)
        nas_server_list = database.list_nas_server()
        for path in paths:
            server = filter(lambda nas_server: handler.check_root(
                path, nas_server['path']), nas_server_list)[0]['ip']
            backend.delete_nfs_share(server, path)
            database.delete_nfs_share(path)
        response = handler.response(0, 'Batch delete nfs shares successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_client_in_nfs_share(params):
    response = {}
    try:
        path, = handler.request(params, path=str)
        data = database.get_client_in_nfs_share(path)
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def create_client_in_nfs_share(params):
    response = {}
    try:
        ips, path, permission, permissionConstraint, rootPermissionConstraint, client_type, writeMode = handler.request(
            params, type=str, ips=str, permission=str, writeMode=str, permissionConstraint=str, rootPermissionConstraint=str, path=str)
        ips = ips.split(';')
        nas_server_list = database.list_nas_server()
        for ip in ips:
            server = filter(lambda nas_server: handler.check_root(
                path, nas_server['path']), nas_server_list)[0]['ip']
            backend.create_client_in_nfs_share(
                server, client_type, ip, permission, writeMode, permissionConstraint, rootPermissionConstraint, path)
            database.create_client_in_nfs_share(
                client_type, ip, permission, writeMode, permissionConstraint, rootPermissionConstraint, path)
        response = handler.response(
            0, 'Create client in nfs share successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def update_client_in_nfs_share(params):
    response = {}
    try:
        ip, path, permission, permissionConstraint, rootPermissionConstraint, client_type, writeMode = handler.request(
            params, type=str, ip=str, permission=str, writeMode=str, permissionConstraint=str, rootPermissionConstraint=str, path=str)
        nas_server_list = database.list_nas_server()
        server = filter(lambda nas_server: handler.check_root(
            path, nas_server['path']), nas_server_list)[0]['ip']
        backend.update_client_in_nfs_share(
            server, client_type, ip, permission, writeMode, permissionConstraint, rootPermissionConstraint, path)
        database.update_client_in_nfs_share(
            client_type, ip, permission, writeMode, permissionConstraint, rootPermissionConstraint, path)
        response = handler.response(
            0, 'Update client in nfs share successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def delete_client_in_nfs_share(params):
    response = {}
    try:
        ip, path = handler.request(params, ip=str, path=str)
        nas_server_list = database.list_nas_server()
        server = filter(lambda nas_server: handler.check_root(
            path, nas_server['path']), nas_server_list)[0]['ip']
        backend.delete_client_in_nfs_share(server, ip, path)
        database.delete_client_in_nfs_share(ip, path)
        response = handler.response(
            0, 'Delete client in nfs share successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response
