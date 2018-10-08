from flask import Flask
from flask_socketio import SocketIO

from api.module import handler

app = Flask('OrcaFS-GUI')
socketio = SocketIO(app)


def create_socketio():
    @socketio.on('connect')
    def connect_handle():
        handler.log('Connect to the client via websocket successfully!')

    return socketio


def send(data):
    socketio.send(data)


def emit(event, data):
    socketio.emit(event, data)
