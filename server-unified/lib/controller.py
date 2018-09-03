from lib.module import handler, terminal
from lib.service import database
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


def receive_event(params):
    response = {}
    try:
        code, channel, data, notify, result, target = handler.request(
            params, channel=str, code=int, target=str, result=bool, data=dict, notify=bool)
        event.receive(channel, code, target, result, data, notify)
        response = handler.response(0, 'Receive event successfully!')
    except Exception as error:
        response = handler.response(1, handler.error(error))
    return response


def initialize_cluster(params):
    try:
        bar, foo = handler.request(params, foo=str, bar=str)
        event.send('cluster', 1, 'cluster', True, {
                   'current': 0, 'state': True, 'total': 3})
        # terminal.run(
        #   'mongod --dbpath /var/lib/mongo --logpath /var/log/mongodb/mongod.log --fork')
        event.send('cluster', 1, 'cluster', True, {
                   'current': 1, 'state': True, 'total': 3})
        terminal.run('sleep 2')
        event.send('cluster', 1, 'cluster', True, {
                   'current': 2, 'state': True, 'total': 3})
        event.send('cluster', 1, 'cluster', True, {
                   'current': 3, 'state': True, 'total': 3})
    except Exception as error:
        print(handler.error(error))


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


def login(params):
    response = {}
    try:
        password, username = handler.request(
            params, username=str, password=str)
        database.login(username, password)
        response = handler.response(0, 'Login successfully!')
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
