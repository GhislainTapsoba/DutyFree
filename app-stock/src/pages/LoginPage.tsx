import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Eye, EyeOff, Package, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login, loading, error } = useAuthStore();
  const isLoading = loading;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = () => { if (username && password) login(username, password); };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 350, background: 'radial-gradient(ellipse, rgba(245,200,66,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 52, height: 52, background: 'var(--accent)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Package size={24} color="var(--bg)" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.01em' }}>DUTY FREE</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: 4 }}>Aéroport de Ouagadougou · DJBC</div>
        </div>
        <div className="card" style={{ padding: '32px 28px' }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Stock Manager</div>
            <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Connectez-vous pour continuer</div>
          </div>
          {error && <div className="alert alert-red" style={{ marginBottom: 18 }}><AlertCircle size={14} style={{ flexShrink: 0 }} />{error}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="field-label">Identifiant</label>
              <input value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="nom.utilisateur" autoFocus />
            </div>
            <div>
              <label className="field-label">Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="••••••••" style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPwd(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2 }}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={isLoading || !username || !password} className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 22, justifyContent: 'center' }}>
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--text-3)' }}>DJBC — Direction Générale des Douanes · Burkina Faso</div>
      </div>
    </div>
  );
}
