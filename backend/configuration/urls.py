from django.urls import path
from .views import ConfigurationView

urlpatterns = [
    path('', ConfigurationView.as_view()),
]
