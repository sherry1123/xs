from lib.module import handler, request
from lib.service import database
from lib.util import schedule, socket, status


def send(channel, code, target, result, data={}, notify=False, ip=None):
    receive_api = '/api/receiveevent'
    if ip is not None:
        if handler.match_ip(ip) is not None:
            url = 'http://' + ip + receive_api
        else:
            raise ValueError('This is not a valid IP address!')
    else:
        url = 'http://localhost' + receive_api
    response = request.post(url, {'channel': channel, 'code': code,
                                  'target': target, 'result': result, 'data': data, 'notify': notify})
    if response['code']:
        raise ValueError(response['msg'])


def receive(channel, code, target, result, data, notify):
    if code:
        if code == 1:
            status.set_cluster_deinitialize_status(True)
        elif code == 2:
            status.set_cluster_deinitialize_status(False)
            result and status.set_cluster_initialize_status(False)
        elif code == 15 or code == 16:
            target = data
        elif code == 17:
            status.set_snapshot_rollback_status(True)
        elif code == 18:
            status.set_snapshot_rollback_status(False)
        else:
            pass
        socket.emit('event status', {'channel': channel, 'code': code,
                                     'target': target, 'result': result, 'notify': notify})
    else:
        if data['current'] == 7:
            status.set_cluster_initialize_status(True)
            database.connect_database()
            schedule.start_scheduler()
        else:
            pass
        socket.emit('init status', data)
