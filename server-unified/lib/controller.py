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


def get_disklist(params):
    response = {}
    try:
        ip, = handler.request(params, ip=str)
        data = backend.get_disk_list(ip)
        response = handler.response(0, data)
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


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
            @setinterval(1)
            def send_initialize_status(fn):
                status_res = backend.get_create_status()
                current = status_res['data']['currentStep']
                fs_total = status_res['data']['totalStep']
                describle = status_res['data']['describle']
                state = status_res['data']['status']
                error_message = status_res['data']['errorMessage']
                if not status_res['errorId']:
                    if state:
                        fn()
                        event.send('cluster', 0, 'cluster', False, {
                                   'current': current, 'state': -1, 'total': total})
                    elif current != fs_total:
                        print(current)
                        event.send('cluster', 0, 'cluster', True, {
                                   'current': current, 'state': state, 'total': total})
                    elif 'finish' in describle:
                        fn()
                        if data['enable_create_buddy_group']:
                            backend.create_buddy_group({})
                        current = 5
                        print(current)
                        event.send('cluster', 0, 'cluster', True, {
                                   'current': current, 'state': 0, 'total': total})
                        initialize.initialize_mongodb(data['mongodb_param'])
                        current = 6
                        print(current)
                        event.send('cluster', 0, 'cluster', True, {
                                   'current': current, 'state': 0, 'total': total})
                        initialize.save_initialize_information(
                            data['param'], data['node_list'])
                        current = 7
                        print(current)
                        event.send('cluster', 0, 'cluster', True, {
                                   'current': current, 'state': 0, 'total': total})
                        print('finish')
                else:
                    fn()
                    event.send('cluster', 0, 'cluster', False, {
                               'current': current, 'state': -1, 'total': total})

            def stop_get_initialize_status():
                start_get_initialize_status.set()
            start_get_initialize_status = send_initialize_status(
                stop_get_initialize_status)
        elif init_res['errorId'] != 111:
            event.send('cluster', 0, 'cluster', False, {
                       'current': current, 'state': -1, 'total': total})
    except Exception as error:
        print(handler.error(error))
        event.send('cluster', 0, 'cluster', False, {
                   'current': current, 'state': -1, 'total': total})


def deinitialize_cluster(params):
    response = {}
    try:
        bar, foo = handler.request(params, foo=str, bar=str)
        status.set_cluster_initialize_status(False)
        schedule.stop_sheduler()
        response = handler.response(0, 'Deinitialize cluster successfully!')
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


def get_user(params):
    response = {}
    try:
        if len(dict.keys(params)):
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
