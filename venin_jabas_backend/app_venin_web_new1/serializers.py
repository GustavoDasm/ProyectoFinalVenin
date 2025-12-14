
from rest_framework import serializers 
from app_venin_web_new1.utils import numero_a_letras_con_centavos
from .models import *
from django.contrib.auth import get_user_model


class UserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(min_length=8, required=True, write_only=True)
    idpersonal = serializers.SerializerMethodField()
    idsucursal = serializers.SerializerMethodField()
    personal_nombre = serializers.SerializerMethodField()
    nivel_usuario = serializers.SerializerMethodField()
    
    class Meta:
        model = get_user_model()
        fields = '__all__'
        depth = 1 #('username', 'password')
    
    def get_idsucursal(self, user):
        try:
            personal = Personal.objects.get(idusuario=user)
            return personal.idsucursal.idsucursal  # O personal.idsucursal.nombre si necesitas el nombre
        except Personal.DoesNotExist:
            return None
        
    def get_idpersonal(self, user):
        try:
            personal = Personal.objects.get(idusuario=user)
            return personal.idpersonal  
        except Personal.DoesNotExist:
            return None
        
    def get_personal_nombre(self, user):
        try:
            personal = Personal.objects.get(idusuario=user)
            return personal.nombre  
        except Personal.DoesNotExist:
            return None
        
    def get_nivel_usuario(self, user):
        try:
            personal = Personal.objects.get(idusuario=user)
            return personal.nivel_usuario
        except Personal.DoesNotExist:
            return None

class PersonalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Personal
        fields = '__all__'

class SucursalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sucursal
        fields = '__all__'


#PROYECT   
class TarjetaCreSerializer(serializers.ModelSerializer):
    class Meta:
        model = TarjetaCre
        fields = '__all__'

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'
  
class TransportistaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transportista
        fields = '__all__'

class DetallePagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetallePago
        fields = '__all__'

class GuiaSalidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuiaSalida
        fields = '__all__'

class GuiaSalidaSearchSerializer(serializers.ModelSerializer):
    cliente = serializers.CharField(source='idcliente.apellidos', read_only=True)
    transportista = serializers.CharField(source='idtransporte.apellidos', read_only=True)
    sucursal = serializers.CharField(source='idsucursal.nombre', read_only=True)
    class Meta:
        model = GuiaSalida
        fields = '__all__'

class ArticulosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Articulos
        fields = '__all__'

class AjusteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ajuste
        fields = '__all__'


class AjusteSearchSerializer(serializers.ModelSerializer):
    sucursal = serializers.CharField(source='idsucursal.nombre', read_only=True)
    class Meta:
        model = Ajuste
        fields = '__all__'

class DetajusteSerializer(serializers.ModelSerializer):
    articulo = ArticulosSerializer(source='idproduct', read_only=True)
    class Meta:
        model = Detajuste
        fields = '__all__'

class AjusteReadSerializer(serializers.ModelSerializer):
    sucursal = serializers.CharField(source='idsucursal.nombre', read_only=True)
    detalles = DetajusteSerializer(many=True)
    class Meta:
        model = Ajuste
        fields = '__all__'

class DetguiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Detguia
        fields = '__all__'

class DetallesGuiaSerializer(serializers.ModelSerializer):
    fecha = serializers.DateField(source='idguiar.fecha', read_only=True)
    cliente = serializers.CharField(source='idguiar.idcliente.apellidos', read_only=True)
    producto = serializers.CharField(source='idproduct.nombre', read_only=True)
    
    class Meta:
        model = Detguia
        fields = ['cantidad', 'precio', 'total', 'fecha', 'cliente', 'producto', 'idguiar']


class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = '__all__'

class EmpresaWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = '__all__'
        extra_kwargs = {
            'logo': {'required': False},
            'logo2': {'required': False},
            'logo3': {'required': False}
        } 

class EmpresaReadSerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()
    logo2 = serializers.SerializerMethodField()
    logo3 = serializers.SerializerMethodField()

    class Meta:
        model = Empresa
        fields = '__all__'

    def _get_image_url(self, obj, field_name):
        image = getattr(obj, field_name)
        if image:
            request = self.context.get('request')
            return request.build_absolute_uri(image.url) if request else image.url
        return None    
    
    def get_logo(self, obj):
        return self._get_image_url(obj, 'logo')
    
    def get_logo2(self, obj):  # ¡Método faltante!
        return self._get_image_url(obj, 'logo2')

    def get_logo3(self, obj):  # ¡Método faltante!
        return self._get_image_url(obj, 'logo3')


    # Método genérico para evitar repetición
    def _get_image_url(self, obj, field_name):
        image = getattr(obj, field_name)
        if image:
            request = self.context.get('request')
            return request.build_absolute_uri(image.url) if request else image.url
        return None

    def get_logo(self, obj):
        return self._get_image_url(obj, 'logo')

    def get_logo2(self, obj):  # ¡Método faltante!
        return self._get_image_url(obj, 'logo2')

    def get_logo3(self, obj):  # ¡Método faltante!
        return self._get_image_url(obj, 'logo3')


    