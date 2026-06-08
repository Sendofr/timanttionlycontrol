import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { formatCurrency, formatDate, formatTime, getDateRangeFilter } from '../lib/utils';
import type { Gasto, DateRange, ExpenseCategory } from '../types';
import { Receipt, Plus, X, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function Gastos() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange>('dia');
  const [showAdd, setShowAdd] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState<ExpenseCategory>('Variable');

  const fetchGastos = useCallback(async () => {
    const start = getDateRangeFilter(range).toISOString();
    const { data } = await supabase
      .from('gastos')
      .select('*')
      .gte('creado_en', start)
      .order('creado_en', { ascending: false });
    setGastos(data ?? []);
    setLoading(false);
  }, [range]);

  useEffect(() => { fetchGastos(); }, [fetchGastos]);

  async function addGasto() {
    if (!descripcion.trim() || !monto) return;
    const { data, error } = await supabase
      .from('gastos')
      .insert({
        descripcion: descripcion.trim(),
        monto: Number(monto),
        categoria,
      })
      .select()
      .single();
    if (!error && data) {
      setGastos(prev => [data, ...prev]);
      setDescripcion('');
      setMonto('');
      setShowAdd(false);
    }
  }

  async function deleteGasto(id: string) {
    const { error } = await supabase.from('gastos').delete().eq('id', id);
    if (!error) setGastos(prev => prev.filter(g => g.id !== id));
  }

  const totalGastos = gastos.reduce((s, g) => s + Number(g.monto), 0);
  const gastosFijos = gastos.filter(g => g.categoria === 'Fijo').reduce((s, g) => s + Number(g.monto), 0);
  const gastosVariables = gastos.filter(g => g.categoria === 'Variable').reduce((s, g) => s + Number(g.monto), 0);

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
          <h2 className="text-lg font-bold text-white">Gastos</h2>
          <p className="text-sm text-gray-500">Registro de gastos del negocio</p>
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
      <div className="grid grid-cols-3 gap-3">
        <div className="card bg-dark-400">
          <p className="text-xs text-gray-500 mb-1">Total</p>
          <p className="text-lg font-bold text-red-400">{formatCurrency(totalGastos)}</p>
        </div>
        <div className="card bg-dark-400">
          <p className="text-xs text-gray-500 mb-1">Fijos</p>
          <p className="text-lg font-bold text-orange-400">{formatCurrency(gastosFijos)}</p>
        </div>
        <div className="card bg-dark-400">
          <p className="text-xs text-gray-500 mb-1">Variables</p>
          <p className="text-lg font-bold text-yellow-400">{formatCurrency(gastosVariables)}</p>
        </div>
      </div>

      {/* Add expense button */}
      <button
        onClick={() => setShowAdd(!showAdd)}
        className="btn-gold w-full flex items-center justify-center gap-2"
      >
        {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        {showAdd ? 'Cancelar' : 'Registrar gasto'}
      </button>

      {/* Add expense form */}
      {showAdd && (
        <div className="card space-y-3">
          <input
            type="text"
            placeholder="Descripción (ej: Alquiler, Luz, Navajas)"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Monto"
            value={monto}
            onChange={e => setMonto(e.target.value)}
            className="input-field"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setCategoria('Fijo')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                categoria === 'Fijo'
                  ? 'bg-orange-500/20 border border-orange-500/30 text-orange-400'
                  : 'bg-dark-400 text-gray-400 border border-dark-50/50'
              }`}
            >
              Fijo
            </button>
            <button
              onClick={() => setCategoria('Variable')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                categoria === 'Variable'
                  ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400'
                  : 'bg-dark-400 text-gray-400 border border-dark-50/50'
              }`}
            >
              Variable
            </button>
          </div>
          <button onClick={addGasto} className="btn-gold w-full">
            Guardar gasto
          </button>
        </div>
      )}

      {/* Expense history */}
      <div className="card">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-300">Historial</span>
            <span className="text-xs text-gray-600">({gastos.length})</span>
          </div>
          {showHistory ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </button>

        {showHistory && (
          <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
            {gastos.length === 0 ? (
              <p className="text-center text-gray-600 text-sm py-4">Sin gastos registrados</p>
            ) : (
              gastos.map(g => (
                <div key={g.id} className="flex items-center justify-between bg-dark-400 rounded-xl px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{g.descripcion}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                        g.categoria === 'Fijo'
                          ? 'bg-orange-500/10 text-orange-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {g.categoria}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(g.creado_en)} {formatTime(g.creado_en)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-red-400">
                      {formatCurrency(Number(g.monto))}
                    </span>
                    <button
                      onClick={() => deleteGasto(g.id)}
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
