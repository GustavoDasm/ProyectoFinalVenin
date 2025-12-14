# routers.py

from .middleware import get_db_name

class SubdomainRouter:
    def db_for_read(self, model, **hints):
        return get_db_name()

    def db_for_write(self, model, **hints):
        return get_db_name()

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label in ['auth', 'contenttypes', 'sessions']:
            return db in ['empresa_a', 'empresa_b','empresa_c']
        return True

    def allow_relation(self, obj1, obj2, **hints):
        if obj1._meta.app_label in ['auth', 'contenttypes', 'sessions'] or obj2._meta.app_label in ['auth', 'contenttypes', 'sessions']:
            return True
        return None
