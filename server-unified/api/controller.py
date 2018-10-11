from api.module import handler
from api.module.process import setinterval
from api.service import backend, database
from api.util import event, initialize, schedule, status
from api.util.cache import cache


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
        check_env_result = initialize.check_cluster_env(
            metadataServerIPs, storageServerIPs)
        if check_env_result['result']:
            data = initialize.get_recommended_raid_configuration(
                metadataServerIPs, storageServerIPs)
            response = handler.response(0, data)
        else:
            response = handler.response(1, handler.error(
                'This node has no OrcaFS service!'))
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
    handler.log('Start initializing the cluster!')
    current = 0
    total = 8
    try:
        clientIPs, customRAID, enableCreateBuddyGroup, enableCustomRAID, enableHA, floatIPs, hbIPs, managementServerIPs, metadataServerIPs, recommendedRAID, storageServerIPs = handler.request(
            params, metadataServerIPs=list, storageServerIPs=list, managementServerIPs=list, clientIPs=list, enableHA=bool, floatIPs=list, hbIPs=list, enableCustomRAID=bool, recommendedRAID=dict, customRAID=dict, enableCreateBuddyGroup=bool)
        data = initialize.param_handler(metadataServerIPs, storageServerIPs, managementServerIPs, clientIPs,
                                        enableHA, floatIPs, hbIPs, enableCustomRAID, recommendedRAID, customRAID, enableCreateBuddyGroup)
        mgmt = data['node_list']['mgmt']
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
                        handler.log(handler.error(error_message), 2)
                        handler.log('Step: %s, description: %s' % (
                            current, 'initialization of the cluster failed'))
                        for ip in mgmt:
                            event.send('cluster', 0, 'cluster', False, {
                                       'current': current, 'status': -1, 'total': total}, False, ip)
                    elif current != fs_total:
                        handler.log('Step: %s, description: %s' %
                                    (current, describle))
                        for ip in mgmt:
                            event.send('cluster', 0, 'cluster', True, {
                                       'current': current, 'status': status_res['data']['status'], 'total': total}, False, ip)
                    elif 'finish' in describle:
                        callback()
                        if data['enable_create_buddy_group']:
                            backend.create_buddy_group({})
                        current = 5
                        handler.log('Step: %s, description: %s' %
                                    (current, 'initialize the database'))
                        for ip in mgmt:
                            event.send('cluster', 0, 'cluster', True, {
                                       'current': current, 'status': 0, 'total': total}, False, ip)
                        initialize.initialize_mongodb(data['mongodb_param'])
                        current = 6
                        handler.log('Step: %s, description: %s' %
                                    (current, 'save initialization information'))
                        for ip in mgmt:
                            event.send('cluster', 0, 'cluster', True, {
                                       'current': current, 'status': 0, 'total': total}, False, ip)
                        initialize.save_initialize_information(
                            data['param'], data['node_list'])
                        current = 7
                        handler.log('Step: %s, description: %s' %
                                    (current, 'finish all steps'))
                        for ip in mgmt:
                            event.send('cluster', 0, 'cluster', True, {
                                       'current': current, 'status': 0, 'total': total}, False, ip)
                        initialize.disable_node_service(data['node_list'])
                        handler.log('Complete cluster initialization!')
                else:
                    callback()
                    handler.log(handler.error(error_message), 2)
                    handler.log('Step: %s, description: %s' % (
                        current, 'initialization of the cluster failed'))
                    for ip in mgmt:
                        event.send('cluster', 0, 'cluster', False, {
                                   'current': current, 'status': -1, 'total': total}, False, ip)

            def stop_get_initialize_status():
                start_get_initialize_status.set()
            start_get_initialize_status = send_initialize_status(
                stop_get_initialize_status)
        elif init_res['errorId'] != 111:
            handler.log(handler.error(init_res['message']), 2)
            handler.log('Step: %s, description: %s' %
                        (current, 'initialization of the cluster failed'))
            for ip in mgmt:
                event.send('cluster', 0, 'cluster', False, {
                           'current': current, 'status': -1, 'total': total}, False, ip)
    except Exception as error:
        handler.log(handler.error(error), 2)
        handler.log('Step: %s, description: %s' %
                    (current, 'initialization of the cluster failed'))
        deinitialize_cluster(2)
        event.send('cluster', 0, 'cluster', False, {
                   'current': current, 'status': -1, 'total': total})


def deinitialize_cluster(mode):
    handler.log('Start deinitializing the cluster!')
    try:
        mongodb_status = initialize.get_mongodb_status()
        node_list = []
        mgmt = []
        if mongodb_status:
            node_list = database.get_setting('NODE-LIST')
            mgmt = node_list['mgmt']
            for ip in mgmt:
                event.send('cluster', 1, 'cluster', True, {}, True, ip)
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
                handler.log('Step: %s, description: %s' % (current, describle))
                if state:
                    callback()
                    handler.log('Deinitialization of the cluster failed!')
                    for ip in mgmt:
                        event.send('cluster', 2, 'cluster',
                                   False, {}, True, ip)
                elif not current and 'finish' in describle:
                    callback()
                    if mongodb_status:
                        ip_list = node_list['mgmt'] if len(
                            node_list['mgmt']) == 1 else node_list['mgmt'] + node_list['meta'][0:1]
                        initialize.deinitialize_mongodb(ip_list)
                        initialize.enable_node_service(node_list)
                    handler.log('Complete cluster deinitialization!')
                    for ip in mgmt:
                        initialize.empty_log(ip)
                        event.send('cluster', 2, 'cluster', True, {}, True, ip)

        def stop_get_deinitialize_status():
            start_get_deinitialize_status.set()
        start_get_deinitialize_status = send_deinitialize_status(
            stop_get_deinitialize_status)
    except Exception as error:
        handler.log(handler.error(error), 2)
        handler.log('Deinitialization of the cluster failed!')
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
        if params:
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
        node_list = []
        node_list_cache = cache.inspect('node-list')
        if node_list_cache:
            current_stamp = handler.current_stamp()
            if current_stamp - node_list_cache['stamp'] < 60000:
                node_list = node_list_cache['value']
            else:
                node_list = backend.get_node_list()
                cache.update('node-list', node_list)
        else:
            node_list = backend.get_node_list()
            cache.update('node-list', node_list)
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
        meta_status_cache = cache.inspect('meta-status')
        if meta_status_cache:
            if len(meta_status_cache['value']) == len(data) and len(filter(lambda meta: meta['status'], meta_status_cache['value'])) != len(filter(lambda meta: meta['status'], data)):
                node_list = backend.get_node_list()
                cache.update('node-list', node_list)
        cache.update('meta-status', data)
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_storage_status():
    response = {}
    try:
        data = backend.get_storage_status()
        storage_status_cache = cache.inspect('storage-status')
        if storage_status_cache:
            if len(storage_status_cache['value']) == len(data) and len(filter(lambda storage: storage['status'], storage_status_cache['value'])) != len(filter(lambda storage: storage['status'], data)):
                node_list = backend.get_node_list()
                cache.update('node-list', node_list)
        cache.update('storage-status', data)
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_target_list(params):
    response = {}
    try:
        ranking, = handler.request(params, ranking=[str, bool])
        target_list = backend.get_target_list()
        if ranking or ranking == 'true':
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
        node_list = []
        node_list_cache = cache.inspect('node-list')
        if node_list_cache:
            current_stamp = handler.current_stamp()
            if current_stamp - node_list_cache['stamp'] < 10000:
                node_list = node_list_cache['value']
            else:
                node_list = backend.get_node_list()
                cache.update('node-list', node_list)
        else:
            node_list = backend.get_node_list()
            cache.update('node-list', node_list)
        data = node_list
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
        if params:
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
        buddy_groups, data_classification, description, name, targets = handler.request(
            params, name=str, description=str, dataClassification=int, targets=list, buddyGroups=list)
        targets = handler.list2str(targets)
        buddy_groups = handler.list2str(buddy_groups)
        pool_id = backend.create_storage_pool(name, targets, buddy_groups)
        database.create_storage_pool(
            pool_id, name, description, data_classification)
        response = handler.response(0, 'Create storagePool successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def update_storage_pool(params):
    response = {}
    try:
        data_classification, description, name, pool_id = handler.request(
            params, poolId=int, name=str, description=str, dataClassification=int)
        backend.update_storage_pool_name(pool_id, name)
        database.update_storage_pool_name_and_desc(pool_id, name, description)
        database.update_storage_pool_data_classification(
            pool_id, data_classification)
        response = handler.response(0, 'Update storagePool successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def delete_storage_pool(params):
    response = {}
    try:
        pool_id, = handler.request(params, poolId=int)
        backend.delete_storage_pool(pool_id)
        database.delete_storage_pool(pool_id)
        response = handler.response(0, 'Delete storagePool successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_targets_in_storage_pool(params):
    response = {}
    try:
        if params:
            pool_id, = handler.request(params, poolId=[int, str])
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
        if params:
            pool_id, = handler.request(params, poolId=[int, str])
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
        if params:
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
                handler.log(hanlder.error(response['message']), 2)
        else:
            event.send('snapshot', 12, name, False, {}, True)
    except Exception as error:
        handler.log(handler.error(error), 2)


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
        handler.log(handler.error(error), 2)


def batch_delete_snapshot(params):
    try:
        names, = handler.request(params, names=list)
        for name in names:
            database.update_snapshot_status(name, False, True, False)
        names_str = handler.list2str(names)
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
        handler.log(handler.error(error), 2)


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
        handler.log(handler.error(error), 2)


def get_snapshot_schedule(params):
    response = {}
    try:
        if params:
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
        initialize.add_node_to_cluster(ip, 'client')
        node_list = backend.get_node_list()
        cache.update('node-list', node_list)
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
        if params:
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
        backend.set_pattern(dirPath, numTargets, chunkSize, buddyMirror)
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
        if params:
            name, = handler.request(params, name=str)
            data = database.get_local_auth_user(name)
            data['validityPeriod'] = backend.get_local_auth_user_validity_period(
                name)
        else:
            data = database.list_local_auth_user()
            for user in data:
                user['validityPeriod'] = backend.get_local_auth_user_validity_period(
                    user['name'])
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
        if params:
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
        if params:
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
        response = handler.response(0, 'Update nfs share successfully!')
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


def get_cifs_share(params):
    response = {}
    try:
        if params:
            name, = handler.request(params, name=str)
            data = database.get_cifs_share(name)
        else:
            data = database.list_cifs_share()
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def create_cifs_share(params):
    response = {}
    try:
        description, name, notify, offlineCacheMode, oplock, path, userOrGroupList = handler.request(
            params, name=str, path=str, description=str, oplock=bool, notify=bool, offlineCacheMode=str, userOrGroupList=list)
        nas_server_list = database.list_nas_server()
        server = filter(lambda nas_server: handler.check_root(
            path, nas_server['path']), nas_server_list)[0]['ip']
        backend.create_cifs_share(
            server, name, path, description, oplock, notify, offlineCacheMode)
        database.create_cifs_share(
            name, path, description, oplock, notify, offlineCacheMode)
        backend.add_user_or_group_to_cifs_share(server, name, userOrGroupList)
        database.update_cifs_share_user_or_group_list(name, userOrGroupList)
        response = handler.response(0, 'Create cifs share successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def update_cifs_share(params):
    response = {}
    try:
        description, name, notify, offlineCacheMode, oplock, path = handler.request(
            params, name=str, path=str, description=str, oplock=bool, notify=bool, offlineCacheMode=str)
        nas_server_list = database.list_nas_server()
        server = filter(lambda nas_server: handler.check_root(
            path, nas_server['path']), nas_server_list)[0]['ip']
        backend.update_cifs_share(
            server, name, description, oplock, notify, offlineCacheMode)
        database.update_cifs_share_desc_and_permission(
            name, description, oplock, notify, offlineCacheMode)
        response = handler.response(0, 'Update cifs share successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def delete_cifs_share(params):
    response = {}
    try:
        name, path = handler.request(params, name=str, path=str)
        nas_server_list = database.list_nas_server()
        server = filter(lambda nas_server: handler.check_root(
            path, nas_server['path']), nas_server_list)[0]['ip']
        backend.delete_cifs_share(server, name)
        database.delete_cifs_share(name)
        response = handler.response(0, 'Delete cifs share successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def batch_delete_cifs_share(params):
    response = {}
    try:
        shares, = handler.request(params, shares=list)
        nas_server_list = database.list_nas_server()
        for share in shares:
            server = filter(lambda nas_server: handler.check_root(
                share['path'], nas_server['path']), nas_server_list)[0]['ip']
            backend.delete_cifs_share(server, share['name'])
            database.delete_cifs_share(share['name'])
        response = handler.response(
            0, 'Batch delete cifs shares successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_user_or_group_from_cifs_share(params):
    response = {}
    try:
        shareName, = handler.request(params, shareName=str)
        data = database.get_user_or_group_from_cifs_share(shareName)
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def add_user_or_group_to_cifs_share(params):
    response = {}
    try:
        items, shareName, sharePath = handler.request(
            params, items=list, shareName=str, sharePath=str)
        nas_server_list = database.list_nas_server()
        server = filter(lambda nas_server: handler.check_root(
            sharePath, nas_server['path']), nas_server_list)[0]['ip']
        backend.add_user_or_group_to_cifs_share(server, shareName, items)
        for item in items:
            database.add_user_or_group_to_cifs_share(shareName, item)
        response = handler.response(
            0, 'Add user or group to cifs share successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def update_user_or_group_in_cifs_share(params):
    response = {}
    try:
        name, permission, shareName, sharePath, user_or_group_type = handler.request(
            params, name=str, type=str, permission=str, shareName=str, sharePath=str)
        nas_server_list = database.list_nas_server()
        server = filter(lambda nas_server: handler.check_root(
            sharePath, nas_server['path']), nas_server_list)[0]['ip']
        backend.update_user_or_group_in_cifs_share(
            server, shareName, name, user_or_group_type, permission)
        database.update_user_or_group_in_cifs_share(
            shareName, name, user_or_group_type, permission)
        response = handler.response(
            0, 'Update user or group in cifs share successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def remove_user_or_group_from_cifs_share(params):
    response = {}
    try:
        name, shareName, sharePath, user_or_group_type = handler.request(
            params, name=str, type=str, shareName=str, sharePath=str)
        nas_server_list = database.list_nas_server()
        server = filter(lambda nas_server: handler.check_root(
            sharePath, nas_server['path']), nas_server_list)[0]['ip']
        backend.remove_user_or_group_from_cifs_share(
            server, shareName, name, user_or_group_type)
        database.remove_user_or_group_from_cifs_share(
            shareName, name, user_or_group_type)
        response = handler.response(
            0, 'Remove user or group from cifs share successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def create_dir(params):
    response = {}
    try:
        noMirror, path = handler.request(params, path=str, noMirror=int)
        backend.create_dir(path, noMirror)
        response = handler.response(0, 'Create directory successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def update_local_auth_user_status(params):
    response = {}
    try:
        name, status = handler.request(params, name=str, status=bool)
        backend.update_local_auth_user_status(name, status)
        database.update_local_auth_user_status(name, status)
        response = handler.response(
            0, 'Update local auth user status successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_local_auth_user_setting():
    response = {}
    try:
        data = backend.get_local_auth_user_setting()
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def update_local_auth_user_setting(params):
    response = {}
    try:
        passAvailableDay, passChangeIntervalMinute, passComplexity, passMaxLen, passMinLen, passRepeatCharMax, userNameMinLen = handler.request(
            params, userNameMinLen=int, passMinLen=int, passMaxLen=int, passComplexity=int, passRepeatCharMax=int, passAvailableDay=int, passChangeIntervalMinute=int)
        backend.update_local_auth_user_setting(
            userNameMinLen, passMinLen, passMaxLen, passComplexity, passRepeatCharMax, passAvailableDay, passChangeIntervalMinute)
        response = handler.response(
            0, 'Update local auth user setting successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def get_data_level(params):
    response = {}
    try:
        if params:
            name, = handler.request(params, name=int)
            data = database.get_data_level(name)
        else:
            data = database.list_data_level()
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def create_data_level(params):
    response = {}
    try:
        description, name = handler.request(params, name=int, description=str)
        database.create_data_level(name, description)
        response = handler.response(0, 'Create data level successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def update_data_level(params):
    response = {}
    try:
        description, name = handler.request(params, name=int, description=str)
        database.update_data_level(name, description)
        response = handler.response(0, 'Update data level successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def delete_data_level(params):
    response = {}
    try:
        name, = handler.request(params, name=int)
        database.delete_data_level(name)
        response = handler.response(0, 'Delete data level successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def add_metadata_to_cluster(params):
    response = {}
    try:
        enableCustomRAID, ip, raidList = handler.request(
            params, ip=str, raidList=list, enableCustomRAID=bool)
        disk_group = []
        if enableCustomRAID:
            disk_group = map(lambda raid: {'diskList': map(lambda disk: disk['diskName'], raid['selectedDisks']), 'raidLevel': handler.replace(
                ' ', '', raid['arrayLevel']['name'].lower()), 'stripeSize': handler.replace('B', '', handler.replace(' ', '', raid['arrayStripeSize'])).lower()}, raidList)
        else:
            disk_group = map(lambda raid: {'diskList': map(
                lambda disk: disk['diskName'], raid['diskList']), 'raidLevel': '%sraid' % raid['raidLevel'], 'stripeSize': '%sk' % (raid['stripeSize'] / 1024)}, raidList)
        backend.add_metadata_to_cluster(ip, disk_group)
        initialize.add_node_to_cluster(ip, 'meta')
        node_list = backend.get_node_list()
        cache.update('node-list', node_list)
        response = handler.response(0, 'Add metadata to cluster successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def add_storage_to_cluster(params):
    response = {}
    try:
        enableCustomRAID, ip, raidList = handler.request(
            params, ip=str, raidList=list, enableCustomRAID=bool)
        disk_group = []
        if enableCustomRAID:
            disk_group = map(lambda raid: {'diskList': map(lambda disk: disk['diskName'], raid['selectedDisks']), 'raidLevel': handler.replace(
                ' ', '', raid['arrayLevel']['name'].lower()), 'stripeSize': handler.replace('B', '', handler.replace(' ', '', raid['arrayStripeSize'])).lower()}, raidList)
        else:
            disk_group = map(lambda raid: {'diskList': map(
                lambda disk: disk['diskName'], raid['diskList']), 'raidLevel': '%sraid' % raid['raidLevel'], 'stripeSize': '%sk' % (raid['stripeSize'] / 1024)}, raidList)
        backend.add_storage_to_cluster(ip, disk_group)
        initialize.add_node_to_cluster(ip, 'storage')
        node_list = backend.get_node_list()
        cache.update('node-list', node_list)
        response = handler.response(0, 'Add storage to cluster successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def create_buddy_group(params):
    response = {}
    try:
        buddyGroups, = handler.request(params, buddyGroups=list)
        group_list = map(lambda group: {'type': 'meta' if group['serviceRole'] == 'metadata' else 'storage', 'primaryId': group[
                         'selectedTargets'][0]['targetId'], 'secondaryId': group['selectedTargets'][1]['targetId']}, buddyGroups)
        backend.create_buddy_group(group_list)
        response = handler.response(0, 'Create buddy group successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def create_target(params):
    response = {}
    try:
        enableCustomRAID, = handler.request(params, enableCustomRAID=bool)
        service_list = []
        if enableCustomRAID:
            storageServerIPs, = handler.request(params, storageServerIPs=list)
            service_list = map(lambda server: server['ip'], storageServerIPs)
            for server in storageServerIPs:
                ip = server['ip']
                raid_list = server['raidList']
                disk_group = map(lambda raid: {'diskList': map(lambda disk: disk['diskName'], raid['selectedDisks']), 'raidLevel': handler.replace(
                    ' ', '', raid['arrayLevel']['name'].lower()), 'stripeSize': handler.replace('B', '', handler.replace(' ', '', raid['arrayStripeSize'])).lower()}, raid_list)
                backend.create_target(ip, disk_group)
        else:
            storageServerIPs, = handler.request(params, storageServerIPs=dict)
            service_list = storageServerIPs.keys()
            for service in service_list:
                ip = service
                disk_group = map(lambda raid: {'diskList': map(lambda disk: disk['diskName'], raid['diskList']), 'raidLevel': '%sraid' % raid['raidLevel'], 'stripeSize': '%sk' % (
                    raid['stripeSize'] / 1024)}, storageServerIPs[service])
                backend.create_target(ip, disk_group)
        response = handler.response(0, 'Create target successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def add_targets_to_storage_pool(params):
    response = {}
    try:
        pool_id, targets = handler.request(params, poolId=int, targets=list)
        targets = handler.list2str(targets)
        backend.add_targets_to_storage_pool(pool_id, targets)
        response = handler.response(
            0, 'Add targets to storage pool successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def remove_targets_from_storage_pool(params):
    response = {}
    try:
        pool_id, targets = handler.request(params, poolId=int, targets=list)
        targets = handler.list2str(targets)
        backend.remove_targets_from_storage_pool(pool_id, targets)
        response = handler.response(
            0, 'remove targets from storage pool successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def add_buddy_groups_to_storage_pool(params):
    response = {}
    try:
        buddy_groups, pool_id = handler.request(
            params, poolId=int, buddyGroups=list)
        buddy_groups = handler.list2str(buddy_groups)
        backend.add_buddy_groups_to_storage_pool(pool_id, buddy_groups)
        response = handler.response(
            0, 'Add buddy groups to storage pool successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def remove_buddy_groups_from_storage_pool(params):
    response = {}
    try:
        buddy_groups, pool_id = handler.request(
            params, poolId=int, buddyGroups=list)
        buddy_groups = handler.list2str(buddy_groups)
        backend.remove_buddy_groups_from_storage_pool(pool_id, buddy_groups)
        response = handler.response(
            0, 'Remove buddy groups from storage pool successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def delete_nas_server(params):
    response = {}
    try:
        ip, path = handler.request(params, ip=str, path=str)
        backend.delete_nas_server(ip, path)
        database.delete_nas_server(ip, path)
        response = handler.response(0, 'Delete nas server successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response
