from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from .models import Fournisseur, Categorie, Produit, Sommier, MouvementStock, CommandeFournisseur
from .serializers import (FournisseurSerializer, CategorieSerializer, ProduitSerializer, ProduitListSerializer,
                           SommierSerializer, MouvementStockSerializer, CommandeFournisseurSerializer)

class CategorieViewSet(viewsets.ModelViewSet):
    """Gestion des catégories de produits"""
    queryset = Categorie.objects.filter(actif=True)
    serializer_class = CategorieSerializer
    search_fields = ['nom', 'code', 'description']
    ordering_fields = ['nom', 'created_at']

    @action(detail=False, methods=['get'])
    def avec_stats(self, request):
        """Catégories avec statistiques des produits"""
        categories = self.get_queryset()
        data = []
        for cat in categories:
            data.append({
                'id': cat.id,
                'nom': cat.nom,
                'code': cat.code,
                'couleur': cat.couleur,
                'icone': cat.icone,
                'nombre_produits': cat.nombre_produits,
                'description': cat.description
            })
        return Response(data)

class FournisseurViewSet(viewsets.ModelViewSet):
    queryset = Fournisseur.objects.filter(actif=True)
    serializer_class = FournisseurSerializer
    search_fields = ['nom', 'contact', 'pays']

class ProduitViewSet(viewsets.ModelViewSet):
    queryset = Produit.objects.filter(actif=True).select_related('fournisseur', 'categorie')
    search_fields = ['nom', 'code', 'code_barres', 'categorie__nom']
    ordering_fields = ['nom', 'categorie__nom', 'stock', 'prix_xof']

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

    @action(detail=False, methods=['get'])
    def stats(self, request):
        qs = Produit.objects.filter(actif=True)
        from django.db.models import F, Sum, DecimalField, ExpressionWrapper
        
        # Calculate financial valuation mathematically
        valeur = qs.annotate(
            valeur_totale=ExpressionWrapper(F('stock') * F('prix_xof'), output_field=DecimalField())
        ).aggregate(total=Sum('valeur_totale'))['total'] or 0

        return Response({
            'total': qs.count(),
            'ruptures': qs.filter(stock=0).count(),
            'en_alerte': qs.extra(where=['stock <= stock_min']).count(),
            'valeur_stock': valeur,
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

    def create(self, request, *args, **kwargs):
        """Custom create to handle lines"""
        print(f"DEBUG: User authenticated: {request.user.is_authenticated}")
        print(f"DEBUG: User: {request.user}")
        print(f"DEBUG: Request data: {request.data}")
        lignes_data = request.data.pop('lignes', [])
        print(f"DEBUG: Lignes data: {lignes_data}")
        
        # Generate numero and add to data
        import uuid
        numero = f"CMD-{uuid.uuid4().hex[:8].upper()}"
        request.data['numero'] = numero
        
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            print(f"DEBUG: Serializer validated: {serializer.validated_data}")
        except Exception as e:
            print(f"DEBUG: Serializer validation error: {e}")
            raise
        
        # Create the commande first
        commande = serializer.save(created_by=request.user)
        print(f"DEBUG: Commande created: {commande.id}")
        
        # Create the lines
        from .models import LigneCommande
        for i, ligne_data in enumerate(lignes_data):
            print(f"DEBUG: Creating ligne {i}: {ligne_data}")
            ligne = LigneCommande.objects.create(
                commande=commande,
                produit_id=ligne_data['produit'],
                quantite=ligne_data['quantite'],
                prix_unitaire=ligne_data['prix_unitaire']
            )
            print(f"DEBUG: Ligne created: {ligne.id}")
        
        # Return the complete commande with lines
        serializer = self.get_serializer(commande)
        return Response(serializer.data, status=201)

    @action(detail=True, methods=['post'])
    def envoyer(self, request, pk=None):
        """Envoyer la commande au fournisseur (brouillon -> envoyee) avec PDF et email"""
        commande = self.get_object()
        if commande.statut != 'brouillon':
            return Response({'detail': 'Seules les commandes en brouillon peuvent être envoyées'}, status=400)
        
        try:
            # Import des utilitaires
            from .utils import envoyer_commande_email
            
            # Envoi de l'email au fournisseur
            email_envoye = envoyer_commande_email(commande)
            
            # Changement du statut
            commande.statut = 'envoyee'
            commande.save()
            
            serializer = self.get_serializer(commande)
            response_data = serializer.data
            
            # Ajout d'information sur l'envoi d'email
            response_data['email_envoye'] = email_envoye
            if email_envoye:
                response_data['message'] = f"Commande {commande.numero} envoyée par email à {commande.fournisseur.email}"
            else:
                response_data['message'] = f"Commande {commande.numero} marquée comme envoyée, mais l'email n'a pas pu être envoyé"
            
            return Response(response_data)
            
        except Exception as e:
            return Response({'detail': f'Erreur lors de l\'envoi: {str(e)}'}, status=500)

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        """Générer et télécharger le PDF de la commande"""
        commande = self.get_object()
        
        try:
            from .utils import generate_commande_pdf
            from django.http import HttpResponse
            
            # Génération du PDF
            pdf_content = generate_commande_pdf(commande)
            
            # Création de la réponse HTTP
            response = HttpResponse(pdf_content, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="commande_{commande.numero}.pdf"'
            
            return response
            
        except Exception as e:
            return Response({'detail': f'Erreur génération PDF: {str(e)}'}, status=500)

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
