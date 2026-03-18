"""
Script de données initiales
Exécuter avec : python manage.py shell < seed.py
"""
import os
import django
from datetime import date, timedelta
from django.utils import timezone
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from utilisateurs.models import Utilisateur
from stock.models import Fournisseur, Produit, Sommier, CommandeFournisseur, LigneCommande, MouvementStock, Categorie
from fidelite.models import CarteFidelite, MouvementFidelite
from configuration.models import Configuration


def seed_users():
    print("🌱 Seeding users...")
    
    if not Utilisateur.objects.filter(username='admin').exists():
        Utilisateur.objects.create_superuser(
            username='admin', 
            password='admin2025',
            first_name='Admin', 
            last_name='Koné',
            email='admin@djbc-df.bf', 
            role='admin'
        )
        print("✓ Admin créé (admin / admin2025)")

    users_data = [
        dict(username='aminata', first_name='Aminata', last_name='Sawadogo', role='caissier', register_id='CAISSE-01', pin='1234'),
        dict(username='issouf', first_name='Issouf', last_name='Compaoré', role='caissier', register_id='CAISSE-02', pin='5678'),
        dict(username='fatoumata', first_name='Fatoumata', last_name='Traoré', role='caissier', register_id='CAISSE-03', pin='4321'),
        dict(username='marie', first_name='Marie', last_name='Ouédraogo', role='superviseur', register_id='SUP-01', pin='9999'),
    ]
    
    created_count = 0
    for u in users_data:
        if not Utilisateur.objects.filter(username=u['username']).exists():
            user = Utilisateur(**u, email=f"{u['username']}@djbc-df.bf")
            user.set_password('dutyfree2025')
            user.save()
            created_count += 1
    
    print(f"✓ {created_count} utilisateurs créés")
    return created_count


def seed_configuration():
    print("🌱 Seeding configuration...")
    
    cfg = Configuration.get()
    cfg.nom_boutique = 'DJBC Duty Free Ouagadougou'
    cfg.nif = 'BF-2024-00123456'
    cfg.adresse = 'Aéroport International de Ouagadougou'
    cfg.telephone = '+226 25 30 65 00'
    cfg.taux_eur_xof = 655.957
    cfg.taux_usd_xof = 607.50
    cfg.message_ticket = "Merci de votre visite et à bientôt!"
    cfg.alerte_stock_min = True
    cfg.seuil_alerte_stock = 10
    cfg.save()
    
    print('✅ Configuration seedée')
    return 1


def seed_suppliers():
    print("🌱 Seeding suppliers...")
    
    fournisseurs = [
        dict(nom='LVMH Distribution', contact='Jean-Paul Martin', email='jp.martin@lvmh.com', pays='France', telephone='+33145678901'),
        dict(nom='Rémy Cointreau', contact='Sophie Durand', email='s.durand@remycointreau.com', pays='France', telephone='+33156789012'),
        dict(nom='Philip Morris International', contact='Mark Johnson', email='m.johnson@pmi.com', pays='Suisse', telephone='+41227938000'),
        dict(nom='Diageo Africa', contact='Kwame Asante', email='k.asante@diageo.com', pays='Ghana', telephone='+233302680000'),
    ]
    
    f_objs = {}
    created_count = 0
    for f in fournisseurs:
        obj, created = Fournisseur.objects.get_or_create(nom=f['nom'], defaults=f)
        f_objs[f['nom']] = obj
        if created:
            created_count += 1
    
    print(f"✓ {created_count} fournisseurs créés")
    return f_objs, created_count


def seed_products():
    print("🌱 Seeding products...")
    try:
        f_lvmh = Fournisseur.objects.get(nom='LVMH Distribution')
        f_remy = Fournisseur.objects.get(nom='Rémy Cointreau')
        f_pmi = Fournisseur.objects.get(nom='Philip Morris International')
        f_diageo = Fournisseur.objects.get(nom='Diageo Africa')
    except Fournisseur.DoesNotExist:
        print("❌ Suppliers not found. Run seed_suppliers first.")
        return 0
    
    cat_alcools, _ = Categorie.objects.get_or_create(nom='alcools', defaults={'code': 'ALC'})
    cat_parfums, _ = Categorie.objects.get_or_create(nom='parfums', defaults={'code': 'PAR'})
    cat_tabac, _ = Categorie.objects.get_or_create(nom='tabac', defaults={'code': 'TAB'})
    cat_cosmetiques, _ = Categorie.objects.get_or_create(nom='cosmetiques', defaults={'code': 'COS'})
    cat_confiserie, _ = Categorie.objects.get_or_create(nom='confiserie', defaults={'code': 'CON'})
    cat_accessoires, _ = Categorie.objects.get_or_create(nom='accessoires', defaults={'code': 'ACC'})
    
    produits = [
        dict(code='ALC-001', code_barres='3014260001233', nom='Hennessy VS 70cl', nom_en='Hennessy VS 70cl', categorie=cat_alcools, fournisseur=f_lvmh, prix_xof=18500, prix_eur=28.20, prix_usd=30.50, stock=48, stock_min=10, stock_max=100, unite='bouteille'),
        dict(code='ALC-002', code_barres='3014260001240', nom='Moët & Chandon Brut 75cl', nom_en='Moet & Chandon Brut 75cl', categorie=cat_alcools, fournisseur=f_lvmh, prix_xof=29000, prix_eur=44.20, prix_usd=47.80, stock=7, stock_min=10, stock_max=60, unite='bouteille'),
        dict(code='PAR-001', code_barres='3346846436419', nom='Dior Sauvage EDP 100ml', nom_en='Dior Sauvage EDP 100ml', categorie=cat_parfums, fournisseur=f_lvmh, prix_xof=52000, prix_eur=79.30, prix_usd=85.60, stock=23, stock_min=5, stock_max=50, unite='flacon'),
        dict(code='ALC-003', code_barres='3035050050322', nom='Rémy Martin VSOP 70cl', nom_en='Remy Martin VSOP 70cl', categorie=cat_alcools, fournisseur=f_remy, prix_xof=24000, prix_eur=36.60, prix_usd=39.50, stock=2, stock_min=8, stock_max=60, unite='bouteille'),
        dict(code='ALC-004', code_barres='3035050167153', nom='Cointreau Triple Sec 70cl', nom_en='Cointreau Triple Sec 70cl', categorie=cat_alcools, fournisseur=f_remy, prix_xof=16000, prix_eur=24.40, prix_usd=26.30, stock=0, stock_min=5, stock_max=40, unite='bouteille'),
        dict(code='TAB-001', code_barres='4019474001011', nom='Marlboro Red x20', nom_en='Marlboro Red x20', categorie=cat_tabac, fournisseur=f_pmi, prix_xof=2800, prix_eur=4.30, prix_usd=4.60, stock=120, stock_min=30, stock_max=300, unite='paquet'),
        dict(code='TAB-002', code_barres='4019474001028', nom='Parliament Aqua Blue x20', nom_en='Parliament Aqua Blue x20', categorie=cat_tabac, fournisseur=f_pmi, prix_xof=3200, prix_eur=4.90, prix_usd=5.30, stock=85, stock_min=20, stock_max=200, unite='paquet'),
        dict(code='ALC-005', code_barres='5000267023656', nom='Johnnie Walker Black 70cl', nom_en='Johnnie Walker Black 70cl', categorie=cat_alcools, fournisseur=f_diageo, prix_xof=22000, prix_eur=33.60, prix_usd=36.20, stock=15, stock_min=12, stock_max=80, unite='bouteille'),
        dict(code='ALC-006', code_barres='5000267023663', nom='Baileys Original 70cl', nom_en='Baileys Original 70cl', categorie=cat_alcools, fournisseur=f_diageo, prix_xof=13500, prix_eur=20.60, prix_usd=22.20, stock=9, stock_min=10, stock_max=50, unite='bouteille'),
        dict(code='PAR-002', code_barres='3346846416701', nom='Chanel N°5 EDP 50ml', nom_en='Chanel No.5 EDP 50ml', categorie=cat_parfums, fournisseur=f_lvmh, prix_xof=68000, prix_eur=103.70, prix_usd=112.00, stock=9, stock_min=4, stock_max=30, unite='flacon'),
        dict(code='CON-001', code_barres='7622210100320', nom='Toblerone 360g', nom_en='Toblerone 360g', categorie=cat_confiserie, fournisseur=f_lvmh, prix_xof=4500, prix_eur=6.90, prix_usd=7.40, stock=40, stock_min=10, stock_max=100, unite='boîte'),
        dict(code='ACC-001', code_barres='5060597920016', nom='Lunettes Ray-Ban Aviator', nom_en='Ray-Ban Aviator Sunglasses', categorie=cat_accessoires, fournisseur=f_lvmh, prix_xof=85000, prix_eur=129.60, prix_usd=139.90, stock=6, stock_min=2, stock_max=20, unite='paire'),
        dict(code='COS-001', code_barres='3605970006501', nom='Lancôme La Vie Est Belle 100ml', nom_en='Lancome La Vie Est Belle 100ml', categorie=cat_cosmetiques, fournisseur=f_lvmh, prix_xof=61000, prix_eur=93.00, prix_usd=100.50, stock=11, stock_min=4, stock_max=30, unite='flacon'),
        dict(code='TAB-003', code_barres='4019474001035', nom='Camel Blue x20', nom_en='Camel Blue x20', categorie=cat_tabac, fournisseur=f_pmi, prix_xof=2600, prix_eur=4.00, prix_usd=4.30, stock=55, stock_min=15, stock_max=150, unite='paquet'),
        dict(code='CON-002', code_barres='4000539103060', nom='Haribo Goldbären 200g', nom_en='Haribo Gold Bears 200g', categorie=cat_confiserie, fournisseur=f_lvmh, prix_xof=1800, prix_eur=2.70, prix_usd=3.00, stock=60, stock_min=15, stock_max=120, unite='unité'),
    ]
    
    created_count = 0
    for p in produits:
        obj, created = Produit.objects.get_or_create(code=p['code'], defaults=p)
        if created:
            created_count += 1
    
    print(f"✓ {created_count} produits créés")
    return created_count


def seed_sommiers():
    print("🌱 Seeding sommiers...")
    try:
        p_hennessy = Produit.objects.get(code='ALC-001')
        p_remy = Produit.objects.get(code='ALC-003')
        p_marlboro = Produit.objects.get(code='TAB-001')
        p_dior = Produit.objects.get(code='PAR-001')
    except Produit.DoesNotExist:
        print("❌ Products not found. Run seed_products first.")
        return 0
    
    sommiers = [
        dict(numero='SOM-2024-001', reference_djbc='REF-DJBC-2024-001', produit=p_hennessy, quantite_initiale=200, quantite_entree=200, quantite_sortie=152, date_ouverture=date(2024,1,15), statut='actif'),
        dict(numero='SOM-2024-002', reference_djbc='REF-DJBC-2024-002', produit=p_remy, quantite_initiale=80, quantite_entree=80, quantite_sortie=78, date_ouverture=date(2024,2,1), statut='en_cours', notes='Apurement imminent'),
        dict(numero='SOM-2024-003', reference_djbc='REF-DJBC-2024-003', produit=p_marlboro, quantite_initiale=1000, quantite_entree=500, quantite_sortie=295, date_ouverture=date(2024,3,10), statut='actif'),
        dict(numero='SOM-2024-004', reference_djbc='REF-DJBC-2024-004', produit=p_hennessy, quantite_initiale=150, quantite_entree=150, quantite_sortie=126, date_ouverture=date(2024,4,5), statut='actif'),
        dict(numero='SOM-2023-012', reference_djbc='REF-DJBC-2023-012', produit=p_dior, quantite_initiale=80, quantite_entree=80, quantite_sortie=80, date_ouverture=date(2023,11,1), date_apurement=date(2024,5,30), statut='apuré'),
    ]
    
    created_count = 0
    for s in sommiers:
        obj, created = Sommier.objects.get_or_create(numero=s['numero'], defaults=s)
        if created:
            created_count += 1
    
    print(f"✓ {created_count} sommiers créés")
    return created_count


def seed_orders():
    print("🌱 Seeding orders...")
    try:
        f_remy = Fournisseur.objects.get(nom='Rémy Cointreau')
        f_lvmh = Fournisseur.objects.get(nom='LVMH Distribution')
        p_remy = Produit.objects.get(code='ALC-003')
        p_cointreau = Produit.objects.get(code='ALC-004')
        p_moet = Produit.objects.get(code='ALC-002')
    except (Fournisseur.DoesNotExist, Produit.DoesNotExist):
        print("❌ Suppliers or products not found. Run seed_suppliers and seed_products first.")
        return 0
    
    orders = [
        dict(numero='CMD-2025-045', fournisseur=f_remy, statut='envoyee', devise='XOF', frais_approche=45000, notes='Urgence rupture Cointreau', date_attendue=timezone.now().date(), created_at=timezone.now()),
        dict(numero='CMD-2025-040', fournisseur=f_lvmh, statut='brouillon', devise='XOF', frais_approche=30000, notes='', date_attendue=None, created_at=timezone.now()),
    ]
    
    created_orders = 0
    order_objs = []
    
    for order_data in orders:
        order, created = CommandeFournisseur.objects.get_or_create(numero=order_data['numero'], defaults=order_data)
        if created:
            created_orders += 1
        order_objs.append(order)
    
    lines_data = [
        dict(commande=order_objs[0], produit=p_remy, quantite=30, prix_unitaire=24000),
        dict(commande=order_objs[0], produit=p_cointreau, quantite=20, prix_unitaire=16000),
        dict(commande=order_objs[1], produit=p_moet, quantite=24, prix_unitaire=29000),
    ]
    
    created_lines = 0
    for line_data in lines_data:
        line, created = LigneCommande.objects.get_or_create(
            commande=line_data['commande'],
            produit=line_data['produit'],
            defaults=line_data
        )
        if created:
            created_lines += 1
    
    print(f"✓ {created_orders} commandes créées")
    print(f"✓ {created_lines} lignes de commande créées")
    return created_orders + created_lines


def seed_movements():
    print("🌱 Seeding movements...")
    try:
        p_hennessy = Produit.objects.get(code='ALC-001')
        p_moet = Produit.objects.get(code='ALC-002')
        p_cointreau = Produit.objects.get(code='ALC-004')
        p_remy = Produit.objects.get(code='ALC-003')
        p_marlboro = Produit.objects.get(code='TAB-001')
        
        som1 = Sommier.objects.get(numero='SOM-2024-001')
        som2 = Sommier.objects.get(numero='SOM-2024-002')
        som3 = Sommier.objects.get(numero='SOM-2024-003')
        
        admin = Utilisateur.objects.get(username='admin')
        aminata = Utilisateur.objects.get(username='aminata')
    except (Produit.DoesNotExist, Sommier.DoesNotExist, Utilisateur.DoesNotExist):
        print("❌ Required objects not found. Run other seeds first.")
        return 0
    
    movements = [
        dict(produit=p_hennessy, type_mouvement='entree', quantite=24, motif='Réception commande CMD-2025-045', utilisateur=admin, sommier=som1, date=timezone.now()),
        dict(produit=p_moet, type_mouvement='sortie', quantite=3, motif='Ventes journée', utilisateur=aminata, sommier=som1, date=timezone.now()),
        dict(produit=p_cointreau, type_mouvement='sortie', quantite=5, motif='Ventes', utilisateur=aminata, sommier=som2, date=timezone.now()),
        dict(produit=p_remy, type_mouvement='ajustement', quantite=-1, motif='Casse inventaire', utilisateur=admin, sommier=som2, date=timezone.now()),
        dict(produit=p_marlboro, type_mouvement='entree', quantite=100, motif='Réception commande CMD-2025-040', utilisateur=admin, sommier=som3, date=timezone.now()),
    ]
    
    created_count = 0
    for m in movements:
        MouvementStock.objects.create(**m)
        created_count += 1
    
    print(f"✓ {created_count} mouvements créés")
    return created_count


def seed_fidelite():
    print("🌱 Seeding loyalty cards...")
    cartes = [
        {'numero': 'DF00000001', 'nom': 'Diallo', 'prenom': 'Aminata', 'email': 'aminata@example.com', 'nationalite': 'Burkina Faso', 'points': 1250, 'niveau': 'gold'},
        {'numero': 'DF00000002', 'nom': 'Ouédraogo', 'prenom': 'Bertrand', 'email': '', 'nationalite': 'Côte d\'Ivoire', 'points': 620, 'niveau': 'silver'},
        {'numero': 'DF00000003', 'nom': 'Traoré', 'prenom': 'Fatimata', 'email': 'ftraoré@example.com', 'nationalite': 'Mali', 'points': 85, 'niveau': 'bronze'},
        {'numero': 'DF00000004', 'nom': 'Konaté', 'prenom': 'Ibrahim', 'email': '', 'nationalite': 'Sénégal', 'points': 310, 'niveau': 'bronze'},
        {'numero': 'DF00000005', 'nom': 'Sawadogo', 'prenom': 'Marie', 'email': 'msawadogo@example.com', 'nationalite': 'Burkina Faso', 'points': 780, 'niveau': 'silver'},
    ]
    
    created_count = 0
    for c in cartes:
        carte, created = CarteFidelite.objects.get_or_create(numero=c['numero'], defaults=c)
        if created:
            created_count += 1
    
    print(f"✅ {created_count} cartes fidélité seedées")
    return created_count


def seed_sales_data():
    print("🌱 Seeding sales data...")
    daily_sales = []
    base_date = date.today() - timedelta(days=29)
    for i in range(30):
        current_date = base_date + timedelta(days=i)
        is_weekend = current_date.weekday() in [5, 6]
        base_ca = 850000 + random.randint(-200000, 400000)
        daily_sales.append({
            'date': current_date,
            'ca': int(base_ca * (1.4 if is_weekend else 1)),
            'tickets': int((base_ca / 28000) * (1.3 if is_weekend else 1)),
            'passagers': int(280 + random.randint(-50, 120))
        })
    category_performance = [
        {'category': 'Alcools', 'ca': 4250000, 'tickets': 148, 'part': 38},
        {'category': 'Parfums', 'ca': 3180000, 'tickets': 67, 'part': 28},
        {'category': 'Tabac', 'ca': 1620000, 'tickets': 312, 'part': 14},
        {'category': 'Cosmétiques', 'ca': 980000, 'tickets': 23, 'part': 9},
        {'category': 'Confiserie', 'ca': 560000, 'tickets': 198, 'part': 5},
        {'category': 'Accessoires', 'ca': 420000, 'tickets': 8, 'part': 4},
        {'category': 'Alimentaire', 'ca': 210000, 'tickets': 44, 'part': 2},
    ]
    payment_methods = [
        {'method': 'Espèces XOF', 'amount': 3800000, 'pct': 34},
        {'method': 'Carte bancaire', 'amount': 4600000, 'pct': 41},
        {'method': 'Espèces EUR', 'amount': 1800000, 'pct': 16},
        {'method': 'Mobile Money', 'amount': 620000, 'pct': 6},
        {'method': 'Espèces USD', 'amount': 400000, 'pct': 3},
    ]
    cashier_performance = [
        {'name': 'Aminata Sawadogo', 'register': 'CAISSE-01', 'ca': 4820000, 'tickets': 187, 'moyenne': 25775, 'heures': 176},
        {'name': 'Issouf Compaoré', 'register': 'CAISSE-02', 'ca': 4110000, 'tickets': 162, 'moyenne': 25370, 'heures': 168},
        {'name': 'Fatoumata Traoré', 'register': 'CAISSE-03', 'ca': 2290000, 'tickets': 93, 'moyenne': 24624, 'heures': 88},
    ]
    print(f"✓ {len(daily_sales)} jours de ventes générés")
    print(f"✓ {len(category_performance)} catégories de produits")
    print(f"✓ {len(payment_methods)} méthodes de paiement")
    print(f"✓ {len(cashier_performance)} performances caissiers")
    return len(daily_sales) + len(category_performance) + len(payment_methods) + len(cashier_performance)


def run_all_seeds():
    print("🚀 Starting complete database seeding...")
    print("=" * 50)
    
    total_created = 0
    try:
        total_created += seed_users()
        print()
        total_created += seed_configuration()
        print()
        f_objs, suppliers_count = seed_suppliers()
        total_created += suppliers_count
        print()
        total_created += seed_products()
        print()
        total_created += seed_sommiers()
        print()
        total_created += seed_orders()
        print()
        total_created += seed_movements()
        print()
        total_created += seed_fidelite()
        print()
        total_created += seed_sales_data()
        print()
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        return False
    
    print("=" * 50)
    print("✅ Database seeding completed successfully!")
    print(f"📊 Total records created: {total_created}")
    print()
    print("🔐 Login credentials:")
    print("   → Admin : admin / admin2025")
    print("   → Users : username / dutyfree2025")
    print()
    print("🌐 Access URLs:")
    print("   → Admin : http://localhost:8000/admin/")
    print("   → API   : http://localhost:8000/api/")
    return True


if __name__ == "__main__":
    run_all_seeds()
