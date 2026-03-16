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

        print(f"DEBUG: Tentative auth - username: {username}, password: {'*' * len(password) if password else 'None'}")

        # 1. Tentative authentification classique (username/password)
        try:
            from django.contrib.auth import authenticate
            user = authenticate(username=username, password=password)
            print(f"DEBUG: Auth classique résultat: {user}")
        except Exception as e:
            print(f"DEBUG: Exception auth classique: {e}")
            pass

        # 2. Tentative via PIN ou Password avec register_id si échec username
        if not user:
            from django.db.models import Q
            try:
                # Chercher par username OU par register_id (en ignorant la casse et les tirets)
                # Le frontend envoie 'caisse01', on compare avec 'CAISSE-01'
                normalized_username = username.replace('-', '').replace('_', '').upper()
                print(f"DEBUG: Normalized username: {normalized_username}")
                
                user_obj = Utilisateur.objects.filter(
                    Q(username__iexact=username) | 
                    Q(register_id__iexact=username) |
                    Q(register_id__iexact=username.replace('-', '').replace('_', '').upper()) |
                    Q(register_id__iexact=f"CAISSE-{normalized_username.replace('CAISSE', '')}")
                ).first()
                
                print(f"DEBUG: User trouvé: {user_obj}")
                print(f"DEBUG: User actif: {user_obj.is_active if user_obj else 'None'}")
                print(f"DEBUG: PIN de l'user: {user_obj.pin if user_obj else 'None'}")

                if user_obj and user_obj.is_active:
                    # Vérifier soit le password soit le PIN
                    if user_obj.pin == password or user_obj.check_password(password):
                        user = user_obj
                        print(f"DEBUG: Auth réussie via PIN/password")
                    else:
                        print(f"DEBUG: PIN/password incorrect")
            except Exception as e:
                print(f"DEBUG: Exception recherche user: {e}")
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
