from datetime import datetime
from django.core.exceptions import ValidationError
# from .models import Compras

def validar_fecha(fecha):
    try:
        datetime.strptime(fecha, "%d/%m/%Y")
        print(fecha)
        return True
    except ValueError:
        raise ValidationError("La fecha debe estar en el formato dd/mm/aaaa")

