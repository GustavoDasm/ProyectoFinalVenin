from django.conf import settings
from num2words import num2words
from rest_framework.views import exception_handler
from rest_framework.response import Response


def gettipodoc(tipodoc):
    if tipodoc == 'FAC':
        return 1
    elif tipodoc == 'BOL':
        return 2
    elif tipodoc == 'NCR':
        return 3
    elif tipodoc == 'ND':
        return 4
    else:
        return None

def gettipomoneda(tipomoneda):
    if tipomoneda == 'S/.' or 'S/':
        return 1
    elif tipomoneda == 'USD':
        return 2
    elif tipomoneda == 'EUR':
        return 3
    else:
        return None

def gettiporetencion(tiporetencion):
    if tiporetencion == 1 or 2:
        return True
    else:
        return False
    

def gettipodocmod(tipodoc):
    if tipodoc == 'FAC':
        return 1
    elif tipodoc == 'BOL':
        return 2
    else:
        return None
  
def getfirst(string):
    try:
        return string[0]
    except:
        return ""
    
def gettipoguia(tipoguia):
    valortipodoc_guia = ""
    if tipoguia in ['T', 'E', '0']:
        valortipodoc_guia = "1"
    elif tipoguia == 'V':
        valortipodoc_guia = "2"
    return valortipodoc_guia

def numero_a_letras_con_centavos(numero):
    # Dividir la parte entera y la parte decimal
    parte_entera = int(numero)
    parte_decimal = round((numero - parte_entera) * 100)
    
    # Convertir la parte entera a letras y la parte decimal como fracción
    parte_entera_letras = num2words(parte_entera, lang='es').upper()
    parte_decimal_letras = f"{parte_decimal:02d}/100"
    
    # Formatear el resultado
    resultado = f"{parte_entera_letras} {parte_decimal_letras}"
    return resultado


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        if isinstance(response.data, list):  # Verificar si es una lista
            error_data = {"errors": response.data}  # Guardar como lista
        elif isinstance(response.data, dict):
            error_data = response.data
        else:
            error_data = {"error": "Error desconocido en el servidor"}
    else:
        error_data = {"error": "Error interno del servidor"}

    # Si estamos en modo DEBUG, mostrar más detalles del error
    if settings.DEBUG:
        error_data["exception"] = str(exc)

    return Response(error_data, status=response.status_code if response else 500)