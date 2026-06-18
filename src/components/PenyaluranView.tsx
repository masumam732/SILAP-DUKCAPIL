import { useState, useMemo, FormEvent } from 'react';
import { Search, Plus, Save, Trash2, X, FileSignature } from 'lucide-react';
import { Penyaluran, Database } from '../types';
import { calculateCurrentStock } from '../lib/db';
import SignatureModal from './SignatureModal';

interface PenyaluranViewProps {
  db: Database;
  onAdd: (item: Omit<Penyaluran, 'id'>) => void;
  onDelete: (id: string) => void;
}

export default function PenyaluranView({ db, onAdd, onDelete }: PenyaluranViewProps) {
  const [search, setSearch] = useState('');
  
  // Modal & form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nomor_penyaluran, setNomorPenyaluran] = useState('');
  const [tanggal_penyaluran, setTanggalPenyaluran] = useState(new Date().toISOString().substring(0, 10));
  const [unit_kerja_penerima, setUnitKerjaPenerima] = useState('');
  const [nama_penerima, setNamaPenerima] = useState('');
  const [jabatan_penerima, setJabatanPenerima] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [jumlah_disalurkan, setJumlahDisalurkan] = useState<number>(0);
  const [keterangan, setKeterangan] = useState('');

  // Signature drawing modal states
  const [signatureTarget, setSignatureTarget] = useState<'pengurus' | 'penerima' | null>(null);
  const [ttd_pengurus, setTtdPengurus] = useState<string>('');
  const [ttd_penerima, setTtdPenerima] = useState<string>('');

  const filteredPenyaluran = db.penyaluran.filter(p => 
    p.nama_barang.toLowerCase().includes(search.toLowerCase()) ||
    p.kode_barang.toLowerCase().includes(search.toLowerCase()) ||
    p.nomor_penyaluran.toLowerCase().includes(search.toLowerCase()) ||
    p.nama_penerima.toLowerCase().includes(search.toLowerCase()) ||
    p.unit_kerja_penerima.toLowerCase().includes(search.toLowerCase())
  );

  const selectedItemObj = useMemo(() => {
    return db.barang.find(b => b.id === selectedItemId);
  }, [db.barang, selectedItemId]);

  const currentAvailableStock = useMemo(() => {
    if (!selectedItemObj) return 0;
    return calculateCurrentStock(db, selectedItemObj.kode_barang);
  }, [db, selectedItemObj]);

  const openAddModal = () => {
    if (db.barang.length === 0) {
      alert("Silakan daftarkan master barang terlebih dahulu di menu 'Data Barang'!");
      return;
    }
    setSelectedItemId(db.barang[0].id);
    setNomorPenyaluran('');
    setUnitKerjaPenerima('');
    setNamaPenerima('');
    setJabatanPenerima('');
    setJumlahDisalurkan(0);
    setKeterangan('');
    setTtdPengurus('');
    setTtdPenerima('');
    setIsModalOpen(true);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!nomor_penyaluran || !unit_kerja_penerima || !nama_penerima || !selectedItemObj || jumlah_disalurkan <= 0) {
      alert("Mohon lengkapi seluruh kolom formulir secara valid!");
      return;
    }

    if (jumlah_disalurkan > currentAvailableStock) {
      alert(`Stok tidak mencukupi! Stok ${selectedItemObj.nama_barang} saat ini di sistem hanya ${currentAvailableStock} ${selectedItemObj.satuan}.`);
      return;
    }

    const payload = {
      nomor_penyaluran,
      tanggal_penyaluran,
      unit_kerja_penerima,
      nama_penerima,
      jabatan_penerima,
      kode_barang: selectedItemObj.kode_barang,
      nama_barang: selectedItemObj.nama_barang,
      jumlah_disalurkan: Number(jumlah_disalurkan),
      keterangan,
      ttd_pengurus: ttd_pengurus || 'drawn_placeholder',
      ttd_penerima: ttd_penerima || 'drawn_placeholder'
    };

    onAdd(payload);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, code: string) => {
    if (window.confirm(`Hapus transaksi penyaluran No. "${code}"?`)) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-6 select-none animate-fade-in no-print">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Penyaluran Goods / Barang Keluar</h2>
          <p className="text-xs text-slate-500 mt-1">Simpan dan cetak pendistribusian operasional barang ATK/Bahan komputer ke Bidang/Seksi internal</p>
        </div>
        
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-blue-600/20 transition duration-150 border-none cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>Tambah Penyaluran</span>
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
            placeholder="Cari berdasarkan nomor bpb, nama penerima, unit kerja, nama barang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Main Grid Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100">
                <th className="py-4 px-6">No. Penyaluran</th>
                <th className="py-4 px-6">Tanggal Distribusi</th>
                <th className="py-4 px-6">Unit Kerja Penerima</th>
                <th className="py-4 px-6">Penerima (NIP/Jabatan)</th>
                <th className="py-4 px-6">Kode Barang</th>
                <th className="py-4 px-6">Nama Barang</th>
                <th className="py-2.5 px-4 text-center">Volume Volt</th>
                <th className="py-4 px-6">Tanda Tangan</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredPenyaluran.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-semibold">
                    Tidak ada transaksi penyaluran barang.
                  </td>
                </tr>
              ) : (
                filteredPenyaluran.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition duration-150">
                    <td className="py-4 px-6 text-slate-700 font-bold max-w-[130px] truncate" title={item.nomor_penyaluran}>{item.nomor_penyaluran}</td>
                    <td className="py-4 px-6 text-slate-500 font-normal">{item.tanggal_penyaluran}</td>
                    <td className="py-4 px-6 text-slate-900 truncate max-w-[140px]" title={item.unit_kerja_penerima}>{item.unit_kerja_penerima}</td>
                    <td className="py-4 px-6">
                      <p className="text-slate-800 font-bold">{item.nama_penerima}</p>
                      <p className="text-[10px] text-slate-400 font-medium font-mono">{item.jabatan_penerima}</p>
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] text-blue-600 font-bold">{item.kode_barang}</td>
                    <td className="py-4 px-6 text-slate-900">{item.nama_barang}</td>
                    <td className="py-2.5 px-4 text-center text-rose-600 font-bold">-{item.jumlah_disalurkan}</td>
                    <td className="py-4 px-6 text-slate-500 font-light">
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">Ttd Ok</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(item.id, item.nomor_penyaluran)}
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
              <h3 className="text-sm font-bold tracking-wide">REGISTER PENYALURAN UNIT KERJA</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-white transition">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1.5 font-bold">NOMOR PENYALURAN (BPB/BAST)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 050/08/BA-DUKCAPIL/II/2026"
                    value={nomor_penyaluran}
                    onChange={(e) => setNomorPenyaluran(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5">TANGGAL DISALURKAN</label>
                  <input
                    type="date"
                    required
                    value={tanggal_penyaluran}
                    onChange={(e) => setTanggalPenyaluran(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-slate-500 mb-1.5">BIDANG / UNIT PENERIMA</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Seksi Identitas"
                    value={unit_kerja_penerima}
                    onChange={(e) => setUnitKerjaPenerima(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5">NAMA LENGKAP PENERIMA</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Marniati Gula, S.AP"
                    value={nama_penerima}
                    onChange={(e) => setNamaPenerima(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5">JABATAN PENERIMA</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kepala Seksi"
                    value={jabatan_penerima}
                    onChange={(e) => setJabatanPenerima(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-500 mb-1.5 font-bold">PILIH BARANG KANTOR</label>
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
                <div>
                  <label className="block text-slate-500 mb-1.5 font-bold">JUMLAH DISALURKAN</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={jumlah_disalurkan || ''}
                    placeholder="Contoh: 15"
                    onChange={(e) => setJumlahDisalurkan(Math.max(0, parseInt(e.target.value, 10)))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {selectedItemObj && (
                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl space-y-1 text-[11px] font-semibold">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pilihan Satuan:</span>
                    <span className="text-slate-700 font-bold">{selectedItemObj.satuan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sisa Stok Tersedia Keuangan:</span>
                    <span className={`font-bold ${currentAvailableStock <= 5 ? 'text-rose-600' : 'text-blue-600'}`}>
                      {currentAvailableStock} {selectedItemObj.satuan}
                    </span>
                  </div>
                </div>
              )}

              {/* Digital drawing signature pads (Double signatures!) */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-bold">TANDA TANGAN PENGURUS BARANG</label>
                  {ttd_pengurus ? (
                    <div className="border border-slate-200 rounded-xl p-2 bg-white flex flex-col items-center relative group">
                      <img src={ttd_pengurus} alt="Ttd Pengurus" className="h-14 object-contain max-w-full" />
                      <button 
                        type="button" 
                        onClick={() => setTtdPengurus('')}
                        className="absolute right-1 top-1 bg-red-100 text-red-600 hover:bg-red-200 p-1 rounded-full text-[10px] transition"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSignatureTarget('pengurus')}
                      className="w-full py-3.5 border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl flex flex-col items-center justify-center space-y-1 transition duration-150"
                    >
                      <FileSignature size={16} className="text-slate-400" />
                      <span className="text-[10px] font-bold">Gambar Ttd</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-bold">TANDA TANGAN PENERIMA</label>
                  {ttd_penerima ? (
                    <div className="border border-slate-200 rounded-xl p-2 bg-white flex flex-col items-center relative group">
                      <img src={ttd_penerima} alt="Ttd Penerima" className="h-14 object-contain max-w-full" />
                      <button 
                        type="button" 
                        onClick={() => setTtdPenerima('')}
                        className="absolute right-1 top-1 bg-red-100 text-red-600 hover:bg-red-200 p-1 rounded-full text-[10px] transition"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSignatureTarget('penerima')}
                      className="w-full py-3.5 border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl flex flex-col items-center justify-center space-y-1 transition duration-150"
                    >
                      <FileSignature size={16} className="text-slate-400" />
                      <span className="text-[10px] font-bold">Gambar Ttd</span>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5">KETERANGAN DIKELUARKAN</label>
                <textarea
                  placeholder="Keterangan pengeluaran..."
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
          } else if (signatureTarget === 'penerima') {
            setTtdPenerima(dataUrl);
          }
        }}
        title={`GAMBAR TANDA TANGAN ${signatureTarget === 'pengurus' ? 'PENGURUS BARANG' : 'PENERIMA BARANG'}`}
      />
    </div>
  );
}
