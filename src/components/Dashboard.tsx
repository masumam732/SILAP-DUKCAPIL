import { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart as RePieChart,
  Cell,
  Pie
} from 'recharts';
import { 
  Boxes, 
  Wallet, 
  Truck, 
  PackageMinus, 
  FileCheck, 
  TrendingUp, 
  AlertTriangle 
} from 'lucide-react';
import { Database } from '../types';
import { calculateCurrentStock, formatRupiah } from '../lib/db';

interface DashboardProps {
  db: Database;
}

export default function Dashboard({ db }: DashboardProps) {
  // 1. Calculate General Stats
  const totalJenis = db.barang.length;
  
  // Total Inventory Value = Starting balance values + Incoming values - Outgoing values
  // Wait, let's look at how the original app calculates totalValue:
  // appState.data.saldo_awal.forEach(s => totalValue += Number(s.nilai_persediaan));
  // appState.data.penerimaan.forEach(r => totalValue += Number(r.total_nilai));
  // Then subtraction? Actually, in Indonesia, totalValue represents cumulative inventory assets managed,
  // or current value of stock! Let's calculate actual current stock value:
  // Current Value of Stock = Sum for each item (current stock * average price)
  // Let's find the unit price for each item. If there's an incoming receipt, use that. Otherwise use Starting balance.
  const itemPrices = useMemo(() => {
    const prices: Record<string, number> = {};
    // Prefill with starting balance prices
    db.saldo_awal.forEach(s => {
      prices[s.kode_barang] = s.harga_satuan;
    });
    // Override/complement with latest receipt prices
    db.penerimaan.forEach(r => {
      prices[r.kode_barang] = r.harga_satuan;
    });
    return prices;
  }, [db]);

  const currentStocksAndValues = useMemo(() => {
    let totalStockValue = 0;
    const itemsWithStock = db.barang.map(b => {
      const stock = calculateCurrentStock(db, b.kode_barang);
      const price = itemPrices[b.kode_barang] || 0;
      const value = stock * price;
      totalStockValue += value;
      return {
        ...b,
        stock,
        price,
        value
      };
    });
    return { items: itemsWithStock, totalValue: totalStockValue };
  }, [db, itemPrices]);

  const totalValue = currentStocksAndValues.totalValue;

  const totalRcv = useMemo(() => {
    return db.penerimaan.reduce((sum, r) => sum + Number(r.total_nilai), 0);
  }, [db.penerimaan]);

  const totalDly = useMemo(() => {
    return db.penyaluran.reduce((sum, d) => {
      const price = itemPrices[d.kode_barang] || 0;
      return sum + (Number(d.jumlah_disalurkan) * price);
    }, 0);
  }, [db.penyaluran, itemPrices]);

  const opnameDiff = useMemo(() => {
    return db.opname.reduce((sum, o) => sum + Number(o.selisih), 0);
  }, [db.opname]);

  // Low Stock Items (Threshold: <= 5)
  const lowStockItems = useMemo(() => {
    return currentStocksAndValues.items.filter(item => item.stock <= 5);
  }, [currentStocksAndValues.items]);

  // Aggregate monthly transaction chart data (Receive vs Dispatch in Rupiah value)
  const chartData = useMemo(() => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", 
      "Jul", "Ags", "Sep", "Okt", "Nov", "Des"
    ];
    
    const monthlyStats = months.map((name, idx) => ({
      name,
      'Penerimaan': 0,
      'Penyaluran': 0
    }));

    // Add Incomings
    db.penerimaan.forEach(r => {
      const date = new Date(r.tanggal_penerimaan);
      if (!isNaN(date.getTime())) {
        const monthIdx = date.getMonth();
        monthlyStats[monthIdx]['Penerimaan'] += Number(r.total_nilai);
      }
    });

    // Add Outgoings
    db.penyaluran.forEach(d => {
      const date = new Date(d.tanggal_penyaluran);
      if (!isNaN(date.getTime())) {
        const monthIdx = date.getMonth();
        const price = itemPrices[d.kode_barang] || 0;
        monthlyStats[monthIdx]['Penyaluran'] += Number(d.jumlah_disalurkan) * price;
      }
    });

    return monthlyStats;
  }, [db.penerimaan, db.penyaluran, itemPrices]);

  // Category Distribution for Pie Chart
  const pieData = useMemo(() => {
    const categories: Record<string, number> = {};
    db.barang.forEach(b => {
      const cat = b.kategori_barang || "Lain-lain";
      categories[cat] = (categories[cat] || 0) + 1;
    });

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value
    }));
  }, [db.barang]);

  const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e'];

  return (
    <div className="space-y-6 select-none animate-fade-in no-print bg-slate-50/20">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Dashboard Ringkasan Persediaan</h2>
          <p className="text-xs text-slate-500 mt-0.5">Sistem pemantauan transaksi belanja barang & mutasi persediaan</p>
        </div>
        <p className="text-xs text-indigo-700 bg-indigo-50 shadow-sm/50 py-1.5 px-3.5 rounded-xl border border-indigo-100 font-bold flex items-center">
          <TrendingUp size={12} className="inline mr-1 text-indigo-600 animate-pulse" />
          Status Sistem: Optimal
        </p>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Jenis Barang */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Jenis Barang</p>
          <h3 className="text-3xl font-extrabold mt-2 text-slate-900 tracking-tight">
            {totalJenis} <span className="text-xs font-bold text-slate-400">Item</span>
          </h3>
          <p className="text-[10px] text-indigo-600 font-extrabold mt-3 bg-indigo-50 inline-flex items-center px-2 py-0.5 rounded-lg">Master Register</p>
          <Boxes className="absolute bottom-4 right-4 text-indigo-500/10" size={48} />
        </div>

        {/* Card 2: Estimasi Nilai */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Nilai Persediaan</p>
          <h3 className="text-base font-extrabold mt-3.5 text-slate-900 tracking-tight">{formatRupiah(totalValue)}</h3>
          <p className="text-[10px] text-emerald-600 font-extrabold mt-3 bg-emerald-50 inline-flex items-center px-2 py-0.5 rounded-lg font-sans">Aset Lancar</p>
          <Wallet className="absolute bottom-4 right-4 text-emerald-500/10" size={48} />
        </div>

        {/* Card 3: Total Penerimaan */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Total Penerimaan</p>
          <h3 className="text-base font-extrabold mt-3.5 text-slate-900 tracking-tight">{formatRupiah(totalRcv)}</h3>
          <p className="text-[10px] text-blue-600 font-extrabold mt-3 bg-blue-50 inline-flex items-center px-2 py-0.5 rounded-lg">Stok Masuk</p>
          <Truck className="absolute bottom-4 right-4 text-blue-500/10" size={48} />
        </div>

        {/* Card 4: Total Penyaluran */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Total Penyaluran</p>
          <h3 className="text-base font-extrabold mt-3.5 text-slate-900 tracking-tight">{formatRupiah(totalDly)}</h3>
          <p className="text-[10px] text-amber-600 font-extrabold mt-3 bg-amber-50 inline-flex items-center px-2 py-0.5 rounded-lg">Stok Keluar</p>
          <PackageMinus className="absolute bottom-4 right-4 text-amber-500/10" size={48} />
        </div>

        {/* Card 5: Selisih Opname */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Selisih Opname</p>
          <h3 className="text-3xl font-extrabold mt-2 text-slate-900 tracking-tight">
            {opnameDiff} <span className="text-xs font-bold text-slate-400">Unit</span>
          </h3>
          <p className="text-[10px] text-rose-600 font-extrabold mt-3 bg-rose-50 inline-flex items-center px-2 py-0.5 rounded-lg">Penyesuaian</p>
          <FileCheck className="absolute bottom-4 right-4 text-rose-500/10" size={48} />
        </div>
      </div>

      {/* Main Charts & Warnings container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Monthly Transaction Bar Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 lg:col-span-2">
          <h4 className="text-xs font-bold text-slate-700 mb-4 uppercase tracking-wider flex items-center">
            <span className="w-1.5 h-3 bg-indigo-500 rounded-full mr-2"></span>
            Grafik Transaksi Penerimaan &amp; Penyaluran (IDR)
          </h4>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis 
                  tick={{ fontSize: 9, fill: '#64748b' }} 
                  stroke="#cbd5e1"
                  tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}jt` : `${val}`}
                />
                <Tooltip 
                  formatter={(value: any) => [formatRupiah(Number(value)), '']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#f8fafc', fontSize: '11px', border: 'none' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                <Bar dataKey="Penerimaan" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Penyaluran" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side: Category Breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <h4 className="text-xs font-bold text-slate-700 mb-4 uppercase tracking-wider flex items-center">
            <span className="w-1.5 h-3 bg-indigo-500 rounded-full mr-2"></span>
            Proporsi Kategori Barang
          </h4>
          <div className="h-44 sm:h-48 flex items-center justify-center">
            {pieData.length === 0 ? (
              <span className="text-xs text-slate-400">Tidak ada kategori data</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Item`, 'Proporsi']} />
                </RePieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Pie Chart Legend List Custom */}
          <div className="space-y-1.5 mt-3 overflow-y-auto max-h-24 custom-scrollbar pr-1">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center space-x-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="text-slate-600 truncate">{entry.name}</span>
                </div>
                <span className="text-slate-800 shrink-0">{entry.value} item</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warnings & Low Stock items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Low Stock Panel */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
              <span className="w-1.5 h-3 bg-amber-500 rounded-full mr-2"></span>
              Stok Menipis (Peringatan Batas)
            </h4>
            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold py-0.5 px-2.5 rounded-lg">
              Stok ≤ 5 Unit
            </span>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="text-center py-6">
              <span className="text-xs text-slate-400 font-semibold">Kondisi aman, tidak ada barang dengan stok menipis.</span>
            </div>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="py-2.5">Kode</th>
                    <th className="py-2.5">Nama Barang</th>
                    <th className="py-2.5">Kategori</th>
                    <th className="py-2.5 text-center">Stok</th>
                    <th className="py-2.5 text-right font-medium">Satuan</th>
                    <th className="py-2.5 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-semibold">
                  {lowStockItems.map(item => (
                    <tr key={item.id} className="text-slate-700 hover:bg-slate-50/50">
                      <td className="py-2.5 font-mono text-[10px]">{item.kode_barang}</td>
                      <td className="py-2.5">{item.nama_barang}</td>
                      <td className="py-2.5 text-slate-500">{item.kategori_barang}</td>
                      <td className="py-2.5 text-center text-amber-600 font-bold">{item.stock}</td>
                      <td className="py-2.5 text-right font-medium text-slate-400">{item.satuan}</td>
                      <td className="py-2.5 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 text-amber-800">
                          <AlertTriangle size={8} className="mr-1" /> Reorder
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Instansi info block */}
        <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-lg border border-slate-700 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">Informasi Instansi</h4>
            <div className="space-y-3 mt-4 text-xs">
              <div>
                <p className="text-slate-400 font-medium font-semibold text-[10px]">ORGANISASI</p>
                <p className="font-bold text-white mt-0.5">Dinas Kependudukan dan Pencatatan Sipil</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium font-semibold text-[10px]">KABUPATEN</p>
                <p className="font-bold text-white mt-0.5">Halmahera Barat, Maluku Utara</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium font-semibold text-[10px]/80">VISI LAYANAN</p>
                <p className="text-slate-300 italic leading-relaxed font-semibold mt-1">
                  &quot;Sistematis, Informatif, Lapis, Akurat, Presisi (SILAP). Mewujudkan pencatatan sipil digital handal.&quot;
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-700/60 pt-3 mt-6 flex items-center justify-between text-[10px] text-slate-400">
            <span>Sistem Versi v1.0.1 (React)</span>
            <span>Est. 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
