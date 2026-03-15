from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UtilisateurViewSet, MeView

router = DefaultRouter()
router.register('', UtilisateurViewSet, basename='utilisateur')

urlpatterns = [
    path('me/', MeView.as_view(), name='utilisateur-me'),
    path('', include(router.urls)),
]