"""
Script pour créer des images placeholder avec PIL
"""
import os
import django
from PIL import Image, ImageDraw, ImageFont
from django.core.files.base import ContentFile
from io import BytesIO

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from stock.models import Produit

def create_placeholder_image(nom_produit, categorie):
    """Crée une image placeholder avec le nom du produit"""
    # Couleurs par catégorie
    colors = {
        'alcools': (139, 69, 19),      # Brun
        'parfums': (255, 192, 203),    # Rose
        'tabac': (128, 128, 128),      # Gris
        'cosmetiques': (255, 182, 193), # Rose clair
        'confiserie': (255, 215, 0),   # Or
        'accessoires': (70, 130, 180), # Acier
        'alimentaire': (144, 238, 144), # Vert clair
    }
    
    # Créer une image 400x400
    img = Image.new('RGB', (400, 400), colors.get(categorie, (200, 200, 200)))
    draw = ImageDraw.Draw(img)
    
    # Ajouter un cercle au centre
    draw.ellipse([50, 50, 350, 350], fill=(255, 255, 255, 128), outline=(0, 0, 0), width=2)
    
    # Ajouter le nom du produit (tronqué si trop long)
    try:
        # Essayer de trouver une police, sinon utiliser celle par défaut
        font = ImageFont.truetype("arial.ttf", 24)
    except:
        font = ImageFont.load_default()
    
    # Diviser le nom en lignes si nécessaire
    words = nom_produit.split()
    lines = []
    current_line = ""
    
    for word in words:
        test_line = current_line + " " + word if current_line else word
        if len(test_line) <= 20:
            current_line = test_line
        else:
            if current_line:
                lines.append(current_line)
            current_line = word
    
    if current_line:
        lines.append(current_line)
    
    # Dessiner le texte
    y_position = 180
    for line in lines[:3]:  # Maximum 3 lignes
        bbox = draw.textbbox((0, 0), line, font=font)
        text_width = bbox[2] - bbox[0]
        x_position = (400 - text_width) // 2
        draw.text((x_position, y_position), line, fill=(0, 0, 0), font=font)
        y_position += 30
    
    # Ajouter la catégorie en bas
    try:
        cat_font = ImageFont.truetype("arial.ttf", 16)
    except:
        cat_font = ImageFont.load_default()
    
    cat_text = categorie.upper()
    cat_bbox = draw.textbbox((0, 0), cat_text, font=cat_font)
    cat_width = cat_bbox[2] - cat_bbox[0]
    cat_x = (400 - cat_width) // 2
    draw.text((cat_x, 350), cat_text, fill=(100, 100, 100), font=cat_font)
    
    return img

def main():
    print("🎨 Création d'images placeholder pour les produits sans image...")
    
    produits_sans_image = Produit.objects.filter(photo__isnull=True) | Produit.objects.filter(photo='')
    
    for produit in produits_sans_image:
        # Créer l'image placeholder
        img = create_placeholder_image(produit.nom, produit.categorie)
        
        # Sauvegarder en mémoire
        buffer = BytesIO()
        img.save(buffer, format='JPEG', quality=85)
        buffer.seek(0)
        
        # Sauvegarder dans le modèle
        filename = f"{produit.code.lower().replace('/', '_').replace(' ', '_')}_placeholder.jpg"
        produit.photo.save(filename, ContentFile(buffer.read()), save=True)
        
        print(f"✓ Image placeholder créée pour {produit.nom} ({produit.categorie})")
    
    print(f"\n✅ Terminé! {produits_sans_image.count()} images placeholder créées")

if __name__ == '__main__':
    main()
