import { useState, FormEvent } from 'react';
import { Shield, Lock, User, ArrowRight } from 'lucide-react';
import { Pengguna } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: Pengguna) => void;
  penggunaList: Pengguna[];
}

export default function LoginPage({ onLoginSuccess, penggunaList }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Username dan Password wajib diisi!");
      return;
    }

    const found = penggunaList.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (found) {
      onLoginSuccess(found);
    } else {
      setError("Username atau Password salah.");
    }
  };

  return (
    <div 
      className="flex-grow flex items-center justify-center bg-slate-900 bg-cover bg-center px-4 py-12 min-h-screen" 
      style={{
        backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.95)), url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80')"
      }}
    >
      <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-indigo-500/40 text-2xl">
            <Shield size={32} />
          </div>
          <h2 className="text-white text-xl font-bold tracking-tight">SILAP-DUKCAPIL</h2>
          <p className="text-xs text-slate-300 font-semibold tracking-wider uppercase mt-1">Kabupaten Halmahera Barat</p>
          <div className="h-[2px] w-12 bg-indigo-500 mx-auto mt-3"></div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-200 text-xs px-4 py-2.5 rounded-xl text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <User size={16} />
              </span>
              <input 
                type="text" 
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                placeholder="Masukkan username"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock size={16} />
              </span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                placeholder="Masukkan password"
                required
              />
            </div>
          </div>
          
          <div className="pt-2">
            <button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.01] duration-150 text-white font-bold py-3.5 px-4 rounded-xl transition text-sm shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2 cursor-pointer border-none"
            >
              <span>Masuk Aplikasi</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>

        <div className="mt-6 text-center border-t border-white/10 pt-4 text-[10px] text-slate-400">
          <p>&copy; 2026 Disdukcapil Kab. Halmahera Barat</p>
          <div className="mt-2 flex items-center justify-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium">Mode: Simulasi Lokal (Offline)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
