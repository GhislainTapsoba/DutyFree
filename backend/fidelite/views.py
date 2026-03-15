from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import CarteFidelite, MouvementFidelite
from .serializers import CarteFideliteSerializer, CarteFideliteListSerializer, MouvementFideliteSerializer
from configuration.models import Configuration
import random, string


def generer_numero():
    prefix = 'DF'
    suffix = ''.join(random.choices(string.digits, k=8))
    return f'{prefix}{suffix}'


class CarteFideliteViewSet(viewsets.ModelViewSet):
    queryset = CarteFidelite.objects.all()
    search_fields = ['numero', 'nom', 'prenom', 'email', 'telephone']
    ordering_fields = ['points', 'niveau', 'date_inscription', 'nom']

    def get_serializer_class(self):
        if self.action == 'list':
            return CarteFideliteListSerializer
        return CarteFideliteSerializer

    def perform_create(self, serializer):
        numero = generer_numero()
        while CarteFidelite.objects.filter(numero=numero).exists():
            numero = generer_numero()
        serializer.save(numero=numero)

    @action(detail=False, methods=['get'], url_path='par_numero')
    def par_numero(self, request):
        numero = request.query_params.get('numero', '').strip().upper()
        if not numero:
            return Response({'error': 'Paramètre numero requis'}, status=400)
        try:
            carte = CarteFidelite.objects.get(numero=numero, actif=True)
            return Response(CarteFideliteSerializer(carte).data)
        except CarteFidelite.DoesNotExist:
            return Response({'error': 'Carte non trouvée'}, status=404)

    @action(detail=True, methods=['post'], url_path='ajouter_points')
    def ajouter_points(self, request, pk=None):
        carte = self.get_object()
        cfg = Configuration.get()
        montant_xof = float(request.data.get('montant_xof', 0))
        reference = request.data.get('reference', '')

        points_gagnes = round(montant_xof * float(cfg.points_par_xof), 2)
        solde_avant = float(carte.points)
        carte.points = round(float(carte.points) + points_gagnes, 2)
        carte.derniere_visite = timezone.now()
        carte.update_niveau()
        carte.save()

        MouvementFidelite.objects.create(
            carte=carte,
            type_mouvement='gain',
            points=points_gagnes,
            solde_avant=solde_avant,
            solde_apres=float(carte.points),
            reference_vente=reference,
            montant_achat_xof=montant_xof,
            operateur=request.user,
        )
        return Response({'points_gagnes': points_gagnes, 'nouveau_solde': float(carte.points), 'niveau': carte.niveau})

    @action(detail=True, methods=['post'], url_path='utiliser_points')
    def utiliser_points(self, request, pk=None):
        carte = self.get_object()
        cfg = Configuration.get()
        points_a_utiliser = float(request.data.get('points', 0))

        if points_a_utiliser > float(carte.points):
            return Response({'error': 'Solde insuffisant'}, status=400)

        valeur_xof = round(points_a_utiliser * float(cfg.valeur_point_xof), 2)
        solde_avant = float(carte.points)
        carte.points = round(float(carte.points) - points_a_utiliser, 2)
        carte.save()

        MouvementFidelite.objects.create(
            carte=carte,
            type_mouvement='utilisation',
            points=-points_a_utiliser,
            solde_avant=solde_avant,
            solde_apres=float(carte.points),
            operateur=request.user,
        )
        return Response({'points_utilises': points_a_utiliser, 'valeur_xof': valeur_xof, 'nouveau_solde': float(carte.points)})

    @action(detail=False, methods=['get'], url_path='statistiques')
    def statistiques(self, request):
        total = CarteFidelite.objects.filter(actif=True).count()
        by_niveau = {
            'bronze': CarteFidelite.objects.filter(actif=True, niveau='bronze').count(),
            'silver': CarteFidelite.objects.filter(actif=True, niveau='silver').count(),
            'gold': CarteFidelite.objects.filter(actif=True, niveau='gold').count(),
        }
        from django.db.models import Sum
        total_points = CarteFidelite.objects.filter(actif=True).aggregate(Sum('points'))['points__sum'] or 0
        return Response({'total_cartes': total, 'by_niveau': by_niveau, 'total_points_en_circulation': float(total_points)})
