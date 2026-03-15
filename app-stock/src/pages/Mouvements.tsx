import { useStockStore } from '../store/stockStore';
import { ArrowUpRight, ArrowDownRight, SlidersHorizontal } from 'lucide-react';

export default function Mouvements() {
  const { movements } = useStockStore();
  return (
    <div className="animate-in" style={{ padding: 32 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:'#fff', margin:0 }}>Mouvements de stock</h1>
          <p style={{ fontSize:12, color:'var(--text-3)', margin:'4px 0 0' }}>Historique complet des entrées, sorties et ajustements</p>
        </div>
        <button style={{ display:'flex', alignItems:'center', gap:6, background:'var(--surface-2)', border:'1px solid var(--border-2)', borderRadius:8, padding:'8px 14px', color:'var(--text-2)', fontSize:12, cursor:'pointer' }}>
          <SlidersHorizontal size={13} /> Filtres
        </button>
      </div>
      <div className="card" style={{ overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
          <thead>
            <tr style={{ borderBottom:'1px solid var(--surface-2)' }}>
              {['Date','Produit','Type','Avant','Mouvement','Après','Motif','Opérateur'].map(h => (
                <th key={h} style={{ textAlign:'left', padding:'12px 16px', color:'var(--text-3)', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {movements.map(m => (
              <tr key={m.id} style={{ borderBottom:'1px solid var(--surface-2)' }}>
                <td style={{ padding:'12px 16px', fontFamily:'IBM Plex Mono, monospace', fontSize:11, color:'var(--text-3)' }}>
                  {new Date(m.date).toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}
                </td>
                <td style={{ padding:'12px 16px', fontWeight:600, color:'var(--text)' }}>{m.produit_nom}</td>
                <td style={{ padding:'12px 16px' }}>
                  <span className={`badge ${m.type_mouvement==='entree'?'badge-ok':m.type_mouvement==='sortie'?'badge-info':'badge-warn'}`}>
                    {m.type_mouvement}
                  </span>
                </td>
                <td style={{ padding:'12px 16px', fontFamily:'IBM Plex Mono, monospace', fontSize:12, color:'var(--text-2)' }}>{m.stock_avant}</td>
                <td style={{ padding:'12px 16px' }}>
                  <span style={{ display:'flex', alignItems:'center', gap:3, fontFamily:'IBM Plex Mono, monospace', fontSize:13, fontWeight:700, color: m.type_mouvement==='entree'?'var(--c-up)':'var(--c-down)' }}>
                    {m.type_mouvement==='entree' ? <ArrowUpRight size={13}/> : <ArrowDownRight size={13}/>}
                    {m.type_mouvement==='entree'?'+':'-'}{Math.abs(m.quantite)}
                  </span>
                </td>
                <td style={{ padding:'12px 16px', fontFamily:'IBM Plex Mono, monospace', fontSize:12, color:'var(--text)', fontWeight:600 }}>{m.stock_apres}</td>
                <td style={{ padding:'12px 16px', color:'var(--text-3)' }}>{m.motif}</td>
                <td style={{ padding:'12px 16px', color:'var(--text-2)' }}>{m.utilisateur_nom}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
