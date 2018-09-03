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
