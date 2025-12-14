import requests
from .models import *
from django.db.models import Q
from datetime import time

from datetime import date, datetime
from decimal import Decimal
from django.db import transaction

def sendPOST(url, data=None, headers=None):
    try:
        response = requests.post(url, json=data, headers=headers)
        response.raise_for_status()  
        return response.json()
    except requests.HTTPError as http_err:
        
        try:
            error_content = response.json()  
        except ValueError:
            error_content = response.text  
        return {'error': True, 'status_code': response.status_code, 'content': error_content}
    except requests.RequestException as e:
        
        print(f"Error al hacer la solicitud: {e}")
        return {'error': True, 'content': str(e)}

        
def sendGET(url, data=None, headers=None):
    try:
        response = requests.get(url, json=data, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.HTTPError as http_err:

        try:
            error_content = response.json()
        except ValueError:
            error_content = response.text
        return {'error': True, 'status_code': response.status_code, 'content': error_content}
    except requests.RequestException as e:

        print(f"Error al hacer la solicitud: {e}")
        return {'error': True, 'content': str(e)}




def format_date(value):
    """Devuelve string YYYY-MM-DD si value es date/datetime, si no str(value)."""
    if isinstance(value, (date, datetime)):
        return value.strftime("%Y-%m-%d")
    return str(value or '')


def get_kardex_data(idarticulo, fecha_inicio, fecha_fin, idsucursal):
    """
    Lógica de KardexAPIView para devolver:
      - kardex_data: lista de dicts (fecha, numero, referencia, tipomovimiento, cantidad, saldoinventario, tipo)
      - totals: dict con total_entradas y total_salidas
    """
    # Convertir fechas si vienen como strings
    # Suponiendo que fecha_inicio/fecha_fin vienen en 'YYYY-MM-DD' o como date; intenta parsear si es string
    try:
        if isinstance(fecha_inicio, str):
            fecha_inicio_parsed = datetime.strptime(fecha_inicio, "%Y-%m-%d").date()
        else:
            fecha_inicio_parsed = fecha_inicio
        if isinstance(fecha_fin, str):
            fecha_fin_parsed = datetime.strptime(fecha_fin, "%Y-%m-%d").date()
        else:
            fecha_fin_parsed = fecha_fin
    except Exception:
        # si no se pudo parsear, dejar tal cual (las consultas ORM fallarán y deben ser manejadas afuera)
        fecha_inicio_parsed = fecha_inicio
        fecha_fin_parsed = fecha_fin

    # 3. Movimientos anteriores a la fecha de inicio (filtrados por sucursal)
    ajustes_antes = Detajuste.objects.filter(
        idproduct=idarticulo,
        idajuste__fecha__lt=fecha_inicio_parsed,
        idajuste__idsucursal=idsucursal
    )
    guias_antes = Detguia.objects.filter(
        idproduct=idarticulo,
        idguiar__fecha__lt=fecha_inicio_parsed,
        idguiar__idsucursal=idsucursal
    ).exclude(
        idguiar__estado='ANU'
    )

    # 4. Calcular saldo inicial
    saldo_inicial = 0
    for ajuste in ajustes_antes:
        monto = ajuste.cantidad or 0
        saldo_inicial += monto

    total_guias_antes = sum(g.cantidad or 0 for g in guias_antes)
    saldo_inicial -= total_guias_antes

    # Movimientos dentro del rango
    ajustes = Detajuste.objects.filter(
        idproduct=idarticulo,
        idajuste__fecha__range=[fecha_inicio_parsed, fecha_fin_parsed],
        idajuste__idsucursal=idsucursal
    )
    guias = Detguia.objects.filter(
        idproduct=idarticulo,
        idguiar__fecha__range=[fecha_inicio_parsed, fecha_fin_parsed],
        idguiar__idsucursal=idsucursal
    ).exclude(idguiar__estado='ANU')

    transacciones = []
    tipo_prioridad = {'guia': 1, 'ajuste': 0}

    for ajuste in ajustes:
        transacciones.append({
            'fecha':      ajuste.idajuste.fecha,
            'numero':     ajuste.idajuste.numero or ajuste.idajuste.idajuste,
            'referencia': getattr(ajuste.idajuste, 'referencia', '') or '',
            'cantidad':   ajuste.cantidad or 0,
            'tipo':       'ajuste',
            'prioridad': tipo_prioridad.get('ajuste', 99)
        })

    for guia in guias:
        transacciones.append({
            'fecha':      guia.idguiar.fecha,
            'numero':     guia.idguiar.idguiar,
            'referencia': guia.idguiar.referencia or '',
            'cantidad':   -(guia.cantidad or 0),
            'tipo':       'guia',
            'prioridad': tipo_prioridad.get('guia', 99)
        })

    transacciones.sort(
        key=lambda x: (
            x['fecha'],
            tipo_prioridad.get(x['tipo'], 99),
            0 if x['cantidad'] >= 0 else 1
        )
    )

    inventory_balance = saldo_inicial
    kardex_data = []

    if saldo_inicial != 0:
        kardex_data.append({
            'fecha':           fecha_inicio_parsed,
            'documento':       '',
            'serie':           '',
            'numero':          '',
            'referencia':      'Saldo Previo',
            'tipomovimiento':  '',
            'cantidad':        0,
            'saldoinventario': inventory_balance,
            'tipo':            99,
        })

    tipo_map = {'ajuste': 0, 'guia': 1}

    for trans in transacciones:
        mov_tipo = trans['tipo']
        cantidad = trans['cantidad']

        if mov_tipo == 'ajuste':
            inventory_balance += cantidad
            tipomovimiento = 'ENTRADA'
        elif mov_tipo == 'guia':
            inventory_balance += cantidad  # cantidad negativa para salidas
            tipomovimiento = 'SALIDA'
        else:
            inventory_balance += cantidad
            tipomovimiento = 'ENTRADA' if cantidad >= 0 else 'SALIDA'

        kardex_data.append({
            'fecha':           trans['fecha'],
            'documento':       '',  # si tienes doc/serie, mapéalos aquí
            'serie':           '',
            'numero':          trans['numero'],
            'referencia':      trans.get('referencia', ''),
            'tipomovimiento':  tipomovimiento,
            'cantidad':        abs(cantidad),
            'saldoinventario': inventory_balance,
            'tipo':            tipo_map.get(mov_tipo, 99),
        })

    total_entradas = sum(item['cantidad'] for item in kardex_data if item.get('tipomovimiento') == 'ENTRADA')
    total_salidas = sum(item['cantidad'] for item in kardex_data if item.get('tipomovimiento') == 'SALIDA')

    return kardex_data, {'total_entradas': total_entradas, 'total_salidas': total_salidas}
   

def modificar_saldo_articulo(articulo, delta, sucursal_id=None):
    """
    Modifica el campo de saldo del Articulos según la sucursal.
    - articulo: instancia de Articulos o su id (recomendado instancia).
    - delta: Decimal (positivo = sumar, negativo = restar).
    - sucursal_id: ID de la sucursal (1 o 2). Si es None, usa el campo 'saldo' original.
    """
    if not isinstance(delta, Decimal):
        delta = Decimal(delta)
    
    # Si delta es 0, no hacer nada
    if delta == 0:
        return
        
    # Asegurar atomicidad y bloqueo del registro para concurrencia
    with transaction.atomic():
        # Si nos pasan id en vez de instancia:
        if not hasattr(articulo, 'pk'):
            articulo = Articulos.objects.select_for_update().get(pk=articulo)
        else:
            articulo = Articulos.objects.select_for_update().get(pk=articulo.pk)
        
        # Determinar qué campo actualizar según la sucursal
        if sucursal_id == 1:
            campo_saldo = 'saldo00001'
            saldo_actual = getattr(articulo, 'saldo00001', None) or Decimal('0.00')
        elif sucursal_id == 2:
            campo_saldo = 'saldo00002'
            saldo_actual = getattr(articulo, 'saldo00002', None) or Decimal('0.00')
        else:
            # Si no se especifica sucursal o es otra, usar el campo original
            campo_saldo = 'saldo'
            saldo_actual = articulo.saldo or Decimal('0.00')
        
        # Calcular nuevo saldo y actualizar
        nuevo_saldo = saldo_actual + delta
        setattr(articulo, campo_saldo, nuevo_saldo)
        articulo.save(update_fields=[campo_saldo])