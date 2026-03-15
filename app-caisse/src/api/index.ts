/**
 * api.ts — Client HTTP centralisé pour les 3 apps
 * - JWT auto-refresh (intercepteur)
 * - Gestion mode offline (queue)
 * - Base URL configurable par .env
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ── Storage helpers ──────────────────────────────────────────────────
const TOKEN_KEY = 'df_access';
const REFRESH_KEY = 'df_refresh';

export const authStorage = {
  getAccess: () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (access: string, refresh: string) => {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// ── Types ────────────────────────────────────────────────────────────
export interface ApiError {
  status: number;
  message: string;
  detail?: Record<string, unknown>;
}

// ── Fetch wrapper avec JWT ───────────────────────────────────────────
async function refreshTokens(): Promise<string | null> {
  const refresh = authStorage.getRefresh();
  if (!refresh) return null;
  try {
    const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) { authStorage.clear(); return null; }
    const data = await res.json();
    authStorage.set(data.access, refresh);
    return data.access;
  } catch {
    return null;
  }
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = authStorage.getAccess();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  // Token expiré → refresh automatique
  if (res.status === 401 && retry) {
    const newToken = await refreshTokens();
    if (newToken) return apiFetch<T>(endpoint, options, false);
    authStorage.clear();
    window.dispatchEvent(new Event('auth:logout'));
    throw { status: 401, message: 'Session expirée' } as ApiError;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw {
      status: res.status,
      message: body.detail || body.message || `Erreur ${res.status}`,
      detail: body,
    } as ApiError;
  }

  // 204 No Content
  if (res.status === 204) return null as T;
  return res.json();
}

// ── API helpers ──────────────────────────────────────────────────────
export const api = {
  get: <T>(url: string) => apiFetch<T>(url),
  post: <T>(url: string, data: unknown) =>
    apiFetch<T>(url, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(url: string, data: unknown) =>
    apiFetch<T>(url, { method: 'PUT', body: JSON.stringify(data) }),
  patch: <T>(url: string, data: unknown) =>
    apiFetch<T>(url, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(url: string) => apiFetch<T>(url, { method: 'DELETE' }),
};

// ── Auth ─────────────────────────────────────────────────────────────
export const authApi = {
  login: async (username: string, password: string) => {
    const data = await api.post<{ access: string; refresh: string }>(
      '/auth/token/',
      { username, password }
    );
    authStorage.set(data.access, data.refresh);
    return data;
  },
  logout: () => authStorage.clear(),
  me: () => api.get<{ id: number; username: string; full_name: string; role: string; register_id: string }>('/utilisateurs/me/'),
};

// ── Stock ─────────────────────────────────────────────────────────────
export const stockApi = {
  produits: {
    list: (params = '') => api.get<PaginatedResponse<Produit>>(`/stock/produits/${params}`),
    get: (id: number) => api.get<Produit>(`/stock/produits/${id}/`),
    byBarcode: (code: string) => api.get<Produit>(`/stock/produits/par_barcode/?code=${code}`),
    alertes: () => api.get<{ ruptures: Produit[]; critiques: Produit[]; bas: Produit[] }>('/stock/produits/alertes/'),
    stats: () => api.get<StockStats>('/stock/produits/stats/'),
    create: (data: Partial<Produit>) => api.post<Produit>('/stock/produits/', data),
    update: (id: number, data: Partial<Produit>) => api.patch<Produit>(`/stock/produits/${id}/`, data),
  },
  fournisseurs: {
    list: () => api.get<PaginatedResponse<Fournisseur>>('/stock/fournisseurs/'),
    create: (data: Partial<Fournisseur>) => api.post<Fournisseur>('/stock/fournisseurs/', data),
  },
  sommiers: {
    list: () => api.get<PaginatedResponse<Sommier>>('/stock/sommiers/'),
    aApurer: () => api.get<Sommier[]>('/stock/sommiers/a_apurer/'),
  },
  mouvements: {
    list: (params = '') => api.get<PaginatedResponse<Mouvement>>(`/stock/mouvements/${params}`),
    create: (data: Partial<Mouvement>) => api.post<Mouvement>('/stock/mouvements/', data),
  },
  commandes: {
    list: () => api.get<PaginatedResponse<Commande>>('/stock/commandes/'),
    create: (data: Partial<Commande>) => api.post<Commande>('/stock/commandes/', data),
    recevoir: (id: number) => api.post(`/stock/commandes/${id}/recevoir/`, {}),
  },
};

// ── Ventes ────────────────────────────────────────────────────────────
export const ventesApi = {
  create: (data: VentePayload) => api.post<VenteResponse>('/ventes/', data),
  list: (params = '') => api.get<PaginatedResponse<VenteListItem>>(`/ventes/${params}`),
  syncOffline: (ventes: VentePayload[]) =>
    api.post<{ synced: number; errors: unknown[] }>('/ventes/sync_offline/', { ventes }),
  dashboard: () => api.get<DashboardData>('/ventes/dashboard/'),
  tauxCapture: () => api.get<TauxCapture[]>('/ventes/taux_capture/'),
  passagers: {
    list: () => api.get<PaginatedResponse<DonneesPassagers>>('/ventes/passagers/'),
    create: (data: Partial<DonneesPassagers>) => api.post<DonneesPassagers>('/ventes/passagers/', data),
  },
};

// ── Types partagés ────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Produit {
  id: number;
  code: string;
  code_barres: string;
  nom: string;
  nom_en: string;
  categorie: string;
  prix_xof: number;
  prix_eur: number;
  prix_usd: number;
  stock: number;
  stock_min: number;
  stock_max: number;
  unite: string;
  statut_stock: 'ok' | 'bas' | 'critique' | 'rupture';
  fournisseur: number | null;
  fournisseur_nom?: string;
  photo_url?: string;
}

export interface Fournisseur {
  id: number;
  nom: string;
  contact: string;
  email: string;
  telephone: string;
  pays: string;
  actif: boolean;
}

export interface Sommier {
  id: number;
  numero: string;
  reference_djbc: string;
  produit: number;
  produit_nom: string;
  quantite_initiale: number;
  quantite_entree: number;
  quantite_sortie: number;
  quantite_restante: number;
  taux_apurement: number;
  date_ouverture: string;
  date_apurement: string | null;
  statut: 'actif' | 'en_cours' | 'apure';
  notes: string;
}

export interface Mouvement {
  id: number;
  produit: number;
  produit_nom: string;
  sommier: number | null;
  type_mouvement: 'entree' | 'sortie' | 'ajustement' | 'rebut' | 'inventaire';
  quantite: number;
  stock_avant: number;
  stock_apres: number;
  motif: string;
  reference: string;
  utilisateur: number;
  utilisateur_nom: string;
  date: string;
}

export interface Commande {
  id: number;
  numero: string;
  fournisseur: number;
  fournisseur_nom: string;
  statut: 'brouillon' | 'envoyee' | 'recue' | 'validee' | 'annulee';
  devise: string;
  montant_total: number;
  frais_approche: number;
  notes: string;
  created_at: string;
  date_attendue: string | null;
  lignes: LigneCommande[];
}

export interface LigneCommande {
  id: number;
  produit: number;
  produit_nom: string;
  quantite: number;
  prix_unitaire: number;
  montant_total: number;
}

export interface StockStats {
  total: number;
  ruptures: number;
  en_alerte: number;
  valeur_stock: number;
}

export interface VentePayload {
  numero_ticket: string;
  numero_caisse: string;
  devise: string;
  sous_total: number;
  remise_totale: number;
  total: number;
  passager_nom?: string;
  vol_reference?: string;
  destination?: string;
  synced: boolean;
  date_locale: string;
  lignes: LigneVentePayload[];
  paiements: PaiementPayload[];
}

export interface LigneVentePayload {
  produit: number;
  quantite: number;
  prix_unitaire: number;
  devise: string;
  remise: number;
  total: number;
}

export interface PaiementPayload {
  methode: string;
  devise: string;
  montant: number;
  montant_xof: number;
  monnaie_rendue: number;
  taux_change: number;
}

export interface VenteResponse {
  id: number;
  numero_ticket: string;
}

export interface VenteListItem {
  id: number;
  numero_ticket: string;
  caissier_nom: string;
  numero_caisse: string;
  total: number;
  devise: string;
  statut: string;
  date_locale: string;
  passager_nom: string;
  vol_reference: string;
  destination: string;
  synced: boolean;
  nb_articles: number;
}

export interface DashboardData {
  ca_month: number;
  ca_today: number;
  tickets_month: number;
  tickets_today: number;
  ticket_moyen: number;
  ca_daily: { jour: string; ca: number; tickets: number }[];
  ca_by_categorie: { lignes__produit__categorie: string; ca: number; tickets: number }[];
  ca_by_cashier: { caissier__first_name: string; caissier__last_name: string; ca: number; tickets: number }[];
}

export interface TauxCapture {
  annee: number;
  mois: number;
  passagers: number;
  tickets: number;
  taux: number;
}

export interface DonneesPassagers {
  id: number;
  annee: number;
  mois: number;
  nombre_passagers: number;
  source: string;
  notes: string;
}
