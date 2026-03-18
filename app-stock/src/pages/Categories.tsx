import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Download, Tag, Package } from 'lucide-react';
import { useStockStore } from '../store/stockStore';

const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n));
const fmtM = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)} M` : fmt(n);

interface Category {
  id: number;
  nom: string;
  description: string;
  code: string;
  couleur: string;
  icone: string;
  actif: boolean;
  nombre_produits: number;
  ca_estime: number;
  created_at: string;
  updated_at: string;
}

export default function CategoriesPage() {
  const { products, fetchProducts } = useStockStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ nom: '', description: '', code: '', couleur: '#3D75C4', icone: 'tag' });

  useEffect(() => {
    // Generate categories from products using their categorie property
    const categoryMap = new Map<string, { count: number; totalCA: number }>();

    products.forEach(product => {
      const catName = product.categorie || 'Non catégorisé';
      const existing = categoryMap.get(catName) || { count: 0, totalCA: 0 };
      categoryMap.set(catName, {
        count: existing.count + 1,
        totalCA: existing.totalCA + (Number(product.prix_xof) || 0)
      });
    });

    const apiCategories: Category[] = Array.from(categoryMap.entries()).map(([name, stats], index) => {
      const categoryName = typeof name === 'string' ? name : 'Non catégorisé';
      return {
        id: index + 1,
        nom: categoryName,
        code: categoryName.substring(0, 8).toUpperCase(),
        description: `${stats.count} produit${stats.count > 1 ? 's' : ''} dans cette catégorie`,
        couleur: ['#EA580C', '#14B8A6', '#F59E0B', '#3B82F6', '#8B5CF6', '#E53E3E'][index % 6],
        icone: 'tag',
        nombre_produits: stats.count,
        ca_estime: stats.totalCA,
        actif: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });

    setCategories(apiCategories);
    setLoading(false);
  }, [products]);

  const filteredCategories = categories.filter(cat =>
    cat.nom.toLowerCase().includes(search.toLowerCase()) ||
    cat.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalProducts = categories.reduce((sum, cat) => sum + (Number(cat.nombre_produits) || 0), 0);
  const totalCA = categories.reduce((sum, cat) => sum + (Number(cat.ca_estime) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      // Update existing category
      setCategories(prev => prev.map(cat =>
        cat.id === editingCategory.id
          ? { ...cat, ...formData }
          : cat
      ));
    } else {
      // Create new category
      const newCategory: Category = {
        id: Date.now(),
        nom: formData.nom,
        description: formData.description,
        code: formData.code,
        couleur: formData.couleur,
        icone: formData.icone,
        actif: true,
        nombre_produits: 0,
        ca_estime: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setCategories(prev => [...prev, newCategory]);
    }

    setShowCreateModal(false);
    setEditingCategory(null);
    setFormData({ nom: '', description: '', code: '', couleur: '#3D75C4', icone: 'tag' });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      nom: category.nom,
      description: category.description,
      code: category.code,
      couleur: category.couleur,
      icone: category.icone
    });
    setShowCreateModal(true);
  };

  const handleDelete = (category: Category) => {
    if (confirm(`Supprimer la catégorie "${category.nom}" ?`)) {
      setCategories(prev => prev.filter(cat => cat.id !== category.id));
    }
  };

  const handleToggleActive = (category: Category) => {
    setCategories(prev => prev.map(cat =>
      cat.id === category.id ? { ...cat, actif: !cat.actif } : cat
    ));
  };

  return (
    <div className="animate-in" style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div className="section-label" style={{ marginBottom: 6 }}>Gestion du catalogue</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <h1 className="serif" style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)' }}>Catégories</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline" style={{ gap: 6, fontSize: 12 }}>
              <Download size={12} /> Exporter
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
              style={{ gap: 6, fontSize: 12 }}
            >
              <Plus size={12} /> Nouvelle catégorie
            </button>
          </div>
        </div>
        <hr className="rule" style={{ marginTop: 16 }} />
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent)', marginBottom: 8 }}>
            {categories.length}
          </div>
          <div className="section-label">Catégories</div>
        </div>
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
            {totalProducts}
          </div>
          <div className="section-label">Produits totaux</div>
        </div>
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--c-info)', marginBottom: 8 }}>
            {categories.filter(cat => cat.actif).length}
          </div>
          <div className="section-label">Actives</div>
        </div>
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--c-up)', marginBottom: 8 }}>
            {fmtM(totalCA)} XOF
          </div>
          <div className="section-label">CA estimé</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input
              type="text"
              placeholder="Rechercher une catégorie..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: 40,
                paddingRight: 16,
                height: 44,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 14,
                color: 'var(--text)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-3)' }}>
          Chargement des catégories...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filteredCategories.map((category, index) => (
            <div key={category.id} className="card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: category.couleur + '18',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Tag size={18} color={category.couleur} />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{category.nom}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                      {category.code} · {category.nombre_produits} produits
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => handleEdit(category)}
                    className="btn btn-ghost"
                    style={{ padding: '6px 8px', fontSize: 11 }}
                    title="Modifier"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => handleToggleActive(category)}
                    className="btn btn-ghost"
                    style={{
                      padding: '6px 8px',
                      fontSize: 11,
                      color: category.actif ? 'var(--c-up)' : 'var(--text-3)',
                      background: category.actif ? 'var(--c-up-dim)' : 'transparent'
                    }}
                    title={category.actif ? "Désactiver" : "Activer"}
                  >
                    {category.actif ? '✓' : '○'}
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    className="btn btn-ghost"
                    style={{ padding: '6px 8px', fontSize: 11, color: 'var(--c-down)' }}
                    title="Supprimer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <div className="section-label" style={{ marginBottom: 4 }}>Produits</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', fontFamily: 'IBM Plex Mono, monospace' }}>
                    {category.nombre_produits}
                  </div>
                </div>
                <div>
                  <div className="section-label" style={{ marginBottom: 4 }}>Code</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', fontFamily: 'IBM Plex Mono, monospace' }}>
                    {category.code}
                  </div>
                </div>
              </div>

              {/* Description */}
              {category.description && (
                <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.4, marginBottom: 16 }}>
                  {category.description}
                </div>
              )}

              {/* Color Preview */}
              <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span className="section-label" style={{ fontSize: 11 }}>Couleur</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{category.couleur}</span>
                </div>
                <div style={{
                  height: 6,
                  background: 'var(--surface-3)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div
                    style={{
                      height: '100%',
                      width: '100%',
                      background: category.couleur,
                      borderRadius: 3,
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>

              {/* Status Badge */}
              <div style={{ position: 'absolute', top: 12, right: 12 }}>
                <span
                  className={`badge ${category.actif ? 'badge-up' : 'badge-gray'}`}
                  style={{ fontSize: 10 }}
                >
                  {category.actif ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            width: '100%',
            maxWidth: 500,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingCategory(null);
                  setFormData({ nom: '', description: '', code: '', couleur: '#3D75C4', icone: 'tag' });
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 4 }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                  Nom de la catégorie *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={e => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                  placeholder="Ex: Alcools, Parfums..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    fontSize: 14,
                    color: 'var(--text)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                  Code
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={e => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Code court (3 lettres)"
                  maxLength={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    fontSize: 14,
                    color: 'var(--text)',
                    outline: 'none',
                    boxSizing: 'border-box',
                    textTransform: 'uppercase'
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description optionnelle de la catégorie..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    fontSize: 14,
                    color: 'var(--text)',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                  Couleur
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['#EA580C', '#14B8A6', '#F59E0B', '#3B82F6', '#8B5CF6', '#E53E3E'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, couleur: color }))}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 6,
                        border: formData.couleur === color ? '2px solid var(--accent)' : '1px solid var(--border)',
                        background: color,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingCategory(null);
                    setFormData({ nom: '', description: '', code: '', couleur: '#3D75C4', icone: 'tag' });
                  }}
                  className="btn btn-outline"
                  style={{ padding: '8px 20px' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!formData.nom.trim()}
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', opacity: formData.nom.trim() ? 1 : 0.6 }}
                >
                  {editingCategory ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
