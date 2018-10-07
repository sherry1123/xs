import requests
from api.module import handler


def get(url, params=None, token={}, mock=None, timeout=None):
    try:
        response = requests.get(
            url, params=params, headers=token, timeout=timeout)
        if response.status_code == requests.codes.ok:
            return handler.unicode2str(response.json())
        else:
            response.raise_for_status()
    except Exception as error:
        if mock is not None:
            return mock
        else:
            raise requests.ConnectionError(error)


def post(url, params=None, token={}, timeout=None):
    try:
        response = requests.post(
            url, json=params, headers=token, timeout=timeout)
        if response.status_code == requests.codes.ok:
            return handler.unicode2str(response.json())
        else:
            response.raise_for_status()
    except Exception as error:
        raise requests.ConnectionError(error)
