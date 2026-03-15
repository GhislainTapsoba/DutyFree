import { useStockStore } from '../store/stockStore';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';

export default function Alertes() {
  const { products, sommiers } = useStockStore();

  const ruptures = products.filter(p => p.statut_stock === 'rupture');
  const critiques = products.filter(p => p.statut_stock === 'critique');
  const bas = products.filter(p => p.statut_stock === 'bas');
  const sommiersApurement = sommiers.filter(s => s.statut === 'en_cours');

  const allAlerts = [
    ...ruptures.map(p => ({ id: p.id, level: 'danger' as const, title: `Rupture de stock`, desc: `${p.nom} — Stock à 0 ${p.unite}`, action: 'Commander maintenant' })),
    ...sommiersApurement.map(s => ({ id: s.id, level: 'warn' as const, title: `Apurement sommier requis`, desc: `${s.numero} — ${s.produit_nom} (${s.quantite_restante} restants)`, action: 'Apurer le sommier' })),
    ...critiques.map(p => ({ id: p.id, level: 'warn' as const, title: `Stock critique`, desc: `${p.nom} — ${p.stock} ${p.unite} (min: ${p.stock_min})`, action: 'Lancer commande' })),
    ...bas.map(p => ({ id: p.id, level: 'info' as const, title: `Stock bas`, desc: `${p.nom} — ${p.stock} ${p.unite} (min: ${p.stock_min})`, action: 'Planifier commande' })),
  ];

  return (
    <div className="animate-in" style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0 }}>Centre d'alertes</h1>
        <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '4px 0 0' }}>
          {allAlerts.length} alerte{allAlerts.length > 1 ? 's' : ''} active{allAlerts.length > 1 ? 's' : ''}
        </p>
      </div>

      {allAlerts.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <CheckCircle size={40} color="var(--c-up)" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Aucune alerte active</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>Tous les stocks sont dans les limites normales</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {allAlerts.map((alert, i) => {
            const Icon = alert.level === 'danger' ? AlertCircle : alert.level === 'warn' ? AlertTriangle : Info;
            const colors = { danger: 'var(--c-down)', warn: 'var(--accent)', info: '#93C5FD' };
            const bgs = { danger: 'rgba(239,68,68,0.07)', warn: 'rgba(245,200,66,0.07)', info: 'rgba(96,165,250,0.07)' };
            const borders = { danger: 'rgba(239,68,68,0.25)', warn: 'rgba(245,200,66,0.25)', info: 'rgba(96,165,250,0.25)' };
            return (
              <div key={`${alert.id}-${i}`} style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 20px', background: bgs[alert.level], border:`1px solid ${borders[alert.level]}`, borderRadius:10 }}>
                <Icon size={20} color={colors[alert.level]} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: colors[alert.level] }}>{alert.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{alert.desc}</div>
                </div>
                <button style={{ background: 'transparent', border: `1px solid ${borders[alert.level]}`, borderRadius: 6, padding: '6px 14px', color: colors[alert.level], fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {alert.action}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
