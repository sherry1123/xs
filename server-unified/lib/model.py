from mongoengine import Document, StringField


class User(Document):
    user_name = StringField(required=True)
    user_passwd = StringField()
