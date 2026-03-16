from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UtilisateurViewSet, MeView, CaissiersPublicView

router = DefaultRouter()
router.register('', UtilisateurViewSet, basename='utilisateur')

urlpatterns = [
    path('me/', MeView.as_view(), name='utilisateur-me'),
    path('caissiers/', CaissiersPublicView.as_view(), name='caissiers-public'),
    path('', include(router.urls)),
]