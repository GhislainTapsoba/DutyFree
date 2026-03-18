"""
Django management command to seed database
Run: python manage.py seed_database
"""
from django.core.management.base import BaseCommand
import os
import sys

class Command(BaseCommand):
    help = 'Seed database with initial data'
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🌱 Starting database seeding...'))
        
        try:
            # Exécuter le script de seed
            seed_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'seed_simple.py')
            
            # Lire et exécuter le script
            with open(seed_path, 'r', encoding='utf-8') as f:
                seed_code = f.read()
            
            # Créer un contexte d'exécution
            context = {}
            exec(seed_code, context)
            
            self.stdout.write(self.style.SUCCESS('✅ Database seeded successfully!'))
            self.stdout.write(self.style.SUCCESS('🔐 Login: admin / admin2025'))
            self.stdout.write(self.style.SUCCESS('🌐 Admin: http://localhost:8000/admin/'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error during seeding: {e}'))
            raise
