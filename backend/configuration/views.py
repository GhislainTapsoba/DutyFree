from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .models import Configuration
from .serializers import ConfigurationSerializer


class ConfigurationView(APIView):
    """GET = lecture, PATCH = mise à jour (admin seulement pour PATCH)."""

    def get_permissions(self):
        if self.request.method == 'PATCH':
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get(self, request):
        config = Configuration.get()
        return Response(ConfigurationSerializer(config).data)

    def patch(self, request):
        config = Configuration.get()
        serializer = ConfigurationSerializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
