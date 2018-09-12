from mongoengine import (BooleanField, Document, IntField, ListField,
                         StringField)


class Setting(Document):
    setting_key = StringField(required=True)
    setting_value = StringField()


class User(Document):
    user_name = StringField(required=True)
    user_passwd = StringField()


class ClusterThroughputAndIops(Document):
    cluster_time = IntField()
    cluster_throughput = IntField()
    cluster_iops = IntField()


class NodeCpuAndMemory(Document):
    node_time = IntField()
    node_host_list = ListField()
    node_data_list = ListField()  # {'cpu', 'memory'}


class NodeThroughputAndIops(Document):
    node_time = IntField()
    node_host_list = ListField()
    node_data_list = ListField()  # {'throughput': {'read', 'write'}, 'iops'}


class StoragePool(Document):
    storage_pool_id = IntField(required=True)
    storage_pool_name = StringField(required=True)
    storage_pool_description = StringField(max_length=255)
    storage_pool_create_time = StringField()


class Snapshot(Document):
    snapshot_name = StringField(required=True)
    snapshot_desc = StringField()
    snapshot_is_auto = BooleanField()
    snapshot_is_creating = BooleanField()
    snapshot_is_deleting = BooleanField()
    snapshot_is_rollbacking = BooleanField()
    snapshot_create_time = StringField()


class SnapshotSchedule(Document):
    schedule_name = StringField(required=True)
    schedule_desc = StringField()
    schedule_create_time = StringField()
    schedule_start_time = StringField()
    schedule_auto_disable_time = IntField()
    schedule_interval = IntField()
    schedule_delete_round = BooleanField()
    schedule_is_running = BooleanField()


class NasServer(Document):
    nas_server_ip = StringField(required=True)
    nas_server_path = StringField()
    nas_server_desc = StringField()


class LocalAuthUser(Document):
    user_name = StringField(required=True)
    user_desc = StringField()
    user_passwd = StringField()
    user_primary_group = StringField()
    user_secondary_group = ListField()


class LocalAuthUserGroup(Document):
    user_group_name = StringField(required=True)
    user_group_desc = StringField()


class NfsShare(Document):
    share_path = StringField(required=True)
    share_desc = StringField()
    share_client_list = ListField()


class CifsShare(Document):
    share_name = StringField(required=True)
    share_path = StringField()
    share_desc = StringField()
    share_oplock = BooleanField()
    share_nitify = BooleanField()
    share_offline_cache_mode = StringField()
    share_user_or_group_list = ListField()
