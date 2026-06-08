import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';
import { DiamondLogo } from './components/DiamondLogo';
import Login from './pages/Login';
import Cortes from './pages/Cortes';
import Inventario from './pages/Inventario';
import Gastos from './pages/Gastos';
import Dashboard from './pages/Dashboard';
import Setup from './pages/Setup';
import { Scissors, Package, Receipt, BarChart3, LogOut } from 'lucide-react';

type Tab = 'cortes' | 'inventario' | 'gastos' | 'dashboard';

const TABS: { id: Tab; label: string; icon: typeof Scissors }[] = [
  { id: 'cortes', label: 'Cortes', icon: Scissors },
  { id: 'inventario', label: 'Productos', icon: Package },
  { id: 'gastos', label: 'Gastos', icon: Receipt },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
];

function AppContent() {
  const { user, profile, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('cortes');
  const [dbReady, setDbReady] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkDb() {
      try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        setDbReady(!error);
      } catch {
        setDbReady(false);
      }
    }
    checkDb();
  }, []);

  if (dbReady === null) {
    return (
      <div className="min-h-screen bg-dark-700 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-diamond-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (dbReady === false) {
    return <Setup />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-700 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-diamond-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !profile) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-dark-700 flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-dark-700 to-dark-600 backdrop-blur-md border-b border-diamond-500/10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-diamond-500/10 border border-diamond-500/20 flex items-center justify-center glow-diamond">
              <DiamondLogo className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-display font-bold text-white leading-tight">
                <span className="bg-gradient-to-r from-diamond-300 to-diamond-500 bg-clip-text text-transparent">
                  Timantti
                </span>
              </h1>
              <p className="text-[10px] text-gray-500 leading-tight">{profile.display_name}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-gray-500 hover:text-diamond-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-dark-400"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs">Salir</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4">
        {activeTab === 'cortes' && <Cortes />}
        {activeTab === 'inventario' && <Inventario />}
        {activeTab === 'gastos' && <Gastos />}
        {activeTab === 'dashboard' && <Dashboard />}
      </main>

      {/* Bottom navigation */}
      <nav className="sticky bottom-0 z-50 bg-gradient-to-t from-dark-700 to-dark-600 backdrop-blur-md border-t border-diamond-500/10">
        <div className="max-w-lg mx-auto flex">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-all duration-150 relative ${
                  isActive ? 'text-diamond-400' : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] font-medium">{tab.label}</span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-diamond-400 to-diamond-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
