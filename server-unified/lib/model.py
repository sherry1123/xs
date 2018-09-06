from mongoengine import Document, IntField, ListField, StringField


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
