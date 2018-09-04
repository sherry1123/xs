from lib.module import handler, request


class BackendError(Exception):
    def __init__(self, ErrorInfo):
        super().__init__(self)
        self.errorinfo = ErrorInfo

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
    return backend_handler(request.get('http://localhost:9090/cluster/createstatus', {}, get_token()))


def get_disk_list(ip):
    disk_list = backend_handler(request.get(
        'http://localhost:9090/disk/list/' + ip, {}, get_token())) or []

    def filter_not_used_disk(disk_list):
        return False if disk_list['isUsed'] else True
    def revise_disk_space(disk):
        disk['totalSpace'] = handler.toByte(float(handler.replace('\SB', '', disk['totalSpace'])), handler.replace('\S+\d', '', disk['totalSpace'])[0])
        return disk
    disk_list = filter(filter_not_used_disk, disk_list)
    disk_list = map(revise_disk_space, disk_list)
    return disk_list