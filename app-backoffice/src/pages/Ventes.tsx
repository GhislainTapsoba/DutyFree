import { useState } from 'react';
import { recentSales } from '../data/mock';
import { Search, Download, Receipt, CreditCard, Banknote, Smartphone, SlidersHorizontal } from 'lucide-react';

const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n));
const fmtM = (n: number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(2)} M` : `${fmt(n)}`;

const METHOD_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  carte:        { icon: <CreditCard size={11}/>,  label: 'Carte',         color: 'var(--c-info)',  bg: 'var(--c-info-dim)' },
  especes:      { icon: <Banknote size={11}/>,    label: 'Espèces',       color: 'var(--c-up)',    bg: 'var(--c-up-dim)' },
  mobile_money: { icon: <Smartphone size={11}/>,  label: 'Mobile Money',  color: 'var(--c-warn)',  bg: 'var(--c-warn-dim)' },
};

export default function Ventes() {
  const [search, setSearch]   = useState('');
  const [caisse, setCaisse]   = useState('');
  const [method, setMethod]   = useState('');

  const filtered = recentSales.filter(s => {
    if (search && !s.id.toLowerCase().includes(search.toLowerCase()) && !s.cashier.toLowerCase().includes(search.toLowerCase()) && !s.passenger?.toLowerCase().includes(search.toLowerCase())) return false;
    if (caisse && !s.cashier.toLowerCase().includes(caisse.toLowerCase())) return false;
    if (method && s.method !== method) return false;
    return true;
  });

  const totalCA   = filtered.reduce((s, v) => s + (v.currency === 'XOF' ? +v.total : +v.total * 655.957), 0);
  const avgTicket = filtered.length ? totalCA / filtered.length : 0;
  const withPass  = filtered.filter(s => s.passenger).length;

  return (
    <div className="fade-in" style={{ padding: '28px 32px', maxWidth: 1440, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div className="section-label" style={{ marginBottom: 5 }}>Transactions</div>
          <h1 style={{ fontFamily: 'Cormorant, Georgia, serif', fontSize: 28, fontWeight: 500, color: 'var(--text)', letterSpacing: '-0.01em' }}>
            Ventes & Tickets
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 7 }}>
          <button className="btn btn-ghost btn-sm" style={{ gap: 5 }}><Download size={12}/> Excel</button>
          <button className="btn btn-ghost btn-sm" style={{ gap: 5 }}><Download size={12}/> PDF</button>
        </div>
      </div>
      <hr className="rule" style={{ marginBottom: 20 }} />

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--border)', borderRadius: 'var(--r)', overflow: 'hidden', marginBottom: 20, border: '1px solid var(--border)' }}>
        {[
          { label: 'CA affiché',       value: fmtM(totalCA) + ' XOF', color: 'var(--gold)' },
          { label: 'Transactions',     value: String(filtered.length)  },
          { label: 'Ticket moyen',     value: fmt(avgTicket) + ' F'    },
          { label: 'Avec passager ID', value: `${withPass} / ${filtered.length}`, color: 'var(--c-info)' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--surface)', padding: '15px 20px' }}>
            <div className="section-label" style={{ marginBottom: 5 }}>{k.label}</div>
            <div className="stat-number-sm" style={{ color: k.color || 'var(--text)' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <SlidersHorizontal size={13} color="var(--text-3)" />
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ticket, caissier, passager…" style={{ paddingLeft: 30 }} />
        </div>
        <select value={caisse} onChange={e => setCaisse(e.target.value)} style={{ width: 160 }}>
          <option value="">Toutes les caisses</option>
          <option value="CAISSE-01">CAISSE-01</option>
          <option value="CAISSE-02">CAISSE-02</option>
        </select>
        <select value={method} onChange={e => setMethod(e.target.value)} style={{ width: 160 }}>
          <option value="">Tous paiements</option>
          <option value="carte">Carte</option>
          <option value="especes">Espèces</option>
          <option value="mobile_money">Mobile Money</option>
        </select>
        {(search || caisse || method) && (
          <button className="btn btn-xs btn-ghost" onClick={() => { setSearch(''); setCaisse(''); setMethod(''); }} style={{ color: 'var(--c-down)' }}>
            Réinitialiser
          </button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>
          {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>N° Ticket</th>
              <th>Date & Heure</th>
              <th>Caissier</th>
              <th style={{ textAlign: 'center' }}>Articles</th>
              <th style={{ textAlign: 'right' }}>Total</th>
              <th>Paiement</th>
              <th>Passager / Vol</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-3)' }}>
                Aucune transaction correspondante
              </td></tr>
            ) : filtered.map(sale => {
              const m = METHOD_CONFIG[sale.method] || METHOD_CONFIG.especes;
              return (
                <tr key={sale.id}>
                  <td>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, fontWeight: 500, color: 'var(--gold)' }}>{sale.id}</span>
                  </td>
                  <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--text-3)' }}>
                    {new Date(sale.date).toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}
                  </td>
                  <td style={{ fontWeight: 500, color: 'var(--text)', fontSize: 12 }}>{sale.cashier}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'var(--text-2)' }}>{sale.items}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                      {sale.currency === 'XOF' ? `${fmt(+sale.total)}` : `€${(+sale.total).toFixed(2)}`}
                    </span>
                    <span style={{ fontSize: 9, color: 'var(--text-3)', marginLeft: 4, fontFamily: 'Space Grotesk, sans-serif' }}>{sale.currency}</span>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 20, fontSize: 11, background: m.bg, color: m.color, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>
                      {m.icon}{m.label}
                    </span>
                  </td>
                  <td style={{ fontSize: 11, color: sale.passenger ? 'var(--c-info)' : 'var(--text-3)', fontFamily: sale.passenger ? 'Space Grotesk, sans-serif' : undefined }}>
                    {sale.passenger || '—'}
                  </td>
                  <td>
                    <button className="btn btn-xs btn-ghost" style={{ gap: 4 }}>
                      <Receipt size={10}/> Ticket
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
