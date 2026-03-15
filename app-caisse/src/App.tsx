import { useEffect } from 'react';
import { useCaisseStore } from './store/caisseStore';
import Login from './pages/Login';
import POS from './pages/POS';

export default function App() {
  const { currentUser, setOnline, isOnline, offlineQueue, syncOfflineQueue, loadProducts } = useCaisseStore();

  useEffect(() => {
    const on = () => { setOnline(true); syncOfflineQueue(); };
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, [setOnline, syncOfflineQueue]);

  useEffect(() => {
    if (currentUser) loadProducts();
  }, [currentUser, loadProducts]);

  // Sync automatique toutes les 2min si online et queue non vide
  useEffect(() => {
    if (!isOnline || offlineQueue.length === 0) return;
    const timer = setInterval(syncOfflineQueue, 120000);
    return () => clearInterval(timer);
  }, [isOnline, offlineQueue.length, syncOfflineQueue]);

  return currentUser ? <POS /> : <Login />;
}
