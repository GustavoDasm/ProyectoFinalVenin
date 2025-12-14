
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView 
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import Http404
from django.contrib.auth import authenticate, login, logout

from app_venin_web_new1.filters import *
from app_venin_web_new1.views.base.base_search_view import BaseSearchView
from app_venin_web_new1.serializers import *
from app_venin_web_new1.models import *
from app_venin_web_new1.utils import *


#usuarios
class LoginView(APIView):
    def post(self, request):
        # Recuperamos las credenciales y autenticamos al usuario
        print(request)
        username = request.data.get('username', None)
        password = request.data.get('password', None)
        user = authenticate(username=username, password=password)

        # Si es correcto añadimos a la request la información de sesión
        if user:
            login(request, user)
            return Response({"message":"Inicio de sesion exitoso.",
                             "data":UserSerializer(user).data,
                             "status":"success"},status=status.HTTP_200_OK)
        # Si no es correcto devolvemos un error en la petición
        return Response({"message":"usuario no encontrado.",
                         "status":"fail"},
                        status=status.HTTP_404_NOT_FOUND)


class LogoutView(APIView):
    def post(self, request):
        # Borramos de la request la información de sesión
        logout(request)

        # Devolvemos la respuesta al cliente
        return Response(status=status.HTTP_200_OK)


#personal
class PersonalView(generics.ListCreateAPIView):
    queryset = Personal.objects.all()
    serializer_class = PersonalSerializer
    name = "Personal List View"
        
class PersonalDetails(APIView):

    def get_object(self, opt, pk):
        try:
            if not opt:
                return Personal.objects.get(pk=pk)
            else:
                if opt != 'like':
                    dictquery = {opt:pk}
                    return Personal.objects.filter(**dictquery)
                else:
                    return Personal.objects.filter(nombre__icontains=pk)
        except Personal.DoesNotExist:
                raise Http404
        
    def get(self, request, option=None, pk=None, format=None):
        query = self.get_object(option,pk)
        serializer = PersonalSerializer(query,many=True if option else False)
        return Response(serializer.data)
    def put(self, request, pk, format=None):
        query = self.get_object(None,pk)
        serializer = PersonalSerializer(query, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":"Datos actualizados exitosamente.",
                             "data":serializer.data,
                             "status":"success"})
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, pk, format=None):
        query = self.get_object(None,pk)
        query.delete()
        return Response({"message":"Elemento eliminado exitosamente.",
                        "status":"success"},status=status.HTTP_200_OK)


class SearchPersonalView(BaseSearchView):
    model = Personal
    serializer_class = PersonalSerializer
    ordering_field = "nombre"

    def get_queryset(self, request):
        text = request.data.get("text", "").strip()
        queryset = self.model.objects.all()
        if text:
            queryset = queryset.filter(nombre__icontains=text)
        return queryset
    

#Empresa
class EmpresaView(generics.ListCreateAPIView):
    queryset = Empresa.objects.all()
    serializer_class = EmpresaReadSerializer
    name = "Empresa List View"

class EmpresaDetails(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self, pk):
        try:
            return Empresa.objects.get(pk=pk)
        except Empresa.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        empresa = self.get_object(pk)
        serializer = EmpresaReadSerializer(empresa, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        empresa = self.get_object(pk)
        serializer = EmpresaWriteSerializer(
            empresa, 
            data=request.data, 
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            # Devuelve los datos con el serializer de lectura
            read_serializer = EmpresaReadSerializer(empresa, context={'request': request})
            return Response({
                "status": "success",
                "data": read_serializer.data
            })
        return Response(serializer.errors, status=400)
    
#Sucursal
class SucursalView(generics.ListCreateAPIView):
    queryset = Sucursal.objects.all()
    serializer_class = SucursalSerializer
    name = "Sucursal List View"
    
    
class SucursalDetail(APIView):
    def get_object(self, pk):
        try:
            return Sucursal.objects.get(pk=pk)
        except Sucursal.DoesNotExist:
            raise Http404
        
    def get(self, request, pk, format=None):
        query = self.get_object(pk)
        serializer = SucursalSerializer(query)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        query = self.get_object(pk)
        serializer = SucursalSerializer(query, data=request.data)
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
