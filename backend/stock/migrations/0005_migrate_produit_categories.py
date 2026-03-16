from django.db import migrations, models
import django.db.models.deletion

def update_produit_categories(apps, schema_editor):
    """Mettre à jour les produits avec les nouvelles catégories"""
    # Mapping des anciennes valeurs vers les nouvelles IDs
    category_mapping = {
        'alcools': 1,
        'parfums': 2,
        'tabac': 3,
        'cosmetiques': 4,
        'confiserie': 5,
        'accessoires': 6,
        'alimentaire': 7
    }
    
    Produit = apps.get_model('stock', 'Produit')
    for old_code, new_id in category_mapping.items():
        # Utiliser le champ temporaire pour stocker l'ID
        Produit.objects.filter(categorie=old_code).update(temp_categorie_id=new_id)

def update_final_categorie(apps, schema_editor):
    """Copier les données du champ temporaire vers le champ final"""
    Produit = apps.get_model('stock', 'Produit')
    # Copier tous les temp_categorie_id vers categorie_id
    for produit in Produit.objects.all():
        if produit.temp_categorie_id:
            produit.categorie_id = produit.temp_categorie_id
            produit.save()

class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0004_populate_categories'),
    ]

    operations = [
        # Ajouter un champ temporaire pour stocker l'ID de catégorie
        migrations.AddField(
            model_name='produit',
            name='temp_categorie_id',
            field=models.IntegerField(null=True, blank=True),
        ),
        
        # Mettre à jour les données dans le champ temporaire
        migrations.RunPython(update_produit_categories),
        
        # Modifier le champ categorie en ForeignKey
        migrations.AlterField(
            model_name='produit',
            name='categorie',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='produits', to='stock.categorie'),
        ),
        
        # Copier les données du champ temporaire vers le nouveau champ
        migrations.RunPython(update_final_categorie),
        
        # Supprimer le champ temporaire
        migrations.RemoveField(
            model_name='produit',
            name='temp_categorie_id',
        ),
    ]
