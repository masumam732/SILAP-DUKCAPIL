import { useState } from 'react';
import { Search, History, Trash2 } from 'lucide-react';
import { Database } from '../types';

interface AuditTrailViewProps {
  db: Database;
  onClear: () => void;
}

export default function AuditTrailView({ db, onClear }: AuditTrailViewProps) {
  const [search, setSearch] = useState('');

  const filteredLogs = [...db.audit_trail]
    .filter(log => 
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.aktivitas.toLowerCase().includes(search.toLowerCase()) ||
      log.detail.toLowerCase().includes(search.toLowerCase())
    )
    .reverse(); // Newest logs first

  const handleClearConfirm = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus seluruh jejak audit log? Tindakan ini tidak bisa dibatalkan!")) {
      onClear();
    }
  };

  return (
    <div className="space-y-6 select-none animate-fade-in no-print">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Audit Trail Log Sistem</h2>
          <p className="text-xs text-slate-500 mt-1">Jejak aktivitas log audit mencatat manipulasi data strategis, login, dan aksi pengguna</p>
        </div>

        <button
          onClick={handleClearConfirm}
          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition duration-150 border-none cursor-pointer self-start sm:self-auto"
        >
          <Trash2 size={14} />
          <span>Bersihkan Semua Log</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Cari logs berdasarkan user, aktivitas, detail aksi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Audit List Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100">
                <th className="py-4 px-6">Waktu Timestamp</th>
                <th className="py-4 px-6">User Operator</th>
                <th className="py-4 px-6">Jenis Aktivitas</th>
                <th className="py-4 px-6">Detail Penjelasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-semibold">
                    Tidak ada log audit tercatat dalam database.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition duration-150">
                    <td className="py-4 px-6 font-mono text-[11px] text-slate-400 font-normal">{log.tanggal}</td>
                    <td className="py-4 px-6">
                      <span className="bg-slate-100 text-slate-700 text-[10px] py-1 px-2.5 rounded-lg font-bold">
                        @{log.user}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold ${
                        log.aktivitas.includes('Hapus') || log.aktivitas.includes('HENTIKAN')
                          ? 'bg-rose-50 text-rose-700 border border-rose-100'
                          : log.aktivitas.includes('Sunting') || log.aktivitas.includes('Ubah')
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : log.aktivitas.includes('Tambah') || log.aktivitas.includes('Simpan')
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        <History size={10} className="mr-1 shrink-0" />
                        {log.aktivitas}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-normal">{log.detail}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
