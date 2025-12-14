# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `#managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from datetime import date
from django.utils import timezone
from django.db import models
from django.contrib.auth.models import User
from .validators import validar_fecha
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
import logging

logger = logging.getLogger(__name__)

def current_time():
    return timezone.localtime().time()

class Empresa(models.Model):
    idempresa = models.AutoField(primary_key=True)
    razonsocial = models.CharField(max_length=100, blank=True, null=True)
    ruc = models.CharField(max_length=11, blank=True, null=True)
    direccion = models.CharField(max_length=150, blank=True, null=True)
    nombrecomercial = models.CharField(max_length=100, blank=True, null=True)
    distrito = models.CharField(max_length=50, blank=True, null=True)
    ciudad = models.CharField(max_length=30, blank=True, null=True)
    telefono = models.CharField(max_length=15, blank=True, null=True)
    fax = models.CharField(max_length=15, blank=True, null=True)
    email = models.CharField(max_length=50, blank=True, null=True)
    logotipo = models.CharField(max_length=150, blank=True, null=True)
    dominio = models.CharField(max_length=100, blank=True, null=True)
    codigofis = models.CharField(max_length=4, blank=True, null=True)
    codigoubigeo = models.CharField(max_length=6, blank=True, null=True)
    resolucion = models.CharField(max_length=100, blank=True, null=True)
    current_sucursal_dir = models.CharField(max_length=300, blank=True, null=True)
    dtr_bconac = models.CharField(max_length=50, blank=True, null=True)
    logo = models.ImageField(upload_to='logos/',blank=True)
    logo2 = models.ImageField(upload_to='logos/',blank=True,null=True) #cambios
    logo3 = models.ImageField(upload_to='logos/',blank=True,null=True) #cambios
    observacion = models.CharField(max_length=100, blank=True, null=True) #cambios
    refran = models.CharField(max_length=100, blank=True, null=True) #cambios
    banco = models.CharField(max_length=100, blank=True, null=True)
    cuenta = models.CharField(max_length=20, blank=True, null=True)
    cci = models.CharField(max_length=30, blank=True, null=True)

    class Meta:
        #managed = False
        db_table = 'empresa'


class Sucursal(models.Model):
    idsucursal = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=20, blank=True, null=True)
    direccion = models.CharField(max_length=70, blank=True, null=True)
    region = models.CharField(max_length=30, blank=True, null=True)
    telefono = models.CharField(max_length=15, blank=True, null=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.PROTECT, default=1)

    class Meta:
        #managed = False
        db_table = 'sucursal'


class Personal(models.Model):
    idpersonal = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=40, blank=True, null=True)
    direccion = models.CharField(max_length=40, blank=True, null=True)
    tipodocumento = models.CharField(max_length=1, blank=True, null=True)
    documento = models.CharField(max_length=20, blank=True, null=True)
    fecha_ingreso = models.DateField(blank=True, null=True, default=timezone.now)
    notas = models.CharField(max_length=50, blank=True, null=True)
    cargo = models.CharField(max_length=3, blank=True, null=True)
    celular = models.CharField(max_length=15, blank=True, null=True)
    activo = models.CharField(max_length=1, blank=True, null=True, default="1")
    idusuario = models.OneToOneField(User, on_delete=models.PROTECT)
    idsucursal = models.ForeignKey(Sucursal, on_delete=models.PROTECT)
    NIVEL_USUARIO_CHOICES = (
        ('1', 'Administrador'),
        ('2', 'Usuario'),
    )
    nivel_usuario = models.CharField(max_length=1, choices=NIVEL_USUARIO_CHOICES, default='1')

    class Meta:
        #managed = False
        db_table = 'personal'

class Cliente(models.Model):
    idcliente = models.AutoField(primary_key=True)
    apellidos = models.CharField(max_length=50, blank=True, null=True)
    celular = models.CharField(max_length=15, blank=True, null=True)
    tipodoc = models.CharField(max_length=1, blank=True, null=True)
    numero = models.CharField(max_length=15, blank=True, null=True)

    class Meta:
        #manage = False
        db_table = 'cliente'    

class Transportista(models.Model):
    idtrans = models.AutoField(primary_key=True)
    apellidos = models.CharField(max_length=50, blank=True, null=True)
    celular = models.CharField(max_length=15, blank=True, null=True)

    class Meta:
        #manage = False
        db_table = 'transportista'    
        
class GuiaSalida(models.Model):
    idguiar = models.AutoField(primary_key=True)
    fecha = models.DateField(blank=True, null=True, default=timezone.now)     
    hora = models.TimeField(blank=True, null=True, default=timezone.now)     
    estado = models.CharField(max_length=3, blank=True, null=True)     
    referencia = models.CharField(max_length=40, blank=True, null=True)     
    total = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)     
    pago = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    idcliente = models.ForeignKey(Cliente, on_delete=models.PROTECT)
    idtransporte = models.ForeignKey(Transportista, on_delete=models.PROTECT)
    idsucursal = models.ForeignKey(Sucursal, on_delete=models.PROTECT)

    class Meta:
        #manage = False
        db_table = 'guiasalida'  


class DetallePago(models.Model):
    idguiar = models.ForeignKey(GuiaSalida, on_delete=models.CASCADE)
    fechaPago = models.DateField(blank=True, null=True)
    referencias = models.CharField(max_length=20, blank=True, null=True)
    tipo_pago = models.CharField(max_length=2, blank=True, null=True)
    importe = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)

    class Meta:
        #manage = False
        db_table = 'detallepago'    


class TarjetaCre(models.Model):
    codigo = models.CharField(max_length=2)
    nombre = models.CharField(max_length=60)
    
    class Meta:
        #managed = False
        db_table = 'tarjetacre'


class Articulos(models.Model):
    idproduct = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=25, blank=True, null=True)     
    precio = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)    
    saldo00001 = models.DecimalField(max_digits=14, decimal_places=2, default=0) 
    saldo00002 = models.DecimalField(max_digits=14, decimal_places=2, default=0) 

    class Meta:
        #manage = False
        db_table = 'articulos'    


class Ajuste(models.Model):
    idajuste = models.AutoField(primary_key=True)
    #serie = models.CharField(max_length=3, blank=True, null=True) Campo descartado para mas simplicidad
    numero = models.CharField(max_length=10, blank=True, null=True)
    fecha = models.DateField(blank=True, null=True)
    referencia = models.CharField(max_length=40, blank=True, null=True)
    idsucursal = models.ForeignKey(Sucursal, db_column="idsucursal", on_delete=models.PROTECT)

    class Meta:
        #manage = False
        db_table = 'ajuste'

class Detajuste(models.Model):
    idajuste = models.ForeignKey(Ajuste, on_delete=models.CASCADE, related_name="detalles")
    cantidad = models.DecimalField(max_digits=10, decimal_places=0, blank=True, null=True)
    idproduct = models.ForeignKey(Articulos, on_delete=models.PROTECT)

    class Meta:
        #manage = False
        db_table = 'detajuste'

class Detguia(models.Model):
    idguiar = models.ForeignKey(GuiaSalida, on_delete=models.CASCADE)
    cantidad = models.DecimalField(max_digits=10, decimal_places=0, blank=True, null=True)
    precio = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    total = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    idproduct = models.ForeignKey(Articulos, on_delete=models.PROTECT)
    
    class Meta:
        #manage = False
        db_table = 'detguia'

