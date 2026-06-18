import { Database, Barang, SaldoAwal, Penerimaan, Penyaluran, Opname, Pengguna, AuditTrail, Dinas } from "../types";
import { initialDatabase, APP_ID } from "../initialData";

const STORAGE_KEYS = {
  barang: `${APP_ID}_barang`,
  saldo_awal: `${APP_ID}_saldo_awal`,
  penerimaan: `${APP_ID}_penerimaan`,
  penyaluran: `${APP_ID}_penyaluran`,
  opname: `${APP_ID}_opname`,
  pengguna: `${APP_ID}_pengguna`,
  audit_trail: `${APP_ID}_audit_trail`,
  dinas: `${APP_ID}_dinas`,
};

export function getDatabase(): Database {
  const db: Database = {
    barang: [],
    saldo_awal: [],
    penerimaan: [],
    penyaluran: [],
    opname: [],
    pengguna: [],
    audit_trail: [],
    dinas: []
  };

  for (const table in STORAGE_KEYS) {
    const key = STORAGE_KEYS[table as keyof typeof STORAGE_KEYS];
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        db[table as keyof Database] = JSON.parse(stored);
      } catch (e) {
        db[table as keyof Database] = [...initialDatabase[table as keyof Database]] as any;
      }
    } else {
      db[table as keyof Database] = [...initialDatabase[table as keyof Database]] as any;
      localStorage.setItem(key, JSON.stringify(initialDatabase[table as keyof Database]));
    }
  }

  return db;
}

export function saveTable<T extends keyof Database>(table: T, data: Database[T]) {
  const key = STORAGE_KEYS[table];
  localStorage.setItem(key, JSON.stringify(data));
}

export function addAuditLog(username: string, aktivitas: string, detail: string) {
  const logs: AuditTrail[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.audit_trail) || "[]");
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const newLog: AuditTrail = {
    id: "LOG" + Date.now(),
    tanggal: timestamp,
    user: username,
    aktivitas,
    detail
  };
  logs.push(newLog);
  saveTable("audit_trail", logs);
  return logs;
}

export function calculateCurrentStock(db: Database, kodeBarang: string): number {
  let initial = 0;
  let inCount = 0;
  let outCount = 0;
  let opnameAdjust = 0;

  const saldo = db.saldo_awal.filter(s => s.kode_barang === kodeBarang);
  saldo.forEach(s => initial += Number(s.jumlah));

  const rcv = db.penerimaan.filter(r => r.kode_barang === kodeBarang);
  rcv.forEach(r => inCount += Number(r.jumlah));

  const dly = db.penyaluran.filter(d => d.kode_barang === kodeBarang);
  dly.forEach(d => outCount += Number(d.jumlah_disalurkan));

  const opn = db.opname.filter(o => o.kode_barang === kodeBarang);
  if (opn.length > 0) {
    // Sort descending by date
    const sortedOpn = [...opn].sort((a, b) => new Date(b.tanggal_opname).getTime() - new Date(a.tanggal_opname).getTime());
    opnameAdjust = Number(sortedOpn[0].selisih);
  }

  return (initial + inCount - outCount) + opnameAdjust;
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

export function getFormattedDateIndo(dateStr: string | Date = new Date()): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${day} ${monthName} ${year}`;
}

export function getActiveDinas(db: Database): Dinas {
  if (db.dinas && db.dinas.length > 0) {
    const active = db.dinas.find(d => d.status_aktif);
    if (active) return active;
    return db.dinas[0];
  }
  return {
    id: "default",
    nama_dinas: "Dinas Kependudukan dan Pencatatan Sipil",
    pemerintah: "Pemerintah Kabupaten Halmahera Barat",
    alamat: "Jl. Pengabdian No. 12, Jailolo",
    nama_kadis: "ANDI R. PILLY, S. Pd., M. Pd",
    nip_kadis: "197204142000081001",
    nama_pengurus: "Daud Soleman",
    nip_pengurus: "198506122009031002",
    status_aktif: true
  };
}
