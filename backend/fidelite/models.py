from django.db import models
from django.utils import timezone


class CarteFidelite(models.Model):
    NIVEAUX = [
        ('bronze', 'Bronze'),
        ('silver', 'Silver'),
        ('gold', 'Gold'),
    ]
    numero = models.CharField(max_length=20, unique=True, db_index=True)
    nom = models.CharField(max_length=200)
    prenom = models.CharField(max_length=200)
    email = models.EmailField(blank=True)
    telephone = models.CharField(max_length=30, blank=True)
    nationalite = models.CharField(max_length=100, blank=True)
    points = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    niveau = models.CharField(max_length=10, choices=NIVEAUX, default='bronze')
    actif = models.BooleanField(default=True)
    date_inscription = models.DateTimeField(default=timezone.now)
    derniere_visite = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Carte de fidélité'
        ordering = ['-points']

    def __str__(self):
        return f'{self.numero} — {self.nom} {self.prenom} ({self.niveau})'

    def update_niveau(self):
        from configuration.models import Configuration
        cfg = Configuration.get()
        p = float(self.points)
        if p >= cfg.seuil_fidelite_gold:
            self.niveau = 'gold'
        elif p >= cfg.seuil_fidelite_silver:
            self.niveau = 'silver'
        else:
            self.niveau = 'bronze'


class MouvementFidelite(models.Model):
    TYPES = [
        ('gain', 'Gain points'),
        ('utilisation', 'Utilisation points'),
        ('ajustement', 'Ajustement manuel'),
        ('expiration', 'Expiration'),
    ]
    carte = models.ForeignKey(CarteFidelite, on_delete=models.CASCADE, related_name='mouvements')
    type_mouvement = models.CharField(max_length=20, choices=TYPES)
    points = models.DecimalField(max_digits=10, decimal_places=2)
    solde_avant = models.DecimalField(max_digits=12, decimal_places=2)
    solde_apres = models.DecimalField(max_digits=12, decimal_places=2)
    reference_vente = models.CharField(max_length=50, blank=True)
    montant_achat_xof = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    note = models.CharField(max_length=200, blank=True)
    date = models.DateTimeField(default=timezone.now)
    operateur = models.ForeignKey(
        'utilisateurs.Utilisateur', on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        ordering = ['-date']
