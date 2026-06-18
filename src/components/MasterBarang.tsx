import { useState, useMemo, FormEvent } from 'react';
import { Search, Plus, Edit, Trash2, CheckCircle2, XCircle, AlertCircle, Save, X } from 'lucide-react';
import { Barang, Database } from '../types';

interface MasterBarangProps {
  db: Database;
  role: string;
  onAdd: (item: Omit<Barang, 'id'>) => void;
  onUpdate: (id: string, item: Partial<Barang>) => void;
  onDelete: (id: string) => void;
}

export default function MasterBarang({ db, role, onAdd, onUpdate, onDelete }: MasterBarangProps) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  
  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [kode_barang, setKodeBarang] = useState('');
  const [nama_barang, setNamaBarang] = useState('');
  const [satuan, setSatuan] = useState('');
  const [kategori_barang, setKategoriBarang] = useState('');
  const [spesifikasi, setSpesifikasi] = useState('');
  const [lokasi_penyimpanan, setLokasiPenyimpanan] = useState('');
  const [status_aktif, setStatusAktif] = useState('Aktif');

  // Can the current user mutate data?
  // Kepala Dinas can ONLY view, they cannot make mutations
  const isReadOnly = role === 'Kepala Dinas';

  // Get unique categories for filtering
  const categories = useMemo(() => {
    const cats = new Set<string>();
    db.barang.forEach(b => {
      if (b.kategori_barang) cats.add(b.kategori_barang);
    });
    return Array.from(cats);
  }, [db.barang]);

  // Filter items
  const filteredBarang = useMemo(() => {
    return db.barang.filter(b => {
      const matchesSearch = b.nama_barang.toLowerCase().includes(search.toLowerCase()) || 
                            b.kode_barang.toLowerCase().includes(search.toLowerCase());
      const matchesCat = !catFilter || b.kategori_barang === catFilter;
      return matchesSearch && matchesCat;
    });
  }, [db.barang, search, catFilter]);

  const openAddModal = () => {
    if (isReadOnly) return;
    setEditId(null);
    setKodeBarang('');
    setNamaBarang('');
    setSatuan('Rim');
    setKategoriBarang('Alat Tulis Kantor');
    setSpesifikasi('');
    setLokasiPenyimpanan('');
    setStatusAktif('Aktif');
    setIsModalOpen(true);
  };

  const openEditModal = (item: Barang) => {
    if (isReadOnly) return;
    setEditId(item.id);
    setKodeBarang(item.kode_barang);
    setNamaBarang(item.nama_barang);
    setSatuan(item.satuan);
    setKategoriBarang(item.kategori_barang);
    setSpesifikasi(item.spesifikasi || '');
    setLokasiPenyimpanan(item.lokasi_penyimpanan || '');
    setStatusAktif(item.status_aktif || 'Aktif');
    setIsModalOpen(true);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!kode_barang || !nama_barang) return;

    const payload = {
      kode_barang,
      nama_barang,
      satuan,
      kategori_barang,
      spesifikasi,
      lokasi_penyimpanan,
      status_aktif
    };

    if (editId) {
      onUpdate(editId, payload);
    } else {
      onAdd(payload);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (isReadOnly) return;
    if (window.confirm(`Apakah Anda yakin ingin menghapus barang "${name}"?`)) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-6 select-none animate-fade-in no-print">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Master Data Barang</h2>
          <p className="text-xs text-slate-500 mt-1">Kelola pendaftaran kode barang, nama, dan lokasi penyimpanan persediaan</p>
        </div>
        
        {!isReadOnly && (
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-blue-600/20 transition duration-150 border-none cursor-pointer self-start sm:self-auto"
          >
            <Plus size={14} />
            <span>Tambah Barang</span>
          </button>
        )}
      </div>

      {isReadOnly && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 flex items-center space-x-3 text-xs font-semibold">
          <AlertCircle size={18} className="text-amber-600 shrink-0" />
          <span>Mode Lihat Saja: Jabatan Anda (Kepala Dinas) didesain untuk pelaporan. Tombol manipulasi dinonaktifkan.</span>
        </div>
      )}

      {/* Filter and Search controls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Cari berdasarkan kode atau nama barang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-[200px]"
        >
          <option value="">Semua Kategori</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100">
                <th className="py-4 px-6">Kode Barang</th>
                <th className="py-4 px-6">Nama Barang</th>
                <th className="py-4 px-6">Kategori</th>
                <th className="py-4 px-6">Satuan</th>
                <th className="py-4 px-6">Spesifikasi</th>
                <th className="py-4 px-6">Lokasi</th>
                <th className="py-4 px-6 text-center">Status</th>
                {!isReadOnly && <th className="py-4 px-6 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredBarang.length === 0 ? (
                <tr>
                  <td colSpan={isReadOnly ? 7 : 8} className="py-12 text-center text-slate-400 font-semibold">
                    Tidak ada data barang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredBarang.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition duration-150">
                    <td className="py-4 px-6 font-mono text-[11px] text-blue-600 font-bold">{item.kode_barang}</td>
                    <td className="py-4 px-6 text-slate-900">{item.nama_barang}</td>
                    <td className="py-4 px-6"><span className="bg-slate-100 py-1 px-2.5 rounded-lg text-[10px] text-slate-600 font-bold">{item.kategori_barang}</span></td>
                    <td className="py-4 px-6 text-slate-500 font-bold">{item.satuan}</td>
                    <td className="py-4 px-6 text-slate-500 font-normal">{item.spesifikasi || '-'}</td>
                    <td className="py-4 px-6 text-slate-500 font-normal">{item.lokasi_penyimpanan || '-'}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold ${
                        item.status_aktif === 'Aktif' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {item.status_aktif === 'Aktif' ? (
                          <CheckCircle2 size={10} className="mr-1" />
                        ) : (
                          <XCircle size={10} className="mr-1" />
                        )}
                        {item.status_aktif || 'Aktif'}
                      </span>
                    </td>
                    {!isReadOnly && (
                      <td className="py-4 px-6 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.nama_barang)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insert or Update Modal container */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative border border-slate-100">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-sm font-bold tracking-wide">
                {editId ? 'SUNTING DETAIL BARANG' : 'TAMBAH MASTER DATA BARANG'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-white transition">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1.5">KODE BARANG (COA/KELOMPOK)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 1.01.01.01"
                    value={kode_barang}
                    onChange={(e) => setKodeBarang(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5">KATEGORI BARANG</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Alat Tulis Kantor"
                    value={kategori_barang}
                    onChange={(e) => setKategoriBarang(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5">NAMA BARANG</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama deskriptif barang..."
                  value={nama_barang}
                  onChange={(e) => setNamaBarang(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1.5">SATUAN STOK</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rim, Box, Pak, Botol"
                    value={satuan}
                    onChange={(e) => setSatuan(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5">STATUS AKTIFASI</label>
                  <select
                    value={status_aktif}
                    onChange={(e) => setStatusAktif(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                  >
                    <option value="Aktif">Aktif (Dapat Ditransaksikan)</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1.5">SPESIFIKASI MERK / MODEL</label>
                  <input
                    type="text"
                    placeholder="Contoh: PaperOne, Putih 80gr"
                    value={spesifikasi}
                    onChange={(e) => setSpesifikasi(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5">LOKASI PENYIMPANAN</label>
                  <input
                    type="text"
                    placeholder="Contoh: Rak ATK A, Lemari Tinta"
                    value={lokasi_penyimpanan}
                    onChange={(e) => setLokasiPenyimpanan(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 duration-150 transition"
                >
                  Batal Sunting
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
