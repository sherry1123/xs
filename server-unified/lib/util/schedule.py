import datetime

from apscheduler.schedulers.background import BackgroundScheduler

scheduler = None


def alarm_clock():
    print(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3])


def create_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(alarm_clock, 'cron', second=0)
    return scheduler


def start_scheduler():
    global scheduler
    scheduler = create_scheduler()
    scheduler.start()


def stop_sheduler():
    global scheduler
    scheduler.shutdown()
    scheduler = None
