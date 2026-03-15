from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VenteViewSet, DonneesPassagersViewSet

router = DefaultRouter()
router.register('', VenteViewSet, basename='vente')
router.register('passagers', DonneesPassagersViewSet, basename='passagers')
urlpatterns = [path('', include(router.urls))]
