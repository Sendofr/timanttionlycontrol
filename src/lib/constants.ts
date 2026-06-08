import type { ServiceType, PaymentMethod } from '../types';

export const SERVICES: { name: ServiceType; price: number }[] = [
  { name: 'Corte', price: 40000 },
  { name: 'Barba', price: 10000 },
  { name: 'Combo', price: 60000 },
  { name: 'Afeitado', price: 2500 },
  { name: 'Cejas', price: 10000 },
  { name: 'Tratamiento', price: 10000 },
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Efectivo',
  'Transferencia',
  'Tarjeta',
];
