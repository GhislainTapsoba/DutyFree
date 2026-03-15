# DutyFree Manager — Backend Django REST API

API REST complète pour la gestion du Duty Free DJBC, Aéroport de Ouagadougou.

## Démarrage rapide (Windows)

### Prérequis
- Python 3.10+ — https://python.org
- pip

### Installation
```bash
cd backend

# Créer un environnement virtuel (recommandé)
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Installer les dépendances
pip install django djangorestframework django-cors-headers djangorestframework-simplejwt Pillow python-decouple

# Migrations
python manage.py migrate

# Données initiales (produits, utilisateurs, sommiers)
python seed.py

# Démarrer le serveur
python manage.py runserver
```

→ API disponible sur **http://localhost:8000/api/**  
→ Admin Django sur **http://localhost:8000/admin/**  
→ Login admin : `admin` / `admin2025`

---

## Endpoints API

### Authentification
| Méthode | URL | Description |
|---|---|---|
| POST | `/api/auth/token/` | Obtenir token JWT |
| POST | `/api/auth/token/refresh/` | Rafraîchir token |

### Utilisateurs
| Méthode | URL | Description |
|---|---|---|
| GET | `/api/utilisateurs/` | Liste utilisateurs |
| POST | `/api/utilisateurs/` | Créer utilisateur |
| GET | `/api/utilisateurs/me/` | Profil connecté |

### Stock
| Méthode | URL | Description |
|---|---|---|
| GET | `/api/stock/produits/` | Liste produits |
| GET | `/api/stock/produits/?search=hennessy` | Recherche |
| GET | `/api/stock/produits/par_barcode/?code=3014260001233` | Par code-barres |
| GET | `/api/stock/produits/alertes/` | Ruptures & alertes |
| GET | `/api/stock/produits/stats/` | KPIs stock |
| GET/POST | `/api/stock/mouvements/` | Mouvements de stock |
| GET | `/api/stock/sommiers/` | Liste sommiers DJBC |
| GET | `/api/stock/sommiers/a_apurer/` | Sommiers urgents |
| GET/POST | `/api/stock/fournisseurs/` | Fournisseurs |
| GET/POST | `/api/stock/commandes/` | Commandes fournisseurs |
| POST | `/api/stock/commandes/{id}/recevoir/` | Réceptionner commande |

### Ventes
| Méthode | URL | Description |
|---|---|---|
| GET | `/api/ventes/` | Liste ventes |
| POST | `/api/ventes/` | Créer vente (caisse) |
| POST | `/api/ventes/sync_offline/` | Sync ventes offline (batch) |
| GET | `/api/ventes/dashboard/` | KPIs backoffice |
| GET | `/api/ventes/taux_capture/` | Taux capture passagers |
| GET/POST | `/api/ventes/passagers/` | Données passagers aéroport |

---

## Authentification (exemple)

```bash
# 1. Obtenir le token
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin2025"}'

# 2. Utiliser le token
curl http://localhost:8000/api/stock/produits/ \
  -H "Authorization: Bearer <access_token>"
```

---

## Structure du projet

```
backend/
├── backend/          ← Configuration principale (settings, urls)
├── utilisateurs/     ← Modèle User custom + authentification
├── stock/            ← Produits, Sommiers, Mouvements, Commandes
├── ventes/           ← Ventes, Paiements, Taux de capture
├── media/            ← Photos produits
├── db.sqlite3        ← Base de données (dev)
├── seed.py           ← Données initiales
├── .env              ← Variables d'environnement
└── manage.py
```

---

## Pour la production

Remplacer SQLite par PostgreSQL dans `.env` :
```
DATABASE_URL=postgresql://user:password@localhost/dutyfree_db
```
Installer : `pip install psycopg2-binary`

