from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FournisseurViewSet, ProduitViewSet, SommierViewSet, MouvementStockViewSet, CommandeFournisseurViewSet

router = DefaultRouter()
router.register('fournisseurs', FournisseurViewSet)
router.register('produits', ProduitViewSet)
router.register('sommiers', SommierViewSet)
router.register('mouvements', MouvementStockViewSet)
router.register('commandes', CommandeFournisseurViewSet)
urlpatterns = [path('', include(router.urls))]
