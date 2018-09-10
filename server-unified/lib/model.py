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
    poolId = IntField
    name = StringField
    description = StringField


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
