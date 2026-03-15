from django.urls import path
from stock import consumers

websocket_urlpatterns = [
    path('ws/stock/', consumers.StockConsumer.as_asgi()),
]
