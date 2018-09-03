from mongoengine import connect

from lib.model import User


class DatabaseError(Exception):
    def __init__(self, ErrorInfo):
        super().__init__(self)
        self.errorinfo = ErrorInfo

    def __str__(self):
        return self.errorinfo


def connect_database(host='127.0.0.1', port=27017):
    connect('orcafs', host=host, port=port)


def login(username, password):
    user = User.objects(user_name=username, user_passwd=password).first()
    if not user:
        raise DatabaseError('Username or password error!')


def logout(username):
    user = User.objects(user_name=username).first()
    if not user:
        raise DatabaseError('No such user!')


def list_user():
    users = []
    for user in User.objects:
        users.append({'name': user.user_name, 'password': user.user_passwd})
    return users


def get_user(username):
    user = User.objects(user_name=username).first()
    if user:
        return {'name': user.user_name, 'password': user.user_passwd}
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
