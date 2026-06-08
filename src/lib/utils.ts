export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDateRangeFilter(range: 'dia' | 'semana' | 'mes', year?: number, month?: number): Date {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60 * 1000;
  const targetYear = year ?? now.getFullYear();
  const targetMonth = month ?? now.getMonth();

  switch (range) {
    case 'dia': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return new Date(start.getTime() + offset);
    }
    case 'semana': {
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek;
      const start = new Date(now.getFullYear(), now.getMonth(), diff);
      return new Date(start.getTime() + offset);
    }
    case 'mes': {
      const start = new Date(targetYear, targetMonth, 1);
      return new Date(start.getTime() + offset);
    }
  }
}

export function getMonthName(month: number): string {
  return new Date(2024, month, 1).toLocaleDateString('es-AR', { month: 'long' });
}
