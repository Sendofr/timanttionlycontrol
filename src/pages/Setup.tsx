import { useState } from 'react';
import { SETUP_SQL } from '../lib/sql-setup';
import { DiamondLogo } from '../components/DiamondLogo';
import { Database, Copy, Check, ExternalLink } from 'lucide-react';

export default function Setup() {
  const [copied, setCopied] = useState(false);

  function copySQL() {
    navigator.clipboard.writeText(SETUP_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-dark-700 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-diamond-500/10 border-2 border-diamond-500/30 mb-3 glow-diamond">
            <DiamondLogo className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">
            <span className="bg-gradient-to-r from-diamond-300 to-diamond-500 bg-clip-text text-transparent">
              Timantti
            </span>
          </h1>
          <p className="text-diamond-400 font-semibold text-sm mt-1">Barber Shop</p>
          <p className="text-sm text-gray-500 mt-2">Configuración inicial</p>
        </div>

        {/* Steps */}
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-diamond-500/10 border border-diamond-500/20 flex items-center justify-center text-diamond-400 text-sm font-bold shrink-0">1</div>
            <div>
              <p className="text-sm font-semibold text-white">Ve al SQL Editor de Supabase</p>
              <p className="text-xs text-gray-500 mt-0.5">Abre tu proyecto en supabase.com/dashboard y ve a SQL Editor</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-diamond-500/10 border border-diamond-500/20 flex items-center justify-center text-diamond-400 text-sm font-bold shrink-0">2</div>
            <div>
              <p className="text-sm font-semibold text-white">Copia y ejecutá el SQL</p>
              <p className="text-xs text-gray-500 mt-0.5">Pega el script completo y haz clic en Run</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-diamond-500/10 border border-diamond-500/20 flex items-center justify-center text-diamond-400 text-sm font-bold shrink-0">3</div>
            <div>
              <p className="text-sm font-semibold text-white">Recarga esta página</p>
              <p className="text-xs text-gray-500 mt-0.5">Las tablas estarán listas y podrás crear tu cuenta</p>
            </div>
          </div>
        </div>

        {/* SQL Code */}
        <div className="card bg-dark-400">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-diamond-400" />
              <span className="text-sm font-semibold text-white">Script SQL</span>
            </div>
            <button onClick={copySQL} className="flex items-center gap-1.5 text-xs text-diamond-400 hover:text-diamond-300 transition-colors">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
          <pre className="text-[10px] leading-relaxed text-gray-400 bg-dark-500 rounded-xl p-3 max-h-48 overflow-y-auto whitespace-pre-wrap">
            {SETUP_SQL}
          </pre>
        </div>

        {/* Link to Supabase */}
        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-diamond w-full flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Abrir Supabase Dashboard
        </a>
      </div>
    </div>
  );
}
