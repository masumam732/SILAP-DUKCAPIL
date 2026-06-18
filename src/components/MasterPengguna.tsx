import { useState, FormEvent } from 'react';
import { Search, Plus, Edit, Trash2, Shield, Save, X } from 'lucide-react';
import { Pengguna, Database } from '../types';

interface MasterPenggunaProps {
  db: Database;
  onAdd: (user: Omit<Pengguna, 'id'>) => void;
  onUpdate: (id: string, user: Partial<Pengguna>) => void;
  onDelete: (id: string) => void;
}

export default function MasterPengguna({ db, onAdd, onUpdate, onDelete }: MasterPenggunaProps) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form Field States
  const [nama_lengkap, setNamaLengkap] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [role, setRole] = useState('Pengurus Barang');
  const [nip, setNip] = useState('');

  const filteredPengguna = db.pengguna.filter(p => 
    p.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
    p.username.toLowerCase().includes(search.toLowerCase()) ||
    p.nip.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditId(null);
    setNamaLengkap('');
    setUsername('');
    setPassword('');
    setJabatan('');
    setRole('Pengurus Barang');
    setNip('');
    setIsModalOpen(true);
  };

  const openEditModal = (user: Pengguna) => {
    setEditId(user.id);
    setNamaLengkap(user.nama_lengkap);
    setUsername(user.username);
    setPassword(user.password || '');
    setJabatan(user.jabatan);
    setRole(user.role);
    setNip(user.nip);
    setIsModalOpen(true);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!nama_lengkap || !username || !password) return;

    const payload = {
      nama_lengkap,
      username,
      password,
      jabatan,
      role,
      nip
    };

    if (editId) {
      onUpdate(editId, payload);
    } else {
      onAdd(payload);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus pengguna "${name}"?`)) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-6 select-none animate-fade-in no-print">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manajemen Data Pengguna</h2>
          <p className="text-xs text-slate-500 mt-1">Kelola lisensi hak akses pegawai, jabatan, NIP, serta peranan aplikasi</p>
        </div>
        
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-blue-600/20 transition duration-150 border-none cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Cari berdasarkan nama lengkap, username, atau NIP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Grid List representation with high craft (Bento style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredPengguna.length === 0 ? (
          <div className="md:col-span-3 bg-white border border-slate-200 p-12 rounded-2xl text-center text-slate-400 font-semibold text-xs">
            Tidak ada pengguna terdaftar yang cocok dengan pencarian.
          </div>
        ) : (
          filteredPengguna.map(user => (
            <div key={user.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition duration-200 flex flex-col justify-between relative overflow-hidden group">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold ${
                      user.role === 'Administrator' 
                        ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                        : user.role === 'Kepala Dinas'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}>
                      <Shield size={10} className="mr-1" />
                      {user.role}
                    </span>
                    <h3 className="text-sm font-bold text-slate-800 line-clamp-1 mt-1">{user.nama_lengkap}</h3>
                    <p className="text-[10px] text-slate-400 font-bold font-mono">NIP. {user.nip || 'MOCK_NIP'}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-100 font-bold text-slate-600 flex items-center justify-center text-sm uppercase">
                    {user.nama_lengkap.charAt(0)}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2 text-[11px] font-semibold">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Username:</span>
                    <span className="text-slate-700">{user.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Jabatan:</span>
                    <span className="text-slate-700 truncate max-w-[150px]" title={user.jabatan}>{user.jabatan}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 mt-6 border-t border-slate-50 pt-3">
                <button
                  onClick={() => openEditModal(user)}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-blue-600 text-[11px] py-1.5 rounded-lg font-bold transition duration-150"
                >
                  Edit Detail
                </button>
                <button
                  onClick={() => handleDelete(user.id, user.nama_lengkap)}
                  className="flex-1 border border-red-100 hover:bg-red-50 text-red-600 text-[11px] py-1.5 rounded-lg font-bold transition duration-150"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sign-up or sunting modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative border border-slate-100">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-sm font-bold tracking-wide">
                {editId ? 'SUNTING DATA PEGAWAI / USER' : 'DAFTARKAN PENGGUNA BARU'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-white transition">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-500 mb-1.5 font-bold">NAMA LENGKAP (GELAR)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Daud Soleman, S.Kom"
                  value={nama_lengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5 font-bold">NOMOR INDUK PEGAWAI (NIP)</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan 18 digit NIP..."
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1.5 font-bold">USERNAME LOGIN</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: daud99"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5 font-bold">PASSWORD AKSES</label>
                  <input
                    type="password"
                    required
                    placeholder="Masukkan sandi..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1.5 font-bold">JABATAN STRUKTUR</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pengurus Barang"
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5 font-bold">ROLE OTORITAS</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                  >
                    <option value="Administrator">Administrator (Sistem IT)</option>
                    <option value="Pengurus Barang">Pengurus Barang (Stok Operator)</option>
                    <option value="Kepala Dinas">Kepala Dinas (Melihat &amp; Menandatangani)</option>
                  </select>
                </div>
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
