import type { ServiceType, PaymentMethod } from '../types';

export const SERVICES: { name: ServiceType; price: number }[] = [
  { name: 'Corte', price: 40000 },
  { name: 'Barba', price: 25000 },
  { name: 'Combo', price: 60000 },
  { name: 'Cejas', price: 10000 },
  { name: 'Lavado', price: 10000 },
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Efectivo',
  'Transferencia',
  'Tarjeta',
];
