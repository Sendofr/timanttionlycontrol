import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { DiamondLogo } from '../components/DiamondLogo';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isSignUp) {
      if (!displayName.trim()) {
        setError('Ingresa tu nombre');
        setLoading(false);
        return;
      }
      const { error: err } = await signUp(email, password, displayName.trim());
      if (err) {
        setError(err.message.includes('already registered')
          ? 'Este email ya está registrado. Inicia sesión.'
          : err.message);
      }
    } else {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError('Email o contraseña incorrectos');
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-dark-700 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-diamond-500/10 border-2 border-diamond-500/30 mb-4 glow-diamond">
            <DiamondLogo className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            <span className="bg-gradient-to-r from-diamond-300 to-diamond-500 bg-clip-text text-transparent">
              Timantti
            </span>
          </h1>
          <p className="text-diamond-400 font-semibold mt-1 text-sm">Barber Shop</p>
          <p className="text-gray-500 mt-2 text-sm">Sistema de gestión</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Tu nombre (ej: Hermano 1)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input-field pl-11"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field pl-11"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pl-11"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-800/30 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-diamond w-full text-base"
          >
            {loading ? 'Cargando...' : isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            className="text-gray-400 text-sm hover:text-diamond-400 transition-colors"
          >
            {isSignUp ? 'Ya tengo cuenta — Iniciar sesión' : 'No tengo cuenta — Crear cuenta'}
          </button>
        </div>

        {/* Setup info */}
        <div className="mt-8 card bg-dark-400/50 border-dark-50/30">
          <p className="text-xs text-gray-500 leading-relaxed">
            Cada barbero crea su propia cuenta con email y contraseña.
            Al iniciar sesión solo verás tus propios cortes y ventas.
            Los gastos y el inventario son compartidos.
          </p>
        </div>
      </div>
    </div>
  );
}
