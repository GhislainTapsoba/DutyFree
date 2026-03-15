from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from .models import Fournisseur, Produit, Sommier, MouvementStock, CommandeFournisseur
from .serializers import (FournisseurSerializer, ProduitSerializer, ProduitListSerializer,
                           SommierSerializer, MouvementStockSerializer, CommandeFournisseurSerializer)

class FournisseurViewSet(viewsets.ModelViewSet):
    queryset = Fournisseur.objects.filter(actif=True)
    serializer_class = FournisseurSerializer
    search_fields = ['nom', 'contact', 'pays']

class ProduitViewSet(viewsets.ModelViewSet):
    queryset = Produit.objects.filter(actif=True).select_related('fournisseur')
    search_fields = ['nom', 'code', 'code_barres', 'categorie']
    ordering_fields = ['nom', 'categorie', 'stock', 'prix_xof']

    def get_serializer_class(self):
        if self.action == 'list':
            return ProduitListSerializer
        return ProduitSerializer
@action(detail=False, methods=['get'])
def alertes(self, request):
    """Produits en rupture, critique ou stock bas"""
    from django.db.models import F
    ruptures = Produit.objects.filter(actif=True, stock=0)
    critiques = Produit.objects.filter(actif=True, stock__gt=0, stock__lte=F('stock_min') * 0.5)
    bas = Produit.objects.filter(actif=True, stock__gt=0, stock__lte=F('stock_min'))

    return Response({
        'ruptures': ProduitListSerializer(ruptures, many=True).data,
        'critiques': ProduitListSerializer(critiques, many=True).data,
        'bas': ProduitListSerializer(bas, many=True).data,
    })

    def stats(self, request):
        qs = Produit.objects.filter(actif=True)
        return Response({
            'total': qs.count(),
            'ruptures': qs.filter(stock=0).count(),
            'en_alerte': qs.extra(where=['stock <= stock_min']).count(),
            'valeur_stock': qs.aggregate(v=Sum('stock'))['v'] or 0,
        })

    @action(detail=False, methods=['get'])
    def par_barcode(self, request):
        barcode = request.query_params.get('code', '')
        try:
            p = Produit.objects.get(code_barres=barcode, actif=True)
            return Response(ProduitSerializer(p).data)
        except Produit.DoesNotExist:
            return Response({'detail': 'Produit non trouvé'}, status=404)

def models_stock_min_half():
    return []


class SommierViewSet(viewsets.ModelViewSet):
    queryset = Sommier.objects.select_related('produit').all()
    serializer_class = SommierSerializer
    search_fields = ['numero', 'reference_djbc', 'produit__nom']
    ordering_fields = ['date_ouverture', 'statut']

    @action(detail=False, methods=['get'])
    def a_apurer(self, request):
        """Sommiers nécessitant un apurement urgent"""
        sommiers = Sommier.objects.filter(statut='en_cours').select_related('produit')
        return Response(SommierSerializer(sommiers, many=True).data)


class MouvementStockViewSet(viewsets.ModelViewSet):
    queryset = MouvementStock.objects.select_related('produit', 'utilisateur', 'sommier').all()
    serializer_class = MouvementStockSerializer
    search_fields = ['produit__nom', 'type_mouvement', 'motif', 'reference']
    ordering_fields = ['date', 'produit__nom', 'type_mouvement']
    http_method_names = ['get', 'post', 'head', 'options']  # Pas de PUT/DELETE

    def perform_create(self, serializer):
        serializer.save(utilisateur=self.request.user)


class CommandeFournisseurViewSet(viewsets.ModelViewSet):
    queryset = CommandeFournisseur.objects.select_related('fournisseur').prefetch_related('lignes__produit').all()
    serializer_class = CommandeFournisseurSerializer
    search_fields = ['numero', 'fournisseur__nom', 'statut']
    ordering_fields = ['created_at', 'statut', 'fournisseur__nom']

    def perform_create(self, serializer):
        import uuid
        numero = f"CMD-{uuid.uuid4().hex[:8].upper()}"
        serializer.save(created_by=self.request.user, numero=numero)

    @action(detail=True, methods=['post'])
    def recevoir(self, request, pk=None):
        """Transformer la commande en réception et mettre à jour le stock"""
        commande = self.get_object()
        if commande.statut != 'envoyee':
            return Response({'detail': 'Seules les commandes envoyées peuvent être reçues'}, status=400)
        from django.utils import timezone
        commande.statut = 'recue'
        commande.date_reception = timezone.now().date()
        commande.save()
        # Créer les mouvements de stock
        for ligne in commande.lignes.all():
            MouvementStock.objects.create(
                produit=ligne.produit,
                type_mouvement='entree',
                quantite=ligne.quantite,
                motif=f"Réception commande {commande.numero}",
                reference=commande.numero,
                utilisateur=request.user,
            )
        return Response({'detail': 'Commande reçue et stock mis à jour'})
