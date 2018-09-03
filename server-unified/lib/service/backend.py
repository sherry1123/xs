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
