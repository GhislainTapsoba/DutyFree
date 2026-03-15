import { useState, useEffect, useRef } from 'react';
import { kpis, dailyCA, caByCategory, caByPayment, caByCashier } from '../data/mock';
import { TrendingUp, TrendingDown, Minus, WifiOff, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';

const fmt  = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n));
const fmtM = (n: number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(2)} M` : n >= 1_000 ? `${(n/1_000).toFixed(0)} K` : fmt(n);
const pct  = (a: number, b: number) => (((a - b) / b) * 100).toFixed(1);
const G    = ['#3D75C4','#2EAD78','#B8914A','#C47B35','#7A5FC4','#2E9FAD'];

const WS_URL = (import.meta.env.VITE_WS_URL || 'ws://localhost:8000') + '/ws/stock/';

function useWS() {
  const [status, setStatus] = useState<'connecting'|'live'|'offline'>('connecting');
  const [alerts, setAlerts] = useState<{level:string;message:string}[]>([]);
  const [lastSale, setLastSale] = useState<{caisse:string;total:number}|null>(null);
  const ws = useRef<WebSocket|null>(null);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const go = () => {
      try {
        const s = new WebSocket(WS_URL); ws.current = s;
        s.onopen = () => setStatus('live');
        s.onmessage = ({data}) => { try { const m = JSON.parse(data); if (m.type==='alert') setAlerts(p=>[{level:m.level,message:m.message},...p.slice(0,3)]); if (m.type==='new_sale') { setLastSale({caisse:m.caisse,total:m.total}); setTimeout(()=>setLastSale(null),4000); } } catch {} };
        s.onclose = () => { setStatus('offline'); t = setTimeout(go, 5000); };
        s.onerror = () => s.close();
      } catch { setStatus('offline'); t = setTimeout(go, 8000); }
    };
    go();
    return () => { clearTimeout(t); ws.current?.close(); };
  }, []);
  return { status, alerts, lastSale };
}

function CT({ active, payload, label, unit='' }: any) {
  if (!active||!payload?.length) return null;
  return <div style={{background:'var(--surface-2)',border:'1px solid var(--border-2)',borderRadius:5,padding:'8px 12px',fontSize:12,boxShadow:'var(--sh-lg)'}}>
    {label&&<div style={{color:'var(--text-3)',fontSize:10,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.08em'}}>{label}</div>}
    {payload.map((p:any)=><div key={p.name} style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:6,height:6,borderRadius:'50%',background:p.color,flexShrink:0}}/><span style={{fontFamily:'IBM Plex Mono,monospace',color:'var(--text)'}}>{typeof p.value==='number'?fmt(p.value):p.value}{unit?' '+unit:''}</span></div>)}
  </div>;
}

function KpiCard({label,value,curr,prev,sub,accent}:{label:string;value:string;curr:number;prev:number;sub:string;accent?:string}) {
  const g=parseFloat(pct(curr,prev)); const up=g>=0; const flat=Math.abs(g)<0.1;
  return <div className="card" style={{padding:'16px 18px'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:11}}>
      <span className="section-label">{label}</span>
      <span className={`delta ${flat?'delta-flat':up?'delta-up':'delta-down'}`}>
        {flat?<Minus size={8}/>:up?<TrendingUp size={8}/>:<TrendingDown size={8}/>}
        {flat?'—':`${up?'+':''}${g}%`}
      </span>
    </div>
    <div className="stat-number" style={{color:accent||'var(--text)',marginBottom:4}}>{value}</div>
    <div style={{fontSize:11,color:'var(--text-3)'}}>{sub}</div>
  </div>;
}

function STitle({children}:{children:string}) {
  return <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:14}}>
    <span className="section-label">{children}</span>
    <div style={{flex:1,height:1,background:'var(--border)'}}/>
  </div>;
}

export default function Dashboard() {
  const last7 = dailyCA.slice(-7);
  const {status,alerts,lastSale} = useWS();
  const [now,setNow] = useState(new Date());
  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),1000); return ()=>clearInterval(t); },[]);

  return (
    <div className="fade-in" style={{padding:'26px 28px',maxWidth:1440,margin:'0 auto'}}>

      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:22}}>
        <div>
          <div className="section-label" style={{marginBottom:4}}>Aéroport International de Ouagadougou · DJBC</div>
          <h1 style={{fontFamily:'Playfair Display,Georgia,serif',fontSize:24,fontWeight:500,color:'var(--text)',letterSpacing:'-0.01em'}}>Tableau de bord</h1>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {lastSale&&<div style={{display:'flex',alignItems:'center',gap:5,background:'var(--c-up-dim)',border:'1px solid var(--c-up-bd)',borderRadius:4,padding:'4px 8px',fontSize:11,color:'var(--c-up)',fontWeight:600,animation:'fadeIn 0.2s ease'}}><Zap size={10}/>{lastSale.caisse} · {fmt(lastSale.total)} XOF</div>}
          <div style={{display:'flex',alignItems:'center',gap:6,padding:'4px 8px',background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:4}}>
            {status==='live'?<span style={{width:6,height:6,borderRadius:'50%',background:'var(--c-up)',animation:'pulse 2s infinite',flexShrink:0}}/>:status==='connecting'?<span style={{width:6,height:6,borderRadius:'50%',background:'var(--c-warn)',flexShrink:0}}/>:<WifiOff size={10} color="var(--text-3)"/>}
            <span style={{fontSize:10,fontWeight:600,color:status==='live'?'var(--c-up)':'var(--text-3)',letterSpacing:'0.06em'}}>{status==='live'?'LIVE':status==='connecting'?'SYNC':'HORS LIGNE'}</span>
          </div>
          <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:13,color:'var(--text-3)',minWidth:68,textAlign:'right'}}>{now.toLocaleTimeString('fr-FR')}</div>
        </div>
      </div>

      {/* Alertes */}
      {alerts.length>0&&<div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>{alerts.map((a,i)=><div key={i} className={`alert ${a.level==='danger'?'alert-red':'alert-warn'}`} style={{fontSize:11,padding:'5px 10px'}}>{a.message}</div>)}</div>}

      {/* KPI row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:7,marginBottom:18}}>
        <KpiCard label="Chiffre d'affaires" value={fmtM(kpis.caTotal)+' XOF'} curr={kpis.caTotal}       prev={kpis.caPrevMonth}      sub="ce mois"              accent="var(--accent)"/>
        <KpiCard label="Tickets émis"        value={fmt(kpis.totalTickets)}      curr={kpis.totalTickets}   prev={kpis.ticketsPrevMonth} sub="transactions"/>
        <KpiCard label="Ticket moyen"        value={fmt(kpis.ticketMoyen)+' F'}  curr={kpis.ticketMoyen}    prev={kpis.ticketMoyenPrev}  sub="CA / ticket"/>
        <KpiCard label="Taux de capture"     value={kpis.tauxCapture+'%'}        curr={kpis.tauxCapture}    prev={kpis.tauxCapturePrev}  sub="tickets / passagers" accent="var(--c-info)"/>
        <KpiCard label="Passagers"           value={fmt(kpis.passagersTotal)}     curr={kpis.passagersTotal} prev={kpis.passagersPrev}    sub="données aéroport"/>
      </div>

      {/* Row 1 : Area + Donut */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 290px',gap:7,marginBottom:7}}>
        <div className="card" style={{padding:'16px 18px'}}>
          <STitle>Évolution CA — 7 derniers jours</STitle>
          <ResponsiveContainer width="100%" height={185}>
            <AreaChart data={last7} margin={{top:2,right:2,bottom:0,left:-18}}>
              <defs>
                <linearGradient id="gCA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3D75C4" stopOpacity={0.16}/>
                  <stop offset="100%" stopColor="#3D75C4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v=>fmtM(v)} tick={{fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CT unit="XOF"/>}/>
              <Area type="monotone" dataKey="ca" stroke="#3D75C4" strokeWidth={1.5} fill="url(#gCA)" dot={false} activeDot={{r:3,strokeWidth:0,fill:'#3D75C4'}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{padding:'16px 18px'}}>
          <STitle>Catégories</STitle>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={caByCategory} cx="50%" cy="50%" innerRadius={32} outerRadius={50} dataKey="ca" paddingAngle={2} stroke="none">
                {caByCategory.map((_,i)=><Cell key={i} fill={G[i%G.length]}/>)}
              </Pie>
              <Tooltip content={<CT/>}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:'flex',flexDirection:'column',gap:3,marginTop:6}}>
            {caByCategory.slice(0,5).map((d,i)=>(
              <div key={d.category} style={{display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:11}}>
                <div style={{display:'flex',alignItems:'center',gap:5}}>
                  <span style={{width:6,height:6,borderRadius:1,background:G[i],flexShrink:0}}/>
                  <span style={{color:'var(--text-2)'}}>{d.category}</span>
                </div>
                <span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'var(--text-3)'}}>{d.part??'—'}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 : Barres + Règlements + Caissiers */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:7}}>
        <div className="card" style={{padding:'16px 18px'}}>
          <STitle>Tickets / jour</STitle>
          <ResponsiveContainer width="100%" height={155}>
            <BarChart data={dailyCA.slice(-8)} margin={{top:2,right:0,bottom:0,left:-24}} barSize={10}>
              <XAxis dataKey="date" tick={{fontSize:9}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:9}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CT/>}/>
              <Bar dataKey="tickets" radius={[2,2,0,0]}>
                {dailyCA.slice(-8).map((_,i,arr)=><Cell key={i} fill={i===arr.length-1?'#2EAD78':'var(--surface-4)'}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{padding:'16px 18px'}}>
          <STitle>Modes de règlement</STitle>
          <div style={{display:'flex',flexDirection:'column',gap:11,marginTop:4}}>
            {caByPayment.map((d,i)=>{
              const w=Math.round((d.amount/Math.max(...caByPayment.map(x=>x.amount)))*100);
              return <div key={d.method}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontSize:11,color:'var(--text-2)'}}>{d.method}</span>
                  <span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'var(--text)'}}>{fmtM(d.amount)}</span>
                </div>
                <div style={{background:'var(--surface-3)',borderRadius:2,height:3}}>
                  <div style={{width:`${w}%`,height:'100%',borderRadius:2,background:G[i%G.length],transition:'width 0.5s'}}/>
                </div>
              </div>;
            })}
          </div>
        </div>

        <div className="card" style={{padding:'16px 18px'}}>
          <STitle>Caissiers</STitle>
          {caByCashier.map((d,i)=>(
            <div key={d.name} style={{display:'flex',alignItems:'center',gap:9,padding:'8px 0',borderBottom:i<caByCashier.length-1?'1px solid var(--border)':'none'}}>
              <div style={{width:22,height:22,borderRadius:4,flexShrink:0,background:G[i%G.length]+'18',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:G[i%G.length]}}>
                {d.name.charAt(0)}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:500,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.name}</div>
                <div style={{fontSize:10,color:'var(--text-3)',fontFamily:'IBM Plex Mono,monospace'}}>{d.tickets} tickets</div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:12,fontFamily:'IBM Plex Mono,monospace',fontWeight:500,color:'var(--text)'}}>{fmtM(d.ca)}</div>
                <div style={{fontSize:9,color:'var(--text-3)'}}>XOF</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
