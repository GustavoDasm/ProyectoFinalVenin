# signals.py
from decimal import Decimal
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from django.db import transaction
from .models import *
from .services import modificar_saldo_articulo

def modificar_saldo_por_sucursal(articulo, cantidad, sucursal_id):
    """
    Modifica el saldo del artículo según la sucursal específica.
    Usa directamente los campos saldo00001 y saldo00002.
    """
    if sucursal_id is None or cantidad == 0:
        return
    
    # Si se pasa un ID en lugar de la instancia, obtener el artículo
    if isinstance(articulo, (int, str)):
        try:
            articulo = Articulos.objects.get(pk=articulo)
        except Articulos.DoesNotExist:
            return
    
    # Convertir cantidad a Decimal si no lo es
    if not isinstance(cantidad, Decimal):
        cantidad = Decimal(str(cantidad))
    
    # Determinar qué campo actualizar según la sucursal
    if sucursal_id == 1:
        saldo_actual = getattr(articulo, 'saldo00001', None) or Decimal('0.00')
        nuevo_saldo = saldo_actual + cantidad
        articulo.saldo00001 = nuevo_saldo
        articulo.save(update_fields=['saldo00001'])
    elif sucursal_id == 2:
        saldo_actual = getattr(articulo, 'saldo00002', None) or Decimal('0.00')
        nuevo_saldo = saldo_actual + cantidad
        articulo.saldo00002 = nuevo_saldo
        articulo.save(update_fields=['saldo00002'])

def obtener_sucursal_desde_instancia(instance):
    """
    Obtiene el ID de sucursal desde la instancia del detalle.
    Retorna 1 o 2 según la sucursal, o None si no se puede determinar.
    """
    if hasattr(instance, 'idguiar') and instance.idguiar:
        # Para Detguia
        return getattr(instance.idguiar, 'idsucursal_id', None)
    elif hasattr(instance, 'idajuste') and instance.idajuste:
        # Para Detajuste (asumiendo que el modelo Ajuste tiene idsucursal)
        return getattr(instance.idajuste, 'idsucursal_id', None)
    return None

@receiver(pre_save, sender=Detguia)
def detguia_pre_save(sender, instance, **kwargs):
    """
    Guardamos valores previos para comparar en post_save (si es update).
    """
    if not instance.pk:
        instance._old_cantidad = None
        instance._old_idproduct = None
        instance._old_sucursal = None
    else:
        try:
            old = Detguia.objects.get(pk=instance.pk)
            instance._old_cantidad = old.cantidad or Decimal('0.00')
            instance._old_idproduct = old.idproduct_id
            instance._old_sucursal = obtener_sucursal_desde_instancia(old)
        except Detguia.DoesNotExist:
            instance._old_cantidad = None
            instance._old_idproduct = None
            instance._old_sucursal = None

@receiver(post_save, sender=Detguia)
def detguia_post_save(sender, instance, created, **kwargs):
    """
    - created: se resta cantidad (salida).
    - update: se aplica la diferencia entre cantidad nueva y anterior.
      También manejamos cambio de producto y/o sucursal.
    """
    cantidad = instance.cantidad or Decimal('0.00')
    sucursal_actual = obtener_sucursal_desde_instancia(instance)
    
    if created:
        # al crear una línea de guía -> salida de inventario => restar
        modificar_saldo_por_sucursal(instance.idproduct, -cantidad, sucursal_actual)
    else:
        # update
        cantidad_anterior = getattr(instance, '_old_cantidad', Decimal('0.00'))
        old_prod_id = getattr(instance, '_old_idproduct', None)
        old_sucursal = getattr(instance, '_old_sucursal', None)

        # Verificar si cambió el producto o la sucursal
        cambio_producto = old_prod_id and old_prod_id != instance.idproduct_id
        cambio_sucursal = old_sucursal != sucursal_actual
        
        if cambio_producto or cambio_sucursal:
            # 1) revertir la operación anterior (sumar la cantidad en producto/sucursal viejo)
            if old_prod_id:
                try:
                    old_product = Articulos.objects.get(pk=old_prod_id)
                    modificar_saldo_por_sucursal(old_product, cantidad_anterior, old_sucursal)
                except Articulos.DoesNotExist:
                    pass

            # 2) aplicar la nueva operación (restar cantidad en producto/sucursal nuevo)
            modificar_saldo_por_sucursal(instance.idproduct, -cantidad, sucursal_actual)
        else:
            # mismo producto y sucursal: calcular diferencia
            diff = cantidad - (cantidad_anterior or Decimal('0.00'))
            delta = -diff  # negativo porque es salida
            if delta != 0:
                modificar_saldo_por_sucursal(instance.idproduct, delta, sucursal_actual)

    # limpiar atributos temporales
    if hasattr(instance, '_old_cantidad'):
        del instance._old_cantidad
    if hasattr(instance, '_old_idproduct'):
        del instance._old_idproduct
    if hasattr(instance, '_old_sucursal'):
        del instance._old_sucursal

@receiver(post_delete, sender=Detguia)
def detguia_post_delete(sender, instance, **kwargs):
    """
    Al eliminar una línea de guía, asumimos que la salida se anula => sumamos la cantidad al stock.
    """
    cantidad = instance.cantidad or Decimal('0.00')
    sucursal = obtener_sucursal_desde_instancia(instance)
    modificar_saldo_articulo(instance.idproduct, cantidad, sucursal)

@receiver(pre_save, sender=Detajuste)
def detajuste_pre_save(sender, instance, **kwargs):
    if not instance.pk:
        instance._old_cantidad = None
        instance._old_idproduct = None
        instance._old_sucursal = None
    else:
        try:
            old = Detajuste.objects.get(pk=instance.pk)
            instance._old_cantidad = old.cantidad or Decimal('0.00')
            instance._old_idproduct = old.idproduct_id
            instance._old_sucursal = obtener_sucursal_desde_instancia(old)
        except Detajuste.DoesNotExist:
            instance._old_cantidad = None
            instance._old_idproduct = None
            instance._old_sucursal = None

@receiver(post_save, sender=Detajuste)
def detajuste_post_save(sender, instance, created, **kwargs):
    cantidad_nueva = instance.cantidad or Decimal('0.00')
    cantidad_anterior = getattr(instance, '_old_cantidad', None)
    viejo_prod_id = getattr(instance, '_old_idproduct', None)
    vieja_sucursal = getattr(instance, '_old_sucursal', None)
    nueva_sucursal = obtener_sucursal_desde_instancia(instance)

    # creación => ajuste suma => sumar cantidad nueva
    if created:
        modificar_saldo_articulo(instance.idproduct, cantidad_nueva, nueva_sucursal)
    else:
        # update
        cambio_producto = viejo_prod_id and viejo_prod_id != instance.idproduct_id
        cambio_sucursal = vieja_sucursal != nueva_sucursal
        
        if cambio_producto or cambio_sucursal:
            # 1) restar la cantidad anterior del producto/sucursal viejo (revertir el ajuste previo)
            if viejo_prod_id:
                try:
                    viejo = Articulos.objects.get(pk=viejo_prod_id)
                    modificar_saldo_articulo(viejo, -(cantidad_anterior or Decimal('0.00')), vieja_sucursal)
                except Articulos.DoesNotExist:
                    pass
            # 2) sumar la cantidad nueva al producto/sucursal nuevo
            modificar_saldo_articulo(instance.idproduct, cantidad_nueva, nueva_sucursal)
        else:
            # mismo producto y sucursal: aplicar diferencia
            cantidad_anterior = cantidad_anterior or Decimal('0.00')
            diff = cantidad_nueva - cantidad_anterior
            if diff != 0:
                modificar_saldo_articulo(instance.idproduct, diff, nueva_sucursal)

    # limpiar atributos temporales
    if hasattr(instance, '_old_cantidad'):
        del instance._old_cantidad
    if hasattr(instance, '_old_idproduct'):
        del instance._old_idproduct
    if hasattr(instance, '_old_sucursal'):
        del instance._old_sucursal

@receiver(post_delete, sender=Detajuste)
def detajuste_post_delete(sender, instance, **kwargs):
    cantidad = instance.cantidad or Decimal('0.00')
    sucursal = obtener_sucursal_desde_instancia(instance)
    # al eliminar un ajuste que sumó, debemos restar esa cantidad
    modificar_saldo_articulo(instance.idproduct, -cantidad, sucursal)