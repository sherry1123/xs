from lib import create_app
from lib.service.database import connect_database
from lib.util import status
from lib.util.schedule import start_scheduler
from lib.util.socket import create_socketio


def main():
    app = create_app()
    socketio = create_socketio()
    initialize = status.get_cluster_status()
    if initialize:
        connect_database()
        # start_scheduler()
    else:
        pass
    socketio.run(app, host='0.0.0.0', port=3456)


if __name__ == '__main__':
    main()
