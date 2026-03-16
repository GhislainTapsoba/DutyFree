from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0002_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Categorie',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nom', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField(blank=True)),
                ('code', models.CharField(blank=True, help_text='Code court pour la catégorie', max_length=20, unique=True)),
                ('couleur', models.CharField(default='#6366f1', help_text="Couleur hexadécimale pour l'interface", max_length=7)),
                ('icone', models.CharField(blank=True, help_text="Nom de l'icône (ex: shopping-bag, bottle)", max_length=50)),
                ('actif', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'Catégorie',
                'verbose_name_plural': 'Catégories',
                'ordering': ['nom'],
            },
        ),
    ]
