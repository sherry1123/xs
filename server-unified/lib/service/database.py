import json

from mongoengine import connect

from lib.model import Setting, User
from lib.module import handler


class DatabaseError(Exception):
    def __init__(self, errorinfo):
        self.errorinfo = errorinfo

    def __str__(self):
        return self.errorinfo


def connect_database(host='127.0.0.1', port=27017):
    connect('orcafs', host=host, port=port)


def get_setting(key):
    setting = Setting.objects(setting_key=key).first()
    if setting:
        return handler.unicode2str(json.loads(setting.setting_value))
    else:
        raise DatabaseError('No such setting!')


def create_setting(key, value):
    setting = Setting.objects(setting_key=key).first()
    if setting:
        raise DatabaseError('Setting already exists!')
    else:
        Setting(setting_key=key, setting_value=json.dumps(value)).save()


def update_setting(key, value):
    setting = Setting.objects(setting_key=key).first()
    if setting:
        setting.update(set__setting_value=json.dumps(value))
    else:
        raise DatabaseError('No such setting!')


def login(username, password):
    user = User.objects(user_name=username, user_passwd=password).first()
    if user:
        return {'username': user.user_name, 'password': user.user_passwd}
    else:
        raise DatabaseError('Username or password error!')


def logout(username):
    user = User.objects(user_name=username).first()
    if not user:
        raise DatabaseError('No such user!')


def list_user():
    users = []
    for user in User.objects:
        users.append({'username': user.user_name,
                      'password': user.user_passwd})
    return users


def get_user(username):
    user = User.objects(user_name=username).first()
    if user:
        return {'username': user.user_name, 'password': user.user_passwd}
    else:
        raise DatabaseError('No such user!')


def create_user(username, password):
    user = User.objects(user_name=username).first()
    if user:
        raise DatabaseError('User already exists!')
    else:
        User(user_name=username, user_passwd=password).save()


def update_user(username, password):
    user = User.objects(user_name=username).first()
    if user:
        user.update(set__user_passwd=password)
    else:
        raise DatabaseError('No such user!')


def delete_user(username):
    user = User.objects(user_name=username).first()
    if user:
        user.delete()
    else:
        raise DatabaseError('No such user!')
