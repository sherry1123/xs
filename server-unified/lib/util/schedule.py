from apscheduler.schedulers.background import BackgroundScheduler

from lib.util import task

scheduler = None


def create_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(task.get_cluster_throughput_and_iops,
                      'cron', second='*/15')
    scheduler.add_job(task.get_node_cpu_and_memory,
                      'cron', second='*/15')
    scheduler.add_job(task.get_node_throughput_and_iops,
                      'cron', second='*/15')
    return scheduler


def start_scheduler():
    global scheduler
    scheduler = create_scheduler()
    scheduler.start()


def stop_sheduler():
    global scheduler
    scheduler.shutdown()
    scheduler = None
