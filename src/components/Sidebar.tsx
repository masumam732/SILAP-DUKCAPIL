import { 
  PieChart, 
  Boxes, 
  Settings, 
  Wallet, 
  Truck, 
  PackageMinus, 
  ClipboardCheck, 
  FileText, 
  History, 
  Database, 
  Power,
  UserCheck,
  Building2
} from 'lucide-react';
import { Pengguna } from '../types';

interface SidebarProps {
  currentUser: Pengguna;
  activePage: string;
  setActivePage: (p: string) => void;
  onLogout: () => void;
  onOpenBackup: () => void;
}

export default function Sidebar({ currentUser, activePage, setActivePage, onLogout, onOpenBackup }: SidebarProps) {
  const role = currentUser.role;

  const appTitle = "SILAP-DUKCAPIL";
  const appSubtitle = "HALMAHERA BARAT";

  // Check access permissions
  const showUsers = role === 'Administrator';
  const showAudit = role === 'Administrator';
  const showStockMgmt = role !== 'Kepala Dinas';

  const menuButtonClass = (isActive: boolean) => 
    `w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl font-bold text-xs text-left transition duration-150 ${
      isActive 
        ? 'bg-slate-800 text-white border-l-4 border-indigo-500 rounded-r-xl rounded-l-none shadow-md shadow-slate-950/20' 
        : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
    }`;

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 select-none shadow-xl">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3.5">
        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/10 shrink-0">
          <Boxes size={20} />
        </div>
        <div>
          <h1 className="font-bold text-white tracking-wide text-sm">{appTitle}</h1>
          <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">{appSubtitle}</p>
        </div>
      </div>
      
      {/* User Card */}
      <div className="p-5 border-b border-slate-800/70 flex items-center space-x-3 bg-slate-900/40">
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 border-2 border-indigo-500/45">
          <UserCheck size={18} className="text-indigo-400" />
        </div>
        <div className="overflow-hidden">
          <p className="font-bold text-white text-xs truncate">{currentUser.nama_lengkap}</p>
          <p className="text-[9px] text-slate-400 capitalize truncate font-semibold">
            {role}
          </p>
        </div>
      </div>

      {/* Navigation Menus */}
      <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 pb-1.5">Menu Utama</div>
        
        <button 
          onClick={() => setActivePage('dashboard')} 
          className={menuButtonClass(activePage === 'dashboard')}
        >
          <PieChart size={16} />
          <span>Dashboard</span>
        </button>

        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 pt-4 pb-1.5">Master Data</div>
        
        <button 
          onClick={() => setActivePage('barang')} 
          className={menuButtonClass(activePage === 'barang')}
        >
          <Boxes size={16} />
          <span>Data Barang</span>
        </button>

        <button 
          onClick={() => setActivePage('dinas')} 
          className={menuButtonClass(activePage === 'dinas')}
        >
          <Building2 size={16} />
          <span>Profil Dinas</span>
        </button>
        
        {showUsers && (
          <button 
            onClick={() => setActivePage('pengguna')} 
            className={menuButtonClass(activePage === 'pengguna')}
          >
            <Settings size={16} />
            <span>Data Pengguna</span>
          </button>
        )}

        {showStockMgmt && (
          <>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 pt-4 pb-1.5">Manajemen Stok</div>

            <button 
              onClick={() => setActivePage('saldo_awal')} 
              className={menuButtonClass(activePage === 'saldo_awal')}
            >
              <Wallet size={16} />
              <span>Saldo Awal</span>
            </button>

            <button 
              onClick={() => setActivePage('penerimaan')} 
              className={menuButtonClass(activePage === 'penerimaan')}
            >
              <Truck size={16} />
              <span>Penerimaan Barang</span>
            </button>

            <button 
              onClick={() => setActivePage('penyaluran')} 
              className={menuButtonClass(activePage === 'penyaluran')}
            >
              <PackageMinus size={16} />
              <span>Penyaluran Barang</span>
            </button>

            <button 
              onClick={() => setActivePage('opname')} 
              className={menuButtonClass(activePage === 'opname')}
            >
              <ClipboardCheck size={16} />
              <span>Opname Persediaan</span>
            </button>
          </>
        )}

        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 pt-4 pb-1.5">Laporan & Audit</div>

        <button 
          onClick={() => setActivePage('kartu_stok')} 
          className={menuButtonClass(activePage === 'kartu_stok')}
        >
          <FileText size={16} />
          <span>Kartu Stok</span>
        </button>

        <button 
          onClick={() => setActivePage('laporan')} 
          className={menuButtonClass(activePage === 'laporan')}
        >
          <FileText size={16} />
          <span>Laporan Persediaan</span>
        </button>

        {showAudit && (
          <button 
            onClick={() => setActivePage('audit_trail')} 
            className={menuButtonClass(activePage === 'audit_trail')}
          >
            <History size={16} />
            <span>Audit Trail Log</span>
          </button>
        )}
      </nav>

      {/* Footer Controls */}
      <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex flex-col space-y-3.5">
        <button 
          onClick={onOpenBackup} 
          className="w-full text-left flex items-center space-x-2.5 text-xs text-slate-400 hover:text-indigo-400 py-2.5 px-3 bg-slate-900/60 hover:bg-slate-900 rounded-xl font-bold transition cursor-pointer border border-slate-800"
        >
          <Database size={14} className="text-indigo-400" />
          <span>Backup & Restore DB</span>
        </button>
        <button 
          onClick={onLogout} 
          className="w-full bg-slate-900 border border-slate-800 hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/40 text-slate-400 py-3 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 transition duration-150 cursor-pointer"
        >
          <Power size={14} />
          <span>Keluar Sistem</span>
        </button>
      </div>
    </aside>
  );
}
