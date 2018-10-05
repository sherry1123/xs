from flask import Flask
from flask_socketio import SocketIO

app = Flask('OrcaFS')
socketio = SocketIO(app)


def create_socketio():
    @socketio.on('connect')
    def connect_handle():
        print('Connect client successfully!')

    return socketio


def send(data):
    socketio.send(data)


def emit(event, data):
    socketio.emit(event, data)
