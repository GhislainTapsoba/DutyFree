"""
Script pour télécharger des images par défaut pour les produits
"""
import os
import django
import requests
from io import BytesIO
from PIL import Image
from django.core.files.base import ContentFile

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from stock.models import Produit

# URLs d'images par défaut pour chaque catégorie (plus fiables)
DEFAULT_IMAGES = {
    'alcools': 'https://images.unsplash.com/photo-1551024601-b1e8b1d4d5e2?w=400&h=400&fit=crop',
    'parfums': 'https://images.unsplash.com/photo-1541641660957-5e295b29e0a1?w=400&h=400&fit=crop',
    'tabac': 'https://images.unsplash.com/photo-1574370330212-9f850bd8e1a4?w=400&h=400&fit=crop',
    'cosmetiques': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
    'confiserie': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    'accessoires': 'https://images.unsplash.com/photo-1470302635339-9347943d2c44?w=400&h=400&fit=crop',
    'alimentaire': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
}

# Images spécifiques pour certains produits
PRODUCT_IMAGES = {
    'ALC-001': 'https://images.unsplash.com/photo-1569492817024-2ac5b271e384?w=400&h=400&fit=crop',  # Hennessy
    'ALC-002': 'https://images.unsplash.com/photo-1560473023-5c52a6b777a8?w=400&h=400&fit=crop',  # Moët
    'PAR-001': 'https://images.unsplash.com/photo-1528343266959-44da327113ea?w=400&h=400&fit=crop',  # Dior
    'PAR-002': 'https://images.unsplash.com/photo-1620916566398-39f1696cd5ec?w=400&h=400&fit=crop',  # Chanel
    'TAB-001': 'https://images.unsplash.com/photo-1574370330212-9f850bd8e1a4?w=400&h=400&fit=crop',  # Marlboro
    'TAB-002': 'https://images.unsplash.com/photo-1574370330212-9f850bd8e1a4?w=400&h=400&fit=crop',  # Parliament
}

def download_and_resize_image(url, filename):
    """Télécharge et redimensionne une image"""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        # Ouvrir l'image avec PIL
        img = Image.open(BytesIO(response.content))
        
        # Redimensionner à 400x400 (carré)
        img = img.resize((400, 400), Image.Resampling.LANCZOS)
        
        # Convertir en RGB si nécessaire
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Sauvegarder en mémoire
        buffer = BytesIO()
        img.save(buffer, format='JPEG', quality=85)
        buffer.seek(0)
        
        return ContentFile(buffer.read(), filename)
    except Exception as e:
        print(f"Erreur lors du téléchargement de {url}: {e}")
        return None

def main():
    print("🖼️  Téléchargement des images par défaut pour les produits...")
    
    produits = Produit.objects.filter(photo__isnull=True) | Produit.objects.filter(photo='')
    
    for produit in produits:
        # Utiliser l'image spécifique du produit si disponible, sinon l'image par défaut de la catégorie
        if produit.code in PRODUCT_IMAGES:
            image_url = PRODUCT_IMAGES[produit.code]
        elif produit.categorie in DEFAULT_IMAGES:
            image_url = DEFAULT_IMAGES[produit.categorie]
        else:
            print(f"⚠ Pas d'image par défaut pour la catégorie: {produit.categorie}")
            continue
            
        filename = f"{produit.code.lower().replace('/', '_').replace(' ', '_')}.jpg"
        
        image_file = download_and_resize_image(image_url, filename)
        
        if image_file:
            produit.photo.save(filename, image_file, save=True)
            print(f"✓ Image ajoutée pour {produit.nom} ({produit.categorie})")
        else:
            print(f"✗ Erreur pour {produit.nom}")
    
    print(f"\n✅ Terminé! {produits.count()} produits traités")

if __name__ == '__main__':
    main()
