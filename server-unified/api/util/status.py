from api.module import handler
from api.util import initialize as initUtil

initialize = False
deinitialize = False
rollback = False


def get_cluster_status():
    global initialize
    try:
        initialize = initUtil.get_orcafs_status()
        if initialize:
            initUtil.reload_mongodb()
    except Exception as error:
        handler.log(handler.error(error), 2)
        handler.log('Get cluster status failed!')
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


def get_snapshot_rollback_status():
    global rollback
    return rollback


def set_snapshot_rollback_status(status):
    global rollback
    rollback = status
