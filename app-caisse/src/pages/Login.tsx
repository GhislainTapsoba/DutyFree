import { useState } from 'react';
import { useCaisseStore } from '../store/caisseStore';
import { Delete, ShoppingCart } from 'lucide-react';

const USERS = [
  { name:'Aminata Sawadogo', initials:'AS', registerId:'CAISSE-01', color:'#B8914A' },
  { name:'Issouf Compaoré',  initials:'IC', registerId:'CAISSE-02', color:'#3D75C4' },
  { name:'Fatoumata Traoré', initials:'FT', registerId:'CAISSE-03', color:'#2EAD78' },
];

export default function Login() {
  const { loginWithApi } = useCaisseStore();
  const [sel, setSel] = useState<typeof USERS[0]|null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const add = (n:string) => { if(pin.length<6) setPin(p=>p+n); };
  const del = () => setPin(p=>p.slice(0,-1));
  const submit = async () => {
    if(!sel||pin.length<4) return;
    setError(''); setLoading(true);
    const ok = await loginWithApi(sel.registerId.toLowerCase().replace('-',''),pin);
    setLoading(false);
    if(!ok){ setError('PIN incorrect'); setPin(''); }
  };

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24}}>
      {/* Header */}
      <div style={{textAlign:'center',marginBottom:32}}>
        <div style={{width:44,height:44,background:'var(--accent)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}>
          <ShoppingCart size={20} color="#0C0D11"/>
        </div>
        <div style={{fontSize:16,fontWeight:700,color:'var(--text)',letterSpacing:'-0.01em'}}>Duty Free DJBC</div>
        <div className="section-label" style={{marginTop:3}}>Caisse · Ouagadougou</div>
      </div>

      <div className="card" style={{width:'100%',maxWidth:380,padding:'24px 22px'}}>
        {!sel ? (
          <>
            <div style={{fontSize:12,color:'var(--text-2)',marginBottom:14,textAlign:'center',fontWeight:500}}>Sélectionnez votre profil</div>
            <div style={{display:'flex',flexDirection:'column',gap:7}}>
              {USERS.map(u=>(
                <button key={u.registerId} onClick={()=>setSel(u)}
                  style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:7,cursor:'pointer',textAlign:'left',width:'100%',transition:'border-color 0.14s'}}
                  onMouseOver={e=>(e.currentTarget.style.borderColor='var(--accent-border)')}
                  onMouseOut={e=>(e.currentTarget.style.borderColor='var(--border)')}>
                  <div style={{width:36,height:36,borderRadius:'50%',background:u.color+'18',border:`1.5px solid ${u.color}33`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:u.color,flexShrink:0}}>
                    {u.initials}
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{u.name}</div>
                    <div style={{fontSize:10,color:'var(--text-3)',fontFamily:'IBM Plex Mono,monospace'}}>{u.registerId}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Profil sélectionné */}
            <div style={{display:'flex',alignItems:'center',gap:11,marginBottom:22}}>
              <div style={{width:36,height:36,borderRadius:'50%',background:sel.color+'18',border:`1.5px solid ${sel.color}33`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:sel.color,flexShrink:0}}>
                {sel.initials}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{sel.name}</div>
                <div style={{fontSize:10,color:'var(--text-3)',fontFamily:'IBM Plex Mono,monospace'}}>{sel.registerId}</div>
              </div>
              <button onClick={()=>{setSel(null);setPin('');setError('');}} style={{background:'none',border:'none',cursor:'pointer',fontSize:11,color:'var(--text-3)',fontWeight:600}}>
                Changer
              </button>
            </div>

            {/* Points PIN */}
            <div style={{display:'flex',justifyContent:'center',gap:9,marginBottom:6}}>
              {[0,1,2,3,4,5].map(i=>(
                <div key={i} style={{width:10,height:10,borderRadius:'50%',background:i<pin.length?'var(--accent)':'var(--border-2)',border:`1.5px solid ${i<pin.length?'var(--accent)':'var(--border-2)'}`,transition:'all 0.12s'}}/>
              ))}
            </div>
            {error&&<div style={{textAlign:'center',fontSize:12,color:'var(--c-down)',marginBottom:6,fontWeight:600}}>{error}</div>}

            {/* Numpad */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:7,marginTop:18}}>
              {['1','2','3','4','5','6','7','8','9'].map(n=>(
                <button key={n} onClick={()=>add(n)}
                  style={{padding:'16px',background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:6,color:'var(--text)',fontSize:18,fontFamily:'IBM Plex Mono,monospace',fontWeight:500,cursor:'pointer',transition:'background 0.1s'}}
                  onMouseOver={e=>(e.currentTarget.style.background='var(--surface-3)')}
                  onMouseOut={e=>(e.currentTarget.style.background='var(--surface-2)')}>
                  {n}
                </button>
              ))}
              <button onClick={del} style={{padding:'16px',background:'var(--c-down-dim)',border:'1px solid var(--c-down-bd)',borderRadius:6,color:'var(--c-down)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Delete size={16}/>
              </button>
              <button onClick={()=>add('0')} style={{padding:'16px',background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:6,color:'var(--text)',fontSize:18,fontFamily:'IBM Plex Mono,monospace',fontWeight:500,cursor:'pointer',transition:'background 0.1s'}}
                onMouseOver={e=>(e.currentTarget.style.background='var(--surface-3)')}
                onMouseOut={e=>(e.currentTarget.style.background='var(--surface-2)')}>0</button>
              <button onClick={submit} disabled={loading||pin.length<4}
                style={{padding:'16px',background:pin.length>=4?'var(--accent)':'var(--surface-2)',border:'none',borderRadius:6,color:pin.length>=4?'#0C0D11':'var(--text-3)',fontSize:13,fontWeight:700,cursor:pin.length>=4?'pointer':'not-allowed',transition:'background 0.18s,color 0.18s'}}>
                {loading?'…':'OK'}
              </button>
            </div>
          </>
        )}
      </div>

      <div style={{marginTop:20,fontSize:11,color:'var(--text-3)',textAlign:'center'}}>
        DJBC — Direction Générale des Douanes · Burkina Faso
      </div>
    </div>
  );
}
