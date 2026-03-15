from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg, F
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from datetime import timedelta
from .models import Vente, DonneesPassagers
from .serializers import (VenteSerializer, VenteListSerializer, VenteCreateSerializer,
                           DonneesPassagersSerializer)

class VenteViewSet(viewsets.ModelViewSet):
    queryset = Vente.objects.select_related('caissier').prefetch_related('lignes__produit', 'paiements').all()
    search_fields = ['numero_ticket', 'caissier__first_name', 'caissier__last_name',
                     'passager_nom', 'vol_reference', 'destination']
    ordering_fields = ['date_locale', 'total', 'caissier__last_name']

    def get_serializer_class(self):
        if self.action == 'create':
            return VenteCreateSerializer
        if self.action == 'list':
            return VenteListSerializer
        return VenteSerializer

    def perform_create(self, serializer):
        serializer.save(caissier=self.request.user)

    @action(detail=False, methods=['post'])
    def sync_offline(self, request):
        """Synchronisation des ventes offline — batch"""
        ventes_data = request.data.get('ventes', [])
        synced, errors = [], []
        for v in ventes_data:
            try:
                # Éviter les doublons
                if not Vente.objects.filter(numero_ticket=v.get('numero_ticket')).exists():
                    ser = VenteCreateSerializer(data={**v, 'synced': True})
                    if ser.is_valid():
                        ser.save(caissier=request.user)
                        synced.append(v.get('numero_ticket'))
                    else:
                        errors.append({'ticket': v.get('numero_ticket'), 'errors': ser.errors})
            except Exception as e:
                errors.append({'ticket': v.get('numero_ticket'), 'error': str(e)})
        return Response({'synced': len(synced), 'errors': errors, 'tickets': synced})

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """KPIs pour le backoffice — vue d'ensemble"""
        today = timezone.now().date()
        month_start = today.replace(day=1)

        qs_month = Vente.objects.filter(date_locale__date__gte=month_start, statut='payee')
        qs_today = Vente.objects.filter(date_locale__date=today, statut='payee')

        ca_month = qs_month.aggregate(total=Sum('total'))['total'] or 0
        ca_today = qs_today.aggregate(total=Sum('total'))['total'] or 0
        tickets_month = qs_month.count()
        tickets_today = qs_today.count()
        ticket_moyen = qs_month.aggregate(avg=Avg('total'))['avg'] or 0

        # CA journalier 30j
        thirty_days_ago = today - timedelta(days=30)
        ca_daily = list(
            Vente.objects.filter(date_locale__date__gte=thirty_days_ago, statut='payee')
            .annotate(jour=TruncDate('date_locale'))
            .values('jour')
            .annotate(ca=Sum('total'), tickets=Count('id'))
            .order_by('jour')
        )

        # CA par catégorie
        from stock.models import Produit
        ca_by_cat = list(
            Vente.objects.filter(date_locale__date__gte=month_start, statut='payee')
            .values('lignes__produit__categorie')
            .annotate(ca=Sum('lignes__total'), tickets=Count('id', distinct=True))
            .order_by('-ca')
        )

        # Par caissier
        ca_by_cashier = list(
            qs_month.values('caissier__first_name', 'caissier__last_name', 'numero_caisse')
            .annotate(ca=Sum('total'), tickets=Count('id'))
            .order_by('-ca')
        )

        return Response({
            'ca_month': ca_month,
            'ca_today': ca_today,
            'tickets_month': tickets_month,
            'tickets_today': tickets_today,
            'ticket_moyen': ticket_moyen,
            'ca_daily': ca_daily,
            'ca_by_categorie': ca_by_cat,
            'ca_by_cashier': ca_by_cashier,
        })

    @action(detail=False, methods=['get'])
    def taux_capture(self, request):
        """Taux de capture mensuel = tickets / passagers"""
        results = []
        for dp in DonneesPassagers.objects.order_by('-annee', '-mois'):
            from django.db.models import Q
            tickets = Vente.objects.filter(
                date_locale__year=dp.annee,
                date_locale__month=dp.mois,
                statut='payee'
            ).count()
            taux = round((tickets / dp.nombre_passagers) * 100, 2) if dp.nombre_passagers else 0
            results.append({
                'annee': dp.annee, 'mois': dp.mois,
                'passagers': dp.nombre_passagers,
                'tickets': tickets, 'taux': taux,
            })
        return Response(results)


class DonneesPassagersViewSet(viewsets.ModelViewSet):
    queryset = DonneesPassagers.objects.all()
    serializer_class = DonneesPassagersSerializer

    def perform_create(self, serializer):
        serializer.save(saisie_par=self.request.user)
