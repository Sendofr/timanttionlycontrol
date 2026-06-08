export interface Profile {
  id: string;
  display_name: string;
  created_at: string;
}

export interface Corte {
  id: string;
  barbero_id: string;
  servicio: string;
  precio: number;
  metodo_pago: 'Efectivo' | 'Transferencia' | 'Tarjeta';
  creado_en: string;
}

export interface Producto {
  id: string;
  nombre: string;
  stock: number;
  precio_costo: number;
  precio_venta: number;
  creado_en: string;
}

export interface VentaProducto {
  id: string;
  producto_id: string;
  cantidad: number;
  barbero_id: string;
  total_venta: number;
  creado_en: string;
  productos?: Producto;
}

export interface Gasto {
  id: string;
  descripcion: string;
  monto: number;
  categoria: 'Fijo' | 'Variable';
  creado_en: string;
}

export type ServiceType = 'Corte' | 'Barba' | 'Combo' | 'Afeitado' | 'Cejas' | 'Tratamiento';
export type PaymentMethod = 'Efectivo' | 'Transferencia' | 'Tarjeta';
export type ExpenseCategory = 'Fijo' | 'Variable';
export type DateRange = 'dia' | 'semana' | 'mes';
