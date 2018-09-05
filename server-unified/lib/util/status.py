from lib.module import handler
from lib.util import initialize as initUtil

initialize = False
deinitialize = False


def get_cluster_status():
    global initialize
    try:
        initialize = initUtil.get_orcafs_status()
    except Exception as error:
        print(handler.error(error))
    return initialize


def get_cluster_initialize_status():
    global initialize
    return initialize


def set_cluster_initialize_status(status):
    global initialize
    initialize = status


def get_cluster_deinitialize_status():
    global deinitialize
    return deinitialize


def set_cluster_deinitialize_status(status):
    global deinitialize
    deinitialize = status
