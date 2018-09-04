import math
from lib.module import request, handler
from lib.service import backend


def get_orcafs_status():
    data = backend.get_create_status()
    status = True if data['currentStep'] and data['currentStep'] == data['totalStep'] else False
    return status


def check_cluster_env(metadatas, storages):
    def check_server(server):
        token = handler.unicode2str(request.get(
            'http://%s:9090/token/get' % server, {}, {}, {'tokenId': ''}))
        result = {'status': '', 'help': ''} if token['tokenId'] else {
            'status': 'error', 'help': 1}
        return result

    def filter_result(server):
        return True if server['status'] else False
    metadataServerIPsError = map(check_server, metadatas)
    storageServerIPsError = map(check_server, storages)
    result = not bool(len(filter(filter_result, metadataServerIPsError +
                                 storageServerIPsError)))
    return {'metadataServerIPsError': metadataServerIPsError, 'storageServerIPsError': storageServerIPsError, 'result': result}


def get_recommended_raid_configuration(metadatas, storages):
    ip_list = list(set(metadatas + storages))

    def create_disk_group(ip):
        return {'ip': ip, 'diskList': backend.get_disk_list(ip)}

    def create_mock_disk_group(ip):
        disk_list = []
        for i in range(28):
            disk_list.append(
                {'diskName': '/dev/nvme%sn1' % i, 'totalSpace': 11489037516})
        return {'ip': ip, 'diskList': disk_list}
    disk_group = map(create_mock_disk_group, ip_list)
    metadata_configuration = {}
    storage_configuration = {}

    def get_configuration(disk_list, service_type):
        disk_list_length = len(disk_list)
        container_list = []
        container_list_length = len(container_list)
        raid_level = 0
        stripe_size = 1024 * 8
        disk_type = 'ssd'
        if service_type == 'metadata':
            if disk_list_length > 1:
                container_list_length = 1
            else:
                pass
            raid_level = 1
        else:
            container_list_length = int(math.floor(disk_list_length / 8))
            raid_level = 5
        container_list = range(container_list_length)

        def map_container_list(container):
            disks = disk_list[0:2] if service_type == 'metadata' else disk_list[0:8]
            total_space = 0
            for disk in disks:
                disk_list.remove(disk)
                total_space += disk['space']
            return {'raidLevel': raid_level, 'diskList': disks, 'totalSpace': total_space, 'stripeSize': stripe_size, 'diskType': disk_type}

        return map(map_container_list, container_list)

    for item in disk_group:
        ip = item['ip']
        disk_list = item['diskList']
        disk_list = filter(lambda disk: 'nvme' in disk['diskName'], disk_list)
        disk_list = map(lambda disk: {
                        'diskName': disk['diskName'], 'space': disk['totalSpace']}, disk_list)
        disk_list_length = len(disk_list)
        if ip in metadatas and ip in storages:
            metadata_configuration[ip] = get_configuration(
                disk_list, 'metadata') if disk_list_length else []
            storage_configuration[ip] = get_configuration(
                disk_list, 'storage') if disk_list_length else []
        elif ip in metadatas:
            metadata_configuration[ip] = get_configuration(
                disk_list, 'metadata') if disk_list_length else []
        elif ip in storages:
            storage_configuration[ip] = get_configuration(
                disk_list, 'storage') if disk_list_length else []
    return {'metadataServerIPs': metadata_configuration, 'storageServerIPs': storage_configuration}
