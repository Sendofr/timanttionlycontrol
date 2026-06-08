import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { formatCurrency, formatDate, formatTime, getDateRangeFilter } from '../lib/utils';
import type { Producto, VentaProducto, DateRange } from '../types';
import { Package, Plus, Minus, ShoppingCart, X, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

export default function Inventario() {
  const { user } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventas, setVentas] = useState<VentaProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange>('dia');
  const [showAdd, setShowAdd] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [newNombre, setNewNombre] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newPrecioCosto, setNewPrecioCosto] = useState('');
  const [newPrecioVenta, setNewPrecioVenta] = useState('');

  const fetchData = useCallback(async () => {
    const [prodRes, ventaRes] = await Promise.all([
      supabase.from('productos').select('*').order('nombre'),
      user
        ? supabase
            .from('ventas_productos')
            .select('*, productos(nombre)')
            .eq('barbero_id', user.id)
            .gte('creado_en', getDateRangeFilter(range).toISOString())
            .order('creado_en', { ascending: false })
        : Promise.resolve({ data: [] as VentaProducto[] }),
    ]);
    setProductos(prodRes.data ?? []);
    setVentas(ventaRes.data ?? []);
    setLoading(false);
  }, [user, range]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function addProducto() {
    if (!newNombre.trim() || !newPrecioVenta) return;
    const { data, error } = await supabase
      .from('productos')
      .insert({
        nombre: newNombre.trim(),
        stock: Number(newStock) || 0,
        precio_costo: Number(newPrecioCosto) || 0,
        precio_venta: Number(newPrecioVenta),
      })
      .select()
      .single();
    if (!error && data) {
      setProductos(prev => [...prev, data]);
      setNewNombre('');
      setNewStock('');
      setNewPrecioCosto('');
      setNewPrecioVenta('');
      setShowAdd(false);
    }
  }

  async function sellProducto(producto: Producto) {
    if (!user || producto.stock <= 0) return;
    const total = Number(producto.precio_venta);
    const { data: ventaData, error: ventaErr } = await supabase
      .from('ventas_productos')
      .insert({
        producto_id: producto.id,
        cantidad: 1,
        barbero_id: user.id,
        total_venta: total,
      })
      .select('*, productos(nombre)')
      .single();
    if (ventaErr) return;

    const { error: stockErr } = await supabase
      .from('productos')
      .update({ stock: producto.stock - 1 })
      .eq('id', producto.id);

    if (!stockErr && ventaData) {
      setProductos(prev =>
        prev.map(p => (p.id === producto.id ? { ...p, stock: p.stock - 1 } : p))
      );
      setVentas(prev => [ventaData, ...prev]);
    }
  }

  async function deleteProducto(id: string) {
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (!error) setProductos(prev => prev.filter(p => p.id !== id));
  }

  async function deleteVenta(ventaId: string, productId: string) {
    const { error: deleteErr } = await supabase.from('ventas_productos').delete().eq('id', ventaId);
    if (deleteErr) return;

    const producto = productos.find(p => p.id === productId);
    if (!producto) return;

    const { error: stockErr } = await supabase
      .from('productos')
      .update({ stock: producto.stock + 1 })
      .eq('id', productId);

    if (!stockErr) {
      setProductos(prev =>
        prev.map(p => (p.id === productId ? { ...p, stock: p.stock + 1 } : p))
      );
      setVentas(prev => prev.filter(v => v.id !== ventaId));
    }
  }

  const ventasTotal = ventas.reduce((s, v) => s + Number(v.total_venta), 0);

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
          <h2 className="text-lg font-bold text-white">Inventario</h2>
          <p className="text-sm text-gray-500">Productos y ventas</p>
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
          <p className="text-xs text-gray-500 mb-1">Mis ventas</p>
          <p className="text-xl font-bold text-diamond-400">{formatCurrency(ventasTotal)}</p>
        </div>
        <div className="card bg-dark-400">
          <p className="text-xs text-gray-500 mb-1">Productos</p>
          <p className="text-xl font-bold text-white">{productos.length}</p>
        </div>
      </div>

      {/* Add product button */}
      <button
        onClick={() => setShowAdd(!showAdd)}
        className="btn-gold w-full flex items-center justify-center gap-2"
      >
        {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        {showAdd ? 'Cancelar' : 'Agregar producto'}
      </button>

      {/* Add product form */}
      {showAdd && (
        <div className="card space-y-3">
          <input
            type="text"
            placeholder="Nombre del producto"
            value={newNombre}
            onChange={e => setNewNombre(e.target.value)}
            className="input-field"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              placeholder="Stock"
              value={newStock}
              onChange={e => setNewStock(e.target.value)}
              className="input-field"
            />
            <input
              type="number"
              placeholder="$ Costo"
              value={newPrecioCosto}
              onChange={e => setNewPrecioCosto(e.target.value)}
              className="input-field"
            />
            <input
              type="number"
              placeholder="$ Venta"
              value={newPrecioVenta}
              onChange={e => setNewPrecioVenta(e.target.value)}
              className="input-field"
            />
          </div>
          <button onClick={addProducto} className="btn-gold w-full">
            Guardar producto
          </button>
        </div>
      )}

      {/* Product list */}
      <div className="space-y-2">
        {productos.length === 0 ? (
          <div className="card text-center py-8">
            <Package className="w-10 h-10 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Sin productos registrados</p>
          </div>
        ) : (
          productos.map(p => (
            <div key={p.id} className="card flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{p.nombre}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-500">Stock: <span className={p.stock <= 2 ? 'text-red-400 font-medium' : 'text-gray-300'}>{p.stock}</span></span>
                  <span className="text-xs text-diamond-400">{formatCurrency(Number(p.precio_venta))}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => sellProducto(p)}
                  disabled={p.stock <= 0}
                  className="flex items-center gap-1.5 bg-diamond-500/10 border border-diamond-500/20 text-diamond-400 px-3 py-2 rounded-xl text-sm font-medium hover:bg-diamond-500/20 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Vender
                </button>
                <button
                  onClick={() => deleteProducto(p.id)}
                  className="p-2 rounded-lg hover:bg-red-900/30 text-gray-600 hover:text-red-400 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sales history */}
      <div className="card">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-300">Mis ventas</span>
            <span className="text-xs text-gray-600">({ventas.length})</span>
          </div>
          {showHistory ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </button>

        {showHistory && (
          <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
            {ventas.length === 0 ? (
              <p className="text-center text-gray-600 text-sm py-4">Sin ventas registradas</p>
            ) : (
              ventas.map(v => (
                <div key={v.id} className="flex items-center justify-between bg-dark-400 rounded-xl px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{(v.productos as Producto)?.nombre ?? 'Producto'}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(v.creado_en)} {formatTime(v.creado_en)} · x{v.cantidad}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className="text-sm font-semibold text-diamond-400">
                      {formatCurrency(Number(v.total_venta))}
                    </span>
                    <button
                      onClick={() => deleteVenta(v.id, v.producto_id)}
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
