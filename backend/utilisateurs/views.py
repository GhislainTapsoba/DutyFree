from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db import models
from django.db.models.functions import Concat
from django.db.models import Value, F, CharField
from .models import Utilisateur
from .serializers import (UtilisateurSerializer, UtilisateurCreateSerializer, 
                           MeSerializer, CustomTokenObtainPairSerializer)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(MeSerializer(request.user).data)


class CaissiersPublicView(APIView):
    """
    Endpoint public pour récupérer les caissiers actifs (pour la page de login)
    """
    permission_classes = []  # Public access
    
    def get(self, request):
        caissiers = Utilisateur.objects.filter(
            role='caissier', 
            is_active=True
        ).annotate(
            full_name=Concat(
                Value(''),  # Placeholder pour le prénom
                F('first_name'),
                Value(' '),
                F('last_name'),
                output_field=CharField()
            )
        ).values('id', 'username', 'full_name', 'register_id', 'role')
        return Response(list(caissiers))


class UtilisateurViewSet(viewsets.ModelViewSet):
    queryset = Utilisateur.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['username', 'first_name', 'last_name', 'email', 'role']
    ordering_fields = ['last_name', 'role', 'last_login']

    def get_serializer_class(self):
        if self.action == 'create':
            return UtilisateurCreateSerializer
        return UtilisateurSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]