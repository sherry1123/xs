from api.module import handler, request
from api.util import initialize, schedule, socket, status


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
    if code == 0:
        if data['current'] == 7:
            status.set_cluster_initialize_status(True)
            initialize.connect_database()
            schedule.start_scheduler()
        else:
            pass
        socket.emit('init status', data)
    elif code > 0:
        if code == 1:
            status.set_cluster_deinitialize_status(True)
            schedule.stop_scheduler()
        elif code == 2:
            status.set_cluster_deinitialize_status(False)
            if result:
                status.set_cluster_initialize_status(False)
            else:
                schedule.start_scheduler()
        elif code == 15 or code == 16 or code == 21:
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
        if code == -1:
            if data['current'] == 0:
                socket.emit('event status', {
                            'channel': channel, 'code': 31, 'target': target, 'result': result, 'notify': notify})
            elif data['current'] == 5 or data['status'] == -1:
                socket.emit('event status', {
                            'channel': channel, 'code': 32, 'target': target, 'result': result, 'notify': notify})
            socket.emit('data check status', data)
        elif code == -2:
            if data['current'] == 0:
                socket.emit('event status', {
                            'channel': channel, 'code': 33, 'target': target, 'result': result, 'notify': notify})
            elif data['current'] == 5 or data['status'] == -1:
                socket.emit('event status', {
                            'channel': channel, 'code': 34, 'target': target, 'result': result, 'notify': notify})
            socket.emit('data recover status', data)
