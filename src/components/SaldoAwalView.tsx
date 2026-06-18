import { useState, useMemo, FormEvent } from 'react';
import { Search, Plus, Save, Trash2, X } from 'lucide-react';
import { SaldoAwal, Database } from '../types';
import { formatRupiah } from '../lib/db';

interface SaldoAwalViewProps {
  db: Database;
  onAdd: (item: Omit<SaldoAwal, 'id'>) => void;
  onDelete: (id: string) => void;
}

export default function SaldoAwalView({ db, onAdd, onDelete }: SaldoAwalViewProps) {
  const [search, setSearch] = useState('');
  
  // Modal & form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tahun_anggaran, setTahunAnggaran] = useState('2026');
  const [tanggal, setTanggal] = useState(new Date().toISOString().substring(0, 10));
  const [selectedItemId, setSelectedItemId] = useState('');
  const [jumlah, setJumlah] = useState<number>(0);
  const [harga_satuan, setHargaSatuan] = useState<number>(0);
  const [keterangan, setKeterangan] = useState('Saldo awal tahun 2026');

  // Filter items match list
  const filteredSaldo = db.saldo_awal.filter(s => 
    s.nama_barang.toLowerCase().includes(search.toLowerCase()) ||
    s.kode_barang.toLowerCase().includes(search.toLowerCase()) ||
    s.tahun_anggaran.includes(search)
  );

  const selectedItemObj = useMemo(() => {
    return db.barang.find(b => b.id === selectedItemId);
  }, [db.barang, selectedItemId]);

  const valorPersediaan = useMemo(() => {
    return jumlah * harga_satuan;
  }, [jumlah, harga_satuan]);

  const openAddModal = () => {
    if (db.barang.length === 0) {
      alert("Silakan daftarkan master barang terlebih dahulu di menu 'Data Barang'!");
      return;
    }
    setSelectedItemId(db.barang[0].id);
    setJumlah(0);
    setHargaSatuan(0);
    setKeterangan('Saldo awal tahun 2026');
    setIsModalOpen(true);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedItemObj || jumlah <= 0 || harga_satuan <= 0) {
      alert("Jumlah dan Harga Satuan wajib lebih besar dari 0!");
      return;
    }

    const payload = {
      tahun_anggaran,
      tanggal,
      kode_barang: selectedItemObj.kode_barang,
      nama_barang: selectedItemObj.nama_barang,
      jumlah: Number(jumlah),
      harga_satuan: Number(harga_satuan),
      nilai_persediaan: Number(valorPersediaan),
      keterangan
    };

    onAdd(payload);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Hapus pencatatan saldo awal "${name}"?`)) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-6 select-none animate-fade-in no-print">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Saldo Awal Persediaan</h2>
          <p className="text-xs text-slate-500 mt-1">Kelola pencatatan sisa saldo fisik barang bawaan tahun anggaran sebelumnya</p>
        </div>
        
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-blue-600/20 transition duration-150 border-none cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>Tambah Saldo Awal</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Cari berdasarkan kode, nama barang, atau tahun anggaran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100">
                <th className="py-4 px-6">TA</th>
                <th className="py-4 px-6">Tanggal Input</th>
                <th className="py-4 px-6">Kode Barang</th>
                <th className="py-4 px-6">Nama Barang</th>
                <th className="py-2.5 px-4 text-center">Jumlah Vol</th>
                <th className="py-4 px-6 text-right">Harga Satuan</th>
                <th className="py-4 px-6 text-right">Nilai Persediaan</th>
                <th className="py-4 px-6">Keterangan</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredSaldo.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-semibold">
                    Tidak ada pencatatan saldo awal persediaan bawaan.
                  </td>
                </tr>
              ) : (
                filteredSaldo.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition duration-150">
                    <td className="py-4 px-6 text-slate-500 font-bold">{item.tahun_anggaran}</td>
                    <td className="py-4 px-6 text-slate-500 font-normal">{item.tanggal}</td>
                    <td className="py-4 px-6 font-mono text-[11px] text-blue-600 font-bold">{item.kode_barang}</td>
                    <td className="py-4 px-6 text-slate-900">{item.nama_barang}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-slate-800">{item.jumlah}</td>
                    <td className="py-4 px-6 text-right text-slate-600">{formatRupiah(item.harga_satuan)}</td>
                    <td className="py-4 px-6 text-right text-emerald-600 font-bold">{formatRupiah(item.nilai_persediaan)}</td>
                    <td className="py-4 px-6 text-slate-500 font-normal truncate max-w-[150px]" title={item.keterangan}>{item.keterangan || '-'}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(item.id, item.nama_barang)}
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

      {/* Insert Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative border border-slate-100">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-sm font-bold tracking-wide">TAMBAH SALDO AWAL TAHUNAN</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-white transition">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1.5">TAHUN ANGGARAN</label>
                  <input
                    type="text"
                    required
                    value={tahun_anggaran}
                    onChange={(e) => setTahunAnggaran(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5">TANGGAL PEMBUKUAN</label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5">PILIH BARANG PEMBAWAAN</label>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1.5">JUMLAH VOLUME</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={jumlah || ''}
                    placeholder="Contoh: 10"
                    onChange={(e) => setJumlah(Math.max(0, parseInt(e.target.value, 10)))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5">HARGA SATUAN (Rupiah)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={harga_satuan || ''}
                    placeholder="Contoh: 55000"
                    onChange={(e) => setHargaSatuan(Math.max(0, parseInt(e.target.value, 10)))}
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
                    <span className="text-slate-400">Estimasi Nilai Persediaan:</span>
                    <span className="text-emerald-600 font-bold">{formatRupiah(valorPersediaan)}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-500 mb-1.5">KETERANGAN PERSILAP</label>
                <textarea
                  placeholder="Keterangan pendukung..."
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white h-20 resize-none"
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
    </div>
  );
}
