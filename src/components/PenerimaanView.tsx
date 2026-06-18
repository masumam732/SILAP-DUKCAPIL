import { useState, useMemo, FormEvent } from 'react';
import { Search, Plus, Save, Trash2, X } from 'lucide-react';
import { Penerimaan, Database } from '../types';
import { formatRupiah } from '../lib/db';

interface PenerimaanViewProps {
  db: Database;
  onAdd: (item: Omit<Penerimaan, 'id'>) => void;
  onDelete: (id: string) => void;
}

export default function PenerimaanView({ db, onAdd, onDelete }: PenerimaanViewProps) {
  const [search, setSearch] = useState('');
  
  // Modal & form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nomor_dokumen, setNomorDokumen] = useState('');
  const [tanggal_penerimaan, setTanggalPenerimaan] = useState(new Date().toISOString().substring(0, 10));
  const [sumber_dana, setSumberDana] = useState('APBD Kabupaten Halmahera Barat');
  const [penyedia, setPenyedia] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [jumlah, setJumlah] = useState<number>(0);
  const [harga_satuan, setHargaSatuan] = useState<number>(0);
  const [keterangan, setKeterangan] = useState('');

  // Filter receipts
  const filteredPenerimaan = db.penerimaan.filter(p => 
    p.nama_barang.toLowerCase().includes(search.toLowerCase()) ||
    p.kode_barang.toLowerCase().includes(search.toLowerCase()) ||
    p.nomor_dokumen.toLowerCase().includes(search.toLowerCase()) ||
    p.penyedia.toLowerCase().includes(search.toLowerCase())
  );

  const selectedItemObj = useMemo(() => {
    return db.barang.find(b => b.id === selectedItemId);
  }, [db.barang, selectedItemId]);

  const valueTotal = useMemo(() => {
    return jumlah * harga_satuan;
  }, [jumlah, harga_satuan]);

  const openAddModal = () => {
    if (db.barang.length === 0) {
      alert("Silakan daftarkan master barang terlebih dahulu di menu 'Data Barang'!");
      return;
    }
    setSelectedItemId(db.barang[0].id);
    setNomorDokumen('');
    setPenyedia('');
    setJumlah(0);
    setHargaSatuan(0);
    setKeterangan('');
    setIsModalOpen(true);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!nomor_dokumen || !penyedia || !selectedItemObj || jumlah <= 0 || harga_satuan <= 0) {
      alert("Mohon isi dokumen, penyedia, barang, jumlah, dan harga satuan secara valid!");
      return;
    }

    const payload = {
      nomor_dokumen,
      tanggal_penerimaan,
      sumber_dana,
      penyedia,
      kode_barang: selectedItemObj.kode_barang,
      nama_barang: selectedItemObj.nama_barang,
      satuan: selectedItemObj.satuan,
      jumlah: Number(jumlah),
      harga_satuan: Number(harga_satuan),
      total_nilai: Number(valueTotal),
      keterangan
    };

    onAdd(payload);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, doc: string) => {
    if (window.confirm(`Hapus pencatatan penerimaan dokumen "${doc}"?`)) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-6 select-none animate-fade-in no-print">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Penerimaan Barang</h2>
          <p className="text-xs text-slate-500 mt-1">Registrasikan stok barang masuk yang bersumber dari pengadaan, hibah, dsb.</p>
        </div>
        
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-blue-600/20 transition duration-150 border-none cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>Tambah Penerimaan</span>
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
            placeholder="Cari berdasarkan nomor dokumen, nama barang, penyedia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Table list */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100">
                <th className="py-4 px-6">No. Dokumen</th>
                <th className="py-4 px-6">Tanggal Rcv</th>
                <th className="py-4 px-6">Sumber Dana</th>
                <th className="py-4 px-6">Penyedia / Toko</th>
                <th className="py-4 px-6">Kode Barang</th>
                <th className="py-4 px-6">Nama Barang</th>
                <th className="py-2.5 px-4 text-center">Volume</th>
                <th className="py-4 px-6 text-right">Harga Satuan</th>
                <th className="py-4 px-6 text-right">Total Nilai</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredPenerimaan.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-semibold">
                    Tidak ada pencatatan transaksi masuk penerimaan barang.
                  </td>
                </tr>
              ) : (
                filteredPenerimaan.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition duration-150">
                    <td className="py-4 px-6 text-slate-700 font-bold max-w-[130px] truncate" title={item.nomor_dokumen}>{item.nomor_dokumen}</td>
                    <td className="py-4 px-6 text-slate-500 font-normal">{item.tanggal_penerimaan}</td>
                    <td className="py-4 px-6 text-slate-500 font-normal truncate max-w-[120px]" title={item.sumber_dana}>{item.sumber_dana}</td>
                    <td className="py-4 px-6 text-slate-700 font-bold truncate max-w-[110px]" title={item.penyedia}>{item.penyedia}</td>
                    <td className="py-4 px-6 font-mono text-[11px] text-blue-600 font-bold">{item.kode_barang}</td>
                    <td className="py-4 px-6 text-slate-900">{item.nama_barang}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-slate-800">{item.jumlah} <span className="text-[10px] text-slate-400 font-semibold">{item.satuan}</span></td>
                    <td className="py-4 px-6 text-right text-slate-600">{formatRupiah(item.harga_satuan)}</td>
                    <td className="py-4 px-6 text-right text-emerald-600 font-bold">{formatRupiah(item.total_nilai)}</td>
                    <td className="py-4 px-6 text-right font-medium">
                      <button
                        onClick={() => handleDelete(item.id, item.nomor_dokumen)}
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
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative border border-slate-100">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-sm font-bold tracking-wide">CATAT BARANG MASUK / PENERIMAAN</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-white transition">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1.5 font-bold">NOMOR DOKUMEN / KONTRAK / SP</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 050/01/SP-DUKCAPIL/I/2026"
                    value={nomor_dokumen}
                    onChange={(e) => setNomorDokumen(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5">TANGGAL PENERIMAAN FISIK</label>
                  <input
                    type="date"
                    required
                    value={tanggal_penerimaan}
                    onChange={(e) => setTanggalPenerimaan(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1.5">SUMBER ANGGARAN</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: DAK / APBD Kabupaten Halmahera Barat"
                    value={sumber_dana}
                    onChange={(e) => setSumberDana(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5 font-bold">REKANAN / TOKO / PENYEDIA</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: CV. Halbar Lestari Mandiri"
                    value={penyedia}
                    onChange={(e) => setPenyedia(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5">NAMA BARANG YANG DIKIRIM</label>
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
                  <label className="block text-slate-500 mb-1.5">VOLUME / JUMLAH MASUK</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={jumlah || ''}
                    placeholder="Contoh: 50"
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
                    <span className="text-slate-400">Total Nilai Kwitansi / Faktur:</span>
                    <span className="text-emerald-600 font-bold">{formatRupiah(valueTotal)}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-500 mb-1.5">KETERANGAN ALASAN MASUK</label>
                <textarea
                  placeholder="Keterangan tambahan..."
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
