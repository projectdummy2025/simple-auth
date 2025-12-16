# Catatan Debugging Proyek simple-auth

Dokumen ini mencatat serangkaian eror yang terjadi selama proses setup dan pengembangan proyek `simple-auth` beserta solusinya.

---

### 1. Eror: `npm install` Gagal saat Build Docker Backend

*   **Pesan Eror:** `ENOENT: no such file or directory, open '/app/package.json'`
*   **Penyebab:** `backend/Dockerfile` mencoba menyalin `package.json` dari direktori root konteks build (`./backend`), padahal file tersebut berada di dalam subdirektori `./backend/src`.
*   **Perbaikan:** Mengubah path penyalinan di `backend/Dockerfile` dari `COPY package*.json ./` menjadi `COPY src/package*.json ./` dan `COPY src/ .` untuk memastikan file disalin dari lokasi yang benar.

---

### 2. Eror: `FATAL: database "admin" does not exist`

*   **Pesan Eror:** Log dari container `postgres-1` menunjukkan bahwa backend mencoba terhubung ke database bernama `admin` yang tidak ada.
*   **Penyebab:** Kode di `backend/src/config/db.js` memiliki nama database yang di-hardcode sebagai `'admin'`, mengabaikan konfigurasi `DB_NAME=simple_auth_db` dari file `.env`.
*   **Perbaikan:** Mengubah `database: 'admin'` menjadi `database: process.env.DB_NAME` di dalam file `backend/src/config/db.js` agar menggunakan nama database dari variabel lingkungan.

---

### 3. Eror: `TypeError: Cannot read properties of undefined (reading 'connect')`

*   **Pesan Eror:** Aplikasi backend crash dengan pesan bahwa ia tidak bisa menjalankan fungsi `.connect()` pada variabel `pool` yang `undefined`.
*   **Penyebab:** File `backend/src/server.js` mencoba menggunakan variabel `pool` tanpa mengimpornya terlebih dahulu dari file `backend/src/config/db.js` tempat ia dibuat.
*   **Perbaikan:** Menambahkan baris `const pool = require('./config/db');` di bagian atas file `backend/src/server.js`.

---

### 4. Eror: `Bind for 0.0.0.0:3000 failed: port is already allocated`

*   **Pesan Eror:** Docker Compose gagal memulai container `frontend-1` karena port `3000` di mesin host sudah digunakan.
*   **Penyebab:** Ditemukan bahwa ada container dari proyek lain (`rego_app`) yang berjalan dan sudah menggunakan port `3000`. Container ini kemungkinan memiliki kebijakan `restart: always`.
*   **Perbaikan:** Mengidentifikasi container yang berkonflik dengan `docker ps`, lalu menghentikannya menggunakan `docker stop rego_app` untuk membebaskan port.

---

### 5. Kondisi: Frontend Tidak Bisa Diakses & `docker ps` Tidak Menampilkan Port

*   **Gejala:** Container `frontend-1` berjalan, tetapi tidak ada pemetaan port yang terlihat di `docker ps`, dan `http://localhost:3000` tidak bisa diakses.
*   **Penyebab:** `docker compose.yml` salah mengkonfigurasi port untuk `frontend` menjadi `3000:3000`. Seharusnya, port host (`3000`) dipetakan ke port Nginx di dalam container (`80`).
*   **Perbaikan:** Mengubah pemetaan port di `docker compose.yml` untuk layanan `frontend` menjadi `ports: - "${FRONTEND_PORT:-3000}:80"`.

---

### 6. Kondisi: Browser Menampilkan "The connection was reset"

*   **Gejala:** Mengakses `http://localhost:3000` berhasil terhubung ke frontend, tetapi koneksi langsung terputus.
*   **Penyebab:** Ini adalah gejala dari masalah di backend. Frontend mencoba mengambil data dari backend, tetapi backend crash (karena eror koneksi database atau `TypeError`), menyebabkan koneksi API terputus secara tiba-tiba.
*   **Perbaikan:** Fokus pada perbaikan eror yang muncul di log container `backend-1` (lihat poin 2 dan 3). Setelah backend berjalan stabil, masalah ini teratasi dengan sendirinya.

---

### 7. Eror: `TypeError: Cannot read properties of undefined (reading 'connect')` (Revisi)

*   **Pesan Eror:** Aplikasi backend crash dengan pesan bahwa ia tidak bisa menjalankan fungsi `.connect()` pada variabel `pool` yang `undefined`, meskipun sebelumnya telah diperbaiki.
*   **Penyebab:** Setelah pengecekan lebih lanjut, masalah bukan hanya pada import, tetapi juga struktur ekspor dari `backend/src/config/db.js` yang berubah menjadi object `{ pool, query }`, sedangkan `server.js` masih mengharapkan pool sebagai export default. Selain itu, file `.env` tidak ditemukan sehingga konfigurasi database gagal dan pool tetap null.
*   **Perbaikan:**
  1. Membuat file `.env` dari contoh file `.env example` untuk menyediakan variabel lingkungan yang diperlukan.
  2. Memperbarui `backend/src/config/db.js` untuk mengembalikan object `{ pool, query }` yang sesuai.
  3. Memperbarui `backend/src/server.js` untuk menyesuaikan cara import dan penggunaan pool dari object baru.
  4. Memperbarui `backend/src/models/User.js` untuk menggunakan fungsi query yang disediakan dari konfigurasi database.

---

### 8. Eror: `Cannot read properties of undefined (reading 'Promise')` dalam `pg-pool`

*   **Pesan Eror:** Terjadi ketika permintaan registrasi dilakukan, dengan error `TypeError: Cannot read properties of undefined (reading 'Promise')` di `/app/node_modules/pg-pool/index.js`.
*   **Penyebab:** File `backend/src/models/User.js` mengimpor fungsi `query` dari `../config/db`, tetapi `backend/src/config/db.js` tidak menyediakan fungsi query yang sesuai. Query fungsi diharapkan untuk mengembalikan promise, tetapi yang diexport hanya pool object mentah.
*   **Perbaikan:**
  1. Memperbarui `backend/src/config/db.js` untuk menyediakan wrapper `query` function yang mengembalikan promise berdasarkan pool.
  2. Memastikan struktur export dari modul database sesuai dengan apa yang diharapkan oleh file-file yang menggunakannya.

---

### 9. Eror: `TypeError: Cannot read properties of undefined (reading 'connect')` (Volume Mount Issue)

*   **Pesan Eror:** Backend crash dengan error yang sama meskipun kode lokal sudah benar.
*   **Penyebab:** Kesalahan konfigurasi volume mount di `docker compose.yml`. Volume di-mount sebagai `./backend/src:/app/src`, padahal aplikasi berjalan di `/app`. Akibatnya, container menjalankan kode usang yang disalin saat build image, bukan kode lokal yang sudah diperbaiki.
*   **Perbaikan:** Mengubah volume mount backend menjadi `./backend/src:/app` agar kode lokal tersinkronisasi dengan benar ke direktori kerja container.

---

### 10. Eror: `curl: (56) Recv failure: Connection reset by peer` pada Frontend

*   **Gejala:** `curl http://localhost:3000/` gagal dengan pesan "Connection reset by peer".
*   **Penyebab:** Ketidakcocokan port Nginx. `docker compose.yml` memetakan port host 3000 ke port container 80, tetapi `nginx.conf` dikonfigurasi untuk mendengarkan port 3000 (`listen 3000;`). Traffic masuk ke port 80 container tidak ada yang menangani.
*   **Perbaikan:** Mengubah konfigurasi `frontend/nginx.conf` menjadi `listen 80;` agar sesuai dengan port mapping di Docker Compose.

---

### 11. Optimasi: Penghapusan Volume Mount Frontend yang Tidak Perlu

*   **Kondisi:** `docker compose.yml` memetakan volume `./frontend/src:/app/src` untuk layanan frontend.
*   **Analisis:** Layanan frontend menggunakan Nginx untuk menyajikan file statis yang sudah di-build (`/usr/share/nginx/html`). Mounting source code ke `/app/src` di runtime tidak memiliki efek apa pun pada aplikasi yang berjalan dan hanya menambah kompleksitas konfigurasi.
*   **Tindakan:** Menghapus baris volume mount tersebut dari `docker compose.yml` untuk membersihkan konfigurasi.

---

### 12. Eror: `npm install` Gagal karena `package.json` Tidak Ditemukan (Backend)

*   **Pesan Eror:** `npm error enoent Could not read package.json: Error: ENOENT: no such file or directory, open '/app/package.json'`
*   **Penyebab:** `backend/Dockerfile` menjalankan perintah `RUN npm install` sebelum file `package.json` disalin ke dalam direktori kerja container (`/app`). Urutan perintah di Dockerfile salah.
*   **Perbaikan:** Memperbaiki `backend/Dockerfile` dengan menambahkan perintah `COPY src/package.json ./` dan `COPY src/package-lock.json* ./` (jika ada) sebelum baris `RUN npm install`. Ini memastikan file konfigurasi dependensi ada di tempat yang benar sebelum proses instalasi dimulai.

---

### Catatan Penting

*   **Rebuild Container:** Setiap kali ada perubahan pada file konfigurasi seperti `nginx.conf`, `Dockerfile`, atau perubahan pada `package.json`, container **harus di-build ulang** agar perubahan diterapkan. Gunakan perintah:
    ```bash
    docker compose down
    docker compose up --build
    ```