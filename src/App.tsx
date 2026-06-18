import { useState, useEffect } from 'react';
import { getDatabase, saveTable, addAuditLog, getFormattedDateIndo } from './lib/db';
import { Database, Pengguna, Barang, SaldoAwal, Penerimaan, Penyaluran, Opname, Dinas } from './types';
import { initialDatabase } from './initialData';

// Component imports
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import MasterBarang from './components/MasterBarang';
import MasterPengguna from './components/MasterPengguna';
import MasterDinas from './components/MasterDinas';
import SaldoAwalView from './components/SaldoAwalView';
import PenerimaanView from './components/PenerimaanView';
import PenyaluranView from './components/PenyaluranView';
import OpnameView from './components/OpnameView';
import KartuStokView from './components/KartuStokView';
import LaporanView from './components/LaporanView';
import AuditTrailView from './components/AuditTrailView';
import BackupRestoreModal from './components/BackupRestoreModal';

export default function App() {
  const [db, setDb] = useState<Database | null>(null);
  const [currentUser, setCurrentUser] = useState<Pengguna | null>(null);
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);

  // Load database on initialization
  useEffect(() => {
    const database = getDatabase();
    setDb(database);
    
    // Check if session exists in sessionStorage
    const storedUser = sessionStorage.getItem('silap_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        // Ignore error
      }
    }
  }, []);

  if (!db) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs select-none">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-t-blue-500 border-slate-700 rounded-full animate-spin mx-auto"></div>
          <p className="font-semibold tracking-wider uppercase">Memuat SILAP-DUKCAPIL Database...</p>
        </div>
      </div>
    );
  }

  const handleLoginSuccess = (user: Pengguna) => {
    setCurrentUser(user);
    sessionStorage.setItem('silap_user', JSON.stringify(user));
    
    // Save audit log
    const updatedLogs = addAuditLog(user.username, "Masuk Sistem", `Pegawai ${user.nama_lengkap} berhasil masuk dengan peranan ${user.role}.`);
    setDb(prev => prev ? { ...prev, audit_trail: updatedLogs } : prev);
  };

  const handleLogout = () => {
    if (currentUser) {
      const updatedLogs = addAuditLog(currentUser.username, "Keluar Sistem", "Pengguna keluar dari aplikasi.");
      sessionStorage.removeItem('silap_user');
      setCurrentUser(null);
      setActivePage('dashboard');
      setDb(prev => prev ? { ...prev, audit_trail: updatedLogs } : prev);
    }
  };

  // --- CRUD HANDLERS BARANG ---
  const handleAddBarang = (payload: Omit<Barang, 'id'>) => {
    if (!currentUser) return;
    const newBarang: Barang = {
      id: "B" + Date.now().toString().substring(7),
      ...payload
    };
    const nextList = [...db.barang, newBarang];
    saveTable("barang", nextList);
    const updatedLogs = addAuditLog(currentUser.username, "Tambah Barang", `Mendaftarkan master barang baru: ${newBarang.nama_barang} (${newBarang.kode_barang})`);
    setDb(prev => prev ? { ...prev, barang: nextList, audit_trail: updatedLogs } : prev);
  };

  const handleUpdateBarang = (id: string, payload: Partial<Barang>) => {
    if (!currentUser) return;
    const nextList = db.barang.map(b => b.id === id ? { ...b, ...payload } : b);
    saveTable("barang", nextList);
    const matched = db.barang.find(b => b.id === id);
    const updatedLogs = addAuditLog(currentUser.username, "Sunting Barang", `Mengubah detail master barang id ${id}: ${matched?.nama_barang}`);
    setDb(prev => prev ? { ...prev, barang: nextList, audit_trail: updatedLogs } : prev);
  };

  const handleDeleteBarang = (id: string) => {
    if (!currentUser) return;
    const matched = db.barang.find(b => b.id === id);
    const nextList = db.barang.filter(b => b.id !== id);
    saveTable("barang", nextList);
    const updatedLogs = addAuditLog(currentUser.username, "Hapus Barang", `Menghapus master barang: ${matched?.nama_barang || id}`);
    setDb(prev => prev ? { ...prev, barang: nextList, audit_trail: updatedLogs } : prev);
  };

  // --- CRUD HANDLERS PENGGUNA ---
  const handleAddPengguna = (payload: Omit<Pengguna, 'id'>) => {
    if (!currentUser) return;
    const newPengguna: Pengguna = {
      id: "USR" + Date.now().toString().substring(8),
      ...payload
    };
    const nextList = [...db.pengguna, newPengguna];
    saveTable("pengguna", nextList);
    const updatedLogs = addAuditLog(currentUser.username, "Tambah Pengguna", `Menolak lisensi user baru: ${newPengguna.nama_lengkap} (As: ${newPengguna.role})`);
    setDb(prev => prev ? { ...prev, pengguna: nextList, audit_trail: updatedLogs } : prev);
  };

  const handleUpdatePengguna = (id: string, payload: Partial<Pengguna>) => {
    if (!currentUser) return;
    const nextList = db.pengguna.map(p => p.id === id ? { ...p, ...payload } : p);
    saveTable("pengguna", nextList);
    const matched = db.pengguna.find(p => p.id === id);
    const updatedLogs = addAuditLog(currentUser.username, "Sunting Pengguna", `Mengubah data user operator id ${id}: ${matched?.nama_lengkap}`);
    setDb(prev => prev ? { ...prev, pengguna: nextList, audit_trail: updatedLogs } : prev);
  };

  const handleDeletePengguna = (id: string) => {
    if (!currentUser) return;
    const matched = db.pengguna.find(p => p.id === id);
    const nextList = db.pengguna.filter(p => p.id !== id);
    saveTable("pengguna", nextList);
    const updatedLogs = addAuditLog(currentUser.username, "Hapus Pengguna", `Menghapus kredensial user: ${matched?.nama_lengkap}`);
    setDb(prev => prev ? { ...prev, pengguna: nextList, audit_trail: updatedLogs } : prev);
  };

  // --- CRUD HANDLERS DINAS ---
  const handleAddDinas = (payload: Omit<Dinas, 'id'>) => {
    if (!currentUser) return;
    const newDinas: Dinas = {
      id: "D" + Date.now().toString().substring(7),
      ...payload
    };
    let nextList = [...(db.dinas || [])];
    if (newDinas.status_aktif) {
      nextList = nextList.map(d => ({ ...d, status_aktif: false }));
    }
    nextList.push(newDinas);
    saveTable("dinas", nextList);
    const updatedLogs = addAuditLog(currentUser.username, "Tambah Dinas", `Mendaftarkan profil dinas/satker baru: ${newDinas.nama_dinas}`);
    setDb(prev => prev ? { ...prev, dinas: nextList, audit_trail: updatedLogs } : prev);
  };

  const handleUpdateDinas = (id: string, payload: Partial<Dinas>) => {
    if (!currentUser) return;
    let nextList = (db.dinas || []).map(d => d.id === id ? { ...d, ...payload } : d);
    if (payload.status_aktif) {
      nextList = nextList.map(d => ({ ...d, status_aktif: d.id === id }));
    }
    saveTable("dinas", nextList);
    const matched = db.dinas.find(d => d.id === id);
    const updatedLogs = addAuditLog(currentUser.username, "Sunting Dinas", `Mengubah profil dinas: ${matched?.nama_dinas}`);
    setDb(prev => prev ? { ...prev, dinas: nextList, audit_trail: updatedLogs } : prev);
  };

  const handleDeleteDinas = (id: string) => {
    if (!currentUser) return;
    const matched = db.dinas.find(d => d.id === id);
    const nextList = (db.dinas || []).filter(d => d.id !== id);
    saveTable("dinas", nextList);
    const updatedLogs = addAuditLog(currentUser.username, "Hapus Dinas", `Menghapus profil dinas: ${matched?.nama_dinas}`);
    setDb(prev => prev ? { ...prev, dinas: nextList, audit_trail: updatedLogs } : prev);
  };

  const handleSetActiveDinas = (id: string) => {
    if (!currentUser) return;
    const nextList = (db.dinas || []).map(d => ({ ...d, status_aktif: d.id === id }));
    saveTable("dinas", nextList);
    const matched = db.dinas.find(d => d.id === id);
    const updatedLogs = addAuditLog(currentUser.username, "Ubah Aktivasi Dinas", `Mengaktifkan instansi kerja: ${matched?.nama_dinas}`);
    setDb(prev => prev ? { ...prev, dinas: nextList, audit_trail: updatedLogs } : prev);
  };

  // --- CRUD HANDLERS SALDO AWAL ---
  const handleAddSaldoAwal = (payload: Omit<SaldoAwal, 'id'>) => {
    if (!currentUser) return;
    const newSA: SaldoAwal = {
      id: "SA" + Date.now().toString().substring(8),
      ...payload
    };
    const nextList = [...db.saldo_awal, newSA];
    saveTable("saldo_awal", nextList);
    const updatedLogs = addAuditLog(currentUser.username, "Tambah SaldoAwal", `Memasukkan saldo awal barang ${newSA.nama_barang} sejumlah ${newSA.jumlah} ${newSA.keterangan}`);
    setDb(prev => prev ? { ...prev, saldo_awal: nextList, audit_trail: updatedLogs } : prev);
  };

  const handleDeleteSaldoAwal = (id: string) => {
    if (!currentUser) return;
    const matched = db.saldo_awal.find(s => s.id === id);
    const nextList = db.saldo_awal.filter(s => s.id !== id);
    saveTable("saldo_awal", nextList);
    const updatedLogs = addAuditLog(currentUser.username, "Hapus SaldoAwal", `Menghapus saldo awal barang: ${matched?.nama_barang}`);
    setDb(prev => prev ? { ...prev, saldo_awal: nextList, audit_trail: updatedLogs } : prev);
  };

  // --- CRUD HANDLERS PENERIMAAN ---
  const handleAddPenerimaan = (payload: Omit<Penerimaan, 'id'>) => {
    if (!currentUser) return;
    const newRcv: Penerimaan = {
      id: "RCV" + Date.now().toString().substring(8),
      ...payload
    };
    const nextList = [...db.penerimaan, newRcv];
    saveTable("penerimaan", nextList);
    const updatedLogs = addAuditLog(currentUser.username, "Tambah Penerimaan", `Menambahkan penerimaan barang ${newRcv.nama_barang} No. Dokumen: ${newRcv.nomor_dokumen}`);
    setDb(prev => prev ? { ...prev, penerimaan: nextList, audit_trail: updatedLogs } : prev);
  };

  const handleDeletePenerimaan = (id: string) => {
    if (!currentUser) return;
    const matched = db.penerimaan.find(r => r.id === id);
    const nextList = db.penerimaan.filter(r => r.id !== id);
    saveTable("penerimaan", nextList);
    const updatedLogs = addAuditLog(currentUser.username, "Hapus Penerimaan", `Menghapus penerimaan barang No Dokumen: ${matched?.nomor_dokumen}`);
    setDb(prev => prev ? { ...prev, penerimaan: nextList, audit_trail: updatedLogs } : prev);
  };

  // --- CRUD HANDLERS PENYALURAN ---
  const handleAddPenyaluran = (payload: Omit<Penyaluran, 'id'>) => {
    if (!currentUser) return;
    const newDly: Penyaluran = {
      id: "DIS" + Date.now().toString().substring(8),
      ...payload
    };
    const nextList = [...db.penyaluran, newDly];
    saveTable("penyaluran", nextList);
    const updatedLogs = addAuditLog(currentUser.username, "Tambah Penyaluran", `Mendistribusikan barang ${newDly.nama_barang} ke unit ${newDly.unit_kerja_penerima}, diterima oleh ${newDly.nama_penerima}`);
    setDb(prev => prev ? { ...prev, penyaluran: nextList, audit_trail: updatedLogs } : prev);
  };

  const handleDeletePenyaluran = (id: string) => {
    if (!currentUser) return;
    const matched = db.penyaluran.find(d => d.id === id);
    const nextList = db.penyaluran.filter(d => d.id !== id);
    saveTable("penyaluran", nextList);
    const updatedLogs = addAuditLog(currentUser.username, "Hapus Penyaluran", `Menghapus penyaluran barang No. BPB: ${matched?.nomor_penyaluran}`);
    setDb(prev => prev ? { ...prev, penyaluran: nextList, audit_trail: updatedLogs } : prev);
  };

  // --- CRUD HANDLERS OPNAME ---
  const handleAddOpname = (payload: Omit<Opname, 'id'>) => {
    if (!currentUser) return;
    const newOpn: Opname = {
      id: "OPN" + Date.now().toString().substring(8),
      ...payload
    };
    const nextList = [...db.opname, newOpn];
    saveTable("opname", nextList);
    const updatedLogs = addAuditLog(currentUser.username, "Tambah Opname", `Melaksanakan audit stock opname barang ${newOpn.nama_barang} No: ${newOpn.nomor_opname}. Selisih: ${newOpn.selisih}`);
    setDb(prev => prev ? { ...prev, opname: nextList, audit_trail: updatedLogs } : prev);
  };

  const handleDeleteOpname = (id: string) => {
    if (!currentUser) return;
    const matched = db.opname.find(o => o.id === id);
    const nextList = db.opname.filter(o => o.id !== id);
    saveTable("opname", nextList);
    const updatedLogs = addAuditLog(currentUser.username, "Hapus Opname", `Menghapus audit opname No BA: ${matched?.nomor_opname}`);
    setDb(prev => prev ? { ...prev, opname: nextList, audit_trail: updatedLogs } : prev);
  };

  // --- RECOVERY DB ---
  const handleRestoreDatabase = (importedDb: Database) => {
    if (!currentUser) return;
    // Save to localStorage
    for (const key in importedDb) {
      localStorage.setItem(`silap-dukcapil-bar_${key}`, JSON.stringify(importedDb[key as keyof Database]));
    }
    // Simple state reload
    sessionStorage.clear();
    window.location.reload();
  };

  const handleResetDatabase = () => {
    // Clear localStorage values under this key
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  const handleClearAuditTrail = () => {
    if (!currentUser) return;
    const emptyLogs: any[] = [];
    saveTable("audit_trail", emptyLogs);
    const updatedLogs = addAuditLog(currentUser.username, "Clear Logs", "Administrator membersihkan seluruh jejak log audit di sistem.");
    setDb(prev => prev ? { ...prev, audit_trail: updatedLogs } : prev);
  };

  // Not logged in routing
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} penggunaList={db.pengguna} />;
  }

  // Active page routing switch board
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard db={db} />;
      case 'barang':
        return (
          <MasterBarang 
            db={db} 
            role={currentUser.role}
            onAdd={handleAddBarang} 
            onUpdate={handleUpdateBarang} 
            onDelete={handleDeleteBarang} 
          />
        );
      case 'pengguna':
        return (
          <MasterPengguna 
            db={db}
            onAdd={handleAddPengguna}
            onUpdate={handleUpdatePengguna}
            onDelete={handleDeletePengguna}
          />
        );
      case 'dinas':
        return (
          <MasterDinas 
            db={db}
            role={currentUser.role}
            onAdd={handleAddDinas}
            onUpdate={handleUpdateDinas}
            onDelete={handleDeleteDinas}
            onSetActive={handleSetActiveDinas}
          />
        );
      case 'saldo_awal':
        return (
          <SaldoAwalView 
            db={db}
            onAdd={handleAddSaldoAwal}
            onDelete={handleDeleteSaldoAwal}
          />
        );
      case 'penerimaan':
        return (
          <PenerimaanView
            db={db}
            onAdd={handleAddPenerimaan}
            onDelete={handleDeletePenerimaan}
          />
        );
      case 'penyaluran':
        return (
          <PenyaluranView
            db={db}
            onAdd={handleAddPenyaluran}
            onDelete={handleDeletePenyaluran}
          />
        );
      case 'opname':
        return (
          <OpnameView
            db={db}
            onAdd={handleAddOpname}
            onDelete={handleDeleteOpname}
          />
        );
      case 'kartu_stok':
        return <KartuStokView db={db} />;
      case 'laporan':
        return <LaporanView db={db} />;
      case 'audit_trail':
        return <AuditTrailView db={db} onClear={handleClearAuditTrail} />;
      default:
        return <Dashboard db={db} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row antialiased text-slate-800 font-sans">
      
      {/* Sidebar with dynamic active links */}
      <div className={`fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition duration-200 ease-in-out shrink-0 flex ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } no-print`}>
        <Sidebar 
          currentUser={currentUser} 
          activePage={activePage} 
          setActivePage={(page) => {
            setActivePage(page);
            setSidebarOpen(false);
          }} 
          onLogout={handleLogout}
          onOpenBackup={() => setBackupOpen(true)}
        />
        {/* Mobile backdrop shadow */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)} 
            className="fixed inset-0 bg-black/40 z-[-1] md:hidden"
          ></div>
        )}
      </div>

      {/* Main page wrapper */}
      <div className="flex-grow flex flex-col min-w-0">
        <Header db={db} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Page Inner Container */}
        <main className="flex-grow p-4 md:p-8 overflow-y-auto print:p-0">
          <div className="max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>

      <BackupRestoreModal 
        isOpen={backupOpen}
        onClose={() => setBackupOpen(false)}
        db={db}
        onRestore={handleRestoreDatabase}
        onResetToDefault={handleResetDatabase}
      />
    </div>
  );
}
