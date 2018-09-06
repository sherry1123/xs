from mongoengine import Document, StringField, IntField


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
