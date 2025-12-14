
from django.db import transaction
from .models import Articulos

class DatabaseMixin:
    def get_database(self):
        # Obtiene la base de datos desde el subdominio
        return getattr(self.request, 'database', 'default')


class BulkOperationsMixin:
    """Mixin optimizado para operaciones bulk con relaciones ForeignKey"""
    
    @property
    def model(self):
        return self.queryset.model if hasattr(self, 'queryset') else self.serializer_class.Meta.model

    @transaction.atomic
    def bulk_create(self, data, compra_id=None):
        """
        Bulk create con manejo de relaciones ForeignKey
        Args:
            data: Lista de diccionarios con los datos
            compra_id: Opcional, ID de la compra padre para todos los items
        """
        objs = []
        
        # Precargar productos si existen en los datos
        product_ids = {item['idproduct'] for item in data if 'idproduct' in item}
        products_map = {p.idproduct: p for p in Articulos.objects.filter(idproduct__in=product_ids)}
        
        for item in data:
            # Manejar idcompra
            if compra_id:
                item['idcompra_id'] = compra_id
            elif 'idcompra' in item:
                item['idcompra_id'] = item.pop('idcompra')
            
            # Manejar idproduct
            if 'idproduct' in item:
                item['idproduct_id'] = item.pop('idproduct')
                # Validar que el producto existe
                if item['idproduct_id'] not in products_map:
                    raise ValueError(f"Producto con ID {item['idproduct_id']} no existe")
            
            objs.append(self.model(**item))
        
        return self.model.objects.bulk_create(objs)

    @transaction.atomic
    def bulk_update(self, data):
        """
        Actualización masiva de DETCOMPRA (detalles)
        :param data: Lista de diccionarios con:
            - 'id' (requerido): ID del detalle a actualizar
            - Otros campos opcionales (cantidad, precio, etc.)
        """
        # Validación básica
        if not all('id_det' in item for item in data):
            raise ValueError("Todos los items deben incluir el ID del detalle")
        
        # Preparar updates
        updates = {}
        for item in data:
            detalle_id = item.pop('id_det')  # Extraemos el ID del detalle
            updates[detalle_id] = item
        
        # Actualizar cada detalle
        updated_count = 0
        detalles = self.model.objects.filter(pk__in=updates.keys())
        
        for detalle in detalles:
            update_data = updates[detalle.id_det]
            for field, value in update_data.items():
                # Manejo especial para ForeignKeys
                if field in ['idcompra', 'idproduct']:
                    setattr(detalle, f"{field}_id", value)
                else:
                    setattr(detalle, field, value)
            detalle.save()
            updated_count += 1
        
        return updated_count

    @transaction.atomic
    def bulk_delete(self, ids):
        """
        Bulk delete que mantiene integridad referencial
        """
        return self.model.objects.filter(id__in=ids).delete()