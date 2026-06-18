import { useState, useMemo, FormEvent, ChangeEvent } from 'react';
import { Search, Plus, Edit, Trash2, Check, CheckCircle2, Shield, User, MapPin, Mail, Sparkles, Building2, Save, X } from 'lucide-react';
import { Dinas, Database } from '../types';

interface MasterDinasProps {
  db: Database;
  role: string;
  onAdd: (item: Omit<Dinas, 'id'>) => void;
  onUpdate: (id: string, item: Partial<Dinas>) => void;
  onDelete: (id: string) => void;
  onSetActive: (id: string) => void;
}

export default function MasterDinas({ db, role, onAdd, onUpdate, onDelete, onSetActive }: MasterDinasProps) {
  const [search, setSearch] = useState('');
  
  // Form modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Form structures
  const [nama_dinas, setNamaDinas] = useState('');
  const [pemerintah, setPemerintah] = useState('');
  const [alamat, setAlamat] = useState('');
  const [nama_kadis, setNamaKadis] = useState('');
  const [nip_kadis, setNipKadis] = useState('');
  const [nama_pengurus, setNamaPengurus] = useState('');
  const [nip_pengurus, setNipPengurus] = useState('');
  const [status_aktif, setStatusAktif] = useState(false);
  const [logo_url, setLogoUrl] = useState<string | undefined>(undefined);

  const isReadOnly = role === 'Kepala Dinas';

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      alert("Ukuran file gambar terlalu besar! Maksimal adalah 500 KB untuk menjamin keamanan penyimpanan lokal.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setLogoUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Filter dinas
  const filteredDinas = useMemo(() => {
    const list = db.dinas || [];
    return list.filter(d => 
      d.nama_dinas.toLowerCase().includes(search.toLowerCase()) || 
      d.pemerintah.toLowerCase().includes(search.toLowerCase()) ||
      d.nama_kadis.toLowerCase().includes(search.toLowerCase())
    );
  }, [db.dinas, search]);

  const openAddModal = () => {
    if (isReadOnly) return;
    setEditId(null);
    setNamaDinas('');
    setPemerintah('Pemerintah Kabupaten Halmahera Barat');
    setAlamat('Jl. Pengabdian No. 12, Jailolo');
    setNamaKadis('');
    setNipKadis('');
    setNamaPengurus('');
    setNipPengurus('');
    setStatusAktif(db.dinas && db.dinas.length === 0); // Active by default if it's the first
    setLogoUrl(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (dinas: Dinas) => {
    if (isReadOnly) return;
    setEditId(dinas.id);
    setNamaDinas(dinas.nama_dinas);
    setPemerintah(dinas.pemerintah);
    setAlamat(dinas.alamat || '');
    setNamaKadis(dinas.nama_kadis);
    setNipKadis(dinas.nip_kadis);
    setNamaPengurus(dinas.nama_pengurus);
    setNipPengurus(dinas.nip_pengurus);
    setStatusAktif(dinas.status_aktif);
    setLogoUrl(dinas.logo_url);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    const data = {
      nama_dinas,
      pemerintah,
      alamat,
      nama_kadis,
      nip_kadis,
      nama_pengurus,
      nip_pengurus,
      status_aktif: editId ? status_aktif : (db.dinas && db.dinas.length === 0 ? true : status_aktif),
      logo_url
    };

    if (editId) {
      onUpdate(editId, data);
    } else {
      onAdd(data);
    }
    
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id: string, active: boolean) => {
    if (isReadOnly) return;
    if (active) {
      alert("Profil Dinas yang sedang aktif tidak dapat dihapus. Silakan aktifkan profil dinas lain terlebih dahulu.");
      return;
    }
    if (confirm("Apakah Anda yakin ingin menghapus profil dinas ini?")) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-6 select-none animate-fade-in no-print">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Profil &amp; Identitas Dinas</h2>
          <p className="text-xs text-slate-500 mt-0.5">Kelola data dinas, sekretariat daerah, dan penandatangan resmi berkas persediaan</p>
        </div>
        {!isReadOnly && (
          <button 
            onClick={openAddModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md shadow-indigo-600/10 transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Plus size={16} />
            <span>Tambah Dinas Baru</span>
          </button>
        )}
      </div>

      {/* Control Panel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={15} />
          </span>
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama dinas / kepala dinas..." 
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-400"
          />
        </div>
        <div className="text-slate-400 text-xs hidden md:block ml-auto">
          Total items: <span className="font-bold text-slate-700">{filteredDinas.length}</span>
        </div>
      </div>

      {/* Dinas Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDinas.map((dinas) => {
          const isActive = dinas.status_aktif;
          return (
            <div 
              key={dinas.id} 
              className={`bg-white rounded-2xl p-6 border transition-all ${
                isActive 
                  ? 'border-indigo-500 ring-2 ring-indigo-500/10 shadow-md' 
                  : 'border-slate-200 shadow-sm hover:border-slate-300'
              } flex flex-col justify-between`}
            >
              <div>
                {/* Active Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-slate-100 w-12 h-12 rounded-xl text-slate-600 shrink-0 flex items-center justify-center overflow-hidden border border-slate-200/50 p-1">
                    {dinas.logo_url ? (
                      <img src={dinas.logo_url} alt="Logo Dinas" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <Building2 size={20} className={isActive ? "text-indigo-600" : "text-slate-500"} />
                    )}
                  </div>
                  {isActive ? (
                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold py-1 px-3 rounded-full flex items-center space-x-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                      <span>Dinas Aktif</span>
                    </span>
                  ) : (
                    !isReadOnly && (
                      <button 
                        onClick={() => onSetActive(dinas.id)}
                        className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 py-1 px-3 rounded-full transition cursor-pointer flex items-center space-x-1"
                      >
                        <Check size={12} />
                        <span>Aktifkan</span>
                      </button>
                    )
                  )}
                </div>

                {/* Identity */}
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">{dinas.pemerintah}</p>
                  <h3 className="text-base font-bold text-slate-800 tracking-tight leading-tight">{dinas.nama_dinas}</h3>
                  {dinas.alamat && (
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1.5">
                      <MapPin size={12} className="text-slate-300 shrink-0" />
                      <span className="truncate">{dinas.alamat}</span>
                    </p>
                  )}
                </div>

                <div className="border-t border-dashed border-slate-200/80 my-4"></div>

                {/* Signatories Details */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Kadis */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Kepala Dinas</span>
                    <span className="text-xs font-bold text-slate-800 block truncate">{dinas.nama_kadis || '-'}</span>
                    <span className="text-[10px] font-mono text-slate-400 block truncate">NIP. {dinas.nip_kadis || '-'}</span>
                  </div>

                  {/* Pengurus */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Pengurus Barang</span>
                    <span className="text-xs font-bold text-slate-800 block truncate">{dinas.nama_pengurus || '-'}</span>
                    <span className="text-[10px] font-mono text-slate-400 block truncate">NIP. {dinas.nip_pengurus || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {!isReadOnly && (
                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 mt-6">
                  <button 
                    onClick={() => openEditModal(dinas)}
                    className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-xl transition cursor-pointer border border-transparent hover:border-indigo-100"
                    title="Ubah Profil"
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(dinas.id, isActive)}
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition cursor-pointer border border-transparent hover:border-red-100"
                    disabled={isActive}
                    title={isActive ? "Tidak dapat menghapus dinas aktif" : "Hapus Profil"}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filteredDinas.length === 0 && (
          <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-8 text-center sm:p-12">
            <Building2 className="mx-auto text-slate-300" size={40} />
            <h3 className="mt-2 text-sm font-semibold text-slate-900">Tidak ada data dinas</h3>
            <p className="mt-1 text-xs text-slate-500">Coba rubah kata kunci pencarian Anda atau tambahkan profil dinas baru.</p>
          </div>
        )}
      </div>

      {/* Slide sheet or Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col md:max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 tracking-tight">
                {editId ? 'Ubah Profil Dinas' : 'Tambah Profil Dinas Baru'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition p-1.5 rounded-lg hover:bg-slate-50"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Nama Pemerintah Daerah</label>
                <input 
                  type="text" 
                  value={pemerintah}
                  onChange={(e) => setPemerintah(e.target.value)}
                  placeholder="Contoh: Pemerintah Kabupaten Halmahera Barat"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Nama Instansi / Dinas</label>
                <input 
                  type="text" 
                  value={nama_dinas}
                  onChange={(e) => setNamaDinas(e.target.value)}
                  placeholder="Contoh: Dinas Kependudukan dan Pencatatan Sipil"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Alamat Instansi</label>
                <input 
                  type="text" 
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Contoh: Jl. Pengabdian No. 12, Jailolo"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Logo Dinas / KOP Surat</label>
                <div className="flex items-center gap-4 p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-slate-200 shrink-0 p-1">
                    {logo_url ? (
                      <img src={logo_url} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <Building2 size={24} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden" 
                      id="logo-upload"
                    />
                    <label 
                      htmlFor="logo-upload"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-200 hover:text-indigo-600 rounded-lg text-xs font-bold text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 transition"
                    >
                      Pilih Logo Dinas
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">Format gambar JPG, PNG, GIF, SVG. Maks 500 KB.</p>
                    {logo_url && (
                      <button 
                        type="button"
                        onClick={() => setLogoUrl(undefined)}
                        className="text-[10px] font-bold text-red-500 hover:text-red-700 mt-1 hover:underline cursor-pointer"
                      >
                        Hapus Logo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/50 space-y-3.5">
                <span className="text-[10px] font-extrabold text-indigo-700 tracking-wider uppercase block">Penandatangan 1: Kepala Dinas / Kadis</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-extrabold text-slate-400 block mb-1">Nama Kepala Dinas</label>
                    <input 
                      type="text" 
                      value={nama_kadis}
                      onChange={(e) => setNamaKadis(e.target.value)}
                      placeholder="Nama Lengkap & Gelar"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-extrabold text-slate-400 block mb-1">NIP Kepala Dinas</label>
                    <input 
                      type="text" 
                      value={nip_kadis}
                      onChange={(e) => setNipKadis(e.target.value)}
                      placeholder="18 Digit Angka NIP"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/40 space-y-3.5">
                <span className="text-[10px] font-extrabold text-emerald-700 tracking-wider uppercase block">Penandatangan 2: Pengurus Barang Pengguna</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-extrabold text-slate-400 block mb-1">Nama Pengurus Barang</label>
                    <input 
                      type="text" 
                      value={nama_pengurus}
                      onChange={(e) => setNamaPengurus(e.target.value)}
                      placeholder="Nama Lengkap & Gelar"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-extrabold text-slate-400 block mb-1">NIP Pengurus Barang</label>
                    <input 
                      type="text" 
                      value={nip_pengurus}
                      onChange={(e) => setNipPengurus(e.target.value)}
                      placeholder="18 Digit Angka NIP"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-md shadow-indigo-600/10 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
