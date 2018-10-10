from apscheduler.schedulers.background import BackgroundScheduler

from api.util import task

scheduler = None


def create_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(task.send_change_password_message,
                      'cron', minute='*/5', second=0)
    scheduler.add_job(task.get_cluster_throughput_and_iops,
                      'cron', second='*/15')
    scheduler.add_job(task.get_node_cpu_and_memory, 'cron', second='*/15')
    scheduler.add_job(task.get_node_throughput_and_iops, 'cron', second='*/15')
    scheduler.add_job(task.run_snapshot_schedule, 'cron', second=0)
    return scheduler


def start_scheduler():
    global scheduler
    scheduler = create_scheduler()
    scheduler.start()


def stop_scheduler():
    global scheduler
    scheduler.shutdown()
    scheduler = None
