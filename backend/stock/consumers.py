import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


class StockConsumer(AsyncWebsocketConsumer):
    """
    WebSocket pour la synchronisation temps réel entre caisses.
    Groupe 'stock_updates' : tous les clients connectés reçoivent
    les mises à jour de stock et les nouvelles ventes.
    """
    GROUP_NAME = 'stock_updates'

    async def connect(self):
        await self.channel_layer.group_add(self.GROUP_NAME, self.channel_name)
        await self.accept()
        # Envoyer le stock initial à la connexion
        stock = await self.get_stock_snapshot()
        await self.send(text_data=json.dumps({'type': 'stock_snapshot', 'data': stock}))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.GROUP_NAME, self.channel_name)

    async def receive(self, text_data):
        """Le client peut envoyer un ping ou demander un refresh."""
        try:
            data = json.loads(text_data)
            if data.get('type') == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
            elif data.get('type') == 'request_snapshot':
                stock = await self.get_stock_snapshot()
                await self.send(text_data=json.dumps({'type': 'stock_snapshot', 'data': stock}))
        except Exception:
            pass

    # ── Handlers pour les messages du groupe ────────────────────────
    async def stock_update(self, event):
        """Reçoit un événement stock_update depuis le groupe et le transmet au WS client."""
        await self.send(text_data=json.dumps({
            'type': 'stock_update',
            'produit_id': event['produit_id'],
            'stock': event['stock'],
            'mouvement': event.get('mouvement'),
        }))

    async def new_sale(self, event):
        """Notifie les backoffices/stocks d'une nouvelle vente."""
        await self.send(text_data=json.dumps({
            'type': 'new_sale',
            'caisse': event['caisse'],
            'total': event['total'],
            'items': event['items'],
        }))

    async def alert(self, event):
        """Alerte rupture de stock."""
        await self.send(text_data=json.dumps({
            'type': 'alert',
            'level': event['level'],
            'message': event['message'],
            'produit_id': event.get('produit_id'),
        }))

    # ── DB helpers ───────────────────────────────────────────────────
    @database_sync_to_async
    def get_stock_snapshot(self):
        from stock.models import Produit
        produits = Produit.objects.values('id', 'code', 'nom', 'stock', 'stock_min')
        return [
            {
                'id':        p['id'],
                'code':      p['code'],
                'nom':       p['nom'],
                'stock':     p['stock'],
                'stock_min': p['stock_min'],
            }
            for p in produits
        ]
