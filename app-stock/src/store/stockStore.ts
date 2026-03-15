import { create } from 'zustand';
import { stockApi } from '../api';
import type { Produit, Fournisseur, Sommier, Mouvement, Commande } from '../api';
import { mockProducts, mockSommiers, mockMovements, mockOrders, mockSuppliers } from '../data/mock';

interface StockStore {
  products: Produit[];
  sommiers: Sommier[];
  movements: Mouvement[];
  orders: Commande[];
  suppliers: Fournisseur[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string;
  isOffline: boolean;
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (c: string) => void;
  fetchAll: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchSommiers: () => Promise<void>;
  fetchMovements: () => Promise<void>;
  fetchSuppliers: () => Promise<void>;
  addMovement: (data: Partial<Mouvement>) => Promise<void>;
}

const adaptMockProducts = (): Produit[] => mockProducts.map(p => ({
  id: parseInt(p.id.replace('p', '')),
  code: p.code, code_barres: p.barcode,
  nom: p.name, nom_en: p.nameEn,
  categorie: p.category,
  prix_xof: p.unitPrice, prix_eur: p.priceEur, prix_usd: p.priceUsd,
  stock: p.stock, stock_min: p.minStock, stock_max: p.maxStock,
  unite: p.unit,
  statut_stock: p.status as Produit['statut_stock'],
  fournisseur: null,
}));

export const useStockStore = create<StockStore>((set, get) => ({
  products: adaptMockProducts(),
  sommiers: [],
  movements: [],
  orders: [],
  suppliers: [],
  loading: false,
  error: null,
  searchQuery: '',
  selectedCategory: 'Tous',
  isOffline: !navigator.onLine,

  setSearchQuery: (q) => set({ searchQuery: q }),
  setSelectedCategory: (c) => set({ selectedCategory: c }),

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await stockApi.produits.list();
      set({ products: res.results, loading: false, isOffline: false });
    } catch { set({ products: adaptMockProducts(), loading: false, isOffline: true }); }
  },

  fetchSommiers: async () => {
    try {
      const res = await stockApi.sommiers.list();
      set({ sommiers: res.results });
    } catch { set({ sommiers: mockSommiers as unknown as Sommier[] }); }
  },

  fetchMovements: async () => {
    try {
      const res = await stockApi.mouvements.list();
      set({ movements: res.results });
    } catch { set({ movements: mockMovements as unknown as Mouvement[] }); }
  },

  fetchAll: async () => {
    const { fetchProducts, fetchSommiers, fetchMovements } = get();
    await Promise.allSettled([fetchProducts(), fetchSommiers(), fetchMovements()]);
    try { const r = await stockApi.fournisseurs.list(); set({ suppliers: r.results }); }
    catch { set({ suppliers: mockSuppliers as unknown as Fournisseur[] }); }
    try { const r = await stockApi.commandes.list(); set({ orders: r.results }); }
    catch { set({ orders: mockOrders as unknown as Commande[] }); }
  },

  fetchSuppliers: async () => {
    try { const r = await stockApi.fournisseurs.list(); set({ suppliers: r.results }); }
    catch { set({ suppliers: mockSuppliers as unknown as Fournisseur[] }); }
  },

  addMovement: async (data) => {
    const m = await stockApi.mouvements.create(data);
    set(s => ({ movements: [m, ...s.movements] }));
    if (data.produit) {
      const p = await stockApi.produits.get(data.produit as number);
      set(s => ({ products: s.products.map(pr => pr.id === p.id ? p : pr) }));
    }
  },
}));
