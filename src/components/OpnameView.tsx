import { useState, useMemo, FormEvent } from 'react';
import { Search, Plus, Save, Trash2, X, ClipboardSignature } from 'lucide-react';
import { Opname, Database } from '../types';
import { calculateCurrentStock } from '../lib/db';
import SignatureModal from './SignatureModal';

interface OpnameViewProps {
  db: Database;
  onAdd: (item: Omit<Opname, 'id'>) => void;
  onDelete: (id: string) => void;
}

export default function OpnameView({ db, onAdd, onDelete }: OpnameViewProps) {
  const [search, setSearch] = useState('');
  
  // Modal & form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nomor_opname, setNomorOpname] = useState('');
  const [tanggal_opname, setTanggalOpname] = useState(new Date().toISOString().substring(0, 10));
  const [selectedItemId, setSelectedItemId] = useState('');
  const [stok_fisik, setStokFisik] = useState<number>(0);
  const [keterangan, setKeterangan] = useState('Stok fisik cocok dengan sistem.');
  const [tim_pemeriksa, setTimPemeriksa] = useState('Yusak M, S.IP & Tim');

  // Signatures targets
  const [signatureTarget, setSignatureTarget] = useState<'pengurus' | 'pemeriksa' | 'kadis' | null>(null);
  const [ttd_pengurus, setTtdPengurus] = useState<string>('');
  const [ttd_pemeriksa, setTtdPemeriksa] = useState<string>('');
  const [ttd_kadis, setTtdKadis] = useState<string>('');

  const filteredOpname = db.opname.filter(o => 
    o.nama_barang.toLowerCase().includes(search.toLowerCase()) ||
    o.kode_barang.toLowerCase().includes(search.toLowerCase()) ||
    o.nomor_opname.toLowerCase().includes(search.toLowerCase()) ||
    o.tim_pemeriksa.toLowerCase().includes(search.toLowerCase())
  );

  const selectedItemObj = useMemo(() => {
    return db.barang.find(b => b.id === selectedItemId);
  }, [db.barang, selectedItemId]);

  const stok_sistem = useMemo(() => {
    if (!selectedItemObj) return 0;
    // Calculate system stock prior to this opname
    return calculateCurrentStock(db, selectedItemObj.kode_barang);
  }, [db, selectedItemObj]);

  const selisih = useMemo(() => {
    return stok_fisik - stok_sistem;
  }, [stok_fisik, stok_sistem]);

  const openAddModal = () => {
    if (db.barang.length === 0) {
      alert("Silakan daftarkan master barang terlebih dahulu di menu 'Data Barang'!");
      return;
    }
    setSelectedItemId(db.barang[0].id);
    setNomorOpname('');
    setStokFisik(0);
    setKeterangan('Stok fisik cocok dengan sistem.');
    setTimPemeriksa('Yusak M, S.IP & Tim');
    setTtdPengurus('');
    setTtdPemeriksa('');
    setTtdKadis('');
    setIsModalOpen(true);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!nomor_opname || !selectedItemObj || !tim_pemeriksa) {
      alert("Mohon lengkapi seluruh kolom formulir secara valid!");
      return;
    }

    const payload = {
      nomor_opname,
      tanggal_opname,
      kode_barang: selectedItemObj.kode_barang,
      nama_barang: selectedItemObj.nama_barang,
      stok_sistem: Number(stok_sistem),
      stok_fisik: Number(stok_fisik),
      selisih: Number(selisih),
      keterangan,
      tim_pemeriksa,
      ttd_pengurus: ttd_pengurus || 'drawn_placeholder',
      ttd_pemeriksa: ttd_pemeriksa || 'drawn_placeholder',
      ttd_kadis: ttd_kadis || 'drawn_placeholder'
    };

    onAdd(payload);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, code: string) => {
    if (window.confirm(`Hapus pencatatan opname No. "${code}"?`)) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-6 select-none animate-fade-in no-print">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Stock Opname / Penyesuaian Fisik</h2>
          <p className="text-xs text-slate-500 mt-1">Cek keakuratan barang, bandingkan kuantitas logis sistem vs fisik riil gudang</p>
        </div>
        
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-blue-600/20 transition duration-150 border-none cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>Tambah Stock Opname</span>
        </button>
      </div>

      {/* Filter search bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Cari berdasarkan nomor opname, nama tim pemeriksa, nama barang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Grid Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100">
                <th className="py-4 px-6">No. Opname</th>
                <th className="py-4 px-6">Tanggal Opname</th>
                <th className="py-4 px-6">Tim Pemeriksa</th>
                <th className="py-4 px-6">Kode Barang</th>
                <th className="py-4 px-6">Nama Barang</th>
                <th className="py-2.5 px-4 text-center">Stok Sistem</th>
                <th className="py-2.5 px-4 text-center">Stok Fisik</th>
                <th className="py-2.5 px-4 text-center">Selisih</th>
                <th className="py-4 px-6">Keterangan</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredOpname.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-semibold">
                    Tidak ada transaksi stock opname persediaan.
                  </td>
                </tr>
              ) : (
                filteredOpname.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition duration-150">
                    <td className="py-4 px-6 text-slate-700 font-bold max-w-[130px] truncate" title={item.nomor_opname}>{item.nomor_opname}</td>
                    <td className="py-4 px-6 text-slate-500 font-normal">{item.tanggal_opname}</td>
                    <td className="py-4 px-6 text-slate-900 truncate max-w-[140px]" title={item.tim_pemeriksa}>{item.tim_pemeriksa}</td>
                    <td className="py-4 px-6 font-mono text-[11px] text-blue-600 font-bold">{item.kode_barang}</td>
                    <td className="py-4 px-6 text-slate-900">{item.nama_barang}</td>
                    <td className="py-2.5 px-4 text-center text-slate-700">{item.stok_sistem}</td>
                    <td className="py-2.5 px-4 text-center text-slate-800 font-bold">{item.stok_fisik}</td>
                    <td className={`py-2.5 px-4 text-center font-bold ${
                      item.selisih > 0 
                        ? 'text-emerald-600' 
                        : item.selisih < 0 
                        ? 'text-red-600' 
                        : 'text-slate-500'
                    }`}>
                      {item.selisih > 0 ? `+${item.selisih}` : item.selisih}
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-normal truncate max-w-[150px]" title={item.keterangan}>{item.keterangan}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(item.id, item.nomor_opname)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Hapus"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insert Modal with drawing inputs */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative border border-slate-100">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-sm font-bold tracking-wide">PENCATATAN STOCK OPNAME FISIK</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-white transition">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1.5 font-bold">NOMOR DOKUMEN OPNAME (BA-SO)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 050/99/SO-DUKCAPIL/V/2026"
                    value={nomor_opname}
                    onChange={(e) => setNomorOpname(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5">TANGGAL PEMERIKSAAN OPNAME</label>
                  <input
                    type="date"
                    required
                    value={tanggal_opname}
                    onChange={(e) => setTanggalOpname(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1.5 font-bold">TIM PEMERIKSA / PANEL</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Yusak M, S.IP & Tim"
                    value={tim_pemeriksa}
                    onChange={(e) => setTimPemeriksa(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5">PILIH BARANG PEMERIKSAAN</label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                  >
                    {db.barang.map(b => (
                      <option key={b.id} value={b.id}>{b.nama_barang} ({b.kode_barang})</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedItemObj && (
                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl grid grid-cols-3 gap-3 text-center text-[11px] font-bold">
                  <div>
                    <p className="text-slate-400 font-semibold mb-0.5">Suku Stok Sistem</p>
                    <p className="text-slate-700 text-sm">{stok_sistem} {selectedItemObj.satuan}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold mb-0.5">Stok Fisik Lapangan</p>
                    <div className="flex justify-center mt-0.5">
                      <input
                        type="number"
                        required
                        min={0}
                        value={stok_fisik || ''}
                        onChange={(e) => setStokFisik(Math.max(0, parseInt(e.target.value, 10)))}
                        className="w-16 p-1 text-center bg-white border border-slate-200 rounded-lg text-xs font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold mb-0.5">Selisih Penyesuaian</p>
                    <p className={`text-sm ${
                      selisih > 0 ? 'text-emerald-600' : selisih < 0 ? 'text-red-600' : 'text-slate-500'
                    }`}>
                      {selisih > 0 ? `+${selisih}` : selisih} {selectedItemObj.satuan}
                    </p>
                  </div>
                </div>
              )}

              {/* Triple Draw Signature pads */}
              <div className="text-[10px] text-slate-500 font-bold mb-1 border-t border-slate-50 pt-2 uppercase">Validasi Tanda Tangan Lapangan</div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[9px] text-slate-400 mb-1">Pengurus Barang</label>
                  {ttd_pengurus ? (
                    <div className="border border-slate-200 rounded-xl p-1 bg-white flex flex-col items-center relative">
                      <img src={ttd_pengurus} alt="Ttd Pengurus" className="h-10 object-contain max-w-full" />
                      <button type="button" onClick={() => setTtdPengurus('')} className="absolute right-0.5 top-0.5 bg-red-100 text-red-600 hover:bg-red-200 p-0.5 rounded-full"><X size={8} /></button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSignatureTarget('pengurus')}
                      className="w-full py-2 border border-dashed border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg flex flex-col items-center justify-center transition"
                    >
                      <ClipboardSignature size={12} />
                      <span className="text-[9px] mt-0.5">Ttd Pengurus</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[9px] text-slate-400 mb-1">Tim Pemeriksa</label>
                  {ttd_pemeriksa ? (
                    <div className="border border-slate-200 rounded-xl p-1 bg-white flex flex-col items-center relative">
                      <img src={ttd_pemeriksa} alt="Ttd Pemeriksa" className="h-10 object-contain max-w-full" />
                      <button type="button" onClick={() => setTtdPemeriksa('')} className="absolute right-0.5 top-0.5 bg-red-100 text-red-600 hover:bg-red-200 p-0.5 rounded-full"><X size={8} /></button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSignatureTarget('pemeriksa')}
                      className="w-full py-2 border border-dashed border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg flex flex-col items-center justify-center transition"
                    >
                      <ClipboardSignature size={12} />
                      <span className="text-[9px] mt-0.5">Ttd Pemeriksa</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[9px] text-slate-400 mb-1">Kadis (Mengetahui)</label>
                  {ttd_kadis ? (
                    <div className="border border-slate-200 rounded-xl p-1 bg-white flex flex-col items-center relative">
                      <img src={ttd_kadis} alt="Ttd Kadis" className="h-10 object-contain max-w-full" />
                      <button type="button" onClick={() => setTtdKadis('')} className="absolute right-0.5 top-0.5 bg-red-100 text-red-600 hover:bg-red-200 p-0.5 rounded-full"><X size={8} /></button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSignatureTarget('kadis')}
                      className="w-full py-2 border border-dashed border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg flex flex-col items-center justify-center transition"
                    >
                      <ClipboardSignature size={12} />
                      <span className="text-[9px] mt-0.5">Ttd Kadis</span>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5">KETERANGAN PERSILAP</label>
                <textarea
                  placeholder="Keterangan penyesuaian opname..."
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white h-14 resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 duration-150 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition duration-150 shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 border-none cursor-pointer"
                >
                  <Save size={14} />
                  <span>Simpan Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Signature drawing popup overlay */}
      <SignatureModal
        isOpen={signatureTarget !== null}
        onClose={() => setSignatureTarget(null)}
        onSave={(dataUrl) => {
          if (signatureTarget === 'pengurus') {
            setTtdPengurus(dataUrl);
          } else if (signatureTarget === 'pemeriksa') {
            setTtdPemeriksa(dataUrl);
          } else if (signatureTarget === 'kadis') {
            setTtdKadis(dataUrl);
          }
        }}
        title={`GAMBAR TANDA TANGAN ${
          signatureTarget === 'pengurus' ? 'PENGURUS BARANG' : signatureTarget === 'pemeriksa' ? 'TIM PEMERIKSA' : 'KEPALA DINAS'
        }`}
      />
    </div>
  );
}
