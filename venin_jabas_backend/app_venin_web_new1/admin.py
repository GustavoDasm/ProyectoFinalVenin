from django.contrib import admin
#from django.contrib.auth.models import User
#from django.apps import apps
from .models import Empresa , Personal, Sucursal, Cliente, TarjetaCre
# Register your models here.
admin.site.register(Empresa) 
admin.site.register(Personal) 
admin.site.register(Sucursal)
admin.site.register(Cliente)
admin.site.register(TarjetaCre)