from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class BaseSearchView(APIView):
    model = None            # El modelo que vas a usar
    serializer_class = None # El serializer
    ordering_field = "id"   # Campo por defecto para ordenar

    def get_top_and_scale(self, request):
        data = request.data
        try:
            top = int(data.get("top", 10))
            if top <= 0:
                raise ValueError
        except (ValueError, TypeError):
            raise ValueError("El parámetro 'top' debe ser un número positivo.")

        scale = data.get("scale", "ASC").upper()
        if scale not in ["ASC", "DESC"]:
            raise ValueError("El parámetro 'scale' debe ser 'ASC' o 'DESC'.")

        return top, scale

    def get_queryset(self, request):
        """
        Este método debe ser implementado por la subclase.
        Debe devolver un queryset filtrado.
        """
        raise NotImplementedError("Debes implementar get_queryset en la subclase.")

    def post(self, request):
        try:
            top, scale = self.get_top_and_scale(request)
        except ValueError as e:
            return Response({"message": str(e), "status": "error"}, status=status.HTTP_400_BAD_REQUEST)

        queryset = self.get_queryset(request)

        if not queryset.exists():
            return Response({"message": "No se encontraron resultados.", "status": "warning"},
                            status=status.HTTP_404_NOT_FOUND)

        orden = self.ordering_field if scale == "ASC" else f"-{self.ordering_field}"
        queryset = queryset.order_by(orden)[:top]

        serializer = self.serializer_class(queryset, many=True)
        return Response({"message": "success", "data": serializer.data}, status=status.HTTP_200_OK)
