import type { Product, Sommier, StockMovement, Supplier, SupplierOrder } from '../types';

export const mockSuppliers: Supplier[] = [
  { id: 's1', name: 'LVMH Distribution', contact: 'Jean-Paul Martin', email: 'jp.martin@lvmh.com', phone: '+33145678901', country: 'France', products: ['p1','p2','p3'] },
  { id: 's2', name: 'Rémy Cointreau', contact: 'Sophie Durand', email: 's.durand@remycointreau.com', phone: '+33156789012', country: 'France', products: ['p4','p5'] },
  { id: 's3', name: 'Philip Morris Intl', contact: 'Mark Johnson', email: 'm.johnson@pmi.com', phone: '+41227938000', country: 'Suisse', products: ['p6','p7'] },
  { id: 's4', name: 'Diageo Africa', contact: 'Kwame Asante', email: 'k.asante@diageo.com', phone: '+233302680000', country: 'Ghana', products: ['p8','p9'] },
];

export const mockProducts: Product[] = [
  { id:'p1', code:'ALC-001', barcode:'3014260001233', name:'Hennessy VS 70cl', nameEn:'Hennessy VS 70cl', category:'Alcools', supplier:'LVMH Distribution', unitPrice:18500, currency:'XOF', priceEur:28, priceUsd:30, stock:48, minStock:10, maxStock:100, unit:'bouteille', sommier:'SOM-2024-001', taxRate:0, status:'ok', lastUpdated:'2025-06-15' },
  { id:'p2', code:'ALC-002', barcode:'3014260001240', name:'Moët & Chandon Brut 75cl', nameEn:'Moët & Chandon Brut 75cl', category:'Alcools', supplier:'LVMH Distribution', unitPrice:29000, currency:'XOF', priceEur:44, priceUsd:47, stock:7, minStock:10, maxStock:60, unit:'bouteille', sommier:'SOM-2024-001', taxRate:0, status:'low', lastUpdated:'2025-06-14' },
  { id:'p3', code:'PAR-001', barcode:'3346846436419', name:'Dior Sauvage EDP 100ml', nameEn:'Dior Sauvage EDP 100ml', category:'Parfums', supplier:'LVMH Distribution', unitPrice:52000, currency:'XOF', priceEur:79, priceUsd:85, stock:23, minStock:5, maxStock:50, unit:'flacon', taxRate:0, status:'ok', lastUpdated:'2025-06-15' },
  { id:'p4', code:'ALC-003', barcode:'3035050050322', name:'Rémy Martin VSOP 70cl', nameEn:'Rémy Martin VSOP 70cl', category:'Alcools', supplier:'Rémy Cointreau', unitPrice:24000, currency:'XOF', priceEur:36, priceUsd:39, stock:2, minStock:8, maxStock:60, unit:'bouteille', sommier:'SOM-2024-002', taxRate:0, status:'critical', lastUpdated:'2025-06-12' },
  { id:'p5', code:'ALC-004', barcode:'3035050050339', name:'Cointreau Triple Sec 70cl', nameEn:'Cointreau Triple Sec 70cl', category:'Alcools', supplier:'Rémy Cointreau', unitPrice:16000, currency:'XOF', priceEur:24, priceUsd:26, stock:0, minStock:5, maxStock:40, unit:'bouteille', sommier:'SOM-2024-002', taxRate:0, status:'rupture', lastUpdated:'2025-06-10' },
  { id:'p6', code:'TAB-001', barcode:'4019474001011', name:'Marlboro Red x20', nameEn:'Marlboro Red x20', category:'Tabac', supplier:'Philip Morris Intl', unitPrice:2800, currency:'XOF', priceEur:4.2, priceUsd:4.5, stock:120, minStock:30, maxStock:300, unit:'paquet', sommier:'SOM-2024-003', taxRate:0, status:'ok', lastUpdated:'2025-06-15' },
  { id:'p7', code:'TAB-002', barcode:'4019474001028', name:'Parliament Aqua Blue x20', nameEn:'Parliament Aqua Blue x20', category:'Tabac', supplier:'Philip Morris Intl', unitPrice:3200, currency:'XOF', priceEur:4.8, priceUsd:5.2, stock:85, minStock:20, maxStock:200, unit:'paquet', sommier:'SOM-2024-003', taxRate:0, status:'ok', lastUpdated:'2025-06-14' },
  { id:'p8', code:'ALC-005', barcode:'5000267023656', name:'Johnnie Walker Black 70cl', nameEn:'Johnnie Walker Black 70cl', category:'Alcools', supplier:'Diageo Africa', unitPrice:22000, currency:'XOF', priceEur:33, priceUsd:36, stock:15, minStock:12, maxStock:80, unit:'bouteille', sommier:'SOM-2024-004', taxRate:0, status:'ok', lastUpdated:'2025-06-13' },
  { id:'p9', code:'ALC-006', barcode:'5000267023663', name:'Baileys Original 70cl', nameEn:'Baileys Original 70cl', category:'Alcools', supplier:'Diageo Africa', unitPrice:13500, currency:'XOF', priceEur:20, priceUsd:22, stock:9, minStock:10, maxStock:50, unit:'bouteille', sommier:'SOM-2024-004', taxRate:0, status:'low', lastUpdated:'2025-06-11' },
  { id:'p10', code:'COS-001', barcode:'3605970006501', name:'Lancôme La Vie Est Belle 100ml', nameEn:'Lancôme La Vie Est Belle 100ml', category:'Cosmétiques', supplier:'LVMH Distribution', unitPrice:61000, currency:'XOF', priceEur:92, priceUsd:99, stock:11, minStock:4, maxStock:30, unit:'flacon', taxRate:0, status:'ok', lastUpdated:'2025-06-15' },
];

export const mockSommiers: Sommier[] = [
  { id:'som1', numero:'SOM-2024-001', productId:'p1', productName:'Alcools LVMH', quantiteInitiale:200, quantiteEntree:200, quantiteSortie:145, quantiteRestante:55, dateOuverture:'2024-01-15', status:'actif', reference:'REF-DJBC-2024-001' },
  { id:'som2', numero:'SOM-2024-002', productId:'p4', productName:'Alcools Rémy Cointreau', quantiteInitiale:120, quantiteEntree:120, quantiteSortie:118, quantiteRestante:2, dateOuverture:'2024-02-01', status:'en_cours', reference:'REF-DJBC-2024-002', notes:'Apurement imminent - commander' },
  { id:'som3', numero:'SOM-2024-003', productId:'p6', productName:'Tabacs Philip Morris', quantiteInitiale:1000, quantiteEntree:500, quantiteSortie:295, quantiteRestante:205, dateOuverture:'2024-03-10', status:'actif', reference:'REF-DJBC-2024-003' },
  { id:'som4', numero:'SOM-2024-004', productId:'p8', productName:'Alcools Diageo', quantiteInitiale:150, quantiteEntree:150, quantiteSortie:126, quantiteRestante:24, dateOuverture:'2024-04-05', status:'actif', reference:'REF-DJBC-2024-004' },
  { id:'som5', numero:'SOM-2023-012', productId:'p3', productName:'Parfums LVMH', quantiteInitiale:80, quantiteEntree:80, quantiteSortie:80, quantiteRestante:0, dateOuverture:'2023-11-01', dateApurement:'2024-05-30', status:'apuré', reference:'REF-DJBC-2023-012' },
];

export const mockMovements: StockMovement[] = [
  { id:'m1', productId:'p1', productName:'Hennessy VS 70cl', type:'entree', quantity:24, quantityBefore:24, quantityAfter:48, reason:'Réception commande CMD-2025-045', userId:'u1', userName:'Admin Koné', date:'2025-06-15T09:30:00', sommierId:'som1' },
  { id:'m2', productId:'p2', productName:'Moët & Chandon Brut', type:'sortie', quantity:3, quantityBefore:10, quantityAfter:7, reason:'Ventes journée', userId:'u2', userName:'Caisse 01', date:'2025-06-15T18:00:00', sommierId:'som1' },
  { id:'m3', productId:'p5', productName:'Cointreau Triple Sec', type:'sortie', quantity:5, quantityBefore:5, quantityAfter:0, reason:'Ventes', userId:'u2', userName:'Caisse 01', date:'2025-06-14T16:45:00', sommierId:'som2' },
  { id:'m4', productId:'p4', productName:'Rémy Martin VSOP', type:'ajustement', quantity:-1, quantityBefore:3, quantityAfter:2, reason:'Casse inventaire', userId:'u1', userName:'Admin Koné', date:'2025-06-12T11:00:00', sommierId:'som2' },
  { id:'m5', productId:'p6', productName:'Marlboro Red', type:'entree', quantity:100, quantityBefore:20, quantityAfter:120, reason:'Réception commande CMD-2025-040', userId:'u1', userName:'Admin Koné', date:'2025-06-10T10:00:00', sommierId:'som3' },
];

export const mockOrders: SupplierOrder[] = [
  { id:'cmd1', supplierId:'s2', supplierName:'Rémy Cointreau', status:'envoyée', items:[{productId:'p4',productName:'Rémy Martin VSOP',quantity:30,unitPrice:24000,currency:'XOF'},{productId:'p5',productName:'Cointreau Triple Sec',quantity:20,unitPrice:16000,currency:'XOF'}], totalAmount:1040000, currency:'XOF', createdAt:'2025-06-14T08:00:00', expectedAt:'2025-06-20T00:00:00', approachCosts:45000, notes:'Urgence rupture Cointreau' },
  { id:'cmd2', supplierId:'s1', supplierName:'LVMH Distribution', status:'brouillon', items:[{productId:'p2',productName:'Moët & Chandon',quantity:24,unitPrice:29000,currency:'XOF'}], totalAmount:696000, currency:'XOF', createdAt:'2025-06-15T14:00:00', approachCosts:30000 },
];
