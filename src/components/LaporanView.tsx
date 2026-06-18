import { useState, useMemo } from 'react';
import { FileDown, Printer, Filter, Check } from 'lucide-react';
import { Database, Barang } from '../types';
import { calculateCurrentStock, formatRupiah, getActiveDinas } from '../lib/db';

interface LaporanViewProps {
  db: Database;
}

interface LaporanItemRow {
  b: Barang;
  saldoAwalQty: number;
  saldoAwalValue: number;
  masukQty: number;
  masukValue: number;
  keluarQty: number;
  keluarValue: number;
  opnameAdjQty: number;
  opnameAdjValue: number;
  akhirQty: number;
  akhirValue: number;
  hargaSatuan: number;
}

export default function LaporanView({ db }: LaporanViewProps) {
  const [filterKategori, setFilterKategori] = useState('');
  const activeDinas = getActiveDinas(db);

  // Extract unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(db.barang.map(b => b.kategori_barang).filter(Boolean)));
  }, [db.barang]);

  // Aggregate items into comprehensive ledger audit report
  const reportRows = useMemo(() => {
    // Determine static prices
    const itemPrices: Record<string, number> = {};
    db.saldo_awal.forEach(s => { itemPrices[s.kode_barang] = s.harga_satuan; });
    db.penerimaan.forEach(r => { itemPrices[r.kode_barang] = r.harga_satuan; });

    let rows: LaporanItemRow[] = db.barang.map(item => {
      const kb = item.kode_barang;
      const hargaSatuan = itemPrices[kb] || 0;

      // 1. Opening Balance
      const saItems = db.saldo_awal.filter(s => s.kode_barang === kb);
      const saldoAwalQty = saItems.reduce((sum, s) => sum + Number(s.jumlah), 0);
      const saldoAwalValue = saItems.reduce((sum, s) => sum + Number(s.nilai_persediaan), 0);

      // 2. Receipts (Incoming)
      const rcItems = db.penerimaan.filter(r => r.kode_barang === kb);
      const masukQty = rcItems.reduce((sum, r) => sum + Number(r.jumlah), 0);
      const masukValue = rcItems.reduce((sum, r) => sum + Number(r.total_nilai), 0);

      // 3. Dispatch (Outgoing)
      const dsItems = db.penyaluran.filter(d => d.kode_barang === kb);
      const keluarQty = dsItems.reduce((sum, d) => sum + Number(d.jumlah_disalurkan), 0);
      const keluarValue = keluarQty * hargaSatuan;

      // 4. Stock Opname
      const opItems = db.opname.filter(o => o.kode_barang === kb);
      const opnameAdjQty = opItems.reduce((sum, o) => sum + Number(o.selisih), 0);
      const opnameAdjValue = opnameAdjQty * hargaSatuan;

      // Compute Ending stock
      const akhirQty = (saldoAwalQty + masukQty - keluarQty) + opnameAdjQty;
      const akhirValue = akhirQty * hargaSatuan;

      return {
        b: item,
        saldoAwalQty,
        saldoAwalValue,
        masukQty,
        masukValue,
        keluarQty,
        keluarValue,
        opnameAdjQty,
        opnameAdjValue,
        akhirQty,
        akhirValue,
        hargaSatuan
      };
    });

    if (filterKategori) {
      rows = rows.filter(r => r.b.kategori_barang === filterKategori);
    }

    return rows;
  }, [db, filterKategori]);

  // Summarize Totals
  const totals = useMemo(() => {
    return reportRows.reduce((acc, row) => {
      acc.saldoAwalVal += row.saldoAwalValue;
      acc.masukVal += row.masukValue;
      acc.keluarVal += row.keluarValue;
      acc.opnameAdjVal += row.opnameAdjValue;
      acc.akhirVal += row.akhirValue;
      return acc;
    }, {
      saldoAwalVal: 0,
      masukVal: 0,
      keluarVal: 0,
      opnameAdjVal: 0,
      akhirVal: 0
    });
  }, [reportRows]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = [
      "Kode Barang", "Nama Barang", "Kategori", "Satuan", "Harga Satuan", 
      "Saldo Awal (Vol)", "Saldo Awal (Nilai)", 
      "Masuk (Vol)", "Masuk (Nilai)", 
      "Keluar (Vol)", "Keluar (Nilai)", 
      "Opname Adj (Vol)", "Opname Adj (Nilai)", 
      "Stok Akhir (Vol)", "Stok Akhir (Nilai)"
    ];

    const rows = reportRows.map(r => [
      r.b.kode_barang, r.b.nama_barang, r.b.kategori_barang, r.b.satuan, r.hargaSatuan,
      r.saldoAwalQty, r.saldoAwalValue,
      r.masukQty, r.masukValue,
      r.keluarQty, r.keluarValue,
      r.opnameAdjQty, r.opnameAdjValue,
      r.akhirQty, r.akhirValue
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Persediaan_Disdukcapil_Halbar_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 select-none animate-fade-in">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Laporan Mutasi Persediaan</h2>
          <p className="text-xs text-slate-500 mt-1">Laporan mutasi gabungan realisasi fisik belanja persediaan per kriteria kepingan waktu</p>
        </div>
        
        <div className="flex space-x-2 shrink-0">
          <button
            onClick={handleExportCsv}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 transition duration-150 border-none cursor-pointer"
          >
            <FileDown size={14} />
            <span>Unduh Laporan (CSV/XLS)</span>
          </button>
          <button
            onClick={handlePrint}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-md transition duration-150 border-none cursor-pointer"
          >
            <Printer size={14} />
            <span>Cetak Register</span>
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center gap-4 no-print">
        <Filter size={16} className="text-slate-400 hidden sm:block shrink-0" />
        <div className="flex-grow w-full">
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white"
          >
            <option value="">Semua Kategori Persediaan</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grand ledger audit sheet layout */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none p-6 print:p-0">
        
        {/* Letterhead and Print layout */}
        <div className="border-b-4 border-double border-slate-900 pb-4 mb-6 flex items-center justify-center gap-4">
          {activeDinas?.logo_url && (
            <div className="w-16 h-16 shrink-0 flex items-center justify-center p-1 bg-white print:bg-transparent">
              <img src={activeDinas.logo_url} alt="Logo Dinas" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
            </div>
          )}
          <div className="text-center flex-grow">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 print:block hidden">{activeDinas.pemerintah.toUpperCase()}</div>
            <h3 className="font-extrabold text-slate-900 text-sm tracking-wide uppercase leading-tight">LAPORAN MUTASI BARANG PERSIDIAAN GUDANG</h3>
            <p className="text-[9px] text-slate-500 font-semibold font-mono mt-1 uppercase">{activeDinas.nama_dinas.toUpperCase()} - PERIODIK TA. 2026</p>
          </div>
          {activeDinas?.logo_url && <div className="w-16 hidden sm:block"></div>}
        </div>

        {/* Master details report block */}
        <div className="overflow-x-auto text-[10px]/normal print:text-[8px]/tight">
          <table className="w-full text-left border-collapse border border-slate-300 font-semibold">
            <thead>
              {/* Double Header rows for beautiful subheaders classification */}
              <tr className="bg-slate-900 text-white font-bold border border-slate-900">
                <th rowSpan={2} className="p-2 border border-slate-300 text-center uppercase min-w-[70px]">Kode Barang</th>
                <th rowSpan={2} className="p-2 border border-slate-300 uppercase min-w-[120px]">Uraian Nama Barang</th>
                <th rowSpan={2} className="p-2 border border-slate-300 text-center uppercase">Satuan</th>
                <th rowSpan={2} className="p-2 border border-slate-300 text-right uppercase">Harga Satuan</th>
                <th colSpan={2} className="p-1 border border-slate-300 text-center uppercase bg-slate-850">Saldo Awal</th>
                <th colSpan={2} className="p-1 border border-slate-300 text-center uppercase bg-blue-900">Penerimaan</th>
                <th colSpan={2} className="p-1 border border-slate-300 text-center uppercase bg-amber-900">Penyaluran</th>
                <th colSpan={2} className="p-1 border border-slate-300 text-center uppercase bg-rose-900">Opname Adj</th>
                <th colSpan={2} className="p-1 border border-slate-300 text-center uppercase bg-slate-950">Persediaan Akhir</th>
              </tr>
              <tr className="bg-slate-800 text-white font-bold border border-slate-900">
                <th className="p-1 border border-slate-300 text-center w-8">Vol</th>
                <th className="p-1 border border-slate-300 text-right w-16">Nilai (Rp)</th>
                
                <th className="p-1 border border-slate-300 text-center w-8">Vol</th>
                <th className="p-1 border border-slate-300 text-right w-16">Nilai (Rp)</th>
                
                <th className="p-1 border border-slate-300 text-center w-8">Vol</th>
                <th className="p-1 border border-slate-300 text-right w-16">Nilai (Rp)</th>
                
                <th className="p-1 border border-slate-300 text-center w-8">Vol</th>
                <th className="p-1 border border-slate-300 text-right w-16">Nilai (Rp)</th>
                
                <th className="p-1 border border-slate-300 text-center w-8">Vol</th>
                <th className="p-1 border border-slate-300 text-right w-16">Nilai (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 border-b border-slate-200 text-slate-700">
              {reportRows.length === 0 ? (
                <tr>
                  <td colSpan={14} className="p-10 text-center text-slate-400">
                    Tidak ada data barang terlaporkan.
                  </td>
                </tr>
              ) : (
                reportRows.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 border border-slate-200">
                    <td className="p-2 border border-slate-200 font-mono text-[9px] text-blue-600 font-bold text-center">{r.b.kode_barang}</td>
                    <td className="p-2 border border-slate-200 text-slate-900 font-bold truncate max-w-[150px]" title={r.b.nama_barang}>{r.b.nama_barang}</td>
                    <td className="p-2 border border-slate-200 text-center text-slate-400">{r.b.satuan}</td>
                    <td className="p-2 border border-slate-200 text-right text-slate-500 font-medium">{formatRupiah(r.hargaSatuan)}</td>
                    
                    {/* Saldo awal */}
                    <td className="p-1 border border-slate-200 text-center">{r.saldoAwalQty}</td>
                    <td className="p-1 border border-slate-200 text-right text-slate-500 font-medium">{formatRupiah(r.saldoAwalValue)}</td>
                    
                    {/* Receipts */}
                    <td className="p-1 border border-slate-200 text-center text-blue-600 font-bold">+{r.masukQty}</td>
                    <td className="p-1 border border-slate-200 text-right text-blue-600 font-medium">{formatRupiah(r.masukValue)}</td>
                    
                    {/* Outgoing */}
                    <td className="p-1 border border-slate-200 text-center text-amber-600 font-bold">-{r.keluarQty}</td>
                    <td className="p-1 border border-slate-200 text-right text-amber-600 font-medium">{formatRupiah(r.keluarValue)}</td>
                    
                    {/* Opname adjustment */}
                    <td className={`p-1 border border-slate-200 text-center font-bold ${r.opnameAdjQty > 0 ? 'text-emerald-600' : r.opnameAdjQty < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                      {r.opnameAdjQty > 0 ? `+${r.opnameAdjQty}` : r.opnameAdjQty === 0 ? '0' : r.opnameAdjQty}
                    </td>
                    <td className={`p-1 border border-slate-200 text-right font-medium ${r.opnameAdjValue > 0 ? 'text-emerald-600' : r.opnameAdjValue < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                      {formatRupiah(r.opnameAdjValue)}
                    </td>
                    
                    {/* Final balance */}
                    <td className="p-1 border border-slate-200 text-center text-slate-900 font-extrabold bg-slate-50">{r.akhirQty}</td>
                    <td className="p-1 border border-slate-200 text-right text-slate-900 font-extrabold bg-slate-50">{formatRupiah(r.akhirValue)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Table Sum footer */}
            <tfoot>
              <tr className="bg-slate-100 font-extrabold text-slate-900 border border-slate-300 text-right">
                <td colSpan={4} className="p-2 border border-slate-300 text-center uppercase text-[9px]">JUMLAH REKAPITULASI PERSILAP (IDR)</td>
                
                <td className="p-1 border border-slate-300"></td>
                <td className="p-1 border border-slate-300 text-slate-900 font-extrabold">{formatRupiah(totals.saldoAwalVal)}</td>
                
                <td className="p-1 border border-slate-300"></td>
                <td className="p-1 border border-slate-300 text-blue-800 font-extrabold">{formatRupiah(totals.masukVal)}</td>
                
                <td className="p-1 border border-slate-300"></td>
                <td className="p-1 border border-slate-300 text-amber-800 font-extrabold">{formatRupiah(totals.keluarVal)}</td>
                
                <td className="p-1 border border-slate-300"></td>
                <td className={`p-1 border border-slate-300 font-extrabold ${totals.opnameAdjVal > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{formatRupiah(totals.opnameAdjVal)}</td>
                
                <td className="p-1 border border-slate-300"></td>
                <td className="p-1 border border-slate-300 text-slate-950 font-extrabold bg-amber-50">{formatRupiah(totals.akhirVal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Dynamic signatures section purely when printing or viewing */}
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
    </div>
  );
}
