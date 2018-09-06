import time

from lib.module import process
from lib.service import backend, database


def get_cluster_throughput_and_iops():
    current_time = int(time.time()) * 1000
    data = backend.get_cluster_throughput_and_iops()
    throughput_list = data['throughput'] or []
    iops_list = data['iops'] or []

    def calculate_the_sum(value):
        value.reverse()
        value = value[0:15]
        return sum(value)
    if len(throughput_list) and len(iops_list):
        total_throughput = calculate_the_sum(throughput_list)
        total_iops = calculate_the_sum(iops_list)
    else:
        total_throughput = 0
        total_iops = 0
    database.create_cluster_throughput_and_iops(
        current_time, total_throughput, total_iops)


def get_node_cpu_and_memory():
    current_time = int(time.time()) * 1000
    node_list = database.get_setting('NODE-LIST')
    node_list = node_list['mgmt'] + node_list['meta'] + node_list['storage']
    host_list = map(lambda node: process.run('hostname', node), node_list)
    data_list = map(backend.get_node_cpu_and_memory, host_list)
    database.create_node_cpu_and_memory(current_time, host_list, data_list)
