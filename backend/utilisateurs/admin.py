from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Utilisateur

@admin.register(Utilisateur)
class UtilisateurAdmin(UserAdmin):
    list_display = ['username', 'full_name', 'role', 'register_id', 'is_active', 'last_login']
    list_filter = ['role', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('Duty Free', {'fields': ('role', 'register_id', 'pin', 'phone')}),
    )
