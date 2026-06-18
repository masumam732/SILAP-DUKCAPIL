export interface Barang {
  id: string;
  kode_barang: string;
  nama_barang: string;
  satuan: string;
  kategori_barang: string;
  spesifikasi: string;
  lokasi_penyimpanan: string;
  status_aktif: 'Aktif' | 'Nonaktif' | string;
}

export interface SaldoAwal {
  id: string;
  tahun_anggaran: string;
  tanggal: string;
  kode_barang: string;
  nama_barang: string;
  jumlah: number;
  harga_satuan: number;
  nilai_persediaan: number;
  keterangan: string;
}

export interface Penerimaan {
  id: string;
  nomor_dokumen: string;
  tanggal_penerimaan: string;
  sumber_dana: string;
  penyedia: string;
  kode_barang: string;
  nama_barang: string;
  satuan: string;
  jumlah: number;
  harga_satuan: number;
  total_nilai: number;
  keterangan: string;
}

export interface Penyaluran {
  id: string;
  nomor_penyaluran: string;
  tanggal_penyaluran: string;
  unit_kerja_penerima: string;
  nama_penerima: string;
  jabatan_penerima: string;
  kode_barang: string;
  nama_barang: string;
  jumlah_disalurkan: number;
  keterangan: string;
  ttd_pengurus?: string; // Signature dataURL or placeholder
  ttd_penerima?: string; // Signature dataURL or placeholder
}

export interface Opname {
  id: string;
  nomor_opname: string;
  tanggal_opname: string;
  kode_barang: string;
  nama_barang: string;
  stok_sistem: number;
  stok_fisik: number;
  selisih: number;
  keterangan: string;
  tim_pemeriksa: string;
  ttd_pengurus?: string;
  ttd_pemeriksa?: string;
  ttd_kadis?: string;
}

export interface Pengguna {
  id: string;
  nama_lengkap: string;
  username: string;
  password?: string;
  jabatan: string;
  role: 'Administrator' | 'Pengurus Barang' | 'Kepala Dinas' | string;
  nip: string;
}

export interface AuditTrail {
  id: string;
  tanggal: string;
  user: string;
  aktivitas: string;
  detail: string;
}

export interface Dinas {
  id: string;
  nama_dinas: string;
  pemerintah: string;
  alamat?: string;
  nama_kadis: string;
  nip_kadis: string;
  nama_pengurus: string;
  nip_pengurus: string;
  status_aktif: boolean;
  logo_url?: string;
}

export interface Database {
  barang: Barang[];
  saldo_awal: SaldoAwal[];
  penerimaan: Penerimaan[];
  penyaluran: Penyaluran[];
  opname: Opname[];
  pengguna: Pengguna[];
  audit_trail: AuditTrail[];
  dinas: Dinas[];
}
