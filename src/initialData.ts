import { Database } from "./types";

export const initialDatabase: Database = {
  barang: [
    { id: "B001", kode_barang: "1.01.01.01", nama_barang: "Kertas HVS A4 80gr", satuan: "Rim", kategori_barang: "Alat Tulis Kantor", spesifikasi: "PaperOne, Putih", lokasi_penyimpanan: "Rak ATK A", status_aktif: "Aktif" },
    { id: "B002", kode_barang: "1.01.01.02", nama_barang: "Pulpen Ballpoint Hitam", satuan: "Box", kategori_barang: "Alat Tulis Kantor", spesifikasi: "Standard AE7", lokasi_penyimpanan: "Rak ATK B", status_aktif: "Aktif" },
    { id: "B003", kode_barang: "1.01.01.03", nama_barang: "Map Plastik Snelhechter", satuan: "Pak", kategori_barang: "Alat Tulis Kantor", spesifikasi: "Gobi, Hijau", lokasi_penyimpanan: "Rak ATK C", status_aktif: "Aktif" },
    { id: "B004", kode_barang: "1.01.01.04", nama_barang: "Tinta Printer L3110 Black", satuan: "Botol", kategori_barang: "Bahan Komputer", spesifikasi: "Epson Original 003", lokasi_penyimpanan: "Lemari Tinta", status_aktif: "Aktif" }
  ],
  saldo_awal: [
    { id: "SA001", tahun_anggaran: "2026", tanggal: "2026-01-02", kode_barang: "1.01.01.01", nama_barang: "Kertas HVS A4 80gr", jumlah: 10, harga_satuan: 55000, nilai_persediaan: 550000, keterangan: "Saldo awal tahun 2026" },
    { id: "SA002", tahun_anggaran: "2026", tanggal: "2026-01-02", kode_barang: "1.01.01.02", nama_barang: "Pulpen Ballpoint Hitam", jumlah: 5, harga_satuan: 24000, nilai_persediaan: 120000, keterangan: "Saldo awal tahun 2026" }
  ],
  penerimaan: [
    { id: "RCV001", nomor_dokumen: "050/01/SP-DUKCAPIL/I/2026", tanggal_penerimaan: "2026-02-10", sumber_dana: "APBD Kabupaten Halmahera Barat", penyedia: "CV. Halbar Lestari Mandiri", kode_barang: "1.01.01.01", nama_barang: "Kertas HVS A4 80gr", satuan: "Rim", jumlah: 50, harga_satuan: 55000, total_nilai: 2750000, keterangan: "Pengadaan rutin triwulan I" },
    { id: "RCV002", nomor_dokumen: "050/01/SP-DUKCAPIL/I/2026", tanggal_penerimaan: "2026-02-10", sumber_dana: "APBD Kabupaten Halmahera Barat", penyedia: "CV. Halbar Lestari Mandiri", kode_barang: "1.01.01.03", nama_barang: "Map Plastik Snelhechter", satuan: "Pak", jumlah: 15, harga_satuan: 40000, total_nilai: 600000, keterangan: "Pengadaan rutin triwulan I" }
  ],
  penyaluran: [
    { id: "DIS001", nomor_penyaluran: "050/08/BA-DUKCAPIL/II/2026", tanggal_penyaluran: "2026-02-25", unit_kerja_penerima: "Seksi Identitas Penduduk", nama_penerima: "Marniati Gula, S.AP", jabatan_penerima: "Kepala Seksi", kode_barang: "1.01.01.01", nama_barang: "Kertas HVS A4 80gr", jumlah_disalurkan: 15, keterangan: "Operasional pendaftaran KIA & KTP", ttd_pengurus: "drawn_placeholder", ttd_penerima: "drawn_placeholder" }
  ],
  opname: [
    { id: "OPN001", nomor_opname: "050/99/SO-DUKCAPIL/V/2026", tanggal_opname: "2026-05-30", kode_barang: "1.01.01.01", nama_barang: "Kertas HVS A4 80gr", stok_sistem: 45, stok_fisik: 45, selisih: 0, keterangan: "Stok fisik cocok dengan sistem.", tim_pemeriksa: "Yusak M, S.IP & Tim", ttd_pengurus: "drawn_placeholder", ttd_pemeriksa: "drawn_placeholder", ttd_kadis: "drawn_placeholder" }
  ],
  pengguna: [
    { id: "USR001", nama_lengkap: "Administrator Utama", username: "admin", password: "admin123", jabatan: "IT Administrator", role: "Administrator", nip: "199001012015011001" },
    { id: "USR002", nama_lengkap: "Daud Soleman", username: "pengurus", password: "pengurus123", jabatan: "Pengurus Barang Pengguna", role: "Pengurus Barang", nip: "198506122009031002" },
    { id: "USR003", nama_lengkap: "ANDI R. PILLY, S. Pd., M. Pd", username: "kadis", password: "kadis123", jabatan: "Kepala Dinas", role: "Kepala Dinas", nip: "197204142000081001" }
  ],
  audit_trail: [
    { id: "LOG001", tanggal: "2026-06-08 08:30:10", user: "system", aktivitas: "Inisialisasi", detail: "Sistem berhasil dijalankan dalam mode simulasi lokal." }
  ],
  dinas: [
    {
      id: "D001",
      nama_dinas: "Dinas Kependudukan dan Pencatatan Sipil",
      pemerintah: "Pemerintah Kabupaten Halmahera Barat",
      alamat: "Jl. Pengabdian No. 12, Jailolo",
      nama_kadis: "ANDI R. PILLY, S. Pd., M. Pd",
      nip_kadis: "197204142000081001",
      nama_pengurus: "Daud Soleman",
      nip_pengurus: "198506122009031002",
      status_aktif: true
    }
  ]
};
export const APP_ID = "silap-dukcapil-halbar";
