from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import Utilisateur

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Permet de s'authentifier soit avec password soit avec PIN (caissiers)"""
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        user = None

        # 1. Tentative authentification classique (username/password)
        try:
            from django.contrib.auth import authenticate
            user = authenticate(username=username, password=password)
        except Exception:
            pass

        # 2. Tentative via PIN ou Password avec register_id si échec username
        if not user:
            from django.db.models import Q
            try:
                # Chercher par username OU par register_id (en ignorant la casse et les tirets)
                # Le frontend envoie 'caisse01', on compare avec 'CAISSE-01'
                user_obj = Utilisateur.objects.filter(
                    Q(username__iexact=username) | 
                    Q(register_id__iexact=username) |
                    Q(register_id__iexact=username.replace('caisse', 'CAISSE-'))
                ).first()

                if user_obj and user_obj.is_active:
                    # Vérifier soit le password soit le PIN
                    if user_obj.pin == password or user_obj.check_password(password):
                        user = user_obj
            except Exception:
                pass

        if user:
            # Générer le token JWT
            refresh = self.get_token(user)
            return {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }

        # Utiliser AuthenticationFailed pour renvoyer un 401 propre
        from rest_framework_simplejwt.exceptions import AuthenticationFailed
        raise AuthenticationFailed('Identifiants ou PIN incorrects')


class UtilisateurSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Utilisateur
        fields = ['id', 'username', 'first_name', 'last_name', 'full_name',
                  'email', 'role', 'register_id', 'phone', 'is_active', 'last_login']
        read_only_fields = ['last_login']

class UtilisateurCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ['username', 'first_name', 'last_name', 'email',
                  'role', 'register_id', 'pin', 'phone', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = Utilisateur(**validated_data)
        user.set_password(password)
        user.save()
        return user

class MeSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    class Meta:
        model = Utilisateur
        fields = ['id', 'username', 'full_name', 'role', 'register_id', 'email']
