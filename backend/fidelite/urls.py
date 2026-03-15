from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CarteFideliteViewSet

router = DefaultRouter()
router.register('', CarteFideliteViewSet, basename='fidelite')
urlpatterns = [path('', include(router.urls))]
