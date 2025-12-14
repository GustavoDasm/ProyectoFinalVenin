import django_filters

from django.db.models import Q
from .models import *

class ClienteFilter(django_filters.FilterSet):
    apellidos = django_filters.CharFilter(field_name='apellidos', lookup_expr='icontains')

    class Meta:
        model = Cliente
        fields = ['apellidos']

class TransportistaFilter(django_filters.FilterSet):
    apellidos = django_filters.CharFilter(field_name='apellidos', lookup_expr='icontains')

    class Meta:
        model = Transportista
        fields = ['apellidos']        

class ArticulosFilter(django_filters.FilterSet):
    nombre = django_filters.CharFilter(field_name='nombre', lookup_expr='icontains')
    
    class Meta:
        model = Articulos
        fields = ['nombre']                

class GuiaSalidaFilter(django_filters.FilterSet):
    fec_ini = django_filters.DateFilter(field_name='fecha', lookup_expr='gte')
    fec_fin = django_filters.DateFilter(field_name='fecha', lookup_expr='lte')

    class Meta:
        model = GuiaSalida
        fields = ['fec_ini', 'fec_fin','idcliente','idsucursal']

class AjusteFilter(django_filters.FilterSet):
    fec_ini = django_filters.DateFilter(field_name='fecha', lookup_expr='gte')
    fec_fin = django_filters.DateFilter(field_name='fecha', lookup_expr='lte')

    class Meta:
        model = Ajuste
        fields = ['fec_ini', 'fec_fin','idsucursal']

        

class CuentaFilter(django_filters.FilterSet):
    fec_ini = django_filters.DateFilter(field_name='idguiar__fecha', lookup_expr='gte')
    fec_fin = django_filters.DateFilter(field_name='idguiar__fecha', lookup_expr='lte')
    idsucursal = django_filters.NumberFilter(field_name='idguiar__idsucursal', required=True)
    idcliente = django_filters.NumberFilter(field_name='idguiar__idcliente', required=True)
    estado = django_filters.CharFilter(field_name='idguiar__estado')
    class Meta:
        model = Detguia
        fields = ['idsucursal','idcliente','estado']