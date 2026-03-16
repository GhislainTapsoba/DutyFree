from rest_framework import serializers
from .models import Fournisseur, Categorie, Produit, Sommier, MouvementStock, CommandeFournisseur, LigneCommande

class CategorieSerializer(serializers.ModelSerializer):
    nombre_produits = serializers.ReadOnlyField()
    
    class Meta:
        model = Categorie
        fields = '__all__'

class FournisseurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fournisseur
        fields = '__all__'

class ProduitSerializer(serializers.ModelSerializer):
    statut_stock = serializers.ReadOnlyField()
    fournisseur_nom = serializers.CharField(source='fournisseur.nom', read_only=True)
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    photo_url = serializers.ReadOnlyField()

    class Meta:
        model = Produit
        fields = '__all__'

class ProduitListSerializer(serializers.ModelSerializer):
    statut_stock = serializers.ReadOnlyField()
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    photo_url = serializers.ReadOnlyField()
    class Meta:
        model = Produit
        fields = ['id', 'code', 'code_barres', 'nom', 'nom_en', 'categorie', 'categorie_nom',
                  'prix_xof', 'prix_eur', 'prix_usd', 'stock', 'stock_min',
                  'stock_max', 'unite', 'statut_stock', 'fournisseur', 'photo_url']

class SommierSerializer(serializers.ModelSerializer):
    quantite_restante = serializers.ReadOnlyField()
    taux_apurement = serializers.ReadOnlyField()
    produit_nom = serializers.CharField(source='produit.nom', read_only=True)

    class Meta:
        model = Sommier
        fields = '__all__'

class MouvementStockSerializer(serializers.ModelSerializer):
    produit_nom = serializers.CharField(source='produit.nom', read_only=True)
    utilisateur_nom = serializers.CharField(source='utilisateur.full_name', read_only=True)

    class Meta:
        model = MouvementStock
        fields = '__all__'
        read_only_fields = ['stock_avant', 'stock_apres', 'date']

class LigneCommandeSerializer(serializers.ModelSerializer):
    montant_total = serializers.ReadOnlyField()
    produit_nom = serializers.CharField(source='produit.nom', read_only=True)
    class Meta:
        model = LigneCommande
        fields = '__all__'

class CommandeFournisseurSerializer(serializers.ModelSerializer):
    lignes = LigneCommandeSerializer(many=True, read_only=True)
    montant_total = serializers.ReadOnlyField()
    fournisseur_nom = serializers.CharField(source='fournisseur.nom', read_only=True)

    class Meta:
        model = CommandeFournisseur
        fields = '__all__'
