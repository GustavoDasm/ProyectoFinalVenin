import os
import tempfile
import xlsxwriter
from rest_framework.response import Response
from rest_framework.views import APIView 
from rest_framework import status
from decimal import Decimal
from datetime import datetime
import logging

from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Case, F, DecimalField
from app_venin_web_new1.filters import *
from app_venin_web_new1.serializers import *
from app_venin_web_new1.models import *
from app_venin_web_new1.utils import *
from django.utils.timezone import now


class CuentaPersonalAPIView(APIView):
    def post(self, request):
        try:
            data = request.data

            if not data:
                return Response({
                    "message": "error",
                    "error": "No se proporcionaron datos"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validar que se proporcione idcliente
            idcliente = data.get('idcliente')
            if not idcliente:
                return Response({
                    "message": "error",
                    "error": "El campo 'idcliente' es requerido"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Obtener el cliente y validar que existe
            cliente = get_object_or_404(Cliente, pk=idcliente)

            # Validar otros campos requeridos si es necesario
            idsucursal = data.get('idsucursal')
            if not idsucursal:
                return Response({
                    "message": "error",
                    "error": "El campo 'idsucursal' es requerido"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Aplicar filtros
            queryset = CuentaFilter(data, queryset=Detguia.objects.exclude(idguiar__estado='ANU')).qs

            # Verificar que hay resultados
            if not queryset.exists():
                return Response({
                    "message": "success",
                    "data": {
                        "cliente": f"{cliente.apellidos}".strip(),
                        "detalles": [],
                        "total_registros": 0,
                        "resumen": {
                            "total_general": Decimal('0'),
                            "total_cantidad": 0,
                            "total_pago": Decimal('0'),
                            "saldo_actual": Decimal('0')
                        }
                    }
                }, status=status.HTTP_200_OK)

            # Serializar los datos
            serializer = DetallesGuiaSerializer(queryset, many=True)

            # Calcular totales del queryset (Detguia)
            aggregates = queryset.aggregate(
                suma_total=Sum('total'),
                suma_cantidad=Sum('cantidad')
            )

            suma_total = aggregates.get('suma_total') or Decimal('0')
            suma_cantidad = aggregates.get('suma_cantidad') or 0

            # Obtener los ids de las guías relacionadas con los Detguia filtrados.
            # Ajusta 'idguiar' si tu campo tiene otro nombre en Detguia.
            guia_ids = list(queryset.values_list('idguiar', flat=True))

            # Sumar los importes de DetallePago para esas guías
            pagos_agg = DetallePago.objects.filter(idguiar__in=guia_ids).exclude(idguiar__estado='ANU').aggregate(total_pago=Sum('importe'))
            total_pago = pagos_agg.get('total_pago') or Decimal('0')

            # Calcular saldo actual = suma_total - total_pago
            saldo_actual = suma_total - total_pago

            response_data = {
                "cliente": f"{cliente.apellidos}".strip(),
                "detalles": serializer.data,
                "resumen": {
                    "total_general": suma_total,
                    "total_cantidad": suma_cantidad,
                    "total_pago": total_pago,
                    "saldo_actual": saldo_actual
                },
                "total_registros": queryset.count()
            }

            return Response({
                "message": "success",
                "data": response_data
            }, status=status.HTTP_200_OK)

        except Cliente.DoesNotExist:
            return Response({
                "message": "error",
                "error": f"No se encontró el cliente con ID {idcliente}"
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            # Log del error para debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error en CuentaPersonalAPIView: {str(e)}")

            return Response({
                "message": "error",
                "error": "Ocurrió un error interno del servidor"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
logger = logging.getLogger(__name__)

class PlanillaMovimientosAPIView(APIView):
    def post(self, request):
        try:
            data = request.data or {}
            # Validaciones básicas
            idsucursal = data.get('idsucursal')
            fecha_inicio_str = data.get('fecha_inicio')
            fecha_fin_str = data.get('fecha_fin')
            idcliente = data.get('idcliente')  # opcional

            if not idsucursal:
                return Response({
                    "message": "error",
                    "error": "El campo 'idsucursal' es requerido"
                }, status=status.HTTP_400_BAD_REQUEST)

            if not fecha_inicio_str or not fecha_fin_str:
                return Response({
                    "message": "error",
                    "error": "Se requieren 'fecha_inicio' y 'fecha_fin' en formato YYYY-MM-DD"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Parseo de fechas
            try:
                fecha_inicio = datetime.strptime(fecha_inicio_str, "%Y-%m-%d").date()
                fecha_fin = datetime.strptime(fecha_fin_str, "%Y-%m-%d").date()
            except ValueError:
                return Response({
                    "message": "error",
                    "error": "Formato de fecha inválido. Usar YYYY-MM-DD"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Construir queryset de guías
            guía_qs = GuiaSalida.objects.filter(
                idsucursal_id=idsucursal,
                fecha__range=(fecha_inicio, fecha_fin)
            ).exclude(estado='ANU').select_related('idsucursal', 'idcliente', 'idtransporte')

            if idcliente:
                guía_qs = guía_qs.filter(idcliente_id=idcliente)

            total_registros = guía_qs.count()
            if total_registros == 0:
                return Response({
                    "message": "success",
                    "data": {
                        "report": [],
                        "total_registros": 0
                    }
                }, status=status.HTTP_200_OK)

            # Productos fijos: ids 1 = JAVA, 2 = PAPEL, 3 = PERIODICO (según tu indicación)
            PRODUCT_IDS = {
                'java': 1,
                'papel': 2,
                'periodico': 3
            }

            # Pre-cargar precios de los artículos (evita consultar por cada guía)
            precios = {}
            for key, pid in PRODUCT_IDS.items():
                try:
                    art = Articulos.objects.get(pk=pid)
                    precios[key] = art.precio if art.precio is not None else Decimal('0')
                except Articulos.DoesNotExist:
                    precios[key] = Decimal('0')

            report = []
            # Iterar por cada guía y calcular los subtotales por producto
            for guia in guía_qs.order_by('fecha', 'idguiar'):
                guia_id = guia.idguiar

                # Agregados por producto desde Detguia (si tu campo tiene otro nombre, ajusta)
                agg_java = Detguia.objects.filter(idguiar_id=guia_id, idproduct_id=PRODUCT_IDS['java']).aggregate(
                    suma_cantidad=Sum('cantidad'), suma_total=Sum('total'))
                agg_papel = Detguia.objects.filter(idguiar_id=guia_id, idproduct_id=PRODUCT_IDS['papel']).aggregate(
                    suma_cantidad=Sum('cantidad'), suma_total=Sum('total'))
                agg_period = Detguia.objects.filter(idguiar_id=guia_id, idproduct_id=PRODUCT_IDS['periodico']).aggregate(
                    suma_cantidad=Sum('cantidad'), suma_total=Sum('total'))

                qty_java = agg_java.get('suma_cantidad') or 0
                total_java = agg_java.get('suma_total') or Decimal('0')

                qty_papel = agg_papel.get('suma_cantidad') or 0
                total_papel = agg_papel.get('suma_total') or Decimal('0')

                qty_period = agg_period.get('suma_cantidad') or 0
                total_period = agg_period.get('suma_total') or Decimal('0')

                # Si por alguna razón los totales no vienen desde Detguia, calcular como qty * precio
                if total_java == Decimal('0') and qty_java:
                    total_java = Decimal(qty_java) * (precios.get('java') or Decimal('0'))
                if total_papel == Decimal('0') and qty_papel:
                    total_papel = Decimal(qty_papel) * (precios.get('papel') or Decimal('0'))
                if total_period == Decimal('0') and qty_period:
                    total_period = Decimal(qty_period) * (precios.get('periodico') or Decimal('0'))

                suma_total_guia = total_java + total_papel + total_period

                # Construir fila del reporte
                # Obtener precios desde el primer Detguia de cada producto en la guía
                def get_precio_detguia(guia_id, product_id):
                    det = Detguia.objects.filter(idguiar_id=guia_id, idproduct_id=product_id).order_by('id').first()
                    return float(det.precio) if det and det.precio is not None else 0.0

                precio_java = get_precio_detguia(guia_id, PRODUCT_IDS['java'])
                precio_papel = get_precio_detguia(guia_id, PRODUCT_IDS['papel'])
                precio_periodico = get_precio_detguia(guia_id, PRODUCT_IDS['periodico'])

                fila = {
                    "idguia": guia_id,
                    "sucursal": str(guia.idsucursal.nombre) if guia.idsucursal else None,
                    "fecha": guia.fecha.isoformat() if guia.fecha else None,
                    "cliente": (str(guia.idcliente.apellidos)) if guia.idcliente else None,
                    "transporte": str(guia.idtransporte.apellidos) if guia.idtransporte else None,
                    "java": {
                        "cantidad": float(qty_java),
                        "precio": precio_java,
                        "total": float(total_java)
                    },
                    "papel": {
                        "cantidad": float(qty_papel),
                        "precio": precio_papel,
                        "total": float(total_papel)
                    },
                    "periodico": {
                        "cantidad": float(qty_period),
                        "precio": precio_periodico,
                        "total": float(total_period)
                    },
                    "suma_total": float(suma_total_guia),
                    "estado": guia.estado,
                    "referencia": guia.referencia
                }

                report.append(fila)

            response = {
                "message": "success",
                "data": {
                    "report": report,
                    "total_registros": total_registros,
                    # "filtros": {
                    #     "idsucursal": idsucursal,
                    #     "fecha_inicio": fecha_inicio_str,
                    #     "fecha_fin": fecha_fin_str,
                    #     "idcliente": idcliente
                    # }
                }
            }
            return Response(response, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error en GuiaSalidaReportAPIView: {str(e)}", exc_info=True)
            return Response({
                "message": "error",
                "error": "Ocurrió un error interno del servidor"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class DashboardApiView(APIView):
    """
    POST endpoint que recibe un body JSON con:
    {
        "action": "ventasdiarias",
        "mes": 9,
        "idproduct": 123,
        "year": 2025   # opcional, por defecto usa now().year
    }
    """

    def post(self, request, *args, **kwargs):
        action = request.data.get('action')
        actions = {
            'ventasdiarias': self.ventas_diarias
        }

        # Validar acción
        if not action or action not in actions:
            return Response({'error': 'Opción no válida'}, status=status.HTTP_400_BAD_REQUEST)

        return actions[action](request, *args, **kwargs)

    def ventas_diarias(self, request, *args, **kwargs):
        # Obtener parámetros: primero del body, si no están usar kwargs (por compatibilidad)
        mes = request.data.get('mes') or kwargs.get('mes')
        producto = request.data.get('idproduct') or kwargs.get('idproduct')
        sucursal = request.data.get('idsucursal') or kwargs.get('idsucursal')
        year = request.data.get('year') or kwargs.get('year') or now().year
        print(f"Mes {mes}, Producto {producto}, sucursal {sucursal}")
        # Validaciones básicas
        if mes is None:
            return Response({'error': 'Falta el parámetro "mes".'}, status=status.HTTP_400_BAD_REQUEST)
        if producto is None:
            return Response({'error': 'Falta el parámetro "idproduct".'}, status=status.HTTP_400_BAD_REQUEST)

       
        query = (
            Detguia.objects
            .filter(idguiar__fecha__year=year, idguiar__fecha__month=mes, idproduct=producto, idguiar__idsucursal_id= sucursal)
            .exclude(idguiar__estado='ANU')
            .values('idguiar__fecha')
            .annotate(totaldia=Sum('cantidad'))
        )

        # Devolver lista de dicts: [{'fecha': date, 'totaldia': Decimal}, ...]
        return Response(list(query), status=status.HTTP_200_OK)    
    

class CuentaPersonalExcelAPIView(APIView):
    def post(self, request):
        try:
            data = request.data

            if not data:
                return JsonResponse({
                    "message": "error",
                    "error": "No se proporcionaron datos"
                }, status=400)

            # Validar que se proporcione idcliente
            idcliente = data.get('idcliente')
            if not idcliente:
                return JsonResponse({
                    "message": "error",
                    "error": "El campo 'idcliente' es requerido"
                }, status=400)

            # Obtener el cliente y validar que existe
            cliente = get_object_or_404(Cliente, pk=idcliente)

            # Validar otros campos requeridos
            idsucursal = data.get('idsucursal')
            if not idsucursal:
                return JsonResponse({
                    "message": "error",
                    "error": "El campo 'idsucursal' es requerido"
                }, status=400)

            # Aplicar filtros (reutilizas tu mismo filtro)
            queryset = CuentaFilter(data, queryset=Detguia.objects.exclude(idguiar__estado='ANU')).qs

            # Verificar que hay resultados
            if not queryset.exists():
                return JsonResponse({
                    "message": "error",
                    "error": "No hay datos para exportar con los filtros aplicados"
                }, status=400)

            # Serializar los datos
            serializer = DetallesGuiaSerializer(queryset, many=True)

            # Calcular totales del queryset
            aggregates = queryset.aggregate(
                suma_total=Sum('total'),
                suma_cantidad=Sum('cantidad')
            )

            suma_total = aggregates.get('suma_total') or Decimal('0')
            suma_cantidad = aggregates.get('suma_cantidad') or 0

            # Obtener los ids de las guías relacionadas
            guia_ids = list(queryset.values_list('idguiar', flat=True))

            # Sumar los importes de DetallePago para esas guías
            pagos_agg = DetallePago.objects.filter(idguiar__in=guia_ids).exclude(idguiar__estado='ANU').aggregate(total_pago=Sum('importe'))
            total_pago = pagos_agg.get('total_pago') or Decimal('0')

            # Calcular saldo actual
            saldo_actual = suma_total - total_pago

            # Crear archivo temporal para Excel
            with tempfile.NamedTemporaryFile(suffix='.xlsx', dir=settings.MEDIA_ROOT, delete=False) as tmp:
                tmp_path = tmp.name

            # Crear workbook
            workbook = xlsxwriter.Workbook(tmp_path)
            worksheet = workbook.add_worksheet('Cuenta Personal')

            # Definir formatos
            title_format = workbook.add_format({
                'bold': True,
                'font_size': 16,
                'align': 'center',
                'valign': 'vcenter',
                'bg_color': '#4472C4',
                'font_color': 'white'
            })

            header_format = workbook.add_format({
                'bold': True,
                'font_size': 11,
                'align': 'center',
                'valign': 'vcenter',
                'bg_color': '#D9E1F2',
                'border': 1
            })

            cell_format = workbook.add_format({
                'font_size': 10,
                'align': 'left',
                'valign': 'vcenter',
                'border': 1
            })

            cell_center_format = workbook.add_format({
                'font_size': 10,
                'align': 'center',
                'valign': 'vcenter',
                'border': 1
            })

            cell_right_format = workbook.add_format({
                'font_size': 10,
                'align': 'right',
                'valign': 'vcenter',
                'border': 1,
                'num_format': '#,##0.00'
            })

            total_format = workbook.add_format({
                'bold': True,
                'font_size': 11,
                'align': 'right',
                'valign': 'vcenter',
                'bg_color': '#F2F2F2',
                'border': 1
            })

            total_number_format = workbook.add_format({
                'bold': True,
                'font_size': 11,
                'align': 'right',
                'valign': 'vcenter',
                'bg_color': '#F2F2F2',
                'border': 1,
                'num_format': '#,##0.00'
            })

            # Configurar ancho de columnas
            worksheet.set_column('A:A', 15)  # Día
            worksheet.set_column('B:B', 20)  # Documento
            worksheet.set_column('C:C', 40)  # Producto
            worksheet.set_column('D:D', 12)  # Cantidad
            worksheet.set_column('E:E', 15)  # Precio
            worksheet.set_column('F:F', 15)  # Total

            # Título del reporte
            worksheet.merge_range('A1:F1', f'CUENTA PERSONAL - {cliente.apellidos.strip()}', title_format)

            # Espacio
            current_row = 2

            # Encabezados de la tabla
            headers = ['Día', 'Documento', 'Producto', 'Cantidad', 'Precio', 'Total']
            for col, header in enumerate(headers):
                worksheet.write(current_row, col, header, header_format)

            current_row += 1

            # Datos de la tabla
            for detalle in serializer.data:
                # Formatear fecha
                fecha = detalle.get('fecha', '')
                if fecha:
                    try:
                        from datetime import datetime
                        fecha_obj = datetime.strptime(fecha[:10], '%Y-%m-%d')
                        fecha_formatted = fecha_obj.strftime('%d-%m-%Y')
                    except:
                        fecha_formatted = fecha
                else:
                    fecha_formatted = ''

                # Documento
                idguiar = detalle.get('idguiar')
                documento = f"GUIA - {idguiar}" if idguiar is not None else ''

                # Escribir datos
                worksheet.write(current_row, 0, fecha_formatted, cell_center_format)
                worksheet.write(current_row, 1, documento, cell_center_format)
                worksheet.write(current_row, 2, detalle.get('producto', ''), cell_format)
                worksheet.write(current_row, 3, int(detalle.get('cantidad', 0)), cell_center_format)
                worksheet.write(current_row, 4, float(detalle.get('precio', 0)), cell_right_format)
                worksheet.write(current_row, 5, float(detalle.get('total', 0)), cell_right_format)

                current_row += 1

            # Filas de totales
            # TOTALES
            worksheet.write(current_row, 0, '', total_format)
            worksheet.write(current_row, 1, '', total_format)
            worksheet.write(current_row, 2, 'TOTALES:', total_format)
            worksheet.write(current_row, 3, int(suma_cantidad), total_format)
            worksheet.write(current_row, 4, '', total_format)
            worksheet.write(current_row, 5, float(suma_total), total_number_format)
            current_row += 1

            # TOTAL PAGOS
            worksheet.write(current_row, 0, '', total_format)
            worksheet.write(current_row, 1, '', total_format)
            worksheet.write(current_row, 2, 'TOTAL PAGOS:', total_format)
            worksheet.write(current_row, 3, '', total_format)
            worksheet.write(current_row, 4, '', total_format)
            worksheet.write(current_row, 5, float(total_pago), total_number_format)
            current_row += 1

            # SALDO ACTUAL
            worksheet.write(current_row, 0, '', total_format)
            worksheet.write(current_row, 1, '', total_format)
            worksheet.write(current_row, 2, 'SALDO ACTUAL:', total_format)
            worksheet.write(current_row, 3, '', total_format)
            worksheet.write(current_row, 4, '', total_format)
            worksheet.write(current_row, 5, float(saldo_actual), total_number_format)

            # Cerrar workbook
            workbook.close()

            # Generar URL de descarga
            download_url = f'/{os.path.basename(tmp_path)}'

            return JsonResponse({
                'message': 'success',
                'download_url': download_url,
                'filename': f'cuenta_personal_{cliente.apellidos.strip().replace(" ", "_")}.xlsx'
            }, status=200)

        except Cliente.DoesNotExist:
            return JsonResponse({
                "message": "error",
                "error": f"No se encontró el cliente con ID {idcliente}"
            }, status=404)

        except Exception as e:
            # Log del error para debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error en CuentaPersonalExcelAPIView: {str(e)}")

            return JsonResponse({
                "message": "error",
                "error": "Ocurrió un error interno del servidor"
            }, status=500)
        

class PlanillaMovimientosExcelAPIView(APIView):
    def post(self, request):
        try:
            data = request.data or {}
            
            # Validaciones básicas (idénticas a tu API original)
            idsucursal = data.get('idsucursal')
            fecha_inicio_str = data.get('fecha_inicio')
            fecha_fin_str = data.get('fecha_fin')
            idcliente = data.get('idcliente')  # opcional

            if not idsucursal:
                return JsonResponse({
                    "message": "error",
                    "error": "El campo 'idsucursal' es requerido"
                }, status=400)

            if not fecha_inicio_str or not fecha_fin_str:
                return JsonResponse({
                    "message": "error",
                    "error": "Se requieren 'fecha_inicio' y 'fecha_fin' en formato YYYY-MM-DD"
                }, status=400)

            # Parseo de fechas
            try:
                fecha_inicio = datetime.strptime(fecha_inicio_str, "%Y-%m-%d").date()
                fecha_fin = datetime.strptime(fecha_fin_str, "%Y-%m-%d").date()
            except ValueError:
                return JsonResponse({
                    "message": "error",
                    "error": "Formato de fecha inválido. Usar YYYY-MM-DD"
                }, status=400)

            # Construir queryset de guías (lógica idéntica)
            guía_qs = GuiaSalida.objects.filter(
                idsucursal_id=idsucursal,
                fecha__range=(fecha_inicio, fecha_fin)
            ).exclude(estado='ANU').select_related('idsucursal', 'idcliente', 'idtransporte')

            if idcliente:
                guía_qs = guía_qs.filter(idcliente_id=idcliente)

            total_registros = guía_qs.count()
            if total_registros == 0:
                return JsonResponse({
                    "message": "error",
                    "error": "No hay datos para exportar con los filtros aplicados"
                }, status=400)

            # Productos fijos (idéntico a tu API)
            PRODUCT_IDS = {
                'java': 1,
                'papel': 2,
                'periodico': 3
            }

            # Pre-cargar precios
            precios = {}
            for key, pid in PRODUCT_IDS.items():
                try:
                    art = Articulos.objects.get(pk=pid)
                    precios[key] = art.precio if art.precio is not None else Decimal('0')
                except Articulos.DoesNotExist:
                    precios[key] = Decimal('0')

            # Generar datos del reporte (lógica idéntica)
            report = []
            totals = {
                'qty_java': 0,
                'total_java': Decimal('0'),
                'qty_papel': 0,
                'total_papel': Decimal('0'),
                'qty_period': 0,
                'total_period': Decimal('0'),
                'suma_total': Decimal('0')
            }

            for guia in guía_qs.order_by('fecha', 'idguiar'):
                guia_id = guia.idguiar

                # Agregados por producto (idéntico a tu API)
                agg_java = Detguia.objects.filter(idguiar_id=guia_id, idproduct_id=PRODUCT_IDS['java']).aggregate(
                    suma_cantidad=Sum('cantidad'), suma_total=Sum('total'))
                agg_papel = Detguia.objects.filter(idguiar_id=guia_id, idproduct_id=PRODUCT_IDS['papel']).aggregate(
                    suma_cantidad=Sum('cantidad'), suma_total=Sum('total'))
                agg_period = Detguia.objects.filter(idguiar_id=guia_id, idproduct_id=PRODUCT_IDS['periodico']).aggregate(
                    suma_cantidad=Sum('cantidad'), suma_total=Sum('total'))

                qty_java = agg_java.get('suma_cantidad') or 0
                total_java = agg_java.get('suma_total') or Decimal('0')

                qty_papel = agg_papel.get('suma_cantidad') or 0
                total_papel = agg_papel.get('suma_total') or Decimal('0')

                qty_period = agg_period.get('suma_cantidad') or 0
                total_period = agg_period.get('suma_total') or Decimal('0')

                # Calcular si no hay totales
                if total_java == Decimal('0') and qty_java:
                    total_java = Decimal(qty_java) * (precios.get('java') or Decimal('0'))
                if total_papel == Decimal('0') and qty_papel:
                    total_papel = Decimal(qty_papel) * (precios.get('papel') or Decimal('0'))
                if total_period == Decimal('0') and qty_period:
                    total_period = Decimal(qty_period) * (precios.get('periodico') or Decimal('0'))

                suma_total_guia = total_java + total_papel + total_period

                # Acumular totales
                totals['qty_java'] += qty_java
                totals['total_java'] += total_java
                totals['qty_papel'] += qty_papel
                totals['total_papel'] += total_papel
                totals['qty_period'] += qty_period
                totals['total_period'] += total_period
                totals['suma_total'] += suma_total_guia

                # Construir fila del reporte
                fila = {
                    "idguia": guia_id,
                    "sucursal": str(guia.idsucursal.nombre) if guia.idsucursal else "",
                    "fecha": guia.fecha.isoformat() if guia.fecha else "",
                    "cliente": str(guia.idcliente.apellidos) if guia.idcliente else "",
                    "transporte": str(guia.idtransporte.apellidos) if guia.idtransporte else "",
                    "java": {
                        "cantidad": float(qty_java),
                        "precio": precios.get('java') or Decimal('0'),
                        "total": total_java
                    },
                    "papel": {
                        "cantidad": float(qty_papel),
                        "precio": precios.get('papel') or Decimal('0'),
                        "total": total_papel
                    },
                    "periodico": {
                        "cantidad": float(qty_period),
                        "precio": precios.get('periodico') or Decimal('0'),
                        "total": total_period
                    },
                    "suma_total": suma_total_guia,
                    "estado": guia.estado,
                    "referencia": guia.referencia
                }
                report.append(fila)

            # Crear archivo temporal para Excel
            with tempfile.NamedTemporaryFile(suffix='.xlsx', dir=settings.MEDIA_ROOT, delete=False) as tmp:
                tmp_path = tmp.name

            # Crear workbook
            workbook = xlsxwriter.Workbook(tmp_path)
            worksheet = workbook.add_worksheet('Planilla Movimientos')

            # Definir formatos
            title_format = workbook.add_format({
                'bold': True,
                'font_size': 16,
                'align': 'center',
                'valign': 'vcenter',
                'bg_color': '#4472C4',
                'font_color': 'white'
            })

            info_format = workbook.add_format({
                'bold': True,
                'font_size': 11,
                'align': 'left'
            })

            header_format = workbook.add_format({
                'bold': True,
                'font_size': 10,
                'align': 'center',
                'valign': 'vcenter',
                'bg_color': '#D9E1F2',
                'border': 1,
                'text_wrap': True
            })

            cell_format = workbook.add_format({
                'font_size': 9,
                'align': 'left',
                'valign': 'vcenter',
                'border': 1
            })

            cell_center_format = workbook.add_format({
                'font_size': 9,
                'align': 'center',
                'valign': 'vcenter',
                'border': 1
            })

            cell_right_format = workbook.add_format({
                'font_size': 9,
                'align': 'right',
                'valign': 'vcenter',
                'border': 1,
                'num_format': '#,##0.00'
            })

            total_format = workbook.add_format({
                'bold': True,
                'font_size': 10,
                'align': 'right',
                'valign': 'vcenter',
                'bg_color': '#F2F2F2',
                'border': 1
            })

            total_number_format = workbook.add_format({
                'bold': True,
                'font_size': 10,
                'align': 'right',
                'valign': 'vcenter',
                'bg_color': '#F2F2F2',
                'border': 1,
                'num_format': '#,##0.00'
            })

            # Configurar ancho de columnas
            worksheet.set_column('A:A', 15)  # Sucursal
            worksheet.set_column('B:B', 12)  # Fecha
            worksheet.set_column('C:C', 25)  # Cliente
            worksheet.set_column('D:D', 20)  # Transporte
            worksheet.set_column('E:E', 8)   # JAVA Cant
            worksheet.set_column('F:F', 10)  # JAVA Precio
            worksheet.set_column('G:G', 12)  # JAVA Total
            worksheet.set_column('H:H', 8)   # PAPEL Cant
            worksheet.set_column('I:I', 10)  # PAPEL Precio
            worksheet.set_column('J:J', 12)  # PAPEL Total
            worksheet.set_column('K:K', 8)   # PERIÓD Cant
            worksheet.set_column('L:L', 10)  # PERIÓD Precio
            worksheet.set_column('M:M', 12)  # PERIÓD Total
            worksheet.set_column('N:N', 12)  # SUMA TOTAL
            worksheet.set_column('O:O', 10)  # Estado
            worksheet.set_column('P:P', 20)  # Referencia

            current_row = 0

            # Título del reporte
            worksheet.merge_range(f'A{current_row + 1}:P{current_row + 1}', 'PLANILLA', title_format)
            current_row += 1

            # Información del reporte
            worksheet.write(current_row + 1, 0, f'Total guías: {total_registros}', info_format)
            worksheet.write(current_row + 1, 7, f'Del periodo {fecha_inicio.strftime("%d-%m-%Y")} al {fecha_fin.strftime("%d-%m-%Y")}', info_format)
            worksheet.write(current_row + 1, 13, f'Fecha del reporte: {datetime.now().strftime("%d-%m-%Y %H:%M")}', info_format)
            current_row += 2

            # Encabezados de la tabla
            headers = [
                'Sucursal', 'Fecha', 'Cliente', 'Transporte',
                'JAVA\nCant.', 'JAVA\nPrecio', 'JAVA\nTotal',
                'PAPEL\nCant.', 'PAPEL\nPrecio', 'PAPEL\nTotal',
                'PERIÓD\nCant.', 'PERIÓD\nPrecio', 'PERIÓD\nTotal',
                'SUMA\nTOTAL', 'Estado', 'Referencia'
            ]

            for col, header in enumerate(headers):
                worksheet.write(current_row, col, header, header_format)

            current_row += 1

            # Datos de la tabla
            for fila in report:
                # Formatear fecha
                fecha = fila.get('fecha', '')
                if fecha:
                    try:
                        fecha_obj = datetime.strptime(fecha[:10], '%Y-%m-%d')
                        fecha_formatted = fecha_obj.strftime('%d-%m-%Y')
                    except:
                        fecha_formatted = fecha
                else:
                    fecha_formatted = ''

                # Escribir datos
                worksheet.write(current_row, 0, fila.get('sucursal', ''), cell_format)
                worksheet.write(current_row, 1, fecha_formatted, cell_center_format)
                worksheet.write(current_row, 2, fila.get('cliente', ''), cell_format)
                worksheet.write(current_row, 3, fila.get('transporte', ''), cell_format)
                
                # JAVA
                worksheet.write(current_row, 4, int(fila['java']['cantidad']), cell_center_format)
                worksheet.write(current_row, 5, float(fila['java']['precio']), cell_right_format)
                worksheet.write(current_row, 6, float(fila['java']['total']), cell_right_format)
                
                # PAPEL
                worksheet.write(current_row, 7, int(fila['papel']['cantidad']), cell_center_format)
                worksheet.write(current_row, 8, float(fila['papel']['precio']), cell_right_format)
                worksheet.write(current_row, 9, float(fila['papel']['total']), cell_right_format)
                
                # PERIODICO
                worksheet.write(current_row, 10, int(fila['periodico']['cantidad']), cell_center_format)
                worksheet.write(current_row, 11, float(fila['periodico']['precio']), cell_right_format)
                worksheet.write(current_row, 12, float(fila['periodico']['total']), cell_right_format)
                
                # SUMA TOTAL
                worksheet.write(current_row, 13, float(fila['suma_total']), cell_right_format)
                worksheet.write(current_row, 14, fila.get('estado', ''), cell_center_format)
                worksheet.write(current_row, 15, fila.get('referencia', ''), cell_format)

                current_row += 1

            # Fila de totales
            worksheet.write(current_row, 0, '', total_format)
            worksheet.write(current_row, 1, '', total_format)
            worksheet.write(current_row, 2, '', total_format)
            worksheet.write(current_row, 3, 'TOTALES:', total_format)
            worksheet.write(current_row, 4, int(totals['qty_java']), total_format)
            worksheet.write(current_row, 5, '', total_format)
            worksheet.write(current_row, 6, float(totals['total_java']), total_number_format)
            worksheet.write(current_row, 7, int(totals['qty_papel']), total_format)
            worksheet.write(current_row, 8, '', total_format)
            worksheet.write(current_row, 9, float(totals['total_papel']), total_number_format)
            worksheet.write(current_row, 10, int(totals['qty_period']), total_format)
            worksheet.write(current_row, 11, '', total_format)
            worksheet.write(current_row, 12, float(totals['total_period']), total_number_format)
            worksheet.write(current_row, 13, float(totals['suma_total']), total_number_format)
            worksheet.write(current_row, 14, '', total_format)
            worksheet.write(current_row, 15, '', total_format)

            # Cerrar workbook
            workbook.close()

            # Generar URL de descarga
            download_url = f'/{os.path.basename(tmp_path)}'
            filename = f'planilla_movimientos_{fecha_inicio.strftime("%Y%m%d")}_{fecha_fin.strftime("%Y%m%d")}.xlsx'

            return JsonResponse({
                'message': 'success',
                'download_url': download_url,
                'filename': filename
            }, status=200)

        except Exception as e:
            # Log del error para debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error en PlanillaMovimientosExcelAPIView: {str(e)}")

            return JsonResponse({
                "message": "error",
                "error": "Ocurrió un error interno del servidor"
            }, status=500)
        

class CuentaDetallePagoAPIView(APIView):
    """
    Versión que permite filtrar por tipo_pago (código del método).
    request.data puede incluir:
      - idcliente (opcional)
      - idsucursal (requerido)
      - tipo_pago (opcional) -> string (codigo) o lista de códigos
      - opcional: fecini (YYYY-MM-DD), fecfin (YYYY-MM-DD)
    """
    def post(self, request):
        try:
            data = request.data or {}
            # si quieres permitir POST vacío que liste por idsucursal, quita esta comprobación
            if not data:
                return Response({
                    "message": "error",
                    "error": "No se proporcionaron datos"
                }, status=status.HTTP_400_BAD_REQUEST)

            # idcliente opcional
            idcliente = data.get('idcliente')
            cliente = None
            if idcliente:
                try:
                    cliente = Cliente.objects.get(pk=idcliente)
                except Cliente.DoesNotExist:
                    return Response({
                        "message": "error",
                        "error": f"No se encontró el cliente con ID {idcliente}"
                    }, status=status.HTTP_404_NOT_FOUND)

            # idsucursal requerido
            idsucursal = data.get('idsucursal')
            if not idsucursal:
                return Response({
                    "message": "error",
                    "error": "El campo 'idsucursal' es requerido"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Base queryset: DetallePago relacionadas a guias no anuladas y a la sucursal indicada
            qs = DetallePago.objects.select_related('idguiar', 'idguiar__idcliente') \
                .exclude(idguiar__estado='ANU') \
                .filter(idguiar__idsucursal=idsucursal)

            # Si se proporcionó cliente, filtrar por él (GuiaSalida.idcliente)
            if cliente:
                qs = qs.filter(idguiar__idcliente=cliente)

            # Filtrar por tipo_pago (codigo del metodo) si viene
            tipo_pago = data.get('tipo_pago')
            if tipo_pago is not None:
                # soporta un string o una lista de códigos
                if isinstance(tipo_pago, (list, tuple)):
                    qs = qs.filter(tipo_pago__in=tipo_pago)
                else:
                    qs = qs.filter(tipo_pago=tipo_pago)

            # Filtros opcionales: rango de fechas sobre la fecha de la guía (GuiaSalida.fecha)
            fecini = data.get('fecini')
            fecfin = data.get('fecfin')
            if fecini:
                try:
                    d_ini = datetime.fromisoformat(fecini).date()
                    qs = qs.filter(idguiar__fecha__gte=d_ini)
                except Exception:
                    logger.warning(f"fecini no válido: {fecini}")

            if fecfin:
                try:
                    d_fin = datetime.fromisoformat(fecfin).date()
                    qs = qs.filter(idguiar__fecha__lte=d_fin)
                except Exception:
                    logger.warning(f"fecfin no válido: {fecfin}")

            # No hay filtro por 'referencias' (según tu último pedido)

            # Si no hay resultados -> devolver estructura vacía
            if not qs.exists():
                return Response({
                    "message": "success",
                    "data": {
                        "cliente": (f"{cliente.apellidos} {getattr(cliente,'nombres','')}".strip() if cliente else "Todos"),
                        "detalles": [],
                        "total_registros": 0,
                        "resumen": {
                            "total_general": Decimal('0'),
                        }
                    }
                }, status=status.HTTP_200_OK)

            # Mapear tipos de pago (TarjetaCre) para mostrar nombre si lo necesitas
            tarjetas = dict(TarjetaCre.objects.all().values_list('codigo', 'nombre'))

            # Agregados (total de importes en DetallePago)
            aggregates = qs.aggregate(suma_importe=Sum('importe'))
            suma_importe = aggregates.get('suma_importe') or Decimal('0')

            # Construir lista de detalles que el front espera: { fecha, cliente, referencia, fechaPago, metodopago, total, idguiar? }
            detalles = []
            for pago in qs:
                guia = getattr(pago, 'idguiar', None)

                fecha_guia = guia.fecha.isoformat() if (guia and getattr(guia, 'fecha', None)) else None

                try:
                    guia_cliente = guia.idcliente  # FK en GuiaSalida
                    cliente_nombre = " ".join(filter(None, [getattr(guia_cliente, 'apellidos', ''), getattr(guia_cliente, 'nombres', '')])).strip()
                except Exception:
                    cliente_nombre = (f"{cliente.apellidos} {getattr(cliente,'nombres','')}".strip() if cliente else "")

                # referencia exclusivamente de DetallePago.referencias
                referencia = pago.referencias or ""

                metodo = tarjetas.get(pago.tipo_pago) if pago.tipo_pago else pago.tipo_pago or ''

                detalles.append({
                    "fecha": fecha_guia,
                    "cliente": cliente_nombre,
                    "referencia": referencia,
                    "fechaPago": pago.fechaPago.isoformat() if pago.fechaPago else None,
                    "metodopago": metodo,
                    "total": pago.importe or Decimal('0'),
                    "idguiar": getattr(guia, 'idguiar', None)
                })

            response_data = {
                "cliente": (f"{cliente.apellidos} {getattr(cliente,'nombres','')}".strip() if cliente else "Todos"),
                "detalles": detalles,
                "resumen": {
                    "total_general": suma_importe,
                },
                "total_registros": qs.count()
            }

            return Response({
                "message": "success",
                "data": response_data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error en CuentaDetallePagoAPIView: {str(e)}", exc_info=True)
            return Response({
                "message": "error",
                "error": "Ocurrió un error interno del servidor"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class CuentaDetallePagoExcelAPIView(APIView):
    """
    Genera un Excel para DetallePago con columnas:
      Fecha (GuiaSalida.fecha), Cliente, Referencia (DetallePago.referencias),
      FechaPago (DetallePago.fechaPago), MetodoPago, Total (DetallePago.importe)

    Filtros en request.data:
      - idcliente (opcional)
      - idsucursal (requerido)
      - tipo_pago (opcional) -> string codigo o lista de codigos
      - fecini (opcional) YYYY-MM-DD
      - fecfin (opcional) YYYY-MM-DD
    Responde con JSON { message, download_url, filename } o error.
    """
    def post(self, request):
        try:
            data = request.data or {}
            if not data:
                return JsonResponse({
                    "message": "error",
                    "error": "No se proporcionaron datos"
                }, status=400)

            # idcliente opcional
            idcliente = data.get('idcliente')
            cliente = None
            if idcliente:
                try:
                    cliente = Cliente.objects.get(pk=idcliente)
                except Cliente.DoesNotExist:
                    return JsonResponse({
                        "message": "error",
                        "error": f"No se encontró el cliente con ID {idcliente}"
                    }, status=404)

            # idsucursal requerido
            idsucursal = data.get('idsucursal')
            if not idsucursal:
                return JsonResponse({
                    "message": "error",
                    "error": "El campo 'idsucursal' es requerido"
                }, status=400)

            # Base queryset: DetallePago relacionadas a guias no anuladas y a la sucursal indicada
            qs = DetallePago.objects.select_related('idguiar', 'idguiar__idcliente') \
                .exclude(idguiar__estado='ANU') \
                .filter(idguiar__idsucursal=idsucursal)

            # Filtrar por cliente si viene
            if cliente:
                qs = qs.filter(idguiar__idcliente=cliente)

            # Filtrar por tipo_pago (codigo) si viene (soporta string o lista)
            tipo_pago = data.get('tipo_pago')
            if tipo_pago is not None:
                if isinstance(tipo_pago, (list, tuple)):
                    qs = qs.filter(tipo_pago__in=tipo_pago)
                else:
                    qs = qs.filter(tipo_pago=tipo_pago)

            # Filtros opcionales de fecha sobre GuiaSalida.fecha
            fecini = data.get('fecini')
            fecfin = data.get('fecfin')
            if fecini:
                try:
                    d_ini = datetime.fromisoformat(fecini).date()
                    qs = qs.filter(idguiar__fecha__gte=d_ini)
                except Exception:
                    logger.warning(f"fecini no válido: {fecini}")
            if fecfin:
                try:
                    d_fin = datetime.fromisoformat(fecfin).date()
                    qs = qs.filter(idguiar__fecha__lte=d_fin)
                except Exception:
                    logger.warning(f"fecfin no válido: {fecfin}")

            # Si no hay resultados -> error (igual que tu ejemplo)
            if not qs.exists():
                return JsonResponse({
                    "message": "error",
                    "error": "No hay datos para exportar con los filtros aplicados"
                }, status=400)

            # Mapear tipos de pago (TarjetaCre) para mostrar nombre si existe
            tarjetas = dict(TarjetaCre.objects.all().values_list('codigo', 'nombre'))

            # Agregado: suma de importes (total general)
            aggregates = qs.aggregate(suma_total=Sum('importe'))
            suma_total = aggregates.get('suma_total') or Decimal('0')

            # Crear archivo temporal en MEDIA_ROOT
            basename = f"cuenta_detallepago_{datetime.now().strftime('%Y%m%d%H%M%S')}.xlsx"
            tmp_path = os.path.join(settings.MEDIA_ROOT, basename)

            # Usar xlsxwriter para crear workbook
            workbook = xlsxwriter.Workbook(tmp_path)
            worksheet = workbook.add_worksheet('DetallePago')

            # Formatos
            title_format = workbook.add_format({
                'bold': True,
                'font_size': 14,
                'align': 'center',
                'valign': 'vcenter',
                'bg_color': '#4472C4',
                'font_color': 'white'
            })
            header_format = workbook.add_format({
                'bold': True,
                'font_size': 11,
                'align': 'center',
                'valign': 'vcenter',
                'bg_color': '#D9E1F2',
                'border': 1
            })
            cell_format = workbook.add_format({
                'font_size': 10,
                'align': 'left',
                'valign': 'vcenter',
                'border': 1
            })
            cell_center_format = workbook.add_format({
                'font_size': 10,
                'align': 'center',
                'valign': 'vcenter',
                'border': 1
            })
            cell_right_format = workbook.add_format({
                'font_size': 10,
                'align': 'right',
                'valign': 'vcenter',
                'border': 1,
                'num_format': '#,##0.00'
            })
            total_format = workbook.add_format({
                'bold': True,
                'font_size': 11,
                'align': 'right',
                'valign': 'vcenter',
                'bg_color': '#F2F2F2',
                'border': 1
            })
            total_number_format = workbook.add_format({
                'bold': True,
                'font_size': 11,
                'align': 'right',
                'valign': 'vcenter',
                'bg_color': '#F2F2F2',
                'border': 1,
                'num_format': '#,##0.00'
            })

            # Configurar ancho de columnas
            worksheet.set_column('A:A', 15)  # Fecha (Día)
            worksheet.set_column('B:B', 40)  # Cliente
            worksheet.set_column('C:C', 40)  # Referencia
            worksheet.set_column('D:D', 15)  # Fecha Pago
            worksheet.set_column('E:E', 25)  # Metodo Pago
            worksheet.set_column('F:F', 15)  # Total

            # Título
            client_label = (f"{cliente.apellidos} {getattr(cliente,'nombres','')}".strip() if cliente else "Todos")
            worksheet.merge_range('A1:F1', f'DETALLE PAGOS - {client_label}', title_format)

            current_row = 2

            # Encabezados
            headers = ['Día', 'Cliente', 'Referencia', 'Fecha Pago', 'Método Pago', 'Total']
            for col, h in enumerate(headers):
                worksheet.write(current_row, col, h, header_format)

            current_row += 1

            # Escribir filas
            for pago in qs:
                guia = getattr(pago, 'idguiar', None)

                # Fecha de guia
                fecha_guia = ''
                if guia and getattr(guia, 'fecha', None):
                    try:
                        fecha_guia = guia.fecha.strftime('%d-%m-%Y')
                    except Exception:
                        fecha_guia = str(guia.fecha)

                # Cliente (de la guia)
                cliente_nombre = ''
                try:
                    guia_cliente = guia.idcliente
                    cliente_nombre = " ".join(filter(None, [getattr(guia_cliente, 'apellidos', ''), getattr(guia_cliente, 'nombres', '')])).strip()
                except Exception:
                    cliente_nombre = ''

                # Referencia exclusivamente de DetallePago.referencias
                referencia = pago.referencias or ''

                # Fecha de pago
                fecha_pago = pago.fechaPago.strftime('%d-%m-%Y') if pago.fechaPago else ''

                # Metodo pago (nombre desde TarjetaCre si existe, si no dejar codigo)
                metodo = tarjetas.get(pago.tipo_pago) if pago.tipo_pago else (pago.tipo_pago or '')

                # Total (importe)
                importe = float(pago.importe or 0)

                worksheet.write(current_row, 0, fecha_guia, cell_center_format)
                worksheet.write(current_row, 1, cliente_nombre, cell_format)
                worksheet.write(current_row, 2, referencia, cell_format)
                worksheet.write(current_row, 3, fecha_pago, cell_center_format)
                worksheet.write(current_row, 4, metodo, cell_format)
                worksheet.write(current_row, 5, importe, cell_right_format)

                current_row += 1

            # Fila de totales (solo TOTAL GENERAL, según tu petición en front)
            worksheet.write(current_row, 0, '', total_format)
            worksheet.write(current_row, 1, '', total_format)
            worksheet.write(current_row, 2, 'TOTALES:', total_format)
            worksheet.write(current_row, 3, '', total_format)
            worksheet.write(current_row, 4, '', total_format)
            worksheet.write(current_row, 5, float(suma_total), total_number_format)

            # Cerrar workbook
            workbook.close()

            # Generar URL de descarga usando MEDIA_URL (asegúrate de servir MEDIA_URL en tu servidor)
            download_url = f'/{os.path.basename(tmp_path)}'
            

            return JsonResponse({
                'message': 'success',
                'download_url': download_url,
                'filename': basename
            }, status=200)

        except Exception as e:
            logger.error(f"Error en CuentaDetallePagoExcelAPIView: {str(e)}", exc_info=True)
            return JsonResponse({
                "message": "error",
                "error": "Ocurrió un error interno del servidor"
            }, status=500)