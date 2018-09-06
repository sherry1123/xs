import logging
import signal
import sys

from lib import create_app
from lib.service.database import connect_database
from lib.util import status
from lib.util.schedule import start_scheduler
from lib.util.socket import create_socketio

logging.basicConfig()


def abort(signum, frame):
    sys.exit(0)


def main():
    signal.signal(signal.SIGINT, abort)
    signal.signal(signal.SIGTERM, abort)
    app = create_app()
    socketio = create_socketio()
    initialize = status.get_cluster_status()
    if initialize:
        connect_database()
        start_scheduler()
    else:
        pass
    socketio.run(app, port=3456, log_output=True)


if __name__ == '__main__':
    main()
