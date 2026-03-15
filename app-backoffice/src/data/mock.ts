// --- Chiffre d'affaires journalier sur 30 jours ---
export const dailyCA = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const base = 850000 + Math.random() * 400000;
  const isWeekend = [0, 6].includes(date.getDay());
  return {
    date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    ca: Math.round(base * (isWeekend ? 1.4 : 1)),
    tickets: Math.round((base / 28000) * (isWeekend ? 1.3 : 1)),
    passagers: Math.round(280 + Math.random() * 120),
  };
});

// --- CA par catégorie ---
export const caByCategory = [
  { category: 'Alcools', ca: 4250000, tickets: 148, part: 38 },
  { category: 'Parfums', ca: 3180000, tickets: 67, part: 28 },
  { category: 'Tabac', ca: 1620000, tickets: 312, part: 14 },
  { category: 'Cosmétiques', ca: 980000, tickets: 23, part: 9 },
  { category: 'Confiserie', ca: 560000, tickets: 198, part: 5 },
  { category: 'Accessoires', ca: 420000, tickets: 8, part: 4 },
  { category: 'Alimentaire', ca: 210000, tickets: 44, part: 2 },
];

// --- CA par mode de paiement ---
export const caByPayment = [
  { method: 'Espèces XOF', amount: 3800000, pct: 34 },
  { method: 'Carte bancaire', amount: 4600000, pct: 41 },
  { method: 'Espèces EUR', amount: 1800000, pct: 16 },
  { method: 'Mobile Money', amount: 620000, pct: 6 },
  { method: 'Espèces USD', amount: 400000, pct: 3 },
];

// --- CA par vendeur ---
export const caByCashier = [
  { name: 'Aminata Sawadogo', register: 'CAISSE-01', ca: 4820000, tickets: 187, moyenne: 25775, heures: 176 },
  { name: 'Issouf Compaoré', register: 'CAISSE-02', ca: 4110000, tickets: 162, moyenne: 25370, heures: 168 },
  { name: 'Fatoumata Traoré', register: 'CAISSE-03', ca: 2290000, tickets: 93, moyenne: 24624, heures: 88 },
];

// --- KPIs du mois ---
export const kpis = {
  caTotal: 11220000,
  caPrevMonth: 10480000,
  totalTickets: 442,
  ticketsPrevMonth: 408,
  ticketMoyen: 25385,
  ticketMoyenPrev: 25686,
  tauxCapture: 18.4,
  tauxCapturePrev: 17.1,
  passagersTotal: 2400,
  passagersPrev: 2380,
};

// --- Ventes récentes (liste tickets) ---
export const recentSales = [
  { id:'TK-1042', date:'2025-06-15T14:32:00', cashier:'Aminata Sawadogo', items:3, total:74500, currency:'XOF', method:'carte', passenger:'Jean Dupont · AF604 → Paris' },
  { id:'TK-1041', date:'2025-06-15T14:18:00', cashier:'Issouf Compaoré', items:1, total:52000, currency:'XOF', method:'especes', passenger:'' },
  { id:'TK-1040', date:'2025-06-15T13:55:00', cashier:'Aminata Sawadogo', items:5, total:28600, currency:'XOF', method:'mobile_money', passenger:'Sarah Müller · LH712 → Frankfurt' },
  { id:'TK-1039', date:'2025-06-15T13:40:00', cashier:'Fatoumata Traoré', items:2, total:44.20, currency:'EUR', method:'carte', passenger:'Carlos Rodriguez · IB5431 → Madrid' },
  { id:'TK-1038', date:'2025-06-15T13:12:00', cashier:'Issouf Compaoré', items:4, total:104000, currency:'XOF', method:'especes', passenger:'' },
  { id:'TK-1037', date:'2025-06-15T12:58:00', cashier:'Aminata Sawadogo', items:1, total:85000, currency:'XOF', method:'carte', passenger:'Amara Diallo · ET309 → Addis' },
  { id:'TK-1036', date:'2025-06-15T12:30:00', cashier:'Fatoumata Traoré', items:2, total:8000, currency:'XOF', method:'especes', passenger:'' },
  { id:'TK-1035', date:'2025-06-15T12:01:00', cashier:'Issouf Compaoré', items:3, total:56.80, currency:'EUR', method:'carte', passenger:'Marie Leblanc · AF602 → Paris' },
];

// --- Top produits du mois ---
export const topProducts = [
  { rank:1, name:'Hennessy VS 70cl', category:'Alcools', qty:148, ca:2738000, trend:'up' },
  { rank:2, name:'Marlboro Red x20', category:'Tabac', qty:312, ca:873600, trend:'up' },
  { rank:3, name:'Dior Sauvage EDP 100ml', category:'Parfums', qty:67, ca:3484000, trend:'stable' },
  { rank:4, name:'Johnnie Walker Black 70cl', category:'Alcools', qty:95, ca:2090000, trend:'down' },
  { rank:5, name:'Chanel N°5 EDP 50ml', category:'Parfums', qty:28, ca:1904000, trend:'up' },
  { rank:6, name:'Toblerone 360g', category:'Confiserie', qty:198, ca:891000, trend:'stable' },
  { rank:7, name:'Rémy Martin VSOP 70cl', category:'Alcools', qty:42, ca:1008000, trend:'down' },
];

// --- Passagers data (externe aéroport) ---
export const passengerData = [
  { month:'Janv.', passagers:2180, tickets:388, taux:17.8 },
  { month:'Févr.', passagers:2240, tickets:401, taux:17.9 },
  { month:'Mars', passagers:2310, tickets:420, taux:18.2 },
  { month:'Avr.', passagers:2290, tickets:408, taux:17.8 },
  { month:'Mai', passagers:2380, tickets:421, taux:17.7 },
  { month:'Juin', passagers:2400, tickets:442, taux:18.4 },
];

// --- Utilisateurs système ---
export const users = [
  { id:'u1', name:'Admin Koné', email:'admin@djbc-df.bf', role:'admin', lastLogin:'2025-06-15T08:00:00', status:'actif' },
  { id:'u2', name:'Aminata Sawadogo', email:'a.sawadogo@djbc-df.bf', role:'caissier', lastLogin:'2025-06-15T07:45:00', status:'actif' },
  { id:'u3', name:'Issouf Compaoré', email:'i.compaore@djbc-df.bf', role:'caissier', lastLogin:'2025-06-15T07:50:00', status:'actif' },
  { id:'u4', name:'Fatoumata Traoré', email:'f.traore@djbc-df.bf', role:'caissier', lastLogin:'2025-06-14T20:30:00', status:'actif' },
  { id:'u5', name:'Marie Ouédraogo', email:'m.ouedraogo@djbc-df.bf', role:'superviseur', lastLogin:'2025-06-15T09:00:00', status:'actif' },
];
