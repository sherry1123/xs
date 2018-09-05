import shlex
import subprocess
import threading

from lib.module import handler


def run(cmd, ip=None):
    if ip is not None:
        if handler.match_ip(ip) is not None:
            cmd = handler.remote_cmd(ip, cmd)
        else:
            raise ValueError('This is not a valid IP address!')
    else:
        pass
    process = subprocess.Popen(
        shlex.split(cmd), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    result = process.communicate()
    if not process.returncode:
        return handler.multiline2list(handler.bytes2str(result[0]))
    else:
        raise subprocess.CalledProcessError(handler.bytes2str(result[1]))


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
