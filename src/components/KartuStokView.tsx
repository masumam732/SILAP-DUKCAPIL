import { useState, useMemo } from 'react';
import { FileText, Printer, Check } from 'lucide-react';
import { Database } from '../types';
import { getActiveDinas } from '../lib/db';

interface KartuStokViewProps {
  db: Database;
}

interface StockCardRow {
  tanggal: string;
  dokumen: string;
  keterangan: string;
  masuk: number;
  keluar: number;
}

export default function KartuStokView({ db }: KartuStokViewProps) {
  const [selectedItemId, setSelectedItemId] = useState('');
  const activeDinas = getActiveDinas(db);

  // Auto-select first item if not set
  useMemo(() => {
    if (!selectedItemId && db.barang.length > 0) {
      setSelectedItemId(db.barang[0].id);
    }
  }, [db.barang, selectedItemId]);

  const selectedItemObj = useMemo(() => {
    return db.barang.find(b => b.id === selectedItemId);
  }, [db.barang, selectedItemId]);

  // Consolidate activity logs for selected item
  const cardRows = useMemo(() => {
    if (!selectedItemObj) return [];

    const rows: StockCardRow[] = [];
    const kb = selectedItemObj.kode_barang;

    // 1. Initial Balance
    const saFiltered = db.saldo_awal.filter(s => s.kode_barang === kb);
    saFiltered.forEach(s => {
      rows.push({
        tanggal: s.tanggal,
        dokumen: "Saldo Awal",
        keterangan: s.keterangan || "Saldo awal tahun anggaran",
        masuk: Number(s.jumlah),
        keluar: 0
      });
    });

    // 2. Receipts Room
    const rcFiltered = db.penerimaan.filter(r => r.kode_barang === kb);
    rcFiltered.forEach(r => {
      rows.push({
        tanggal: r.tanggal_penerimaan,
        dokumen: `Penerimaan - ${r.nomor_dokumen}`,
        keterangan: `Dari: ${r.penyedia}. ${r.keterangan || ''}`.trim(),
        masuk: Number(r.jumlah),
        keluar: 0
      });
    });

    // 3. Dispatch Rooms
    const dsFiltered = db.penyaluran.filter(d => d.kode_barang === kb);
    dsFiltered.forEach(d => {
      rows.push({
        tanggal: d.tanggal_penyaluran,
        dokumen: `Penyaluran - ${d.nomor_penyaluran}`,
        keterangan: `Kepada: ${d.nama_penerima} (${d.unit_kerja_penerima})`.trim(),
        masuk: 0,
        keluar: Number(d.jumlah_disalurkan)
      });
    });

    // 4. Stock Opname Room
    const opFiltered = db.opname.filter(o => o.kode_barang === kb);
    opFiltered.forEach(o => {
      // Treat selisih adjustments. If positive, add as masuk. If negative, add as keluar.
      const isPositive = o.selisih > 0;
      rows.push({
        tanggal: o.tanggal_opname,
        dokumen: `Opname Fisik - ${o.nomor_opname}`,
        keterangan: `Penyesuaian Fisik. Catat: Selisih ${o.selisih}. Keterangan: ${o.keterangan}`.trim(),
        masuk: isPositive ? Number(o.selisih) : 0,
        keluar: !isPositive && o.selisih !== 0 ? Number(Math.abs(o.selisih)) : 0
      });
    });

    // Sort chronologically by date
    rows.sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

    return rows;
  }, [db, selectedItemObj]);

  // Compute ending running balance for each rows
  const cardWithRunningBalance = useMemo(() => {
    let running = 0;
    return cardRows.map(row => {
      running = running + row.masuk - row.keluar;
      return {
        ...row,
        saldo: running
      };
    });
  }, [cardRows]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 select-none animate-fade-in">
      {/* Title block */}
      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Kartu Stok Barang</h2>
          <p className="text-xs text-slate-500 mt-1">Kartu riwayat mutasi keluar-masuk persediaan per item spesifik</p>
        </div>
        
        {selectedItemObj && (
          <button
            onClick={handlePrint}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-md transition duration-150 border-none cursor-pointer"
          >
            <Printer size={14} />
            <span>Cetak Kartu Stok</span>
          </button>
        )}
      </div>

      {/* Select Box */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 no-print">
        <label className="block text-[10px] text-slate-400 font-bold mb-2 uppercase tracking-wide">PILIH ITEM BARANG UNTUK MELIHAT BUKU STOK</label>
        <select
          value={selectedItemId}
          onChange={(e) => setSelectedItemId(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white"
        >
          {db.barang.length === 0 ? (
            <option value="">Belum ada barang terdaftar</option>
          ) : (
            db.barang.map(b => (
              <option key={b.id} value={b.id}>{b.nama_barang} ({b.kode_barang})</option>
            ))
          )}
        </select>
      </div>

      {/* Printer/Preview Card */}
      {selectedItemObj ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none p-6 print:p-0">
          
          {/* Print Letterhead Header */}
          <div className="border-b-4 border-double border-slate-900 pb-4 mb-6 flex items-center justify-center gap-4">
            {activeDinas?.logo_url && (
              <div className="w-16 h-16 shrink-0 flex items-center justify-center p-1 bg-white print:bg-transparent">
                <img src={activeDinas.logo_url} alt="Logo Dinas" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
              </div>
            )}
            <div className="text-center flex-grow">
              <h3 className="font-extrabold text-slate-900 text-sm tracking-wide uppercase leading-tight">{activeDinas.nama_dinas}</h3>
              <h4 className="font-bold text-slate-800 text-xs tracking-wider uppercase mt-0.5">{activeDinas.pemerintah}</h4>
              <p className="text-[9px] text-slate-500 font-medium font-mono mt-1 uppercase">KARTU KONTROL PERSEDIAAN BARANG MILIK DAERAH - TA. 2026</p>
            </div>
            {activeDinas?.logo_url && <div className="w-16 hidden sm:block"></div>}
          </div>

          {/* Item Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-xl text-xs font-semibold text-slate-700 print:bg-transparent print:border print:p-3">
            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-28 text-slate-400">Kode Barang</span>
                <span className="text-slate-900 font-mono font-bold">: {selectedItemObj.kode_barang}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-400">Nama Barang</span>
                <span className="text-slate-900 font-bold">: {selectedItemObj.nama_barang}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-400">Kategori</span>
                <span className="text-slate-800">: {selectedItemObj.kategori_barang}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-28 text-slate-400">Satuan Stok</span>
                <span className="text-slate-900">: {selectedItemObj.satuan}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-400">Lokasi Rak</span>
                <span className="text-slate-800">: {selectedItemObj.lokasi_penyimpanan || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-400">Spesifikasi</span>
                <span className="text-slate-800">: {selectedItemObj.spesifikasi || '-'}</span>
              </div>
            </div>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-semibold">
              <thead>
                <tr className="bg-slate-900 text-white font-bold border border-slate-900">
                  <th className="py-3 px-4 border border-slate-300">Tanggal</th>
                  <th className="py-3 px-4 border border-slate-300">Uraian / Dokumen Referensi</th>
                  <th className="py-3 px-4 border border-slate-300">Keterangan Mutasi</th>
                  <th className="py-3 px-4 text-center border border-slate-300 w-24">Masuk (+)</th>
                  <th className="py-3 px-4 text-center border border-slate-300 w-24">Keluar (-)</th>
                  <th className="py-3 px-4 text-center border border-slate-300 w-24">Sisa Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 border-b border-slate-200">
                {cardWithRunningBalance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Belum ada transaksi mutasi yang tercatat untuk barang ini.
                    </td>
                  </tr>
                ) : (
                  cardWithRunningBalance.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40 border border-slate-200">
                      <td className="py-3 px-4 border border-slate-200 text-slate-500 font-mono font-normal">{row.tanggal}</td>
                      <td className="py-3 px-4 border border-slate-200 text-slate-800 font-bold">{row.dokumen}</td>
                      <td className="py-3 px-4 border border-slate-200 text-slate-500 font-normal max-w-[200px] truncate" title={row.keterangan}>{row.keterangan}</td>
                      <td className="py-3 px-4 border border-slate-200 text-center font-bold text-emerald-600">
                        {row.masuk > 0 ? `+${row.masuk}` : '-'}
                      </td>
                      <td className="py-3 px-4 border border-slate-200 text-center font-bold text-red-600">
                        {row.keluar > 0 ? `-${row.keluar}` : '-'}
                      </td>
                      <td className="py-3 px-4 border border-slate-200 text-center font-extrabold text-slate-900 bg-slate-50/50">
                        {row.saldo} <span className="text-[9px] text-slate-400 font-medium">{selectedItemObj.satuan}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Institutional Print footer signatures */}
          <div className="hidden print:grid grid-cols-2 gap-10 mt-16 font-semibold text-slate-800 text-xs text-center justify-items-center">
            <div className="w-56 flex flex-col items-center">
              <p>Mengetahui,</p>
              <p className="font-bold">Kepala {activeDinas.nama_dinas}</p>
              <div className="h-20 flex items-end justify-center">
                <span className="text-[10px] text-slate-400 border-b border-dashed border-slate-300 pb-0.5">TTD KADIS</span>
              </div>
              <p className="font-bold underline mt-2 text-slate-900">{activeDinas.nama_kadis}</p>
              <p className="text-[10px] text-slate-500">NIP. {activeDinas.nip_kadis}</p>
            </div>

            <div className="w-56 flex flex-col items-center">
              <p>Halmahera Barat, {new Date().getFullYear()}</p>
              <p className="font-bold">Pengurus Barang Pengguna</p>
              <div className="h-20 flex items-end justify-center">
                <span className="text-[10px] text-slate-400 border-b border-dashed border-slate-300 pb-0.5">TTD PENGURUS BARANG</span>
              </div>
              <p className="font-bold underline mt-2 text-slate-900">{activeDinas.nama_pengurus}</p>
              <p className="text-[10px] text-slate-500">NIP. {activeDinas.nip_pengurus}</p>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white border text-center p-12 text-slate-400 text-xs font-semibold rounded-2xl">
          Tidak ada master barang terdaftar saat ini.
        </div>
      )}
    </div>
  );
}
