# Smart Retail Engine (Review Proyek Kode)

Proyek aplikasi pemrosesan transaksi retail (`orderProcessor`), autentikasi akun (`authService`), dan manajemen inventaris (`inventoryManager`) untuk studi kasus **Review Proyek Kode (Standarisasi Coding)**.

## Struktur Proyek

- `src/orderProcessor.js`: Modul kalkulasi pesanan, diskon member, kupon, pajak, dan ongkos kirim.
- `src/authService.js`: Modul autentikasi pengguna dan pembuatan token sesi.
- `src/inventoryManager.js`: Modul analisis stok barang dan valuasi inventaris gudang.
- `test/run-tests.js`: Unit testing suite untuk memverifikasi fungsionalitas modul.

## Menjalankan Proyek

```bash
npm test
npx eslint .
npx prettier --check .
```
