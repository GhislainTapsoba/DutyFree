import { create } from 'zustand';
import { ventesApi, authApi, authStorage } from '../api';
import type { DashboardData, VenteListItem, TauxCapture } from '../api';
import { kpis, dailyCA, caByCategory, caByPayment, caByCashier, recentSales, passengerData } from '../data/mock';

interface BackofficeStore {
  // Auth
  user: { id: number; username: string; full_name: string; role: string } | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;

  // Dashboard
  dashboardData: DashboardData | null;
  dashboardLoading: boolean;
  isOffline: boolean;
  fetchDashboard: () => Promise<void>;

  // Ventes
  ventes: VenteListItem[];
  ventesLoading: boolean;
  fetchVentes: (params?: string) => Promise<void>;

  // Taux capture
  tauxCapture: TauxCapture[];
  fetchTauxCapture: () => Promise<void>;
}

// Mock fallback pour le dashboard
const mockDashboard: DashboardData = {
  ca_month: kpis.caTotal,
  ca_today: dailyCA[dailyCA.length - 1]?.ca || 0,
  tickets_month: kpis.totalTickets,
  tickets_today: dailyCA[dailyCA.length - 1]?.tickets || 0,
  ticket_moyen: kpis.ticketMoyen,
  ca_daily: dailyCA.map(d => ({ jour: d.date, ca: d.ca, tickets: d.tickets })),
  ca_by_categorie: caByCategory.map(c => ({
    lignes__produit__categorie: c.category,
    ca: c.ca,
    tickets: c.tickets,
  })),
  ca_by_cashier: caByCashier.map(c => ({
    caissier__first_name: c.name.split(' ')[0],
    caissier__last_name: c.name.split(' ')[1] || '',
    ca: c.ca,
    tickets: c.tickets,
  })),
};

export const useBackofficeStore = create<BackofficeStore>((set, get) => ({
  user: null,
  isAuthenticated: !!authStorage.getAccess(),
  authLoading: false,
  authError: null,

  login: async (username, password) => {
    set({ authLoading: true, authError: null });
    try {
      await authApi.login(username, password);
      const user = await authApi.me();
      set({ user, isAuthenticated: true, authLoading: false });
      return true;
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || 'Identifiants incorrects';
      set({ authError: msg, authLoading: false });
      return false;
    }
  },

  logout: () => {
    authApi.logout();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    if (!authStorage.getAccess()) return;
    try {
      const user = await authApi.me();
      set({ user, isAuthenticated: true });
    } catch {
      authStorage.clear();
      set({ user: null, isAuthenticated: false });
    }
  },

  dashboardData: null,
  dashboardLoading: false,
  isOffline: false,

  fetchDashboard: async () => {
    set({ dashboardLoading: true });
    try {
      const data = await ventesApi.dashboard();
      set({ dashboardData: data, dashboardLoading: false, isOffline: false });
    } catch {
      // Fallback données mock
      set({ dashboardData: mockDashboard, dashboardLoading: false, isOffline: true });
    }
  },

  ventes: [],
  ventesLoading: false,
  fetchVentes: async (params = '') => {
    set({ ventesLoading: true });
    try {
      const res = await ventesApi.list(params);
      set({ ventes: res.results, ventesLoading: false });
    } catch {
      set({ ventes: recentSales as unknown as VenteListItem[], ventesLoading: false });
    }
  },

  tauxCapture: [],
  fetchTauxCapture: async () => {
    try {
      const data = await ventesApi.tauxCapture();
      set({ tauxCapture: data });
    } catch {
      set({ tauxCapture: passengerData.map(p => ({
        annee: 2025, mois: ['Janv.','Févr.','Mars','Avr.','Mai','Juin'].indexOf(p.month) + 1,
        passagers: p.passagers, tickets: p.tickets, taux: p.taux,
      })) });
    }
  },
}));
