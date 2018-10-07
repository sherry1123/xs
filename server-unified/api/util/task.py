import time

import event
from api.module import handler, process
from api.service import backend, database
from api.util import initialize


def do_or_not_do():
    result = initialize.get_mongodb_is_master_or_not()
    return result


def send_change_password_message():
    if do_or_not_do():
        user = database.get_user('admin')
        if user['password'] == 'e10adc3949ba59abbe56e057f20f883e':
            event.send('user', 21, 'admin', False, user, True)
        else:
            pass


def get_cluster_throughput_and_iops():
    if do_or_not_do():
        current_time = int(time.time()) * 1000
        data = backend.get_cluster_throughput_and_iops()
        throughput_list = data['throughput'] or []
        iops_list = data['iops'] or []

        def calculate_the_sum(value):
            value.reverse()
            value = value[0:15]
            return sum(value)
        if len(throughput_list) and len(iops_list):
            total_throughput = calculate_the_sum(
                map(lambda throughput: throughput['total'], throughput_list))
            total_iops = calculate_the_sum(
                map(lambda iops: iops['total'], iops_list))
        else:
            total_throughput = 0
            total_iops = 0
        database.create_cluster_throughput_and_iops(
            current_time, total_throughput / 15, total_iops / 15)


def get_node_cpu_and_memory():
    if do_or_not_do():
        current_time = int(time.time()) * 1000
        node_list = database.get_setting('NODE-LIST')
        node_list = node_list['mgmt'] + \
            node_list['meta'] + node_list['storage']
        host_list = map(lambda node: process.run('hostname', node), node_list)
        data_list = map(backend.get_node_cpu_and_memory, host_list)
        database.create_node_cpu_and_memory(current_time, host_list, data_list)


def get_node_throughput_and_iops():
    if do_or_not_do():
        current_time = int(time.time()) * 1000
        node_list = database.get_setting('NODE-LIST')
        node_list = node_list['mgmt'] + \
            node_list['meta'] + node_list['storage']
        host_list = map(lambda node: process.run('hostname', node), node_list)

        def get_throughput_and_iops(host):
            data = backend.get_node_throughput_and_iops(host)
            throughput_list = data['throughput'] or []
            iops_list = data['iops'] or []
            read_throughput = 0
            wriet_throughput = 0
            total_iops = 0
            if len(throughput_list) and len(iops_list):
                throughput_list.reverse()
                throughput_list = throughput_list[0:15]
                iops_list.reverse()
                iops_list = iops_list[0:15]
                for throughput in throughput_list:
                    read_throughput += throughput['read']
                    wriet_throughput += throughput['write']
                iops_list = map(lambda iops: iops['total'], iops_list)
                total_iops = sum(iops_list)
            return {'throughput': {'read': read_throughput / 15, 'write': wriet_throughput / 15}, 'iops': total_iops / 15}
        data_list = map(get_throughput_and_iops, host_list)
        database.create_node_throughput_and_iops(
            current_time, host_list, data_list)


def run_snapshot_schedule():
    if do_or_not_do():
        current_time = handler.current_time()
        schedule_is_running = database.get_is_running_snapshot_schedule()
        if schedule_is_running is not None:
            name = schedule_is_running['name']
            start_time = schedule_is_running['startTime']
            auto_disable_time = schedule_is_running['autoDisableTime']
            interval = schedule_is_running['interval']
            delete_round = schedule_is_running['deleteRound']
            time_gap_in_second = handler.iso2stamp(
                current_time) - handler.iso2stamp(start_time)
            if time_gap_in_second >= interval and not (time_gap_in_second % interval) and (not auto_disable_time or time_gap_in_second <= auto_disable_time):
                snapshot_setting = database.get_setting('SNAPSHOT-SETTING')
                limit = snapshot_setting['auto']
                count = database.count_snapshot(True)
                name_to_create = name + '-' + \
                    process.run('date "+%Y%m%d%H%M%S"')
                if count < limit:
                    database.create_snapshot(
                        name_to_create, '', True, current_time)
                    event.send('snapshot', 11, name_to_create, True)
                    create_status = backend.create_snapshot(
                        name_to_create, True)
                    if not create_status['errorId']:
                        database.update_snapshot_status(name_to_create)
                        event.send('snapshot', 12, name_to_create, True)
                    else:
                        database.delete_snapshot(name_to_create)
                        event.send('snapshot', 12, name_to_create, False)
                elif delete_round:
                    auto_snapshots = database.get_auto_snapshot()
                    name_to_delete = auto_snapshots[0]['name']
                    database.update_snapshot_status(
                        name_to_delete, False, True, False)
                    delete_status = backend.delete_snapshot(name_to_delete)
                    if not delete_status['errorId']:
                        database.delete_snapshot(name_to_delete)
                        database.create_snapshot(
                            name_to_create, '', True, current_time)
                        event.send('snapshot', 11, name_to_create, True)
                        create_status = backend.create_snapshot(
                            name_to_create, True)
                        if not create_status['errorId']:
                            database.update_snapshot_status(name_to_create)
                            event.send('snapshot', 12, name_to_create, True)
                        else:
                            database.delete_snapshot(name_to_create)
                            event.send('snapshot', 12, name_to_create, False)
                    else:
                        database.update_snapshot_status(name_to_delete)
            elif auto_disable_time and time_gap_in_second > auto_disable_time:
                database.disable_snapshot_schedule(name)
