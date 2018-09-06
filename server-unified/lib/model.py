from mongoengine import Document, StringField


class Setting(Document):
    setting_key = StringField(required=True)
    setting_value = StringField()


class User(Document):
    user_name = StringField(required=True)
    user_passwd = StringField()
