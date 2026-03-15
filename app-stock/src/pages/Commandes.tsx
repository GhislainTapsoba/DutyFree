import { useStockStore } from '../store/stockStore';
import { Plus, ShoppingCart } from 'lucide-react';

const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

export default function Commandes() {
  const { orders } = useStockStore();
  return (
    <div className="animate-in" style={{ padding: 32 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:'#fff', margin:0 }}>Commandes fournisseurs</h1>
          <p style={{ fontSize:12, color:'var(--text-3)', margin:'4px 0 0' }}>Bons de commande et bordereaux de réception</p>
        </div>
        <button style={{ display:'flex', alignItems:'center', gap:6, background:'var(--accent)', border:'none', borderRadius:8, padding:'8px 16px', color:'var(--bg)', fontSize:12, fontWeight:700, cursor:'pointer' }}>
          <Plus size={13} /> Nouvelle commande
        </button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {orders.map(o => (
          <div key={o.id} className="card" style={{ padding:24 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:'#fff' }}>{o.fournisseur_nom}</div>
                <div style={{ fontSize:11, color:'var(--text-3)', marginTop:2, fontFamily:'IBM Plex Mono, monospace' }}>{o.id} · {new Date(o.created_at).toLocaleDateString('fr-FR')}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <span className={`badge ${o.statut==='validee'?'badge-ok':o.statut==='envoyee'?'badge-warn':o.statut==='recue'?'badge-info':'badge-info'}`}>{o.statut}</span>
                <div style={{ fontSize:14, fontWeight:700, color:'var(--accent)', fontFamily:'IBM Plex Mono, monospace', marginTop:6 }}>{fmt(o.montant_total)} {o.devise}</div>
              </div>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--surface-2)' }}>
                  {['Produit','Qté','Prix unit.','Total'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding:'6px 0', color:'var(--text-3)', fontSize:11, fontWeight:600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {o.lignes.map((item, i) => (
                  <tr key={i}>
                    <td style={{ padding:'8px 0', color:'var(--text)' }}>{item.produit_nom}</td>
                    <td style={{ padding:'8px 0', color:'var(--text-2)', fontFamily:'IBM Plex Mono, monospace' }}>{item.quantite}</td>
                    <td style={{ padding:'8px 0', color:'var(--text-2)', fontFamily:'IBM Plex Mono, monospace' }}>{fmt(item.prix_unitaire)}</td>
                    <td style={{ padding:'8px 0', color:'var(--accent)', fontFamily:'IBM Plex Mono, monospace', fontWeight:600 }}>{fmt(item.quantite * item.prix_unitaire)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {o.notes && (
              <div style={{ marginTop:12, padding:'8px 12px', background:'rgba(245,200,66,0.06)', borderRadius:6, fontSize:11, color:'var(--accent)' }}>
                📝 {o.notes}
              </div>
            )}
            <div style={{ marginTop:12, display:'flex', gap:8 }}>
              {o.statut === 'brouillon' && <button style={{ background:'var(--accent)', border:'none', borderRadius:6, padding:'7px 14px', color:'var(--bg)', fontSize:11, fontWeight:700, cursor:'pointer' }}>Envoyer au fournisseur</button>}
              {o.statut === 'envoyee' && <button style={{ background:'var(--c-up)', border:'none', borderRadius:6, padding:'7px 14px', color:'#fff', fontSize:11, fontWeight:700, cursor:'pointer' }}>Enregistrer réception</button>}
              <button style={{ background:'transparent', border:'1px solid var(--border-2)', borderRadius:6, padding:'7px 14px', color:'var(--text-2)', fontSize:11, cursor:'pointer' }}>Voir détails</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
