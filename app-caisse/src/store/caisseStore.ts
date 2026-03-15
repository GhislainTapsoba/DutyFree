import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { stockApi, ventesApi, authApi, authStorage } from '../api';
import type { Produit, VentePayload } from '../api';
import type { CartItem, Sale, User, Currency, Payment } from '../types';
import { mockProducts, mockUsers, exchangeRates } from '../data/mock';

let ticketCounter = parseInt(localStorage.getItem('df_ticket_counter') || '1001');

const saveCounter = () => localStorage.setItem('df_ticket_counter', String(ticketCounter));

const toXOF = (amount: number, currency: Currency, rates: typeof exchangeRates) => {
  if (currency === 'EUR') return amount * rates.EUR_XOF;
  if (currency === 'USD') return amount * rates.USD_XOF;
  return amount;
};

const priceInCurrency = (p: Produit, currency: Currency) => {
  if (currency === 'EUR') return p.prix_eur;
  if (currency === 'USD') return p.prix_usd;
  return p.prix_xof;
};

interface CaisseStore {
  currentUser: User | null;
  isOnline: boolean;
  setOnline: (v: boolean) => void;
  activeCurrency: Currency;
  setActiveCurrency: (c: Currency) => void;
  rates: typeof exchangeRates;
  cart: CartItem[];
  products: Produit[];
  productsLoaded: boolean;
  addToCart: (productId: string | number) => void;
  removeFromCart: (productId: string | number) => void;
  updateQty: (productId: string | number, qty: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartItemCount: () => number;
  passengerName: string;
  flightRef: string;
  destination: string;
  setPassenger: (name: string, flight: string, dest: string) => void;
  clearPassenger: () => void;
  sales: Sale[];
  offlineQueue: VentePayload[];
  completeSale: (payments: Payment[]) => Sale;
  syncOfflineQueue: () => Promise<void>;
  login: (user: User) => void;
  loginWithApi: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loadProducts: () => Promise<void>;
  searchProducts: (q: string) => Produit[];
}

// Adapter produit API → mock compatible
const adaptApiProduct = (p: Produit): Produit => ({
  ...p,
  prix_xof: typeof p.prix_xof === 'number' ? p.prix_xof : parseFloat(String(p.prix_xof)) || 0,
  prix_eur: typeof p.prix_eur === 'number' ? p.prix_eur : parseFloat(String(p.prix_eur)) || 0,
  prix_usd: typeof p.prix_usd === 'number' ? p.prix_usd : parseFloat(String(p.prix_usd)) || 0,
});

// Adapter mock → API Produit
const adaptMockToApi = (p: typeof mockProducts[0]): Produit => ({
  id: parseInt(String(p.id).replace('p', '')) || 1,
  code: p.code,
  code_barres: p.barcode || '',
  nom: p.name || '',
  nom_en: p.nameEn || '',
  categorie: p.category || '',
  prix_xof: p.priceXOF || 0,
  prix_eur: p.priceEUR || 0,
  prix_usd: p.priceUSD || 0,
  stock: p.stock || 0,
  stock_min: 5,
  stock_max: 100,
  unite: 'unité',
  statut_stock: (p.stock === 0 ? 'rupture' : 'ok') as Produit['statut_stock'],
  fournisseur: null,
});

export const useCaisseStore = create<CaisseStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isOnline: navigator.onLine,
      setOnline: (v) => set({ isOnline: v }),
      activeCurrency: 'XOF',
      setActiveCurrency: (c) => set({ activeCurrency: c }),
      rates: exchangeRates,
      cart: [],
      products: mockProducts.map(adaptMockToApi),
      productsLoaded: false,

      loadProducts: async () => {
        try {
          const res = await stockApi.produits.list();
          set({ products: res.results.map(adaptApiProduct), productsLoaded: true });
        } catch {
          set({ products: mockProducts.map(adaptMockToApi) });
        }
      },

      addToCart: (productId) => {
        const pid = String(productId);
        const product = get().products.find(
          p => String(p.id) === pid || p.code_barres === pid || p.code === pid
        );
        if (!product || product.stock === 0) return;
        const currency = get().activeCurrency;
        const unitPrice = priceInCurrency(product, currency);
        set(s => {
          const existing = s.cart.find(i => i.product.id === product.id);
          if (existing) {
            return { cart: s.cart.map(i => i.product.id === product.id
              ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice * (1 - i.discount / 100) }
              : i) };
          }
          return { cart: [...s.cart, {
            product: { ...product, id: product.id } as unknown as CartItem['product'],
            quantity: 1, unitPrice, currency, discount: 0, total: unitPrice
          }] };
        });
      },

      removeFromCart: (id) => set(s => ({ cart: s.cart.filter(i => i.product.id !== id) })),
      updateQty: (id, qty) => {
        if (qty <= 0) { get().removeFromCart(id); return; }
        set(s => ({ cart: s.cart.map(i => i.product.id === id
          ? { ...i, quantity: qty, total: qty * i.unitPrice * (1 - i.discount / 100) }
          : i) }));
      },
      clearCart: () => set({ cart: [], passengerName: '', flightRef: '', destination: '' }),
      cartTotal: () => {
        const { cart, activeCurrency, rates } = get();
        return cart.reduce((sum, item) => {
          const xof = toXOF(item.total, item.currency as Currency, rates);
          if (activeCurrency === 'XOF') return sum + xof;
          const rate = activeCurrency === 'EUR' ? rates.EUR_XOF : rates.USD_XOF;
          return sum + xof / rate;
        }, 0);
      },
      cartItemCount: () => get().cart.reduce((s, i) => s + i.quantity, 0),

      passengerName: '', flightRef: '', destination: '',
      setPassenger: (name, flight, dest) => set({ passengerName: name, flightRef: flight, destination: dest }),
      clearPassenger: () => set({ passengerName: '', flightRef: '', destination: '' }),

      sales: [],
      offlineQueue: [],

      completeSale: (payments) => {
        const { cart, currentUser, activeCurrency, passengerName, flightRef, destination, isOnline, rates } = get();
        const now = new Date().toISOString();
        const total = get().cartTotal();
        const ticketNumber = `TK-${String(ticketCounter++).padStart(4, '0')}`;
        saveCounter();

        const sale: Sale = {
          id: `sale-${Date.now()}`,
          ticketNumber,
          cashierId: currentUser!.id,
          cashierName: currentUser!.name,
          registerNumber: currentUser!.registerId,
          items: [...cart],
          payments,
          subtotal: total,
          discountTotal: cart.reduce((s, i) => s + (i.unitPrice * i.quantity * i.discount / 100), 0),
          total,
          currency: activeCurrency,
          status: 'payée',
          createdAt: now,
          completedAt: now,
          passengerName,
          flightRef,
          destination,
          synced: isOnline,
        };

        // Construire le payload API
        const payload: VentePayload = {
          numero_ticket: ticketNumber,
          numero_caisse: currentUser!.registerId,
          devise: activeCurrency,
          sous_total: total,
          remise_totale: sale.discountTotal,
          total,
          passager_nom: passengerName,
          vol_reference: flightRef,
          destination,
          synced: isOnline,
          date_locale: now,
          lignes: cart.map(item => ({
            produit: item.product.id as unknown as number,
            quantite: item.quantity,
            prix_unitaire: item.unitPrice,
            devise: item.currency,
            remise: item.discount,
            total: item.total,
          })),
          paiements: payments.map(p => ({
            methode: p.method,
            devise: p.currency,
            montant: p.amount,
            montant_xof: p.amountXOF,
            monnaie_rendue: p.change || 0,
            taux_change: p.currency === 'EUR' ? rates.EUR_XOF : p.currency === 'USD' ? rates.USD_XOF : 1,
          })),
        };

        if (isOnline) {
          // Envoyer à l'API
          ventesApi.create(payload).catch(() => {
            // Si échec, mettre en queue
            set(s => ({ offlineQueue: [...s.offlineQueue, payload] }));
          });
        } else {
          set(s => ({ offlineQueue: [...s.offlineQueue, payload] }));
        }

        set(s => ({ sales: [sale, ...s.sales] }));
        get().clearCart();
        return sale;
      },

      syncOfflineQueue: async () => {
        const { offlineQueue } = get();
        if (offlineQueue.length === 0) return;
        try {
          const result = await ventesApi.syncOffline(offlineQueue);
          if (result.synced > 0) { set(s => ({ offlineQueue: [] }));
          }
        } catch { /* retry later */ }
      },

      login: (user) => set({ currentUser: user }),

      loginWithApi: async (username, password) => {
        try {
          await authApi.login(username, password);
          const me = await authApi.me();
          const user: User = {
            id: String(me.id),
            name: me.full_name,
            pin: '',
            role: me.role as User['role'],
            registerId: me.register_id || 'CAISSE',
          };
          set({ currentUser: user });
          return true;
        } catch { return false; }
      },

      logout: () => {
        authStorage.clear();
        set({ currentUser: null, cart: [] });
      },

      searchProducts: (q) => {
        const lower = q.toLowerCase();
        return get().products.filter(p =>
          p.nom.toLowerCase().includes(lower) ||
          p.code_barres?.includes(q) ||
          p.code.toLowerCase().includes(lower) ||
          p.categorie.toLowerCase().includes(lower)
        );
      },
    }),
    {
      name: 'df-caisse-store',
      // Ne persister que les données essentielles offline
      partialize: (s) => ({
        currentUser: s.currentUser,
        activeCurrency: s.activeCurrency,
        offlineQueue: s.offlineQueue,
        sales: s.sales.slice(0, 50), // Garder 50 dernières ventes
      }),
    }
  )
);
