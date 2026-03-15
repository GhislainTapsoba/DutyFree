import { useState, useEffect } from 'react';
import { stockApi, type Produit } from '../api';
import { ProductImage } from '../components/ProductImage';
import { TrendingUp, TrendingDown, Minus, Download, Search, Filter } from 'lucide-react';

const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n));
const fmtM = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(2)} M` : fmt(n);

export function ProduitsPage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProduits();
  }, []);

  const loadProduits = async () => {
    try {
      const response = await stockApi.produits.list();
      setProduits(response.results);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProduits = produits.filter(p => 
    p.nom.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in" style={{ padding: '36px 40px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 36 }}>
        <div className="section-label" style={{ marginBottom: 6 }}>Gestion des produits</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <h1 className="serif" style={{ fontSize: 32, fontWeight: 700, color: 'var(--slate)' }}>Catalogue produits</h1>
          <button className="btn btn-outline" style={{ gap: 6, fontSize: 12 }}><Download size={12} /> Export</button>
        </div>
        <hr className="rule" style={{ marginTop: 16 }} />
      </div>

      {/* Barre de recherche */}
      <div className="card" style={{ marginBottom: 24, padding: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px 12px 8px 36px', 
                border: '1px solid var(--border)', 
                borderRadius: 6,
                fontSize: 14
              }}
            />
          </div>
          <button className="btn btn-outline" style={{ gap: 6 }}>
            <Filter size={14} /> Filtres
          </button>
        </div>
      </div>

      {/* Tableau des produits */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
            Chargement des produits...
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Stock</th>
                <th>Prix XOF</th>
                <th>Prix EUR</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredProduits.map((produit) => (
                <tr key={produit.id}>
                  <td>
                    <ProductImage 
                      src={produit.photo_url} 
                      alt={produit.nom}
                      size="small"
                    />
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600 }}>{produit.nom}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{produit.code}</div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{produit.categorie}</td>
                  <td>
                    <div className="mono">{produit.stock} {produit.unite}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>Min: {produit.stock_min}</div>
                  </td>
                  <td className="mono" style={{ fontWeight: 500 }}>{fmt(produit.prix_xof)}</td>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{fmt(produit.prix_eur)}</td>
                  <td>
                    {produit.statut_stock === 'rupture' && <span className="badge badge-down" style={{ fontSize: 11 }}>Rupture</span>}
                    {produit.statut_stock === 'critique' && <span className="badge badge-down" style={{ fontSize: 11 }}>Critique</span>}
                    {produit.statut_stock === 'bas' && <span className="badge badge-neutral" style={{ fontSize: 11 }}>Bas</span>}
                    {produit.statut_stock === 'ok' && <span className="badge badge-up" style={{ fontSize: 11 }}>OK</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
