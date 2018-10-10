from api.module.handler import current_stamp


class Cache:
    def __init__(self):
        self.cache = {}

    def inspect(self, key=None):
        return self.cache.get(key) if key else self.cache

    def update(self, key, value):
        self.cache[key] = {'value': value, 'stamp': current_stamp()}


cache = Cache()
