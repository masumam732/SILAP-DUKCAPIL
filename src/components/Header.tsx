import { Menu, Calendar } from 'lucide-react';
import { getFormattedDateIndo, getActiveDinas } from '../lib/db';
import { Database } from '../types';

interface HeaderProps {
  db: Database;
  onToggleSidebar: () => void;
}

export default function Header({ db, onToggleSidebar }: HeaderProps) {
  const activeDinas = getActiveDinas(db);
  const displayLabel = activeDinas 
    ? `${activeDinas.nama_dinas} - ${activeDinas.pemerintah}`
    : "Dinas Kependudukan dan Pencatatan Sipil Kab. Halmahera Barat";

  return (
    <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 shadow-sm/50 shrink-0 select-none no-print">
      <div className="flex items-center space-x-4">
        <button 
          onClick={onToggleSidebar} 
          className="md:hidden text-slate-500 hover:text-slate-800 focus:outline-none transition p-1.5 hover:bg-slate-50 rounded-lg"
        >
          <Menu size={20} />
        </button>
        {activeDinas?.logo_url && (
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200 p-0.5 bg-slate-50 flex items-center justify-center">
            <img src={activeDinas.logo_url} alt="Logo Dinas" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
        )}
        <div className="hidden sm:flex flex-col">
          <span className="text-[9px] text-indigo-500 font-extrabold uppercase tracking-widest">Sistem Informasi Persediaan</span>
          <span className="text-xs font-extrabold text-slate-800 tracking-tight mt-0.5">{displayLabel}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-bold px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
          <span>SISTEM AKTIF</span>
        </span>
        <div className="h-6 w-[1px] bg-slate-200"></div>
        <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold">
          <Calendar size={14} className="text-indigo-400" />
          <span className="text-slate-600">{getFormattedDateIndo(new Date())}</span>
        </div>
      </div>
    </header>
  );
}
