import { useState, useRef, ChangeEvent } from 'react';
import { Download, Upload, RefreshCw, X, Check, AlertCircle } from 'lucide-react';
import { Database } from '../types';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  db: Database;
  onRestore: (importedDb: Database) => void;
  onResetToDefault: () => void;
}

export default function BackupRestoreModal({ isOpen, onClose, db, onRestore, onResetToDefault }: BackupRestoreModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `SILAP_DISDUKCAPIL_BACKUP_2026_${new Date().toISOString().substring(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      
      setSuccessMsg("Backup database berhasil diunduh!");
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      setErrorMsg("Gagal mengunduh backup.");
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        // Simple structural check
        const isValid = json && Array.isArray(json.barang) && Array.isArray(json.saldo_awal);
        if (isValid) {
          onRestore(json);
          setSuccessMsg("Database berhasil dipulihkan dari file backup!");
          setTimeout(() => {
            setSuccessMsg('');
            onClose();
          }, 3000);
        } else {
          setErrorMsg("Gagal: Struktur file JSON yang diunggah tidak valid untuk SILAP.");
          setTimeout(() => setErrorMsg(''), 5000);
        }
      } catch (err) {
        setErrorMsg("Gagal memparsing file. Pastikan format file adalah JSON valid.");
        setTimeout(() => setErrorMsg(''), 5000);
      }
    };
    reader.readAsText(file);
  };

  const handleResetClick = () => {
    if (window.confirm("Apakah Anda yakin ingin RESET database ke kondisi bawaan simulasi? Ini akan membersihkan seluruh transaksi baru Anda!")) {
      onResetToDefault();
      setSuccessMsg("Database di-reset ke kondisi bawaan!");
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative border border-slate-100 font-semibold">
        
        <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center text-xs">
          <h4 className="font-bold tracking-wide">BACKUP &amp; RESTORE DATABASE (OFFLINE)</h4>
          <button onClick={onClose} className="text-slate-300 hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 text-xs text-slate-700 space-y-4">
          <p className="text-slate-500 font-normal leading-relaxed text-[11px]">
            Karena program ini berjalan di <strong className="text-blue-600">Simulasi Lokal</strong>, seluruh data Anda tersimpan di penjelajah web Anda (localStorage). Unduh cadangan secara berkala agar data tidak hilang.
          </p>

          {/* Feedback messages */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center space-x-2 text-[11px] font-bold">
              <Check size={14} className="shrink-0 text-emerald-600 animate-bounce" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-center space-x-2 text-[11px] font-bold">
              <AlertCircle size={14} className="shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-2 pt-2">
            
            {/* Backup Button */}
            <button
              onClick={handleDownloadBackup}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 hover:bg-slate-200 duration-150 rounded-xl text-slate-800 cursor-pointer text-left font-bold"
            >
              <span className="flex items-center space-x-2">
                <Download size={14} className="text-slate-500" />
                <span>Unduh Cadangan (.json)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Ekspor</span>
            </button>

            {/* Restore Input & Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={handleUploadClick}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 hover:bg-slate-200 duration-150 rounded-xl text-slate-800 cursor-pointer text-left font-bold"
            >
              <span className="flex items-center space-x-2">
                <Upload size={14} className="text-slate-500" />
                <span>Pulihkan dari File</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Impor</span>
            </button>

            <div className="h-[1px] bg-slate-100 my-4"></div>

            {/* Reset Defaults button */}
            <button
              onClick={handleResetClick}
              className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-rose-50 text-rose-600 rounded-xl duration-150 cursor-pointer text-left font-bold border border-rose-100 bg-rose-50/20"
            >
              <RefreshCw size={14} className="text-rose-500 shrink-0" />
              <span>Atur Ulang ke Bawaan Simulasi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
