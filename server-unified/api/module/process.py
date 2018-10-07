import threading
import commands

from api.module import handler


class ProcessError(Exception):
    def __init__(self, errorinfo):
        self.errorinfo = errorinfo

    def __str__(self):
        return self.errorinfo


def run(cmd, ip=None):
    if ip is not None:
        if handler.match_ip(ip) is not None:
            cmd = handler.remote_cmd(ip, cmd)
        else:
            raise ValueError('This is not a valid IP address!')
    else:
        pass
    status, output = commands.getstatusoutput(cmd)
    if not status:
        return output.strip()
    else:
        raise ProcessError(output.strip())


def do(fn, params={}):
    thread = threading.Thread(target=fn, args=(params, ))
    thread.start()


def setinterval(interval, times=-1):
    def outer_wrap(function):
        def wrap(*args, **kwargs):
            stop = threading.Event()

            def inner_wrap():
                i = 0
                while i != times and not stop.isSet():
                    stop.wait(interval)
                    function(*args, **kwargs)
                    i += 1
            t = threading.Timer(0, inner_wrap)
            t.daemon = True
            t.start()
            return stop
        return wrap
    return outer_wrap
