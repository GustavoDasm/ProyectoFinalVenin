from django.apps import AppConfig


class AppVeninWebNew1Config(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app_venin_web_new1'

    def ready(self):
        from app_venin_web_new1 import signals
