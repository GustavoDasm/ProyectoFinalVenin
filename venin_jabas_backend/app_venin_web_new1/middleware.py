from django.utils.deprecation import MiddlewareMixin
from threading import local

_db_name = local()

def get_db_name():
    return getattr(_db_name, 'value', 'default')

class SubdomainMiddleware(MiddlewareMixin):
    def process_request(self, request):
        origin = request.META.get('HTTP_ORIGIN') or request.META.get('HTTP_REFERER', '')
        
        if origin:
            host = origin.split('//')[-1].split('.')[0]  # Extrae el subdominio
            if host == 'ng':
                _db_name.value = 'empresa_a'
            elif host == 'ng2':
                _db_name.value = 'empresa_b'
            else:
                _db_name.value = 'default'
        else:
            _db_name.value = 'default'
