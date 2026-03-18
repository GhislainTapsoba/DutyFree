from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VenteViewSet, DonneesPassagersViewSet

router = DefaultRouter()
router.register('passagers', DonneesPassagersViewSet, basename='passagers')
router.register('', VenteViewSet, basename='vente')
urlpatterns = [path('', include(router.urls))]
