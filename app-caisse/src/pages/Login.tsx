import { useState, useEffect } from 'react';
import { useCaisseStore } from '../store/caisseStore';
import { Delete, ShoppingCart } from 'lucide-react';

interface User {
  id: number;
  username: string;
  full_name: string;
  role: string;
  register_id: string;
}

export default function Login() {
  const { loginWithApi } = useCaisseStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<User | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load cashiers from API (public endpoint for login screen)
    const loadCashiers = async () => {
      try {
        // Use direct fetch without auth for public cashiers list
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/utilisateurs/caissiers/`);
        if (!response.ok) {
          throw new Error('Failed to fetch cashiers');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error('Failed to load cashiers:', err);
        // Fallback to empty array - user will need to enter credentials manually
      } finally {
        setLoading(false);
      }
    };
    loadCashiers();
  }, []);

  const add = (n: string) => { if (pin.length < 6) setPin(p => p + n); };
  const del = () => setPin(p => p.slice(0, -1));
  const submit = async () => {
    if (!sel || pin.length < 4) return;
    setError(''); setSubmitting(true);
    const ok = await loginWithApi(sel.username, pin);
    setSubmitting(false);
    if (!ok) { setError('PIN incorrect'); setPin(''); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 44, height: 44, background: 'var(--accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <ShoppingCart size={20} color="#0C0D11" />
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>Duty Free DJBC</div>
        <div className="section-label" style={{ marginTop: 3 }}>Caisse · Ouagadougou</div>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: 380, padding: '24px 22px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)', fontSize: 12 }}>
            Chargement des caissiers...
          </div>
        ) : !sel ? (
          <>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 14, textAlign: 'center', fontWeight: 500 }}>
              {users.length > 0 ? 'Sélectionnez votre profil' : 'Aucun caissier disponible'}
            </div>
            {users.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {users.map(u => (
                  <button key={u.id} onClick={() => setSel(u)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 7, cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'border-color 0.14s' }}
                    onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--accent-border)')}
                    onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-dim)', border: '1.5px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>
                      {u.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{u.full_name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'IBM Plex Mono,monospace' }}>{u.register_id}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Profil sélectionné */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 22 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-dim)', border: '1.5px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>
                {sel.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{sel.full_name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'IBM Plex Mono,monospace' }}>{sel.register_id}</div>
              </div>
              <button onClick={() => { setSel(null); setPin(''); setError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>
                Changer
              </button>
            </div>

            {/* Points PIN */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 9, marginBottom: 6 }}>
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: i < pin.length ? 'var(--accent)' : 'var(--border-2)', border: `1.5px solid ${i < pin.length ? 'var(--accent)' : 'var(--border-2)'}`, transition: 'all 0.12s' }} />
              ))}
            </div>
            {error && <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--c-down)', marginBottom: 6, fontWeight: 600 }}>{error}</div>}

            {/* Numpad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7, marginTop: 18 }}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(n => (
                <button key={n} onClick={() => add(n)}
                  style={{ padding: '16px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', fontSize: 18, fontFamily: 'IBM Plex Mono,monospace', fontWeight: 500, cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseOver={e => (e.currentTarget.style.background = 'var(--surface-3)')}
                  onMouseOut={e => (e.currentTarget.style.background = 'var(--surface-2)')}>
                  {n}
                </button>
              ))}
              <button onClick={del} style={{ padding: '16px', background: 'var(--c-down-dim)', border: '1px solid var(--c-down-bd)', borderRadius: 6, color: 'var(--c-down)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Delete size={16} />
              </button>
              <button onClick={() => add('0')} style={{ padding: '16px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', fontSize: 18, fontFamily: 'IBM Plex Mono,monospace', fontWeight: 500, cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseOver={e => (e.currentTarget.style.background = 'var(--surface-3)')}
                onMouseOut={e => (e.currentTarget.style.background = 'var(--surface-2)')}>0</button>
              <button onClick={submit} disabled={submitting || pin.length < 4}
                style={{ padding: '16px', background: pin.length >= 4 ? 'var(--accent)' : 'var(--surface-2)', border: 'none', borderRadius: 6, color: pin.length >= 4 ? '#0C0D11' : 'var(--text-3)', fontSize: 13, fontWeight: 700, cursor: pin.length >= 4 ? 'pointer' : 'not-allowed', transition: 'background 0.18s,color 0.18s' }}>
                {submitting ? '…' : 'OK'}
              </button>
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: 20, fontSize: 11, color: 'var(--text-3)', textAlign: 'center' }}>
        DJBC — Direction Générale des Douanes · Burkina Faso
      </div>
    </div>
  );
}
