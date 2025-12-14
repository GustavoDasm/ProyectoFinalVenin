from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView 
from rest_framework import status
from django.http import Http404
from app_venin_web_new1.filters import *
from app_venin_web_new1.views.base.base_search_view import BaseSearchView
from app_venin_web_new1.serializers import *
from app_venin_web_new1.models import *
from app_venin_web_new1.utils import *
from django.db import transaction


#Cliente
class ClienteView(generics.ListCreateAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    name = "Cliente List View"

class ClienteDetails(APIView):

    def get_object(self, pk):
        try:
            return Cliente.objects.get(pk=pk)
        except Cliente.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        empresa = self.get_object(pk)
        serializer = ClienteSerializer(empresa, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        query = self.get_object(pk)
        serializer = ClienteSerializer(query, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":"Datos actualizados exitosamente.",
                             "data":serializer.data,
                             "status":"success"})
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, pk, format=None):
        query = self.get_object(pk)
        query.delete()
        return Response({"message":"Elemento eliminado exitosamente.",
                        "status":"success"},status=status.HTTP_200_OK)
    
class ClienteSearchAPIView(APIView):
    def post(self, request):
        queryset= ClienteFilter(request.data, queryset=Cliente.objects.all()).qs
        serializer=ClienteSerializer(queryset, many=True)
        return Response({
            "message": "success",
            "data": serializer.data
        })
        
#Transportista    
class TransportistaView(generics.ListCreateAPIView):
    queryset = Transportista.objects.all()
    serializer_class = TransportistaSerializer
    name = "Transportista List View"

class TransportistaDetails(APIView):

    def get_object(self, pk):
        try:
            return Transportista.objects.get(pk=pk)
        except Transportista.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        empresa = self.get_object(pk)
        serializer = TransportistaSerializer(empresa, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        query = self.get_object(pk)
        serializer = TransportistaSerializer(query, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":"Datos actualizados exitosamente.",
                             "data":serializer.data,
                             "status":"success"})
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, pk, format=None):
        query = self.get_object(pk)
        query.delete()
        return Response({"message":"Elemento eliminado exitosamente.",
                        "status":"success"},status=status.HTTP_200_OK)    

class TransportistaSearchAPIView(APIView):
    def post(self, request):
        queryset= TransportistaFilter(request.data, queryset=Transportista.objects.all()).qs
        serializer=TransportistaSerializer(queryset, many=True)
        return Response({
            "message": "success",
            "data": serializer.data
        })   

#DetallePago    
class DetallePagoView(generics.ListCreateAPIView):
    queryset = DetallePago.objects.all()
    serializer_class = DetallePagoSerializer
    name = "DetallePago List View"

class DetallePagoDetails(APIView):

    def get_object(self, pk):
        try:
            return DetallePago.objects.get(pk=pk)
        except DetallePago.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        empresa = self.get_object(pk)
        serializer = DetallePagoSerializer(empresa, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        query = self.get_object(pk)
        serializer = DetallePagoSerializer(query, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":"Datos actualizados exitosamente.",
                             "data":serializer.data,
                             "status":"success"})
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, pk, format=None):
        query = self.get_object(pk)
        query.delete()
        return Response({"message":"Elemento eliminado exitosamente.",
                        "status":"success"},status=status.HTTP_200_OK)   

#GuiaSalida    
class GuiaSalidaView(generics.ListCreateAPIView):
    queryset = GuiaSalida.objects.all()
    serializer_class = GuiaSalidaSerializer
    name = "GuiaSalida List View"

class GuiaSalidaDetails(APIView):

    def get_object(self, pk):
        try:
            return GuiaSalida.objects.get(pk=pk)
        except GuiaSalida.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        empresa = self.get_object(pk)
        serializer = GuiaSalidaSerializer(empresa, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        query = self.get_object(pk)
        serializer = GuiaSalidaSerializer(query, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":"Datos actualizados exitosamente.",
                             "data":serializer.data,
                             "status":"success"})
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, pk, format=None):
        query = self.get_object(pk)
        query.delete()
        return Response({"message":"Elemento eliminado exitosamente.",
                        "status":"success"},status=status.HTTP_200_OK)   
    
class GuiaSalidaCompletaView(APIView):
    def get(self, request, id, format=None):
        try:
            guia = GuiaSalida.objects.get(pk=id)

            guia_data = {
                "idguiar": guia.idguiar,
                "fecha": guia.fecha,
                "hora": guia.hora,
                "estado": guia.estado,
                "referencia": guia.referencia,
                "total": guia.total,
                "pago": guia.pago,
                "idcliente": guia.idcliente_id,
                "idtransporte": guia.idtransporte_id,
                "idsucursal": guia.idsucursal_id,
                "cliente":guia.idcliente.apellidos,
                "transporte":guia.idtransporte.apellidos,
            }

            detalle_ventas = Detguia.objects.filter(idguiar=guia)
            guia_data["detalleVentas"] = [
                {
                    "idproduct": v.idproduct_id,
                    "nombre": v.idproduct.nombre if v.idproduct else None,
                    "cantidad": v.cantidad,
                    "precio": v.precio,
                    "total": v.total
                }
                for v in detalle_ventas
            ]

            detalle_pagos = DetallePago.objects.filter(idguiar=guia)
            guia_data["detallePagos"] = [
                {
                    "fechaPago": p.fechaPago,
                    "referencias": p.referencias,
                    "tipo_pago": p.tipo_pago,
                    "importe": p.importe
                }
                for p in detalle_pagos
            ]

            return Response(guia_data, status=status.HTTP_200_OK)

        except GuiaSalida.DoesNotExist:
            return Response(
                {"message": "Guía no encontrada", "status": "error"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            # Imprime el error completo en consola para depuración
            import traceback
            traceback.print_exc()

            return Response(
                {
                    "message": "Error interno del servidor",
                    "status": "error",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request, format=None):
        with transaction.atomic():
            data = request.data
            detalle_ventas = data.pop("detalleVentas", [])
            detalle_pagos = data.pop("detallePagos", [])

            try:
                guia = GuiaSalida.objects.create(
                    fecha=data.get("fecha"),
                    hora=data.get("hora"),
                    estado=data.get("estado"),
                    referencia=data.get("referencia"),
                    total=data.get("total"),
                    pago=data.get("pago"),
                    idcliente_id=data.get("idcliente"),
                    idtransporte_id=data.get("idtransporte"),
                    idsucursal_id=data.get("idsucursal"),
                )

                for venta in detalle_ventas:
                    Detguia.objects.create(
                        idguiar=guia,
                        cantidad=venta.get("cantidad"),
                        precio=venta.get("precio"),
                        total=venta.get("total"),
                        idproduct_id=venta.get("idproduct"),
                    )

                for pago in detalle_pagos:
                    DetallePago.objects.create(
                        idguiar=guia,
                        fechaPago=pago.get("fechaPago"),
                        tipo_pago=pago.get("tipo_pago"),
                        referencias=pago.get("referencias"),
                        importe=pago.get("importe"),
                    )

                return Response({
                    "message": "Guía creada exitosamente",
                    "status": "success",
                    "data": {"idguiar": guia.idguiar}
                }, status=status.HTTP_201_CREATED)

            except Exception as e:
                transaction.set_rollback(True)
                return Response({
                    "message": "Error al guardar la guía",
                    "status": "error",
                    "error": str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
            
    def put(self, request, id, format=None):
        with transaction.atomic():
            try:
                guia = GuiaSalida.objects.get(pk=id)
            except GuiaSalida.DoesNotExist:
                return Response(
                    {"message": "Guía no encontrada", "status": "error"},
                    status=status.HTTP_404_NOT_FOUND
                )

            data = request.data
            detalle_ventas = data.pop("detalleVentas", [])
            detalle_pagos = data.pop("detallePagos", [])

            try:
                # Actualiza los campos básicos de la guía
                guia.fecha = data.get("fecha", guia.fecha)
                guia.hora = data.get("hora", guia.hora)
                guia.estado = data.get("estado", guia.estado)
                guia.referencia = data.get("referencia", guia.referencia)
                guia.total = data.get("total", guia.total)
                guia.pago = data.get("pago", guia.pago)
                guia.idcliente_id = data.get("idcliente", guia.idcliente_id)
                guia.idtransporte_id = data.get("idtransporte", guia.idtransporte_id)
                guia.idsucursal_id = data.get("idsucursal", guia.idsucursal_id)

                guia.save()

                # Elimina detalles anteriores para reemplazarlos
                Detguia.objects.filter(idguiar=guia).delete()
                DetallePago.objects.filter(idguiar=guia).delete()

                # Recrear detalles de ventas
                for venta in detalle_ventas:
                    Detguia.objects.create(
                        idguiar=guia,
                        cantidad=venta.get("cantidad"),
                        precio=venta.get("precio"),
                        total=venta.get("total"),
                        idproduct_id=venta.get("idproduct"),
                    )

                # Recrear detalles de pagos
                for pago in detalle_pagos:
                    DetallePago.objects.create(
                        idguiar=guia,
                        fechaPago=pago.get("fechaPago"),
                        tipo_pago=pago.get("tipo_pago"),
                        referencias=pago.get("referencias"),
                        importe=pago.get("importe"),
                    )

                return Response({
                    "message": "Guía actualizada exitosamente",
                    "status": "success",
                    "data": {"idguiar": guia.idguiar}
                }, status=status.HTTP_200_OK)

            except Exception as e:
                transaction.set_rollback(True)
                return Response({
                    "message": "Error al actualizar la guía",
                    "status": "error",
                    "error": str(e)
                }, status=status.HTTP_400_BAD_REQUEST)   
               
    def patch(self, request, id, format=None):
        try:
            guia = GuiaSalida.objects.get(pk=id)
        except GuiaSalida.DoesNotExist:
            return Response(
                {"message": "Guía no encontrada", "status": "error"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        data = request.data
        
        # Por ejemplo, si solo quieres permitir actualizar el estado:
        estado = data.get('estado')
        if estado:
            guia.estado = estado
            guia.save()
            return Response(
                {"message": "Estado actualizado correctamente", "status": "success"},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"message": "No se proporcionó campo válido para actualizar", "status": "error"},
                status=status.HTTP_400_BAD_REQUEST
            )

    def delete(self, request, id, format=None):
        try:
            guia = GuiaSalida.objects.get(pk=id)
        except GuiaSalida.DoesNotExist:
            return Response(
                {"message": "Guía no encontrada", "status": "error"},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            with transaction.atomic():
                # Borra los detalles primero (opcional si tienes cascada)
                Detguia.objects.filter(idguiar=guia).delete()
                DetallePago.objects.filter(idguiar=guia).delete()

                guia.delete()

            return Response({
                "message": "Guía eliminada exitosamente",
                "status": "success"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "message": "Error al eliminar la guía",
                "status": "error",
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class GuiaSalidaSearchAPIView(APIView):
    def post(self, request):
        data = request.data
        try:
            top = int(data.get("top", 10))  # Si no se envía, por defecto 10
            opcion = data.get("opcion", "idguiar")  # Por defecto ordena por ID
            scale = "-" + opcion if data.get("scale") == "DESC" else opcion
        except ValueError:
            raise ValueError("El parámetro 'top' debe ser un número.")
        
        queryset= GuiaSalidaFilter(data, queryset=GuiaSalida.objects.all()).qs

        if opcion == "hora":
            ordering = (scale,)
        else:
            ordering = (scale, "-hora")

        try:
            queryset = queryset.order_by(*ordering)[:top]
        except Exception as e:
            return Response({"message": "Error al ordenar: " + str(e)},
                            status=status.HTTP_400_BAD_REQUEST)
        
        serializer=GuiaSalidaSearchSerializer(queryset, many=True)
        return Response({
            "message": "success",
            "data": serializer.data
        })

#Articulos    
class ArticulosView(generics.ListCreateAPIView):
    queryset = Articulos.objects.all()
    serializer_class = ArticulosSerializer
    name = "Articulos List View"

class ArticulosDetails(APIView):

    def get_object(self, pk):
        try:
            return Articulos.objects.get(pk=pk)
        except Articulos.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        empresa = self.get_object(pk)
        serializer = ArticulosSerializer(empresa, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        query = self.get_object(pk)
        serializer = ArticulosSerializer(query, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":"Datos actualizados exitosamente.",
                             "data":serializer.data,
                             "status":"success"})
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, pk, format=None):
        query = self.get_object(pk)
        query.delete()
        return Response({"message":"Elemento eliminado exitosamente.",
                        "status":"success"},status=status.HTTP_200_OK)   
    
class ArticulosSearchAPIView(APIView):
    def post(self, request):
        queryset= ArticulosFilter(request.data, queryset=Articulos.objects.all()).qs
        serializer=ArticulosSerializer(queryset, many=True)
        return Response({
            "message": "success",
            "data": serializer.data
        })  
     
#Ajuste    
class AjusteView(generics.ListCreateAPIView):
    queryset = Ajuste.objects.all()
    serializer_class = AjusteSerializer
    name = "Ajuste List View"

class AjusteDetails(APIView):

    def get_object(self, pk):
        try:
            return Ajuste.objects.get(pk=pk)
        except Ajuste.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        ajuste = self.get_object(pk)
        serializer = AjusteReadSerializer(ajuste, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        query = self.get_object(pk)
        serializer = AjusteSerializer(query, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":"Datos actualizados exitosamente.",
                             "data":serializer.data,
                             "status":"success"})
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, pk, format=None):
        query = self.get_object(pk)
        query.delete()
        return Response({"message":"Elemento eliminado exitosamente.",
                        "status":"success"},status=status.HTTP_200_OK)   
    
class AjusteSearchAPIView(APIView):
    def post(self, request):
        data = request.data
        try:
            top = int(data.get("top", 10))  # Si no se envía, por defecto 10
            opcion = data.get("opcion", "idajuste")  # Por defecto ordena por ID
            scale = "-" + opcion if data.get("scale") == "DESC" else opcion
        except ValueError:
            raise ValueError("El parámetro 'top' debe ser un número.")
        
        queryset= AjusteFilter(data, queryset=Ajuste.objects.all()).qs



        try:
            queryset = queryset.order_by('fecha')[:top]
        except Exception as e:
            return Response({"message": "Error al ordenar: " + str(e)},
                            status=status.HTTP_400_BAD_REQUEST)
        
        serializer=AjusteSearchSerializer(queryset, many=True)
        return Response({
            "message": "success",
            "data": serializer.data
        })

#Detajuste    
class DetajusteView(generics.ListCreateAPIView):
    queryset = Detajuste.objects.all()
    serializer_class = DetajusteSerializer
    name = "Detajuste List View"

class DetajusteDetails(APIView):

    def get_object(self, pk):
        try:
            return Detajuste.objects.get(pk=pk)
        except Detajuste.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        empresa = self.get_object(pk)
        serializer = DetajusteSerializer(empresa, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        query = self.get_object(pk)
        serializer = DetajusteSerializer(query, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":"Datos actualizados exitosamente.",
                             "data":serializer.data,
                             "status":"success"})
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, pk, format=None):
        query = self.get_object(pk)
        query.delete()
        return Response({"message":"Elemento eliminado exitosamente.",
                        "status":"success"},status=status.HTTP_200_OK)   

#Detguia    
class DetguiaView(generics.ListCreateAPIView):
    queryset = Detguia.objects.all()
    serializer_class = DetguiaSerializer
    name = "Detguia List View"

class DetguiaDetails(APIView):

    def get_object(self, pk):
        try:
            return Detguia.objects.get(pk=pk)
        except Detguia.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        empresa = self.get_object(pk)
        serializer = DetguiaSerializer(empresa, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        query = self.get_object(pk)
        serializer = DetguiaSerializer(query, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":"Datos actualizados exitosamente.",
                             "data":serializer.data,
                             "status":"success"})
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, pk, format=None):
        query = self.get_object(pk)
        query.delete()
        return Response({"message":"Elemento eliminado exitosamente.",
                        "status":"success"},status=status.HTTP_200_OK)   
    
class DetalleGuiaView(generics.ListAPIView):
    queryset = Detguia.objects.select_related(
        'idguiar',
        'idguiar__idcliente',
        'idproduct'
    ).filter(idguiar__estado='ACT') 
    serializer_class = DetallesGuiaSerializer
#Cargo

class TarjetaCreView(generics.ListCreateAPIView):
    queryset = TarjetaCre.objects.all()
    serializer_class = TarjetaCreSerializer
    name = "TarjetaCre List View"

