from django.contrib.auth.models import AbstractUser
from django.db import models

class Utilisateur(AbstractUser):
    ROLES = [
        ('admin', 'Administrateur'),
        ('superviseur', 'Superviseur'),
        ('stock_manager', 'Stock Manager'),
        ('caissier', 'Caissier'),
    ]
    role = models.CharField(max_length=20, choices=ROLES, default='caissier')
    register_id = models.CharField(max_length=20, blank=True, verbose_name="Identifiant caisse")
    pin = models.CharField(max_length=6, blank=True, verbose_name="Code PIN caisse")
    phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Utilisateur"
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"

    @property
    def full_name(self):
        return self.get_full_name() or self.username
