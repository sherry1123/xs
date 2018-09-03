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
    request.post(url, {'channel': channel, 'code': code, 'target': target,
                       'result': result, 'data': data, 'notify': notify})


def receive(channel, code, target, result, data, notify):
    if code == 1:
        current, state, total = handler.request(
            data, current=int, state=bool, total=int)
        if current == 0:
            socket.send('Start')
        elif current == 3:
            status.set_cluster_initialize_status(True)
            database.connect_database()
            schedule.start_scheduler()
            socket.send('Finish')
        else:
            socket.send(current)
    else:
        pass
