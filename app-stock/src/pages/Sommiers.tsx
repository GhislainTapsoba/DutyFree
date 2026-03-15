import { useStockStore } from '../store/stockStore';
import { FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

export default function Sommiers() {
  const { sommiers } = useStockStore();

  const actifs = sommiers.filter(s => s.statut === 'actif').length;
  const enCours = sommiers.filter(s => s.statut === 'en_cours').length;
  const apurés = sommiers.filter(s => s.statut === 'apure').length;

  return (
    <div className="animate-in" style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0 }}>Sommiers DJBC</h1>
        <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '4px 0 0' }}>
          Gestion des sommiers d'entreposage fictif — Conformité douanière
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <div className="card" style={{ padding: 20, display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ background: 'rgba(96,165,250,0.15)', padding: 10, borderRadius: 8 }}><FileText size={18} color="var(--c-info)" /></div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', fontFamily: 'IBM Plex Mono, monospace' }}>{actifs}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Sommiers actifs</div>
          </div>
        </div>
        <div className="card" style={{ padding: 20, display: 'flex', gap: 14, alignItems: 'center', borderColor: 'rgba(245,200,66,0.3)' }}>
          <div style={{ background: 'rgba(245,200,66,0.15)', padding: 10, borderRadius: 8 }}><Clock size={18} color="var(--accent)" /></div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent)', fontFamily: 'IBM Plex Mono, monospace' }}>{enCours}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>En cours d'apurement</div>
          </div>
        </div>
        <div className="card" style={{ padding: 20, display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ background: 'rgba(110,231,183,0.15)', padding: 10, borderRadius: 8 }}><CheckCircle size={18} color="var(--c-up)" /></div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--c-up)', fontFamily: 'IBM Plex Mono, monospace' }}>{apurés}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Apurés</div>
          </div>
        </div>
      </div>

      {/* Alert apurement */}
      {enCours > 0 && (
        <div style={{ background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.3)', borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
          <AlertTriangle size={16} color="var(--accent)" />
          <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
            {enCours} sommier(s) nécessitent un apurement imminent — Stock quasi nul
          </span>
        </div>
      )}

      {/* Table sommiers */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-2)' }}>
              {['N° Sommier','Réf DJBC','Produits','Qté Init.','Entrées','Sorties','Restant','Taux','Ouverture','Statut'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-3)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sommiers.map(s => {
              const taux = Math.round((s.quantite_sortie / s.quantite_entree) * 100);
              const isUrgent = s.statut === 'en_cours';
              return (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--surface-2)', background: isUrgent ? 'rgba(245,200,66,0.03)' : 'transparent' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{s.numero}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--text-3)' }}>{s.reference_djbc}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text)', fontWeight: 500 }}>{s.produit_nom}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--text-2)' }}>{fmt(s.quantite_initiale)}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--c-up)' }}>+{fmt(s.quantite_entree)}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--c-down)' }}>-{fmt(s.quantite_sortie)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 14, fontWeight: 700, color: s.quantite_restante === 0 ? 'var(--c-up)' : isUrgent ? 'var(--accent)' : 'var(--text)' }}>
                      {fmt(s.quantite_restante)}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, height: 4, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden', width: 60 }}>
                        <div style={{ height: '100%', width: `${taux}%`, background: taux > 90 ? 'var(--c-down)' : taux > 70 ? 'var(--accent)' : 'var(--c-up)', borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'IBM Plex Mono, monospace' }}>{taux}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 11, color: 'var(--text-3)' }}>
                    {new Date(s.date_ouverture).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge ${s.statut === 'actif' ? 'badge-ok' : s.statut === 'en_cours' ? 'badge-warn' : 'badge-info'}`}>
                      {s.statut === 'actif' ? 'Actif' : s.statut === 'en_cours' ? '⚠ Apurement' : '✓ Apuré'}
                    </span>
                    {s.notes && <div style={{ fontSize: 10, color: 'var(--accent)', marginTop: 3 }}>{s.notes}</div>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Guide réglementaire */}
      <div style={{ marginTop: 24, padding: '16px 20px', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#93C5FD', marginBottom: 6 }}>📋 Rappel réglementaire DJBC</div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.7 }}>
          Les sommiers d'entreposage fictif doivent être apurés dès que le stock atteint zéro.<br />
          Un sommier non apuré avec stock nul constitue une irrégularité douanière passible de sanctions.<br />
          Délai d'apurement maximum : 30 jours après épuisement du stock.
        </div>
      </div>
    </div>
  );
}
