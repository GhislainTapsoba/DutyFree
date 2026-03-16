from rest_framework import serializers
from .models import CarteFidelite, MouvementFidelite


class MouvementFideliteSerializer(serializers.ModelSerializer):
    class Meta:
        model = MouvementFidelite
        fields = '__all__'
        read_only_fields = ['solde_avant', 'solde_apres', 'operateur']


class CarteFideliteSerializer(serializers.ModelSerializer):
    mouvements = MouvementFideliteSerializer(many=True, read_only=True)
    nom_complet = serializers.SerializerMethodField()
    numero = serializers.CharField(read_only=True)  # ← ajouter cette ligne

    class Meta:
        model = CarteFidelite
        fields = '__all__'

    def get_nom_complet(self, obj):
        return f'{obj.prenom} {obj.nom}'.strip()


class CarteFideliteListSerializer(serializers.ModelSerializer):
    nom_complet = serializers.SerializerMethodField()

    class Meta:
        model = CarteFidelite
        fields = ['id', 'numero', 'nom', 'prenom', 'nom_complet', 'email',
                  'telephone', 'nationalite', 'points', 'niveau', 'actif',
                  'date_inscription', 'derniere_visite']

    def get_nom_complet(self, obj):
        return f'{obj.prenom} {obj.nom}'.strip()
