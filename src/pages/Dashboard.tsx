import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { formatCurrency, getDateRangeFilter } from '../lib/utils';
import type { Corte, VentaProducto, Gasto, Profile, DateRange } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Scissors, Package, Users, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthName } from '../lib/utils';

export default function Dashboard() {
  const [range, setRange] = useState<DateRange>('dia');
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [loading, setLoading] = useState(true);
  const [cortes, setCortes] = useState<Corte[]>([]);
  const [ventas, setVentas] = useState<VentaProducto[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const start = getDateRangeFilter(
      range,
      range === 'mes' ? selectedYear : undefined,
      range === 'mes' ? selectedMonth : undefined
    ).toISOString();

    const [cortesRes, ventasRes, gastosRes, profilesRes] = await Promise.all([
      supabase.from('cortes').select('*').gte('creado_en', start),
      supabase.from('ventas_productos').select('*').gte('creado_en', start),
      supabase.from('gastos').select('*').gte('creado_en', start),
      supabase.from('profiles').select('*'),
    ]);

    setCortes(cortesRes.data ?? []);
    setVentas(ventasRes.data ?? []);
    setGastos(gastosRes.data ?? []);
    setProfiles(profilesRes.data ?? []);
    setLoading(false);
  }, [range, selectedYear, selectedMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const ingresosCortes = cortes.reduce((s, c) => s + Number(c.precio), 0);
  const ingresosVentas = ventas.reduce((s, v) => s + Number(v.total_venta), 0);
  const ingresosTotales = ingresosCortes + ingresosVentas;
  const gastosTotales = gastos.reduce((s, g) => s + Number(g.monto), 0);
  const gananciaReal = ingresosTotales - gastosTotales;

  const performanceByBarbero = profiles.map(p => {
    const barberoCortes = cortes.filter(c => c.barbero_id === p.id);
    const barberoVentas = ventas.filter(v => v.barbero_id === p.id);
    const cortesIngresos = barberoCortes.reduce((s, c) => s + Number(c.precio), 0);
    const ventasIngresos = barberoVentas.reduce((s, v) => s + Number(v.total_venta), 0);
    return {
      id: p.id,
      name: p.display_name,
      cortesCount: barberoCortes.length,
      cortesIngresos,
      ventasIngresos,
      totalIngresos: cortesIngresos + ventasIngresos,
    };
  }).sort((a, b) => b.totalIngresos - a.totalIngresos);

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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Dashboard</h2>
            <p className="text-sm text-gray-500">Resumen financiero</p>
          </div>
          <div className="flex gap-1 bg-dark-400 rounded-xl p-1">
            {(['dia', 'semana', 'mes'] as DateRange[]).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  range === r ? 'bg-gradient-to-r from-diamond-400 to-diamond-500 text-dark-700' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {r === 'dia' ? 'Hoy' : r === 'semana' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
        </div>

        {/* Month/Year selector for historical data */}
        {range === 'mes' && (
          <div className="card flex items-center justify-between">
            <button
              onClick={() => {
                if (selectedMonth === 0) {
                  setSelectedMonth(11);
                  setSelectedYear(selectedYear - 1);
                } else {
                  setSelectedMonth(selectedMonth - 1);
                }
                setLoading(true);
              }}
              className="p-2 hover:bg-dark-500 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={e => {
                  setSelectedMonth(parseInt(e.target.value));
                  setLoading(true);
                }}
                className="bg-dark-500 text-white text-sm rounded-lg px-3 py-1.5 border border-dark-300 focus:border-diamond-400 outline-none transition-colors"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {getMonthName(i)}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={e => {
                  setSelectedYear(parseInt(e.target.value));
                  setLoading(true);
                }}
                className="bg-dark-500 text-white text-sm rounded-lg px-3 py-1.5 border border-dark-300 focus:border-diamond-400 outline-none transition-colors"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>
            <button
              onClick={() => {
                if (selectedMonth === 11) {
                  setSelectedMonth(0);
                  setSelectedYear(selectedYear + 1);
                } else {
                  setSelectedMonth(selectedMonth + 1);
                }
                setLoading(true);
              }}
              className="p-2 hover:bg-dark-500 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {/* Main profit card */}
      <div className="card bg-gradient-to-br from-dark-200 to-dark-400 border-diamond-500/10">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-400">Ganancia Real</p>
          {gananciaReal >= 0 ? (
            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
          ) : (
            <ArrowDownRight className="w-5 h-5 text-red-400" />
          )}
        </div>
        <p className={`text-3xl font-bold ${gananciaReal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatCurrency(gananciaReal)}
        </p>
        <div className="mt-3 h-2 bg-dark-500 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              gananciaReal >= 0 ? 'bg-gradient-to-r from-diamond-500 to-emerald-400' : 'bg-red-500'
            }`}
            style={{ width: `${ingresosTotales > 0 ? Math.min(Math.max((gananciaReal / ingresosTotales) * 100, 0), 100) : 0}%` }}
          />
        </div>
      </div>

      {/* Income / Expense cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card bg-dark-400">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <p className="text-xs text-gray-500">Ingresos</p>
          </div>
          <p className="text-lg font-bold text-emerald-400">{formatCurrency(ingresosTotales)}</p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 flex items-center gap-1">
                <Scissors className="w-3 h-3" /> Cortes
              </span>
              <span className="text-gray-300">{formatCurrency(ingresosCortes)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 flex items-center gap-1">
                <Package className="w-3 h-3" /> Productos
              </span>
              <span className="text-gray-300">{formatCurrency(ingresosVentas)}</span>
            </div>
          </div>
        </div>

        <div className="card bg-dark-400">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <p className="text-xs text-gray-500">Gastos</p>
          </div>
          <p className="text-lg font-bold text-red-400">{formatCurrency(gastosTotales)}</p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Fijos</span>
              <span className="text-orange-300">
                {formatCurrency(gastos.filter(g => g.categoria === 'Fijo').reduce((s, g) => s + Number(g.monto), 0))}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Variables</span>
              <span className="text-yellow-300">
                {formatCurrency(gastos.filter(g => g.categoria === 'Variable').reduce((s, g) => s + Number(g.monto), 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card bg-dark-400 text-center py-3">
          <Scissors className="w-5 h-5 text-diamond-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{cortes.length}</p>
          <p className="text-xs text-gray-500">Cortes</p>
        </div>
        <div className="card bg-dark-400 text-center py-3">
          <Package className="w-5 h-5 text-diamond-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{ventas.length}</p>
          <p className="text-xs text-gray-500">Ventas</p>
        </div>
        <div className="card bg-dark-400 text-center py-3">
          <DollarSign className="w-5 h-5 text-diamond-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{gastos.length}</p>
          <p className="text-xs text-gray-500">Gastos</p>
        </div>
      </div>

      {/* Barber performance */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-diamond-400" />
          <p className="text-sm font-semibold text-white">Rendimiento individual</p>
        </div>

        {performanceByBarbero.length === 0 ? (
          <p className="text-center text-gray-600 text-sm py-4">Sin barberos registrados</p>
        ) : (
          <div className="space-y-3">
            {performanceByBarbero.map((b, idx) => (
              <div key={b.id} className="bg-dark-400 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-gradient-to-r from-diamond-400 to-diamond-500 text-dark-700' : 'bg-dark-50 text-gray-300'
                    }`}>
                      {idx + 1}
                    </div>
                    <span className="text-sm font-medium text-white">{b.name}</span>
                  </div>
                  <span className="text-sm font-bold text-diamond-400">
                    {formatCurrency(b.totalIngresos)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-dark-500 rounded-lg px-2 py-1.5">
                    <span className="text-gray-500">Cortes: </span>
                    <span className="text-gray-200 font-medium">{b.cortesCount}</span>
                    <span className="text-gray-600 ml-1">({formatCurrency(b.cortesIngresos)})</span>
                  </div>
                  <div className="bg-dark-500 rounded-lg px-2 py-1.5">
                    <span className="text-gray-500">Ventas: </span>
                    <span className="text-gray-200 font-medium">{formatCurrency(b.ventasIngresos)}</span>
                  </div>
                </div>
                {ingresosTotales > 0 && (
                  <div className="mt-2 h-1.5 bg-dark-500 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-diamond-500 to-diamond-300 rounded-full transition-all duration-500"
                      style={{ width: `${(b.totalIngresos / ingresosTotales) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment method breakdown */}
      {cortes.length > 0 && (
        <div className="card">
          <p className="text-sm font-semibold text-white mb-3">Cortes por método de pago</p>
          <div className="space-y-2">
            {(['Efectivo', 'Transferencia', 'Tarjeta'] as const).map(method => {
              const methodCortes = cortes.filter(c => c.metodo_pago === method);
              const methodTotal = methodCortes.reduce((s, c) => s + Number(c.precio), 0);
              if (methodCortes.length === 0) return null;
              return (
                <div key={method} className="flex items-center justify-between bg-dark-400 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">{method}</span>
                    <span className="text-xs text-gray-600">({methodCortes.length})</span>
                  </div>
                  <span className="text-sm font-medium text-diamond-400">{formatCurrency(methodTotal)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
