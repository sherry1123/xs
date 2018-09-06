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
    return request.post('http://localhost:9090/cluster/destroy', {}, get_token())


def create_buddy_group(param):
    return backend_handler(request.post('http://localhost:9090/cluster/createbuddymirror', param, get_token()))


def get_version():
    return backend_handler(request.get('http://localhost:9090/cluster/getversion', {}, get_token()))


def get_node_list():
    node_list = backend_handler(request.get(
        'http://localhost:9090/cluster/listallnodes', {}, get_token()))

    def modify_node_info(node):
        node['service'] = map(lambda service: 'metadata' if service == 'meta' else service, filter(
            lambda service: service != 'client', node['service']))
        is_pure_mgmt = True if len(
            node['service']) == 1 and 'mgmt' in node['service'] else False
        cpu_usage = '%s%%' % round(node['cpuUsage'], 2)
        memory_usage = '%s%%' % round(node['memUsage'], 2)
        space_usage = '%s%%' % round(
            float(node['spaceUsed']) / node['spaceTotal'] * 100, 2) if node['spaceTotal'] else '0%'
        return {'hostname': node['hostname'], 'ip': node['ip'], 'service': node['service'], 'isPureMgmt': is_pure_mgmt, 'status': node['status'], 'cpuUsage': cpu_usage, 'memoryUsage': memory_usage, 'space': {'total': node['spaceTotal'], 'used': node['spaceUsed'], 'free': node['spaceFree'], 'usage': space_usage}}
    node_list = map(modify_node_info, node_list)
    node_list = sorted(node_list, key=lambda node: node['hostname'])
    return node_list


def get_storage_disk_space():
    disk_space = backend_handler(request.get(
        'http://localhost:9090/cluster/getstoragespace', {}, get_token()))
    space_usage = '%s%%' % round(
        float(disk_space['used']) / disk_space['total'] * 100, 2)
    return {'total': disk_space['total'], 'used': disk_space['used'], 'free': disk_space['free'], 'usage': space_usage}


def get_meta_status():
    return backend_handler(request.get('http://localhost:9090/cluster/listmetanodes', {}, get_token()))


def get_storage_status():
    return backend_handler(request.get('http://localhost:9090/cluster/liststoragenodes', {}, get_token()))


def get_target_list():
    target_list = backend_handler(request.get(
        'http://localhost:9090/cluster/listtargets', {}, get_token()))

    def modify_target_info(target):
        target['service'] = 'metadata' if target['service'] == 'meta' else target['service']
        space_usage = '%s%%' % round(
            float(target['usedSpace']) / target['totalSpace'] * 100, 2)
        return {'targetId': target['targetId'], 'mountPath': target['mountPath'], 'node': target['hostname'], 'service': target['service'], 'isUsed': target['isUsed'], 'nodeId': target['nodeId'], 'space': {'total': target['totalSpace'], 'used': target['usedSpace'], 'free': target['freeSpace'], 'usage': space_usage}}
    target_list = map(modify_target_info, target_list)
    return target_list
