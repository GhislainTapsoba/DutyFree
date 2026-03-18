import { useBackofficeStore } from '../store/backofficeStore';
import { Download, UserPlus, Shield, Settings2, FileSpreadsheet, FileText, RefreshCw } from 'lucide-react';

const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n));

export function UtilisateursPage() {
  const roleColors: Record<string, string> = { admin: 'badge-gold', superviseur: 'badge-up', caissier: 'badge-neutral' };
  const users: Array<{ id: number; name: string; email: string; role: string; lastLogin: string; status: string }> = []; // TODO: Fetch from API when available

  return (
    <div className="fade-in" style={{ padding: '36px 40px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 36 }}>
        <div className="section-label" style={{ marginBottom: 6 }}>Accès & Sécurité</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <h1 className="serif" style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)' }}>Utilisateurs</h1>
          <button className="btn btn-primary" style={{ gap: 6 }}><UserPlus size={13} /> Nouvel utilisateur</button>
        </div>
        <hr className="rule" style={{ marginTop: 16 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, marginBottom: 28, background: 'var(--border)' }}>
        {[
          { label: 'Administrateurs', value: users.filter(u => u.role === 'admin').length, icon: <Shield size={14} /> },
          { label: 'Superviseurs', value: users.filter(u => u.role === 'superviseur').length, icon: <Shield size={14} /> },
          { label: 'Caissiers', value: users.filter(u => u.role === 'caissier').length, icon: <Shield size={14} /> },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--surface)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="section-label" style={{ marginBottom: 4 }}>{k.label}</div>
              <div className="mono" style={{ fontSize: 26, fontWeight: 500 }}>{k.value}</div>
            </div>
            <span style={{ color: 'var(--text-2)' }}>{k.icon}</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Dernière connexion</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-2)' }}>
                      {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span style={{ fontWeight: 500 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ fontSize: 12, color: 'var(--text-2)' }}>{u.email}</td>
                <td><span className={`badge ${roleColors[u.role]}`}>{u.role}</span></td>
                <td className="mono" style={{ fontSize: 11, color: 'var(--text-2)' }}>
                  {new Date(u.lastLogin).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td><span className="badge badge-up">{u.status}</span></td>
                <td>
                  <button style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 3, padding: '4px 10px', fontSize: 11, color: 'var(--text-2)', cursor: 'pointer' }}>
                    Modifier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ExportsPage() {
  const exports = [
    { title: 'Rapport journalier des ventes', desc: 'CA, tickets, ticket moyen par heure et par vendeur', icon: <FileSpreadsheet size={18} />, format: 'Excel' },
    { title: 'Rapport mensuel complet', desc: 'Toutes les métriques du mois en cours et comparaison M-1', icon: <FileSpreadsheet size={18} />, format: 'Excel' },
    { title: 'Rapport DJBC — Sommiers', desc: 'État des sommiers douaniers pour transmission à la DJBC', icon: <FileText size={18} />, format: 'PDF' },
    { title: 'Mix des ventes par produit', desc: 'Top ventes, quantités, CA par article sur la période', icon: <FileSpreadsheet size={18} />, format: 'Excel' },
    { title: 'Journal des paiements', desc: 'Tous les encaissements détaillés par mode et devise', icon: <FileSpreadsheet size={18} />, format: 'Excel' },
    { title: 'Taux de capture passagers', desc: 'Ratio tickets / passagers (données aéroport requises)', icon: <FileText size={18} />, format: 'PDF' },
    { title: 'Duplicata de tickets', desc: 'Réédition des tickets sur une période, vendeur, ou numéro', icon: <FileText size={18} />, format: 'PDF' },
    { title: 'Rapport de stock', desc: 'Mouvements, ruptures, valorisation du stock', icon: <FileSpreadsheet size={18} />, format: 'Excel' },
  ];

  return (
    <div className="fade-in" style={{ padding: '36px 40px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 36 }}>
        <div className="section-label" style={{ marginBottom: 6 }}>Extraction de données</div>
        <h1 className="serif" style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)' }}>Exports & Rapports</h1>
        <hr className="rule" style={{ marginTop: 16 }} />
      </div>

      {/* Date range */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, alignItems: 'center', background: 'var(--surface)', padding: '16px 20px', border: '1px solid var(--border)', borderRadius: 4 }}>
        <div className="section-label">Période :</div>
        <input type="date" className="input" defaultValue="2025-06-01" style={{ fontSize: 12 }} />
        <span style={{ color: 'var(--text-2)', fontSize: 13 }}>→</span>
        <input type="date" className="input" defaultValue="2025-06-15" style={{ fontSize: 12 }} />
        <select className="select" style={{ fontSize: 12 }}>
          <option>Toutes caisses</option>
          <option>CAISSE-01</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {exports.map(e => (
          <div key={e.title} className="card" style={{ padding: '20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ padding: 10, background: 'var(--surface)', borderRadius: 4, color: 'var(--text)', flexShrink: 0 }}>
              {e.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 14 }}>{e.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 12, lineHeight: 1.5 }}>{e.desc}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 12, gap: 5 }}>
                  <Download size={11} /> {e.format}
                </button>
                <span style={{ display: 'flex', alignItems: 'center', fontSize: 10, color: 'var(--text-2)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{e.format}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PassagersPage() {
  const { tauxCapture } = useBackofficeStore();
  const passengerData = tauxCapture; // Use data from API

  return (
    <div className="fade-in" style={{ padding: '36px 40px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 36 }}>
        <div className="section-label" style={{ marginBottom: 6 }}>Données externes aéroport</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <h1 className="serif" style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)' }}>Taux de capture</h1>
          <button className="btn btn-outline" style={{ gap: 6, fontSize: 12 }}><RefreshCw size={12} /> Saisir données passagers</button>
        </div>
        <hr className="rule" style={{ marginTop: 16 }} />
      </div>

      <div style={{ padding: '14px 18px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 4, marginBottom: 28, fontSize: 13, color: 'var(--sapphire, #1E3A8A)' }}>
        ℹ Les données de fréquentation passagers sont fournies mensuellement par l'aéroport. Saisie manuelle requise.
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Mois</th>
              <th>Passagers (aéroport)</th>
              <th>Tickets émis</th>
              <th>Taux de capture</th>
              <th>Évolution</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {passengerData.map((p, i) => {
              const prev = i > 0 ? passengerData[i - 1].taux : p.taux;
              const diff = p.taux - prev;
              const monthName = new Date(p.annee, p.mois - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
              return (
                <tr key={`${p.annee}-${p.mois}`}>
                  <td style={{ fontWeight: i === passengerData.length - 1 ? 600 : 400 }}>
                    {monthName} {i === passengerData.length - 1 && <span className="badge badge-gold" style={{ marginLeft: 6 }}>Actuel</span>}
                  </td>
                  <td className="mono">{fmt(p.passagers)}</td>
                  <td className="mono">{p.tickets}</td>
                  <td>
                    <span className="mono" style={{ fontSize: 18, fontWeight: 500 }}>{p.taux}%</span>
                  </td>
                  <td>
                    {i === 0 ? '—' : (
                      <span className={`badge ${diff >= 0 ? 'badge-up' : 'badge-down'}`}>
                        {diff >= 0 ? '+' : ''}{diff.toFixed(1)} pts
                      </span>
                    )}
                  </td>
                  <td>
                    <button style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 3, padding: '4px 10px', fontSize: 11, color: 'var(--text-2)', cursor: 'pointer' }}>
                      Modifier
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

export function ConfigurationPage() {
  return (
    <div className="fade-in" style={{ padding: '36px 40px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 36 }}>
        <div className="section-label" style={{ marginBottom: 6 }}>Paramètres système</div>
        <h1 className="serif" style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)' }}>Configuration</h1>
        <hr className="rule" style={{ marginTop: 16 }} />
      </div>

      {[
        {
          title: 'Taux de change', icon: <Settings2 size={16} />, fields: [
            { label: 'EUR → XOF', value: '655.957' },
            { label: 'USD → XOF', value: '607.50' },
          ]
        },
        {
          title: 'Informations de la boutique', icon: <Settings2 size={16} />, fields: [
            { label: 'Nom', value: 'DJBC Duty Free Ouagadougou' },
            { label: 'NIF', value: 'BF-2024-00123456' },
            { label: 'Adresse', value: 'Aéroport International de Ouagadougou' },
            { label: 'Téléphone', value: '+226 25 30 65 00' },
          ]
        },
        {
          title: 'Message ticket de caisse', icon: <Settings2 size={16} />, fields: [
            { label: 'Message d\'accueil (ligne 1)', value: 'Bienvenue — Welcome' },
            { label: 'Message d\'accueil (ligne 2)', value: 'Zone de transit international' },
            { label: 'Message de politesse', value: 'Merci. Bon voyage — Thank you. Safe travels.' },
          ]
        },
        {
          title: 'Seuils d\'alerte stock', icon: <Settings2 size={16} />, fields: [
            { label: 'Seuil alerte réapprovisionnement', value: '10 unités' },
            { label: 'Délai apurement sommier (jours)', value: '30' },
          ]
        },
      ].map(section => (
        <div key={section.title} className="card" style={{ padding: '24px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--text-2)' }}>{section.icon}</span>
              <div className="serif" style={{ fontSize: 16, fontWeight: 600 }}>{section.title}</div>
            </div>
            <button className="btn btn-outline" style={{ fontSize: 11, padding: '5px 12px' }}>Modifier</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {section.fields.map(f => (
              <div key={f.label} className="card-inset" style={{ padding: '10px 14px' }}>
                <div className="section-label" style={{ marginBottom: 4 }}>{f.label}</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
