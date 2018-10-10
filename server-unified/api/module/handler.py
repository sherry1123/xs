import collections
import datetime
import math
import re
import time

import dateutil.parser


def request(params, **kwargs):
    def handle_simple_dictionary(param, arg, parent=None):
        for key in dict.keys(arg):
            current_arg = arg[key]
            current_param = param.get(key)
            current_parent = '%s.%s' % (parent, key) if parent else key
            current_type = arg[key] if isinstance(
                current_arg, type) or isinstance(current_arg, list) else dict
            if current_param is not None:
                if type(current_param) == current_type:
                    if isinstance(current_arg, dict):
                        arg[key] = handle_simple_dictionary(
                            current_param, current_arg, current_parent)
                    else:
                        arg[key] = current_param
                elif type(current_param) in current_type:
                    arg[key] = current_param
                else:
                    raise ValueError('The type of the parameter \'%s\' should be \'%s\'!' % (
                        current_parent, type2str(current_type)))
            else:
                raise ValueError(
                    'The parameter \'%s\' is empty!' % current_parent)
        return arg
    kwargs = handle_simple_dictionary(unicode2str(params), kwargs)
    return sort_dict_by_key(kwargs)


def response(code, result):
    response = {}
    if code:
        response = {'code': code, 'msg': result}
        log(result, 2)
    else:
        response = {'code': code, 'data': result}
    return response


def error(error):
    if error:
        error_type = type(error)
        if isinstance(error, Exception):
            error_type = str(error_type).split('\'')[1].split('.').pop()
        else:
            error_type = 'ERROR'
        if 'KeyError' in error_type:
            error = 'Key %s is not found' % error
        error = '[%s]%s' % (error_type, error)
        return str(error)
    else:
        return '[Error]The error message is empty'


def log(words, level=1):  # 1 => Info, 2 => Error
    date = datetime.datetime.now().replace().isoformat()
    print('[%s]%s' % (date, words if level > 1 else '[INFO]%s' % words))


def cookie(cookie):
    return cookie if cookie is None else cookie == 'true'


def api(path):
    return '-'.join(unicode2str(path.split('/'))[:1:-1])


def unicode2str(data):
    if isinstance(data, basestring):
        return str(data.encode('utf-8'))
    elif isinstance(data, collections.Mapping):
        return dict(map(unicode2str, data.iteritems()))
    elif isinstance(data, collections.Iterable):
        return type(data)(map(unicode2str, data))
    else:
        return data


def bytes2str(data):
    return data.decode('utf-8').strip()


def type2str(data):
    if isinstance(data, list):
        type_list = []
        for d in data:
            type_list.append(type2str(d))
        return list2str(type_list)
    else:
        return eval(re.search('\'\S+\'', str(data)).group())


def multiline2list(data):
    lines = data.split('\n')
    result = []
    for line in lines:
        result.append(line.strip())
    return result


def sort_dict_by_key(data):
    keys = dict.keys(data)
    keys.sort()
    return map(data.get, keys)


def match_ip(ip):
    return re.match('([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])', ip)


def remote_cmd(ip, cmd):
    return 'ssh -i /root/.ssh/id_rsa -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -o LogLevel=quiet root@%s \'%s\'' % (ip, cmd)


def to_byte(value, unit):
    unit_list = ['B', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']
    return math.floor(value * math.pow(1024, unit_list.index(unit)))


def replace(pattern, repl, string):
    return re.sub(pattern, repl, string)


def current_time():
    return datetime.datetime.now().replace(microsecond=0).isoformat()


def start_time():
    return replace(':\d+$', ':00', datetime.datetime.fromtimestamp(int(time.time()) + 60).isoformat())


def iso2stamp(iso):
    return int(time.mktime(dateutil.parser.parse(iso).timetuple()))


def check_root(path, root):
    return path.split('/')[1] == root.split('/')[1]


def list2str(data):
    return ','.join(map(lambda d: d if isinstance(d, str) else str(d), data))
