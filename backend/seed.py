"""
Script de données initiales — exécuter avec :
python manage.py shell < seed.py
"""
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from utilisateurs.models import Utilisateur
from stock.models import Fournisseur, Produit, Sommier
from django.utils import timezone

print("🌱 Seeding database...")

# Superuser
if not Utilisateur.objects.filter(username='admin').exists():
    Utilisateur.objects.create_superuser(
        username='admin', password='admin2025',
        first_name='Admin', last_name='Koné',
        email='admin@djbc-df.bf', role='admin'
    )
    print("✓ Admin créé (admin / admin2025)")

# Utilisateurs
users_data = [
    dict(username='aminata', first_name='Aminata', last_name='Sawadogo', role='caissier', register_id='CAISSE-01', pin='1234'),
    dict(username='issouf', first_name='Issouf', last_name='Compaoré', role='caissier', register_id='CAISSE-02', pin='5678'),
    dict(username='fatoumata', first_name='Fatoumata', last_name='Traoré', role='caissier', register_id='CAISSE-03', pin='4321'),
    dict(username='marie', first_name='Marie', last_name='Ouédraogo', role='superviseur', register_id='SUP-01', pin='9999'),
]
for u in users_data:
    if not Utilisateur.objects.filter(username=u['username']).exists():
        user = Utilisateur(**u, email=f"{u['username']}@djbc-df.bf")
        user.set_password('dutyfree2025')
        user.save()
print(f"✓ {len(users_data)} utilisateurs créés")

# Fournisseurs
fournisseurs = [
    dict(nom='LVMH Distribution', contact='Jean-Paul Martin', email='jp.martin@lvmh.com', pays='France', telephone='+33145678901'),
    dict(nom='Rémy Cointreau', contact='Sophie Durand', email='s.durand@remycointreau.com', pays='France', telephone='+33156789012'),
    dict(nom='Philip Morris International', contact='Mark Johnson', email='m.johnson@pmi.com', pays='Suisse', telephone='+41227938000'),
    dict(nom='Diageo Africa', contact='Kwame Asante', email='k.asante@diageo.com', pays='Ghana', telephone='+233302680000'),
]
f_objs = {}
for f in fournisseurs:
    obj, _ = Fournisseur.objects.get_or_create(nom=f['nom'], defaults=f)
    f_objs[f['nom']] = obj
print(f"✓ {len(fournisseurs)} fournisseurs créés")

# Produits
produits = [
    dict(code='ALC-001', code_barres='3014260001233', nom='Hennessy VS 70cl', nom_en='Hennessy VS 70cl', categorie='alcools', fournisseur=f_objs['LVMH Distribution'], prix_xof=18500, prix_eur=28.20, prix_usd=30.50, stock=48, stock_min=10, stock_max=100, unite='bouteille'),
    dict(code='ALC-002', code_barres='3014260001240', nom='Moët & Chandon Brut 75cl', nom_en='Moet & Chandon Brut 75cl', categorie='alcools', fournisseur=f_objs['LVMH Distribution'], prix_xof=29000, prix_eur=44.20, prix_usd=47.80, stock=7, stock_min=10, stock_max=60, unite='bouteille'),
    dict(code='PAR-001', code_barres='3346846436419', nom='Dior Sauvage EDP 100ml', nom_en='Dior Sauvage EDP 100ml', categorie='parfums', fournisseur=f_objs['LVMH Distribution'], prix_xof=52000, prix_eur=79.30, prix_usd=85.60, stock=23, stock_min=5, stock_max=50, unite='flacon'),
    dict(code='ALC-003', code_barres='3035050050322', nom='Rémy Martin VSOP 70cl', nom_en='Remy Martin VSOP 70cl', categorie='alcools', fournisseur=f_objs['Rémy Cointreau'], prix_xof=24000, prix_eur=36.60, prix_usd=39.50, stock=2, stock_min=8, stock_max=60, unite='bouteille'),
    dict(code='ALC-004', code_barres='3035050167153', nom='Cointreau Triple Sec 70cl', nom_en='Cointreau Triple Sec 70cl', categorie='alcools', fournisseur=f_objs['Rémy Cointreau'], prix_xof=16000, prix_eur=24.40, prix_usd=26.30, stock=0, stock_min=5, stock_max=40, unite='bouteille'),
    dict(code='TAB-001', code_barres='4019474001011', nom='Marlboro Red x20', nom_en='Marlboro Red x20', categorie='tabac', fournisseur=f_objs['Philip Morris International'], prix_xof=2800, prix_eur=4.30, prix_usd=4.60, stock=120, stock_min=30, stock_max=300, unite='paquet'),
    dict(code='TAB-002', code_barres='4019474001028', nom='Parliament Aqua Blue x20', nom_en='Parliament Aqua Blue x20', categorie='tabac', fournisseur=f_objs['Philip Morris International'], prix_xof=3200, prix_eur=4.90, prix_usd=5.30, stock=85, stock_min=20, stock_max=200, unite='paquet'),
    dict(code='ALC-005', code_barres='5000267023656', nom='Johnnie Walker Black 70cl', nom_en='Johnnie Walker Black 70cl', categorie='alcools', fournisseur=f_objs['Diageo Africa'], prix_xof=22000, prix_eur=33.60, prix_usd=36.20, stock=15, stock_min=12, stock_max=80, unite='bouteille'),
    dict(code='ALC-006', code_barres='5000267023663', nom='Baileys Original 70cl', nom_en='Baileys Original 70cl', categorie='alcools', fournisseur=f_objs['Diageo Africa'], prix_xof=13500, prix_eur=20.60, prix_usd=22.20, stock=9, stock_min=10, stock_max=50, unite='bouteille'),
    dict(code='PAR-002', code_barres='3346846416701', nom='Chanel N°5 EDP 50ml', nom_en='Chanel No.5 EDP 50ml', categorie='parfums', fournisseur=f_objs['LVMH Distribution'], prix_xof=68000, prix_eur=103.70, prix_usd=112.00, stock=9, stock_min=4, stock_max=30, unite='flacon'),
    dict(code='CON-001', code_barres='7622210100320', nom='Toblerone 360g', nom_en='Toblerone 360g', categorie='confiserie', fournisseur=f_objs['LVMH Distribution'], prix_xof=4500, prix_eur=6.90, prix_usd=7.40, stock=40, stock_min=10, stock_max=100, unite='boîte'),
    dict(code='ACC-001', code_barres='5060597920016', nom='Lunettes Ray-Ban Aviator', nom_en='Ray-Ban Aviator Sunglasses', categorie='accessoires', fournisseur=f_objs['LVMH Distribution'], prix_xof=85000, prix_eur=129.60, prix_usd=139.90, stock=6, stock_min=2, stock_max=20, unite='paire'),
]
for p in produits:
    Produit.objects.get_or_create(code=p['code'], defaults=p)
print(f"✓ {len(produits)} produits créés")

# Sommiers
p_hennessy = Produit.objects.get(code='ALC-001')
p_remy = Produit.objects.get(code='ALC-003')
p_marlboro = Produit.objects.get(code='TAB-001')

from datetime import date
sommiers = [
    dict(numero='SOM-2024-001', reference_djbc='REF-DJBC-2024-001', produit=p_hennessy, quantite_initiale=200, quantite_entree=200, quantite_sortie=152, date_ouverture=date(2024,1,15), statut='actif'),
    dict(numero='SOM-2024-002', reference_djbc='REF-DJBC-2024-002', produit=p_remy, quantite_initiale=80, quantite_entree=80, quantite_sortie=78, date_ouverture=date(2024,2,1), statut='en_cours', notes='Apurement imminent'),
    dict(numero='SOM-2024-003', reference_djbc='REF-DJBC-2024-003', produit=p_marlboro, quantite_initiale=1000, quantite_entree=500, quantite_sortie=295, date_ouverture=date(2024,3,10), statut='actif'),
]
for s in sommiers:
    Sommier.objects.get_or_create(numero=s['numero'], defaults=s)
print(f"✓ {len(sommiers)} sommiers créés")

print("\n✅ Base de données initialisée avec succès !")
print("   → Admin : http://localhost:8000/admin/")
print("   → API   : http://localhost:8000/api/")
print("   → Login : admin / admin2025")


# ── Seed Configuration ────────────────────────────────────────────────
import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from configuration.models import Configuration
cfg = Configuration.get()
cfg.nom_boutique = 'DJBC Duty Free Ouagadougou'
cfg.nif = 'BF-2024-00123456'
cfg.adresse = 'Aéroport International de Ouagadougou'
cfg.telephone = '+226 25 30 65 00'
cfg.taux_eur_xof = 655.957
cfg.taux_usd_xof = 607.50
cfg.save()
print('✅ Configuration seedée')

# ── Seed Cartes Fidélité ──────────────────────────────────────────────
from fidelite.models import CarteFidelite, MouvementFidelite

cartes = [
    {'numero': 'DF00000001', 'nom': 'Diallo', 'prenom': 'Aminata', 'email': 'aminata@example.com', 'nationalite': 'Burkina Faso', 'points': 1250, 'niveau': 'gold'},
    {'numero': 'DF00000002', 'nom': 'Ouédraogo', 'prenom': 'Bertrand', 'email': '', 'nationalite': 'Côte d\'Ivoire', 'points': 620, 'niveau': 'silver'},
    {'numero': 'DF00000003', 'nom': 'Traoré', 'prenom': 'Fatimata', 'email': 'ftraoré@example.com', 'nationalite': 'Mali', 'points': 85, 'niveau': 'bronze'},
    {'numero': 'DF00000004', 'nom': 'Konaté', 'prenom': 'Ibrahim', 'email': '', 'nationalite': 'Sénégal', 'points': 310, 'niveau': 'bronze'},
    {'numero': 'DF00000005', 'nom': 'Sawadogo', 'prenom': 'Marie', 'email': 'msawadogo@example.com', 'nationalite': 'Burkina Faso', 'points': 780, 'niveau': 'silver'},
]

for c in cartes:
    CarteFidelite.objects.get_or_create(numero=c['numero'], defaults=c)

print(f'✅ {len(cartes)} cartes fidélité seedées')
