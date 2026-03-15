from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from utilisateurs.views import CustomTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/token/', CustomTokenObtainPairView.as_view()),
    path('api/auth/token/refresh/', TokenRefreshView.as_view()),
    path('api/utilisateurs/', include('utilisateurs.urls')),
    path('api/stock/', include('stock.urls')),
    path('api/ventes/', include('ventes.urls')),
    path('api/configuration/', include('configuration.urls')),
    path('api/fidelite/', include('fidelite.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
