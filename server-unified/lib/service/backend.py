from lib.module import handler, request


class BackendError(Exception):
    def __init__(self, errorinfo):
        self.errorinfo = errorinfo

    def __str__(self):
        return self.errorinfo


def backend_handler(response):
    if response['errorId']:
        raise BackendError(response['message'])
    else:
        return response['data']


def get_token():
    return request.get('http://localhost:9090/token/get', {})


def get_create_status():
    return request.get('http://localhost:9090/cluster/createstatus', {}, get_token())


def get_disk_list(ip):
    disk_list = backend_handler(request.get(
        'http://localhost:9090/disk/list/' + ip, {}, get_token())) or []

    def revise_disk_space(disk):
        disk['totalSpace'] = int(handler.toByte(float(handler.replace(
            '\SB', '', disk['totalSpace'])), handler.replace('\S+\d', '', disk['totalSpace'])[0]))
        return disk
    disk_list = filter(lambda disk: not disk['isUsed'], disk_list)
    disk_list = map(revise_disk_space, disk_list)
    disk_list = sorted(disk_list, key=lambda disk: disk['diskName'])
    return disk_list


def initialize_cluster(param):
    return request.post('http://localhost:9090/cluster/create', param, get_token())


def deinitialize_cluster():
    request.post('http://localhost:9090/cluster/destroy', {}, get_token())


def create_buddy_group(param):
    return backend_handler(request.post('http://localhost:9090/cluster/createbuddymirror', param, get_token()))
