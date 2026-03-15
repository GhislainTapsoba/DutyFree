from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


def broadcast_stock_update(produit_id, stock, mouvement_type=None):
    """Envoie une mise à jour de stock à tous les clients WebSocket."""
    try:
        channel_layer = get_channel_layer()
        if channel_layer is None:
            return
        async_to_sync(channel_layer.group_send)(
            'stock_updates',
            {
                'type': 'stock_update',
                'produit_id': produit_id,
                'stock': stock,
                'mouvement': mouvement_type,
            }
        )
    except Exception:
        pass  # Ne pas bloquer si Redis/Channels indisponible


def broadcast_alert(message, level='warning', produit_id=None):
    try:
        channel_layer = get_channel_layer()
        if channel_layer is None:
            return
        async_to_sync(channel_layer.group_send)(
            'stock_updates',
            {'type': 'alert', 'level': level, 'message': message, 'produit_id': produit_id}
        )
    except Exception:
        pass


@receiver(post_save, sender='stock.MouvementStock')
def on_mouvement_stock(sender, instance, created, **kwargs):
    if not created:
        return
    produit = instance.produit
    broadcast_stock_update(produit.id, produit.stock, instance.type_mouvement)
    # Alerte rupture
    if produit.stock <= produit.stock_min:
        broadcast_alert(
            f"Stock critique : {produit.nom} ({produit.stock} unités restantes)",
            level='danger',
            produit_id=produit.id,
        )
    elif produit.stock <= produit.stock_min * 1.5:
        broadcast_alert(
            f"Stock faible : {produit.nom} ({produit.stock} unités)",
            level='warning',
            produit_id=produit.id,
        )
