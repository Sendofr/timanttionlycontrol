import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { SERVICES, PAYMENT_METHODS } from '../lib/constants';
import { formatCurrency, formatDate, formatTime, getDateRangeFilter } from '../lib/utils';
import type { Corte, DateRange, PaymentMethod, ServiceType } from '../types';
import { Scissors, Trash2, Clock, ChevronDown, ChevronUp } from 'lucide-react';

export default function Cortes() {
  const { user, profile } = useAuth();
  const [cortes, setCortes] = useState<Corte[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange>('dia');
  const [showHistory, setShowHistory] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('Efectivo');

  const fetchCortes = useCallback(async () => {
    if (!user) return;
    const start = getDateRangeFilter(range).toISOString();
    const { data } = await supabase
      .from('cortes')
      .select('*')
      .eq('barbero_id', user.id)
      .gte('creado_en', start)
      .order('creado_en', { ascending: false });
    setCortes(data ?? []);
    setLoading(false);
  }, [user, range]);

  useEffect(() => { fetchCortes(); }, [fetchCortes]);

  async function addCorte(servicio: ServiceType, precio: number) {
    if (!user) return;
    const { data, error } = await supabase
      .from('cortes')
      .insert({ barbero_id: user.id, servicio, precio, metodo_pago: selectedPayment })
      .select()
      .single();
    if (!error && data) {
      setCortes(prev => [data, ...prev]);
    }
  }

  async function deleteCorte(id: string) {
    const { error } = await supabase.from('cortes').delete().eq('id', id);
    if (!error) setCortes(prev => prev.filter(c => c.id !== id));
  }

  const todayTotal = cortes.reduce((sum, c) => sum + Number(c.precio), 0);
  const todayCount = cortes.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-diamond-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Mis Cortes</h2>
          <p className="text-sm text-gray-500">{profile?.display_name}</p>
        </div>
        <div className="flex gap-1 bg-dark-400 rounded-xl p-1">
          {(['dia', 'semana', 'mes'] as DateRange[]).map(r => (
            <button
              key={r}
              onClick={() => { setRange(r); setLoading(true); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                range === r ? 'bg-gradient-to-r from-diamond-400 to-diamond-500 text-dark-700' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {r === 'dia' ? 'Hoy' : r === 'semana' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card bg-dark-400">
          <p className="text-xs text-gray-500 mb-1">Total</p>
          <p className="text-xl font-bold text-diamond-400">{formatCurrency(todayTotal)}</p>
        </div>
        <div className="card bg-dark-400">
          <p className="text-xs text-gray-500 mb-1">Cortes</p>
          <p className="text-xl font-bold text-white">{todayCount}</p>
        </div>
      </div>

      {/* Payment method selector */}
      <div className="card">
        <p className="text-xs text-gray-500 mb-2">Método de pago</p>
        <div className="flex gap-2">
          {PAYMENT_METHODS.map(m => (
            <button
              key={m}
              onClick={() => setSelectedPayment(m)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedPayment === m
                  ? 'bg-gradient-to-r from-diamond-400 to-diamond-500 text-dark-700'
                  : 'bg-dark-400 text-gray-400 hover:text-gray-200 border border-dark-50/50'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Quick add buttons */}
      <div className="card">
        <p className="text-xs text-gray-500 mb-3">Registrar corte rápido</p>
        <div className="grid grid-cols-3 gap-2">
          {SERVICES.map(s => (
            <button
              key={s.name}
              onClick={() => addCorte(s.name, s.price)}
              className="bg-dark-400 border border-dark-50/50 rounded-xl p-3 hover:border-diamond-500/30 hover:bg-dark-200 active:scale-95 transition-all text-left"
            >
              <p className="text-sm font-semibold text-white">{s.name}</p>
              <p className="text-xs text-diamond-400 font-medium mt-0.5">{formatCurrency(s.price)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent cuts */}
      <div className="card">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-300">Historial reciente</span>
            <span className="text-xs text-gray-600">({cortes.length})</span>
          </div>
          {showHistory ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </button>

        {showHistory && (
          <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
            {cortes.length === 0 ? (
              <p className="text-center text-gray-600 text-sm py-4">Sin cortes registrados</p>
            ) : (
              cortes.map(c => (
                <div
                  key={c.id}
                  className="flex items-center justify-between bg-dark-400 rounded-xl px-3 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <Scissors className="w-4 h-4 text-diamond-400/70" />
                    <div>
                      <p className="text-sm font-medium text-white">{c.servicio}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(c.creado_en)} {formatTime(c.creado_en)} · {c.metodo_pago}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-diamond-400">
                      {formatCurrency(Number(c.precio))}
                    </span>
                    <button
                      onClick={() => deleteCorte(c.id)}
                      className="p-1.5 rounded-lg hover:bg-red-900/30 text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
