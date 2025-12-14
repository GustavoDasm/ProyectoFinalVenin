from datetime import time
import os
from rest_framework.response import Response
from rest_framework.views import APIView 
from rest_framework import status
from rest_framework.request import Request
from rest_framework.decorators import api_view
from django.conf import settings
from django.http import Http404, HttpResponse, HttpResponseServerError, JsonResponse
from app_venin_web_new1.filters import *
from app_venin_web_new1.views.base.base_search_view import BaseSearchView
from venin_web_new1.settings import MEDIA_ROOT , EMAIL_HOST_USER
from app_venin_web_new1.serializers import *
from app_venin_web_new1.models import *
from app_venin_web_new1.services import *
from app_venin_web_new1.utils import *
import tempfile
import xlsxwriter

def eliminar_excel(request,filename):
    # Calcula el momento en el que se debe eliminar el archivo
    try:
        file_path = os.path.join(MEDIA_ROOT, filename)
        os.remove(file_path)
        print(f'Archivo "{file_path}" eliminado después de ser descargado.')
    except Exception as e:
        print(f'Error al eliminar el archivo: {e}')
    return JsonResponse({'mensaje': 'Archivo eliminado con éxito'})


@api_view(['GET'])
def download_excel_view(request, filename):
    try:
        file_path = os.path.join(MEDIA_ROOT, filename)
        if os.path.exists(file_path):
            with open(file_path, 'rb') as f:
                response = HttpResponse(f.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
                response['Content-Disposition'] = f'attachment; filename={filename}'
                return response
        
        else:
            raise FileNotFoundError(f'File not found: {filename}')
    except Exception as e:
        print(f'Error downloading file: {e}')
        return HttpResponseServerError()

class KardexAPIView(APIView):
    def post(self, request):
        idarticulo   = request.data.get('id')
        fecha_inicio = request.data.get('fecini')
        fecha_fin    = request.data.get('fecfin')
        idsucursal   = request.data.get('idsucursal')  # Se espera un entero 1–7

        # 1. Validar parámetros
        if not (idarticulo and fecha_inicio and fecha_fin and idsucursal):
            return Response(
                {'error': 'Se requieren id, fecha de inicio, fecha de fin e idsucursal'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            articulo = Articulos.objects.get(idproduct=idarticulo)
        except Articulos.DoesNotExist:
            return Response(
                {'error': f'No se encontró el artículo con id {idarticulo}'},
                status=status.HTTP_404_NOT_FOUND
            )

        # 2. Validar idsucursal
        try:
            idx = int(idsucursal)
            if not (1 <= idx <= 7):
                raise ValueError
        except (ValueError, TypeError):
            return Response(
                {'error': 'idsucursal inválido. Debe ser un entero entre 1 y 7.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Movimientos anteriores a la fecha de inicio (filtrados por sucursal)
        ajustes_antes = Detajuste.objects.filter(
            idproduct=idarticulo,
            idajuste__fecha__lt=fecha_inicio,
            idajuste__idsucursal=idx
        )
        guias_antes = Detguia.objects.filter(
            idproduct=idarticulo,
            idguiar__fecha__lt=fecha_inicio,
            idguiar__idsucursal=idx
        ).exclude(
            idguiar__estado='ANU'
        )

        # 4. Calcular saldo inicial basado solo en movimientos anteriores (sin usar saldo000XX)
        saldo_inicial = 0

        # 4.c Ajustes antes
        for ajuste in ajustes_antes:
            monto = ajuste.cantidad or 0
            saldo_inicial += monto

        # 4.d Guías antes (salidas)
        total_guias_antes = sum(g.cantidad or 0 for g in guias_antes)
        saldo_inicial -= total_guias_antes

        
        ajustes = Detajuste.objects.filter(
            idproduct=idarticulo,
            idajuste__fecha__range=[fecha_inicio, fecha_fin],
            idajuste__idsucursal=idx
        )
        guias = Detguia.objects.filter(
            idproduct=idarticulo,
            idguiar__fecha__range=[fecha_inicio, fecha_fin],
            idguiar__idsucursal=idx
        ).exclude(idguiar__estado='ANU')
        
        # 6. Construir lista de transacciones
        transacciones = []

        tipo_prioridad = {
            'guia': 1,
            'ajuste': 0,
        }

        # 6.a Ajustes dentro de rango (serie vacía, numero = id del ajuste)
        for ajuste in ajustes:
            transacciones.append({
                'fecha':      ajuste.idajuste.fecha,
                'numero':     ajuste.idajuste.numero,    # ahora mostramos el id del ajuste
                'referencia': getattr(ajuste.idajuste, 'referencia', '') or '',
                'cantidad':   ajuste.cantidad or 0,
                'tipo':       'ajuste',
                'prioridad': tipo_prioridad.get('ajuste', 99)
            })

        # 6.d Guías dentro de rango
        for guia in guias:
            transacciones.append({
                'fecha':      guia.idguiar.fecha,
                'numero':     guia.idguiar.idguiar,
                'referencia': guia.idguiar.referencia or '',
                'cantidad':   -(guia.cantidad or 0),
                'tipo':       'guia',
                'prioridad': tipo_prioridad.get('guia', 99)
            })

        # 7. Ordenar transacciones por fecha y hora
        transacciones.sort(
            key=lambda x: (
                x['fecha'],
                tipo_prioridad.get(x['tipo'], 99),    # tu prioridad de tipo
                0 if x['cantidad'] >= 0 else 1 ,
            )
        )

        # 8. Construir kardex_data partiendo del saldo inicial
        inventory_balance = saldo_inicial
        kardex_data = []

        # Solo agregar “Saldo inicial” si existe un saldo anterior distinto de cero
        if saldo_inicial != 0:
            kardex_data.append({
                'fecha':           fecha_inicio,
                'documento':       '',
                'serie':           '',
                'numero':          '',
                'referencia':      'Saldo Previo',
                'tipomovimiento':  '',
                'cantidad':        0,
                'saldoinventario': inventory_balance,
                'tipo':            99,
            })

        tipo_map = {
            'ajuste': 0,
            'guia': 1,
        }

        for trans in transacciones:
            mov_tipo = trans['tipo']
            cantidad = trans['cantidad']

            # Determinar tipomovimiento y ajustar saldo
            if mov_tipo == 'ajuste':
                inventory_balance += cantidad
                tipomovimiento = 'ENTRADA'
            elif mov_tipo == 'compra':
                inventory_balance += cantidad
                tipomovimiento = 'ENTRADA'
            elif mov_tipo == 'venta':
                inventory_balance += cantidad
                tipomovimiento = 'SALIDA'
            elif mov_tipo == 'nota_credito':
                inventory_balance += cantidad
                tipomovimiento = 'ENTRADA'
            elif mov_tipo == 'guia':
                inventory_balance += cantidad  # cantidad negativa para origen
                tipomovimiento = 'SALIDA'
            elif mov_tipo == 'ordenproduccion':
                if trans.get('subtipo') == 'ingreso':
                    inventory_balance += cantidad
                    tipomovimiento = 'ENTRADA'
                else:
                    inventory_balance += cantidad  # cantidad negativa
                    tipomovimiento = 'SALIDA'
            else:
                # Caso inesperado: tratar como entrada si cantidad >= 0
                inventory_balance += cantidad
                tipomovimiento = 'ENTRADA' if cantidad >= 0 else 'SALIDA'

            kardex_data.append({
                'fecha':           trans['fecha'],
                'numero':          trans['numero'],
                'referencia':      trans['referencia'],
                'tipomovimiento':  tipomovimiento,
                'cantidad':        abs(cantidad),
                'saldoinventario': inventory_balance,
                'tipo':            tipo_map.get(mov_tipo, 99),
            })

        # 9. Serializar y devolver respuesta
        # serializer = KardexSerializer(kardex_data, many=True)
        return Response(kardex_data, status=status.HTTP_200_OK)


class KardexExportXLSXAPIView(APIView):

    def post(self, request, *args, **kwargs):
        idarticulo   = request.data.get('id')
        fecha_inicio = request.data.get('fecini')
        fecha_fin    = request.data.get('fecfin')
        idsucursal   = request.data.get('idsucursal')

        if not (idarticulo and fecha_inicio and fecha_fin and idsucursal):
            return Response({'error': 'Se requieren id, fecha de inicio, fecha de fin e idsucursal'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            articulo = Articulos.objects.get(idproduct=idarticulo)
        except Articulos.DoesNotExist:
            return Response({'error': f'No se encontró el artículo con id {idarticulo}'},
                            status=status.HTTP_404_NOT_FOUND)

        try:
            idx = int(idsucursal)
            if not (1 <= idx <= 7):
                raise ValueError
        except (ValueError, TypeError):
            return Response({'error': 'idsucursal inválido. Debe ser un entero entre 1 y 7.'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            kardex_data, totals = get_kardex_data(idarticulo, fecha_inicio, fecha_fin, idx)
        except Exception as e:
            return Response({'error': f'Error al generar datos del kardex: {str(e)}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if not hasattr(settings, 'MEDIA_ROOT') or not settings.MEDIA_ROOT:
            return Response({'error': 'MEDIA_ROOT no está configurado en settings.'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        os.makedirs(settings.MEDIA_ROOT, exist_ok=True)

        with tempfile.NamedTemporaryFile(suffix='.xlsx', dir=settings.MEDIA_ROOT, delete=False) as tmp:
            tmp_path = tmp.name

        # Crear workbook
        workbook = xlsxwriter.Workbook(tmp_path)
        worksheet = workbook.add_worksheet('Kardex')

        headers = ['Fecha', 'Numero', 'Referencia', 'Entrada', 'Salida', 'Saldo']
        for col, head in enumerate(headers):
            worksheet.write(0, col, head)

        row = 1
        for item in kardex_data:
            worksheet.write(row, 0, format_date(item.get('fecha')))
            worksheet.write(row, 1, item.get('numero', ''))
            worksheet.write(row, 2, item.get('referencia', ''))

            if item.get('tipomovimiento') == 'ENTRADA':
                worksheet.write_number(row, 3, float(item.get('cantidad') or 0))
                worksheet.write(row, 4, '')
            elif item.get('tipomovimiento') == 'SALIDA':
                worksheet.write(row, 3, '')
                worksheet.write_number(row, 4, float(item.get('cantidad') or 0))
            else:
                worksheet.write(row, 3, '')
                worksheet.write(row, 4, '')

            worksheet.write_number(row, 5, float(item.get('saldoinventario') or 0))
            row += 1

        worksheet.write(row, 0, 'TOTAL')
        worksheet.write(row, 1, '')
        worksheet.write(row, 2, '')
        worksheet.write_number(row, 3, float(totals['total_entradas'] or 0))
        worksheet.write_number(row, 4, float(totals['total_salidas'] or 0))
        worksheet.write(row, 5, '')

        workbook.close()

        download_url = f'/{os.path.basename(tmp_path)}'
        return JsonResponse({'download_url': download_url}, status=200)
   