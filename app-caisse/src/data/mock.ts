import type { Product, User, ExchangeRates } from '../types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Aminata Sawadogo', pin: '1234', role: 'caissier', registerId: 'CAISSE-01' },
  { id: 'u2', name: 'Issouf Compaoré', pin: '5678', role: 'caissier', registerId: 'CAISSE-02' },
  { id: 'u3', name: 'Marie Ouédraogo', pin: '9999', role: 'superviseur', registerId: 'SUP-01' },
];

export const exchangeRates: ExchangeRates = {
  EUR_XOF: 655.957,
  USD_XOF: 607.50,
  updatedAt: new Date().toISOString(),
};

export const mockProducts: Product[] = [
  { id:'p1', code:'ALC-001', barcode:'3014260001233', name:'Hennessy VS 70cl', nameEn:'Hennessy VS 70cl', category:'Alcools', priceXOF:18500, priceEUR:28.20, priceUSD:30.50, stock:48, taxRate:0 },
  { id:'p2', code:'ALC-002', barcode:'3014260001240', name:'Moët & Chandon Brut 75cl', nameEn:'Moet & Chandon Brut 75cl', category:'Alcools', priceXOF:29000, priceEUR:44.20, priceUSD:47.80, stock:7, taxRate:0 },
  { id:'p3', code:'PAR-001', barcode:'3346846436419', name:'Dior Sauvage EDP 100ml', nameEn:'Dior Sauvage EDP 100ml', category:'Parfums', priceXOF:52000, priceEUR:79.30, priceUSD:85.60, stock:23, taxRate:0 },
  { id:'p4', code:'ALC-003', barcode:'3035050050322', name:'Rémy Martin VSOP 70cl', nameEn:'Remy Martin VSOP 70cl', category:'Alcools', priceXOF:24000, priceEUR:36.60, priceUSD:39.50, stock:2, taxRate:0 },
  { id:'p5', code:'ALC-004', barcode:'5000267023656', name:'Johnnie Walker Black 70cl', nameEn:'Johnnie Walker Black 70cl', category:'Alcools', priceXOF:22000, priceEUR:33.60, priceUSD:36.20, stock:15, taxRate:0 },
  { id:'p6', code:'TAB-001', barcode:'4019474001011', name:'Marlboro Red x20', nameEn:'Marlboro Red x20', category:'Tabac', priceXOF:2800, priceEUR:4.30, priceUSD:4.60, stock:120, taxRate:0 },
  { id:'p7', code:'TAB-002', barcode:'4019474001028', name:'Parliament Aqua Blue x20', nameEn:'Parliament Aqua Blue x20', category:'Tabac', priceXOF:3200, priceEUR:4.90, priceUSD:5.30, stock:85, taxRate:0 },
  { id:'p8', code:'PAR-002', barcode:'3346846416701', name:'Chanel N°5 EDP 50ml', nameEn:'Chanel No.5 EDP 50ml', category:'Parfums', priceXOF:68000, priceEUR:103.70, priceUSD:112.00, stock:9, taxRate:0 },
  { id:'p9', code:'ALC-005', barcode:'5000267023663', name:'Baileys Original 70cl', nameEn:'Baileys Original 70cl', category:'Alcools', priceXOF:13500, priceEUR:20.60, priceUSD:22.20, stock:9, taxRate:0 },
  { id:'p10', code:'COS-001', barcode:'3605970006501', name:'Lancôme La Vie Est Belle 100ml', nameEn:'Lancome La Vie Est Belle 100ml', category:'Cosmétiques', priceXOF:61000, priceEUR:93.00, priceUSD:100.50, stock:11, taxRate:0 },
  { id:'p11', code:'TAB-003', barcode:'4019474001035', name:'Camel Blue x20', nameEn:'Camel Blue x20', category:'Tabac', priceXOF:2600, priceEUR:4.00, priceUSD:4.30, stock:55, taxRate:0 },
  { id:'p12', code:'CON-001', barcode:'7622210100320', name:'Toblerone 360g', nameEn:'Toblerone 360g', category:'Confiserie', priceXOF:4500, priceEUR:6.90, priceUSD:7.40, stock:40, taxRate:0 },
  { id:'p13', code:'ALC-006', barcode:'3035050167153', name:'Cointreau Triple Sec 70cl', nameEn:'Cointreau Triple Sec 70cl', category:'Alcools', priceXOF:16000, priceEUR:24.40, priceUSD:26.30, stock:0, taxRate:0 },
  { id:'p14', code:'ACC-001', barcode:'5060597920016', name:'Lunettes Ray-Ban Aviator', nameEn:'Ray-Ban Aviator Sunglasses', category:'Accessoires', priceXOF:85000, priceEUR:129.60, priceUSD:139.90, stock:6, taxRate:0 },
  { id:'p15', code:'CON-002', barcode:'4000539103060', name:'Haribo Goldbären 200g', nameEn:'Haribo Gold Bears 200g', category:'Confiserie', priceXOF:1800, priceEUR:2.70, priceUSD:3.00, stock:60, taxRate:0 },
];
