// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

// src/server/api.ts
import { Router } from "express";

// src/data/questions.ts
var STIMULUS_DANAU = `DANAU UNTUK SEMUA

Di hutan ada sebuah danau tempat semua binatang minum. Suatu pagi, air danau menjadi kotor karena Rino si badak berendam di dalamnya. Binatang-binatang lain jadi tidak bisa minum. Namun, mereka takut menegur Rino karena badannya besar dan bercula. Mereka diam seribu bahasa. Rino malah merasa bangga karena jadi pusat perhatian.

Esoknya, Rino masih berendam. Binatang-binatang makin kehausan.
\u201CAduh, bagaimana ini?\u201D ujar Bani si kelinci. Hewan lain juga mulai gelisah.
Binatang-binatang hutan pun berkumpul dan bermusyawarah. Hari si harimau mengusulkan agar meminta bantuan Ucil si kancil.
\u201CSetuju!!\u201D semua binatang berteriak antusias.

Ucil menemui Rino.
\u201CSelamat siang. Maaf mengganggu Tuan. Ada kabar penting,\u201D kata Ucil dengan lembut.
Rino segera bangun. Ia merasa tersanjung dengan ucapan Ucil.
\u201CKabar penting? Cepat bicara!\u201D kata Rino.
\u201CHamba kasihan kepada Tuan. Badan besar berendam di danau kecil. Tidak pantas, Tuan. Oh ya, ada makhluk yang menutup jalan air supaya tidak mengalir. Sayang, makhluk itu tidak kelihatan oleh mata kita, dia makhluk gaib,\u201D lanjut Ucil.

Rino mengerutkan dahinya.
\u201CPercayalah, Tuan,\u201D bujuk Ucil.
Rino segera berjalan menuju pohon nangka. Ia pun mengawasi pohon itu selama setengah hari.
Sementara itu, binatang yang lain bergantian datang untuk minum air danau.
Rino selesai mengawasi pohon nangka. Ia kembali menuju danau. Sementara, binatang lainnya sudah meninggalkan danau. Mereka sudah tidak haus lagi.`;
var STIMULUS_FOLIVORA = `HEWAN PEMAKAN DAUN, APA ITU?

Hewan bisa dibagi menjadi tiga kelompok berdasarkan makanan mereka. Karnivora, hewan pemakan daging. Contoh hewan karnivora adalah singa. Selanjutnya herbivora, yaitu hewan pemakan tumbuhan. Sapi adalah contoh hewan herbivora. Terakhir, hewan omnivora, yaitu hewan pemakan daging dan tumbuhan, seperti beruang.

Dari kelompok herbivora, ada hewan yang hanya makan daun saja. Mereka disebut folivora. Hewan folivora hanya makan daun untuk hidup. Namun, daun itu susah untuk dicerna, apalagi kalau sudah tua. Kadang-kadang daun juga mengandung zat yang bisa berbahaya.

Agar bisa mencerna daun, tubuh hewan folivora punya cara khusus. Mereka punya usus yang panjang agar makanan bisa diproses lebih lama. Tubuh hewan folivora bekerja lebih lambat, jadi tidak terlalu banyak bergerak. Di dalam perut hewan folivora juga ada bakteri baik yang membantu mencerna daun. Beberapa hewan folivora lebih suka daun muda karena lebih lembut dan mudah dimakan.

Ada beberapa contoh hewan folivora yang hidup di alam. Misalnya, panda yang makan daun bambu. Ada juga koala yang makan daun eukaliptus. Mereka tinggal di hutan dan sangat bergantung pada daun untuk makan. Karena itu, hutan tempat mereka tinggal harus dijaga supaya mereka bisa terus hidup.

Sumber: http://bobo.grid.id/read/084266052/bukan-herbivora-inilah-sebutan-untuk-hewan-pemakan-daun-tanaman`;
var STIMULUS_KENTHUS = `KENTHUS YANG SOMBONG

Di tengah padang rumput terdapat kolam. Kolam itu dihuni banyak katak. Kenthus adalah anak katak yang paling besar dan kuat. Dia merasa tidak terkalahkan. 

Suatu pagi Kenthus melompat di padang rumput. Ada seekor anak lembu. Ia sedang bermain dan berlari-lari. Anak lembu itu menjulurkan lidahnya untuk makan. Lidahnya mengenai Kenthus.
Kenthus melompat. \u201CBerani makhluk ini mengusikku!\u201D kata Kenthus sembari menuju ke tepi kolam.

Kenthus sampai di tepi kolam.
\u201CKenthus, mengapa kamu terengah-engah?\u201D tanya Naka.
\u201CWajahmu terlihat pucat,\u201D kata Tata.
\u201CLihatlah di padang rumput itu. Makhluk itu sangat sombong. Ia tadi hendak menelanku!\u201D kata Kenthus dengan napas terengah-engah.

Koko, kakak Kenthus, menjelaskan. \u201CMakhluk itu anak lembu. Anak lembu tidak jahat. Lembu tidak makan katak. Ia hanya makan rumput.\u201D
\u201CAku tidak percaya. Tadi, aku dikejarnya dan hampir ditendang olehnya,\u201D jawab Kenthus menggebu-gebu.
Koko hanya diam mendengar adiknya berbicara. 

\u201CAku sebenarnya bisa melawannya dengan mengembungkan diriku,\u201D lanjut Kenthus dengan bangga.
\u201CKamu tidak akan dapat menandingi lembu itu. Perbuatan kamu berbahaya,\u201D kata Koko.
Kenthus mengembungkan tubuhnya. Perutnya membesar secara berlebihan. Tiba-tiba ia jatuh lemas. Perutnya terasa sakit. Perlahan-lahan ia mengempiskan tubuhnya. Akhirnya tubuh Kenthus kembali ke ukuran semula.
\u201CKenthus, kamu tidak apa-apa?\u201D tanya Koko.
\u201CAku baik-baik saja. Maafkan aku, Kak. Aku tidak mendengar kata-katamu,\u201D kata Kenthus sembari menunduk.

Sumber: https://ceritaanak.org/cerita-anak-anak-katak-anak-lembu/`;
var STIMULUS_APOLLO = `SURAT DARI MARGARET HAMILTON (8 AGUSTUS 1969)

Dear Sahabatku Jill Tarter,

Saat kau membaca ini, aku sedang liburan bersama Lauren. Aku baru menyelesaikan rapat terakhir dengan tim pendaratan Apollo 11. Seperti yang pernah kuceritakan kepadamu. Aku memimpin tim penyusun kode pemrograman komputer untuk pesawat itu. Pada 20 Juli lalu, Apollo 11 berhasil mendarat di bulan. Kamu pasti sudah tahu itu!

Hari-hari itu sangat menegangkan. Komputer sempat mengirim pesan salah. Itu terjadi saat para astronaut-Neil Armstrong dan Edwin Aldrin-hampir gagal mendarat di Bumi! Untungnya, aku telah menyusun banyak kode komputer di pesawat itu. Aku melakukan itu agar mereka fokus pada misi utama dan tetap bisa mendarat. Empat hari kemudian, mereka kembali dengan selamat ke Samudra Pasifik.

Neil sempat bercerita sebelum rapat. Bulan sangat dingin, lebih dari Kutub Utara. Permukaannya penuh kawah, tanpa angin dan cuaca. Neil dan Edwin membawa pulang pasir bulan untuk diteliti. Tak ada makhluk yang mereka temui.
Aku bersyukur kode-kodeku bisa mengantar manusia ke bulan. Semoga suatu hari bisa juga ke Venus. Lauren menitipkan salam untukmu, dia bilang matamu seperti bintang Polaris yang ia lihat lewat teleskop pemberianmu.

Salam hangat,
Margaret Hamilton`;
var STIMULUS_MAGNET_KULKAS = `CARA MEMBUAT MAGNET KULKAS DARI MAINAN HEWAN PLASTIK

Apakah kamu punya mainan hewan plastik bekas? Ternyata, mainan bekas bisa dimanfaatkan kembali. Yuk, ikuti petunjuknya!

Bahan dan alat:
\u2022 Mainan hewan plastik
\u2022 Cat semprot (tambahan)
\u2022 Tanah liat
\u2022 Gunting atau cutter
\u2022 Lem tembak
\u2022 Magnet

Langkah pembuatan:
1. Potong mainan hewan menjadi dua bagian. Pastikan meminta bantuan orang dewasa untuk keamanan.
2. Periksa bagian-bagian mainan. Jika ada bagian yang berlubang, isilah dengan tanah liat.
3. Warnai mainan hewan dengan cat semprot agar menarik. Namun, kamu juga boleh melewati langkah ini.
4. Tempelkan magnet pada bagian yang rata dengan lem tembak.
5. Tunggu beberapa menit hingga lem mengering.
6. Magnet kulkas dari mainan hewan sudah siap ditempel!`;
var STIMULUS_AIR_MINERAL = `BEDA AIR PUTIH DAN AIR MINERAL

Walaupun wujud, warna, dan rasanya cenderung mirip, air mineral dan air putih tidaklah sama. Keduanya memiliki perbedaan dari segi sumber, proses pengolahan, maupun kandungannya.

AIR PUTIH:
\u2022 Didapatkan dari sungai, danau, sumur, atau air keran rumah.
\u2022 Harus direbus dulu sebab terdapat bakteri dan parasit dari kotoran manusia/hewan.
\u2022 pH antara 5 - 7,5.
\u2022 Kandungan: Natrium dan Kalium.
\u2022 Manfaat: Bantu sistem metabolisme tubuh, menyerap dan mengedarkan vitamin dalam tubuh.

AIR MINERAL:
\u2022 Diambil dari sumber mata air pegunungan vulkanik yang kaya akan mineral alami.
\u2022 pH antara 6 - 8,5.
\u2022 Kandungan: Magnesium, Potassium, Elektrolit, Sulfat.
\u2022 Manfaat: Jaga tekanan darah normal, tingkatkan kesehatan tulang, bantu fungsi jantung, bantu kinerja otot, cegah dehidrasi, dan mencerna makanan lebih baik.

Sumber: https://indonesiabaik.id/infografis/beda-air-putih-dan-air-mineral`;
var STIMULUS_ANTRE = `ANTRE, DONG!

Tia dan Devi sedang berada di Toko Buku Gemar. Mereka mencari buku pelajaran. Setelah menemukan buku yang dicari, mereka menuju ke kasir. Mereka menempati urutan kelima dan keenam. Tak lama kemudian, ada orang yang mengantre di belakang mereka. Mereka sabar menunggu giliran membayar di kasir.

Namun, tiba-tiba seorang pemuda berjalan ke antrean paling depan. Tentu saja, orang-orang yang sudah mengantre lebih dulu memprotes.
\u201CTolong, antre, Dik,\u201D kata seorang ibu yang berada di belakangnya.
\u201CMaaf, Bu, saya harus cepat-cepat. Ini juga hanya satu buku, pasti tidak akan lama. Tidak akan sampai lima menit,\u201D kata pemuda itu.
\u201CTidak boleh seperti itu, Nak. Kita harus membudayakan antre. Jika kamu harus cepat-cepat, bolehkah saya tahu alasannya?\u201D ucap ibu itu.
\u201CIya, Kak, kita harus antre. Semua yang ada di sini juga ingin cepat dilayani. Apa Kakak tidak malu melihat seorang ibu-ibu saja bersedia mengantre? Kakak yang muda justru bertingkah sebaliknya,\u201D sahut Tia. Devi terlihat hanya diam dan mengangguk.

Mendengar ada suara seperti keributan, Pak Satpam pun masuk. Dia menenangkan situasi. Pemuda itu harus tetap mengantre sesuai antrean.`;
var STIMULUS_SIKAT_GIGI = `KENAPA KITA TIDAK BOLEH MALAS MENYIKAT GIGI?

Apakah kamu sering lupa menyikat gigi sebelum tidur?
Kenapa kita tidak boleh malas menyikat gigi?
Bayangkan jika kita tidak memiliki gigi. Kita hanya bisa makan makanan lunak saja, makanan yang tidak perlu digigit atau dikunyah. Oleh karena itu, kita harus merawat gigi.

Faktanya, gigi kita terdiri dari banyak lapisan, lho:
\u2022 Enamel: Lapisan terluar gigi berupa cangkang. Lapisan ini sangat keras melebihi tulang. Namun, jika enamel rusak, ia tidak bisa memperbaiki diri.
\u2022 Dentin: Berisi lubang-lubang kecil yang terhubung dengan saraf gigi. Jika enamel rusak, suhu panas atau dingin bisa masuk ke gigi dan menimbulkan rasa sakit nyut-nyutan.
\u2022 Pulpa: Bagian ini sangat sensitif. Di dalamnya ada pembuluh darah dan saraf.

Bayangkan jika kita tidak menyikat gigi!
Bakteri jahat suka memakan sisa gula, misalnya sisa kue, keripik, roti, permen, dan yang lainnya.
Mereka melepaskan asam yang membuat gigi kita berlubang. Mengerikan, ya!
Yuk, rajin menyikat gigi sebelum tidur dan setelah bangun tidur.

Sumber: https://bobo.grid.id/read/081276994/kenapa-kita-tidak-boleh-malas-menyikat-gigi-ayo-caritahu`;
var STIMULUS_PUISI_SAHABAT = `SURAT UNTUK SAHABAT

Senyum itu enggan lepas dari bibirmu
Ketika kau melihat kedatanganku
Uluran tanganmu menyambutku
Untuk selalu bersama dan saling berpegang erat
Menghadapi segala suka maupun duka

Bila sesekali kau marah
Itu karena aku tak mau memahamimu
Bila sesekali aku berbuat salah
Maafmu selalu terbuka untukku

Kata terima kasih kuanggap lebih manis daripada kata maaf
untuk segala keceriaan yang selalu kau bagi
untuk segala ketulusan hati yang selalu kau beri
dan untuk kesetiaan yang tak akan pernah lekang oleh masa

Bila kita dewasa nanti
dan jarak juga waktu memisahkan kita
Satu harapku dalam hati
Kata persahabatan tidak akan pernah menjadi sebuah kenangan

Sumber: Antologi Puisi Anak (repositori.kemendikdasmen.go.id)`;
var STIMULUS_KERUPUK = `KERUPUK, PELENGKAP MAKANAN YANG MENDUNIA

Kerupuk bukan hal asing bagi masyarakat Indonesia. Kerupuk adalah pelengkap makanan, bahkan menjadi bahan utama di hidangan. Tekstur renyah, rasa gurih, dan harga yang relatif murah sebagai alasannya.

Kerupuk sudah ada sejak abad ke-9 atau ke-10 yang tertulis di Prasasti Batu Pura. Kerupuk yang paling tua dan sudah lama dikonsumsi adalah rambak.

Kerupuk buatan Indonesia juga digemari di luar negeri, lho! Nilai jualnya ke luar negeri pada tahun 2021 lebih dari 35 juta dolar Amerika Serikat. Banyaknya ekspor kerupuk mencapai lebih dari 22 juta kilogram. Oleh karena itu, kerupuk asal Indonesia semakin mendunia.

Berbagai Jenis Kerupuk di Indonesia:
1. Kerupuk bawang
2. Kerupuk udang
3. Kerupuk kulit / rambak
4. Rengginang
5. Kerupuk putih
6. Kerupuk ikan
7. Kerupuk melarat
8. Kerupuk gendar

Sumber: Tirto.id & Historia.id`;
var QUESTIONS_BANK = [
  // ================= UNIT 1: FABEL "DANAU UNTUK SEMUA" (Soal 1 - 3) =================
  {
    id: 1,
    tipeSoal: "pilihan_ganda",
    kategori: "Literasi Fabel & Cerita",
    subkategori: "Tokoh & Alur Cerita",
    bacaan: STIMULUS_DANAU,
    judulStimulus: "Fabel: Danau untuk Semua",
    pertanyaan: "Siapa yang memiliki usul untuk meminta bantuan hewan yang cerdik?",
    pilihan: [
      { id: "A", teks: "Bani." },
      { id: "B", teks: "Ucil." },
      { id: "C", teks: "Rino." },
      { id: "D", teks: "Hari." }
    ],
    kunci: "D",
    pembahasan: 'Berdasarkan teks fabel paragraf ke-4: "Hari si harimau mengusulkan agar meminta bantuan Ucil si kancil." Kunci jawaban: D (Hari).'
  },
  {
    id: 2,
    tipeSoal: "pilihan_ganda",
    kategori: "Literasi Fabel & Cerita",
    subkategori: "Makna Ungkapan Kontekstual",
    bacaan: STIMULUS_DANAU,
    judulStimulus: "Fabel: Danau untuk Semua",
    pertanyaan: "\u201CMereka diam seribu bahasa.\u201D\nApa arti \u201Cdiam seribu bahasa\u201D pada teks fabel tersebut?",
    pilihan: [
      { id: "A", teks: "Para binatang di hutan tidak mampu melakukan sesuatu." },
      { id: "B", teks: "Semua binatang di hutan menahan untuk tidak berkomentar." },
      { id: "C", teks: "Penghuni hutan tidak mau mendengarkan pendapat orang lain." },
      { id: "D", teks: "Binatang-binatang di hutan tidak mengetahui masalah yang terjadi." }
    ],
    kunci: "B",
    pembahasan: 'Ungkapan "diam seribu bahasa" bermakna semua binatang menahan untuk tidak berbicara atau berkomentar karena takut menegur Rino yang berbadan besar dan bercula. Kunci: B.'
  },
  {
    id: 3,
    tipeSoal: "mcma_tabel",
    kategori: "Literasi Fabel & Cerita",
    subkategori: "Refleksi Nilai Kehidupan",
    bacaan: STIMULUS_DANAU,
    judulStimulus: "Fabel: Danau untuk Semua",
    pertanyaan: "Apa contoh peristiwa yang dapat ditemukan dalam kehidupan sehari-hari berdasarkan kejadian yang dialami Ucil pada cerita tersebut?\nTentukan Sesuai atau Tidak Sesuai untuk setiap pernyataan berikut!",
    kolomKategori: ["Sesuai", "Tidak Sesuai"],
    pernyataanTabel: [
      {
        id: "A",
        teks: "Tita memberi ide cemerlang yang dapat dilakukan oleh teman-teman di kelas.",
        kunci: "Tidak Sesuai"
      },
      {
        id: "B",
        teks: "Jani menghargai kepercayaan yang diberikan teman-teman sekelas kepada dirinya.",
        kunci: "Sesuai"
      },
      {
        id: "C",
        teks: "Nina bertanggung jawab dalam menjalankan tugas yang dipercayakan kepadanya.",
        kunci: "Sesuai"
      }
    ],
    pembahasan: "Kunci jawaban: A = Tidak Sesuai, B = Sesuai, C = Sesuai. Ucil menerima kepercayaan dari hewan-hewan lain dan bertanggung jawab menyelesaikannya dengan cerdik."
  },
  // ================= UNIT 2: TEKS "HEWAN PEMAKAN DAUN, APA ITU?" (Soal 4 - 6) =================
  {
    id: 4,
    tipeSoal: "mcma_centang",
    kategori: "Teks Informasi & Sains",
    subkategori: "Contoh Hewan Folivora",
    bacaan: STIMULUS_FOLIVORA,
    judulStimulus: "Teks Informasi: Hewan Pemakan Daun, Apa Itu?",
    pertanyaan: "Apa saja contoh hewan folivora berdasarkan informasi tersebut?\nPilihlah jawaban yang benar! (Jawaban benar lebih dari satu / beri tanda centang)",
    pilihan: [
      { id: "A", teks: "Sapi." },
      { id: "B", teks: "Koala." },
      { id: "C", teks: "Panda." }
    ],
    kunciCentang: ["B", "C"],
    pembahasan: 'Kunci jawaban: Koala dan Panda. Teks menyebutkan: "Misalnya, panda yang makan daun bambu. Ada juga koala yang makan daun eukaliptus." Sapi adalah herbivora umum, bukan folivora khusus pemakan daun saja.'
  },
  {
    id: 5,
    tipeSoal: "pilihan_ganda",
    kategori: "Teks Informasi & Sains",
    subkategori: "Bagan Alur Teks",
    bacaan: STIMULUS_FOLIVORA,
    judulStimulus: "Teks Informasi: Hewan Pemakan Daun, Apa Itu?",
    pertanyaan: "Bagan mana yang sesuai untuk menggambarkan urutan informasi pada teks tersebut?",
    pilihan: [
      { id: "A", teks: "Tiga Kelompok Utama Hewan \u2794 Contoh Hewan Folivora \u2794 Pengertian Hewan Folivora \u2794 Cara Hewan Folivora Mencerna Daun" },
      { id: "B", teks: "Tiga Kelompok Utama Hewan \u2794 Cara Hewan Folivora Mencerna Daun \u2794 Pengertian Hewan Folivora \u2794 Contoh Hewan Folivora" },
      { id: "C", teks: "Pengertian Hewan Folivora \u2794 Tiga Kelompok Utama Hewan \u2794 Cara Hewan Folivora Mencerna Daun \u2794 Contoh Hewan Folivora" },
      { id: "D", teks: "Tiga Kelompok Utama Hewan \u2794 Pengertian Hewan Folivora \u2794 Cara Hewan Folivora Mencerna Daun \u2794 Contoh Hewan Folivora" }
    ],
    kunci: "D",
    pembahasan: "Kunci jawaban: D. Paragraf 1 membahas 3 kelompok utama hewan, Paragraf 2 menjelaskan pengertian folivora, Paragraf 3 cara mencerna daun, Paragraf 4 contoh hewan folivora."
  },
  {
    id: 6,
    tipeSoal: "pilihan_ganda",
    kategori: "Teks Informasi & Sains",
    subkategori: "Gagasan Utama",
    bacaan: STIMULUS_FOLIVORA,
    judulStimulus: "Teks Informasi: Hewan Pemakan Daun, Apa Itu?",
    pertanyaan: "Apa gagasan utama yang disampaikan pada paragraf ketiga teks tersebut?",
    pilihan: [
      { id: "A", teks: "Jenis daun yang cocok untuk hewan folivora." },
      { id: "B", teks: "Pembagian hewan berdasarkan makanan mereka." },
      { id: "C", teks: "Cara khusus tubuh hewan folivora mencerna daun." },
      { id: "D", teks: "Peranan penting hutan bagi kehidupan hewan folivora." }
    ],
    kunci: "C",
    pembahasan: "Kunci jawaban: C. Paragraf 3 menjelaskan usus yang panjang, gerak yang lambat, dan bakteri baik di dalam perut untuk mencerna daun."
  },
  // ================= UNIT 3: FABEL "KENTHUS YANG SOMBONG" (Soal 7 - 9) =================
  {
    id: 7,
    tipeSoal: "mcma_centang",
    kategori: "Literasi Fabel & Cerita",
    subkategori: "Karakter & Ciri Hewan",
    bacaan: STIMULUS_KENTHUS,
    judulStimulus: "Fabel: Kenthus yang Sombong",
    pertanyaan: "Apa yang dijelaskan Koko tentang anak lembu?\nPilihlah jawaban benar! (Jawaban benar lebih dari satu / beri tanda centang)",
    pilihan: [
      { id: "A", teks: "Makhluk itu sangat sombong." },
      { id: "B", teks: "Anak lembu tidak jahat." },
      { id: "C", teks: "Lembu tidak makan katak." }
    ],
    kunciCentang: ["B", "C"],
    pembahasan: 'Kunci jawaban: "Anak lembu tidak jahat" dan "Lembu tidak makan katak". Koko menjelaskan bahwa lembu hanya makan rumput dan tidak memakan katak.'
  },
  {
    id: 8,
    tipeSoal: "pilihan_ganda",
    kategori: "Literasi Fabel & Cerita",
    subkategori: "Alur Penyesalan Tokoh",
    bacaan: STIMULUS_KENTHUS,
    judulStimulus: "Fabel: Kenthus yang Sombong",
    pertanyaan: "Apa kejadian yang membuat Kenthus merasa menyesal?",
    pilihan: [
      { id: "A", teks: "Kenthus hendak ditelan anak lembu di padang rumput." },
      { id: "B", teks: "Kenthus berlari ke tepi kolam hingga terengah-engah." },
      { id: "C", teks: "Kenthus mengembang terlalu besar hingga jatuh lemas." },
      { id: "D", teks: "Kenthus dimarahi Koko karena terlalu menggebu-gebu." }
    ],
    kunci: "C",
    pembahasan: "Kunci jawaban: C. Kenthus mengembungkan tubuhnya secara berlebihan hingga perutnya sakit dan jatuh lemas, lalu ia meminta maaf karena tidak mendengar nasihat kakaknya."
  },
  {
    id: 9,
    tipeSoal: "mcma_tabel",
    kategori: "Literasi Fabel & Cerita",
    subkategori: "Reaksi Pembaca",
    bacaan: STIMULUS_KENTHUS,
    judulStimulus: "Fabel: Kenthus yang Sombong",
    pertanyaan: "Amel telah membaca cerita tersebut. Ia merasakan beberapa reaksi saat membacanya. Bagaimana reaksi Amel saat membaca akhir cerita tersebut?\nPilihlah jawaban Benar atau Salah untuk setiap pernyataan berdasarkan isi teks!",
    kolomKategori: ["Benar", "Salah"],
    pernyataanTabel: [
      {
        id: "A",
        teks: "Terharu karena Kenthus mau mengakui kesalahannya.",
        kunci: "Benar"
      },
      {
        id: "B",
        teks: "Bahagia karena Kenthus berbaikan dengan anak lembu.",
        kunci: "Salah"
      },
      {
        id: "C",
        teks: "Antusias karena Kenthus bisa membuktikan kekuatannya.",
        kunci: "Salah"
      }
    ],
    pembahasan: "Kunci jawaban: A = Benar, B = Salah, C = Salah. Akhir cerita memperlihatkan Kenthus menunduk meminta maaf kepada kakaknya, bukan bertemu lembu kembali atau membuktikan kekuatan."
  },
  // ================= UNIT 4: SURAT MARGARET HAMILTON - APOLLO 11 (Soal 10 - 12) =================
  {
    id: 10,
    tipeSoal: "pilihan_ganda",
    kategori: "Teks Prosedur, Puisi & Budaya",
    subkategori: "Makna Kata",
    bacaan: STIMULUS_APOLLO,
    judulStimulus: "Surat: Margaret Hamilton (Misi Apollo 11)",
    pertanyaan: 'Dalam teks, terdapat kalimat \u201CHari-hari itu sangat menegangkan.\u201D\nMakna kata "menegangkan" dalam kalimat tersebut adalah \u2026.',
    pilihan: [
      { id: "A", teks: "membuat orang terus waspada dalam bekerja" },
      { id: "B", teks: "menyebabkan orang kehilangan fokus saat bekerja" },
      { id: "C", teks: "membuat suasana menjadi serius dan penuh ketakutan" },
      { id: "D", teks: "menimbulkan rasa khawatir karena situasi yang genting" }
    ],
    kunci: "D",
    pembahasan: 'Kunci jawaban: D. "Menegangkan" bermakna menimbulkan rasa khawatir dan cemas yang mendalam karena situasi genting pendaratan astronaut di bulan.'
  },
  {
    id: 11,
    tipeSoal: "pilihan_ganda",
    kategori: "Teks Prosedur, Puisi & Budaya",
    subkategori: "Ide Pokok Surat",
    bacaan: STIMULUS_APOLLO,
    judulStimulus: "Surat: Margaret Hamilton (Misi Apollo 11)",
    pertanyaan: "Surat membahas peran kode komputer dalam misi Apollo 11. Manakah pernyataan yang mendukung ide utama tersebut?",
    pilihan: [
      { id: "A", teks: "Kode komputer mengantar para manusia ke bulan dan Venus." },
      { id: "B", teks: "Kode komputer dibahas dalam rapat setelah misi utama selesai." },
      { id: "C", teks: "Kode komputer membuat astronaut dapat mendarat dengan aman." },
      { id: "D", teks: "Kode komputer mengirim pesan kesalahan saat proses pendaratan." }
    ],
    kunci: "C",
    pembahasan: "Kunci jawaban: C. Margaret menyusun kode komputer agar astronaut dapat fokus pada misi dan berhasil mendarat di bulan dengan aman."
  },
  {
    id: 12,
    tipeSoal: "mcma_tabel",
    kategori: "Teks Prosedur, Puisi & Budaya",
    subkategori: "Pelajaran Hidup",
    bacaan: STIMULUS_APOLLO,
    judulStimulus: "Surat: Margaret Hamilton (Misi Apollo 11)",
    pertanyaan: "Pengalaman Margaret Hamilton mengandung pelajaran hidup. Apa pelajaran penting yang dapat diambil dari suratnya?\nPilihlah jawaban Benar atau Salah untuk setiap pernyataan berdasarkan isi teks!",
    kolomKategori: ["Benar", "Salah"],
    pernyataanTabel: [
      {
        id: "A",
        teks: "Ketelitian bekerja sangat penting agar tidak terjadi kesalahan.",
        kunci: "Benar"
      },
      {
        id: "B",
        teks: "Bekerja di proyek luar angkasa dapat memotivasi orang lain.",
        kunci: "Salah"
      },
      {
        id: "C",
        teks: "Tanggung jawab terhadap tugas membuat seseorang tetap fokus.",
        kunci: "Benar"
      }
    ],
    pembahasan: "Kunci jawaban: A = Benar, B = Salah, C = Benar. Pelajaran utama dari Margaret Hamilton adalah ketelitian kerja dan tanggung jawab terhadap tugas."
  },
  // ================= UNIT 5: INFOGRAFIS "CARA MEMBUAT MAGNET KULKAS" (Soal 13 - 15) =================
  {
    id: 13,
    tipeSoal: "pilihan_ganda",
    kategori: "Teks Prosedur, Puisi & Budaya",
    subkategori: "Bahan Kerajinan",
    bacaan: STIMULUS_MAGNET_KULKAS,
    judulStimulus: "Infografis: Cara Membuat Magnet Kulkas Mainan Hewan",
    pertanyaan: "Berdasarkan teks, benda yang umum digunakan dalam kerajinan adalah \u2026.",
    pilihan: [
      { id: "A", teks: "mainan plastik" },
      { id: "B", teks: "cat semprot" },
      { id: "C", teks: "magnet" },
      { id: "D", teks: "gunting" }
    ],
    kunci: "A",
    pembahasan: "Kunci jawaban: A (mainan plastik). Benda utama yang didaur ulang menjadi kerajinan adalah mainan hewan plastik bekas."
  },
  {
    id: 14,
    tipeSoal: "mcma_centang",
    kategori: "Teks Prosedur, Puisi & Budaya",
    subkategori: "Tujuan Langkah Prosedur",
    bacaan: STIMULUS_MAGNET_KULKAS,
    judulStimulus: "Infografis: Cara Membuat Magnet Kulkas Mainan Hewan",
    pertanyaan: "Langkah kedua mendukung tujuan utama teks karena \u2026.\nPilihlah jawaban benar! (Jawaban benar lebih dari satu / beri tanda centang)",
    pilihan: [
      { id: "A", teks: "membuat permukaan mainan tertutup rapi" },
      { id: "B", teks: "memudahkan anak mewarnai mainan hewan" },
      { id: "C", teks: "menutup lubang agar magnet bisa menempel" }
    ],
    kunciCentang: ["A", "C"],
    pembahasan: 'Kunci jawaban: A ("membuat permukaan mainan tertutup rapi") dan C ("menutup lubang agar magnet bisa menempel"). Mengisi lubang dengan tanah liat membuat bidang rekat menjadi rata dan padat.'
  },
  {
    id: 15,
    tipeSoal: "pilihan_ganda",
    kategori: "Teks Prosedur, Puisi & Budaya",
    subkategori: "Alasan Langkah Kerja",
    bacaan: STIMULUS_MAGNET_KULKAS,
    judulStimulus: "Infografis: Cara Membuat Magnet Kulkas Mainan Hewan",
    pertanyaan: "Mengapa mainan hewan dibagi menjadi dua bagian?",
    pilihan: [
      { id: "A", teks: "Supaya ukuran mainan lebih besar dan menarik." },
      { id: "B", teks: "Agar mainan bisa menempel di permukaan kulkas." },
      { id: "C", teks: "Karena mainan perlu diwarnai menggunakan cat semprot." },
      { id: "D", teks: "Untuk memudahkan pemberian lem tembak pada mainan." }
    ],
    kunci: "B",
    pembahasan: "Kunci jawaban: B. Mainan dipotong dua agar menghasilkan sisi datar yang bisa menempel rata pada permukaan pintu kulkas."
  },
  // ================= UNIT 6: TEKS INFOGRAFIS "AIR PUTIH VS AIR MINERAL" (Soal 16 - 18) =================
  {
    id: 16,
    tipeSoal: "pilihan_ganda",
    kategori: "Teks Informasi & Sains",
    subkategori: "Fungsi Kandungan Air",
    bacaan: STIMULUS_AIR_MINERAL,
    judulStimulus: "Infografis: Beda Air Putih dan Air Mineral",
    pertanyaan: "Apa fungsi kandungan elektrolit yang dimiliki air mineral?",
    pilihan: [
      { id: "A", teks: "Menjaga tekanan darah normal." },
      { id: "B", teks: "Meningkatkan fungsi jantung." },
      { id: "C", teks: "Membantu mencegah dehidrasi." },
      { id: "D", teks: "Mempermudah sistem metabolisme tubuh." }
    ],
    kunci: "C",
    pembahasan: 'Kunci jawaban: C. Pada rincian air mineral di infografis tertulis: "Elektrolit \u2794 Cegah dehidrasi".'
  },
  {
    id: 17,
    tipeSoal: "pilihan_ganda",
    kategori: "Teks Informasi & Sains",
    subkategori: "Karakteristik Air Putih",
    bacaan: STIMULUS_AIR_MINERAL,
    judulStimulus: "Infografis: Beda Air Putih dan Air Mineral",
    pertanyaan: "Mengapa air putih lebih cocok untuk dikonsumsi setiap saat?",
    pilihan: [
      { id: "A", teks: "Sumber air putih mudah ditemukan." },
      { id: "B", teks: "Kandungan air putih sangat banyak." },
      { id: "C", teks: "Pengolahan air putih melalui proses alami." },
      { id: "D", teks: "Kandungan pH dalam air putih lebih tinggi." }
    ],
    kunci: "A",
    pembahasan: "Kunci jawaban: A. Air putih mudah didapatkan masyarakat dari sungai, danau, sumur, atau keran rumah di lingkungan sehari-hari."
  },
  {
    id: 18,
    tipeSoal: "mcma_tabel",
    kategori: "Teks Informasi & Sains",
    subkategori: "Elemen Visual Grafis",
    bacaan: STIMULUS_AIR_MINERAL,
    judulStimulus: "Infografis: Beda Air Putih dan Air Mineral",
    pertanyaan: 'Mengapa kata "BEDA" pada judul infografis berwarna oranye?\nPilihlah jawaban Benar atau Salah untuk setiap pernyataan berdasarkan isi teks!',
    kolomKategori: ["Benar", "Salah"],
    pernyataanTabel: [
      {
        id: "A",
        teks: "Menekankan pokok utama yang ingin disampaikan dalam infografis.",
        kunci: "Benar"
      },
      {
        id: "B",
        teks: "Menonjolkan informasi penting yang sedang dibahas dalam infografis.",
        kunci: "Benar"
      },
      {
        id: "C",
        teks: "Menyesuaikan warna yang mungkin akan disukai pembaca infografis.",
        kunci: "Salah"
      }
    ],
    pembahasan: "Kunci jawaban: A = Benar, B = Benar, C = Salah. Warna oranye kontras digunakan secara tipografis untuk menegaskan bahwa kedua jenis air memiliki perbedaan nyata."
  },
  // ================= UNIT 7: CERITA "ANTRE, DONG!" (Soal 19 - 21) =================
  {
    id: 19,
    tipeSoal: "pilihan_ganda",
    kategori: "Literasi Fabel & Cerita",
    subkategori: "Penyelesaian Konflik Tokoh",
    bacaan: STIMULUS_ANTRE,
    judulStimulus: "Cerita: Antre, Dong!",
    pertanyaan: "Siapakah tokoh yang menyelesaikan keributan dalam cerita tersebut?",
    pilihan: [
      { id: "A", teks: "Tia." },
      { id: "B", teks: "Devi." },
      { id: "C", teks: "Kasir." },
      { id: "D", teks: "Pak Satpam." }
    ],
    kunci: "D",
    pembahasan: 'Kunci jawaban: D. Pada teks disebutkan: "Pak Satpam pun masuk. Dia menenangkan situasi. Pemuda itu harus tetap mengantre sesuai antrean."'
  },
  {
    id: 20,
    tipeSoal: "mcma_centang",
    kategori: "Literasi Fabel & Cerita",
    subkategori: "Peristiwa Tokoh",
    bacaan: STIMULUS_ANTRE,
    judulStimulus: "Cerita: Antre, Dong!",
    pertanyaan: "Apa saja peristiwa yang dialami Tia dalam cerita?\nPilihlah jawaban benar! (Jawaban benar lebih dari satu / beri tanda centang)",
    pilihan: [
      { id: "A", teks: "Mencari dan membeli buku bersama Devi." },
      { id: "B", teks: "Dinasihati oleh seorang ibu untuk antre." },
      { id: "C", teks: "Ikut menegur pemuda yang menyerobot antrean." }
    ],
    kunciCentang: ["A", "C"],
    pembahasan: 'Kunci jawaban: A ("Mencari dan membeli buku bersama Devi") dan C ("Ikut menegur pemuda yang menyerobot antrean"). Yang dinasihati ibu adalah pemuda, bukan Tia.'
  },
  {
    id: 21,
    tipeSoal: "mcma_tabel",
    kategori: "Literasi Fabel & Cerita",
    subkategori: "Argumen Moral & Budaya Antre",
    bacaan: STIMULUS_ANTRE,
    judulStimulus: "Cerita: Antre, Dong!",
    pertanyaan: "Dalam cerita, seorang pemuda mengatakan, \u201Chanya satu buku, pasti tidak akan lama.\u201D\nIntan telah membaca cerita tersebut. Menurutnya, perkataan tersebut tidak dapat dibenarkan. Apa alasan yang mendukung pendapat Intan berdasarkan isi cerita?\nPilihlah jawaban Mendukung atau Tidak Mendukung untuk setiap pernyataan berdasarkan isi teks!",
    kolomKategori: ["Mendukung", "Tidak Mendukung"],
    pernyataanTabel: [
      {
        id: "A",
        teks: "Semua orang yang mengantre juga ingin cepat dilayani.",
        kunci: "Mendukung"
      },
      {
        id: "B",
        teks: "Mengantre membutuhkan kesabaran setiap orang.",
        kunci: "Mendukung"
      },
      {
        id: "C",
        teks: "Aturan antrean harus dihormati oleh semua orang.",
        kunci: "Mendukung"
      }
    ],
    pembahasan: "Kunci jawaban: A = Mendukung, B = Mendukung, C = Mendukung. Seluruh pernyataan mendukung pentingnya mematuhi antrean tanpa pengecualian."
  },
  // ================= UNIT 8: TEKS "KENAPA KITA TIDAK BOLEH MALAS MENYIKAT GIGI?" (Soal 22 - 24) =================
  {
    id: 22,
    tipeSoal: "pilihan_ganda",
    kategori: "Teks Informasi & Sains",
    subkategori: "Penyebab Gigi Berlubang",
    bacaan: STIMULUS_SIKAT_GIGI,
    judulStimulus: "Teks Kesehatan: Kenapa Kita Tidak Boleh Malas Menyikat Gigi?",
    pertanyaan: "Apa penyebab gigi berlubang?",
    pilihan: [
      { id: "A", teks: "Rusaknya enamel pada gigi." },
      { id: "B", teks: "Enamel gigi tidak sekuat tulang." },
      { id: "C", teks: "Pembuluh darah dan saraf sensitif." },
      { id: "D", teks: "Bakteri melepaskan zat asam pada gigi." }
    ],
    kunci: "D",
    pembahasan: 'Kunci jawaban: D. "Bakteri jahat suka memakan sisa gula... Mereka melepaskan asam yang membuat gigi kita berlubang."'
  },
  {
    id: 23,
    tipeSoal: "mcma_centang",
    kategori: "Teks Informasi & Sains",
    subkategori: "Dampak Buruk",
    bacaan: STIMULUS_SIKAT_GIGI,
    judulStimulus: "Teks Kesehatan: Kenapa Kita Tidak Boleh Malas Menyikat Gigi?",
    pertanyaan: "Apa yang terjadi pada gigi jika tidak dirawat dengan baik?\nPilihlah jawaban benar! (Jawaban benar lebih dari satu / beri tanda centang)",
    pilihan: [
      { id: "A", teks: "Gigi akan menjadi rusak dan bolong." },
      { id: "B", teks: "Gigi akan mengunyah makanan lebih lama." },
      { id: "C", teks: "Gigi akan ditumbuhi oleh bakteri sisa makanan." }
    ],
    kunciCentang: ["A", "C"],
    pembahasan: 'Kunci jawaban: A ("Gigi akan menjadi rusak dan bolong") dan C ("Gigi akan ditumbuhi oleh bakteri sisa makanan").'
  },
  {
    id: 24,
    tipeSoal: "mcma_tabel",
    kategori: "Teks Informasi & Sains",
    subkategori: "Fungsi Tanda Panah Gambar",
    bacaan: STIMULUS_SIKAT_GIGI,
    judulStimulus: "Teks Kesehatan: Kenapa Kita Tidak Boleh Malas Menyikat Gigi?",
    pertanyaan: "Apa fungsi tanda panah pada gambar teks tersebut?\nPilihlah jawaban Benar atau Salah untuk setiap pertanyaan berdasarkan isi teks!",
    kolomKategori: ["Benar", "Salah"],
    pernyataanTabel: [
      {
        id: "A",
        teks: "Mempermudah melihat perbedaan kondisi gigi tiap orang.",
        kunci: "Salah"
      },
      {
        id: "B",
        teks: "Menunjukkan lapisan-lapisan gigi yang sedang dijelaskan.",
        kunci: "Benar"
      },
      {
        id: "C",
        teks: "Menggambarkan bentuk dan fungsi dari setiap gigi manusia.",
        kunci: "Salah"
      }
    ],
    pembahasan: "Kunci jawaban: A = Salah, B = Benar, C = Salah. Tanda panah berfungsi menunjuk langsung lapisan Enamel, Dentin, dan Pulpa yang dijelaskan di samping gambar."
  },
  // ================= UNIT 9: PUISI "SURAT UNTUK SAHABAT" (Soal 25 - 27) =================
  {
    id: 25,
    tipeSoal: "mcma_centang",
    kategori: "Teks Prosedur, Puisi & Budaya",
    subkategori: "Larik Puisi Kerinduan",
    bacaan: STIMULUS_PUISI_SAHABAT,
    judulStimulus: "Puisi: Surat untuk Sahabat",
    pertanyaan: "Larik mana saja yang menunjukkan kerinduan?\nKlik pada setiap pilihan jawaban benar! (Jawaban benar lebih dari satu / beri tanda centang)",
    pilihan: [
      { id: "A", teks: "Senyum itu enggan lepas dari bibirmu." },
      { id: "B", teks: "Uluran tanganmu menyambutku." },
      { id: "C", teks: "Maafmu selalu terbuka untukku." }
    ],
    kunciCentang: ["A", "B"],
    pembahasan: 'Kunci jawaban: A ("Senyum itu enggan lepas dari bibirmu") dan B ("Uluran tanganmu menyambutku"). Keduanya menggambarkan ekspresi hangat dan rindu saat berjumpa kembali.'
  },
  {
    id: 26,
    tipeSoal: "pilihan_ganda",
    kategori: "Teks Prosedur, Puisi & Budaya",
    subkategori: "Makna Larik Kiasan",
    bacaan: STIMULUS_PUISI_SAHABAT,
    judulStimulus: "Puisi: Surat untuk Sahabat",
    pertanyaan: "\u201Ckesetiaan yang tak akan pernah lekang oleh masa\u201D\nMakna pada larik puisi tersebut adalah \u2026",
    pilihan: [
      { id: "A", teks: "Simbol penerimaan, dukungan, dan rasa aman dalam persahabatan." },
      { id: "B", teks: "Ungkapan kebahagiaan saat bertemu seseorang yang lama tidak bertemu." },
      { id: "C", teks: "Penghargaan dan rasa syukur sebagai hal yang berkesan dalam persahabatan." },
      { id: "D", teks: "Lambang hubungan abadi, tetap kuat meski waktu atau jarak memisahkan." }
    ],
    kunci: "D",
    pembahasan: 'Kunci jawaban: D. "Tak akan pernah lekang oleh masa" berarti abadi, kokoh, dan tidak pernah pudar walau berlalunya waktu atau terpisah jarak.'
  },
  {
    id: 27,
    tipeSoal: "pilihan_ganda",
    kategori: "Teks Prosedur, Puisi & Budaya",
    subkategori: "Amanat Puisi",
    bacaan: STIMULUS_PUISI_SAHABAT,
    judulStimulus: "Puisi: Surat untuk Sahabat",
    pertanyaan: "Pesan apa yang ingin disampaikan dalam puisi tersebut?",
    pilihan: [
      { id: "A", teks: "Persahabatan membuat seseorang harus mengalah demi menjaga hubungan." },
      { id: "B", teks: "Persahabatan harus selalu diutamakan di atas hubungan dengan keluarga." },
      { id: "C", teks: "Persahabatan membutuhkan pengertian, kesetiaan, dan saling menghargai." },
      { id: "D", teks: "Persahabatan sering diuji oleh konflik sehingga tidak selalu bertahan." }
    ],
    kunci: "C",
    pembahasan: "Kunci jawaban: C. Pesan puisi adalah bahwa persahabatan sejati memerlukan pengertian (saling memahami saat marah), kesetiaan yang lekang oleh masa, dan saling menghargai."
  },
  // ================= UNIT 10: TEKS "KERUPUK, PELENGKAP MAKANAN YANG MENDUNIA" (Soal 28 - 30) =================
  {
    id: 28,
    tipeSoal: "pilihan_ganda",
    kategori: "Teks Prosedur, Puisi & Budaya",
    subkategori: "Fakta Sejarah Kerupuk",
    bacaan: STIMULUS_KERUPUK,
    judulStimulus: "Teks Budaya: Kerupuk, Pelengkap Makanan yang Mendunia",
    pertanyaan: "Apa nama kerupuk yang sudah dikonsumsi sejak lama?",
    pilihan: [
      { id: "A", teks: "Rengginang." },
      { id: "B", teks: "Melarat." },
      { id: "C", teks: "Rambak." },
      { id: "D", teks: "Gendar." }
    ],
    kunci: "C",
    pembahasan: 'Kunci jawaban: C (Rambak). Teks menyebutkan: "Kerupuk yang paling tua dan sudah lama dikonsumsi adalah rambak."'
  },
  {
    id: 29,
    tipeSoal: "mcma_tabel",
    kategori: "Teks Prosedur, Puisi & Budaya",
    subkategori: "Alasan Kerupuk Mendunia",
    bacaan: STIMULUS_KERUPUK,
    judulStimulus: "Teks Budaya: Kerupuk, Pelengkap Makanan yang Mendunia",
    pertanyaan: "Mengapa kerupuk asal Indonesia semakin mendunia?\nPilihlah jawaban Benar atau Salah untuk setiap pernyataan berdasarkan isi teks!",
    kolomKategori: ["Benar", "Salah"],
    pernyataanTabel: [
      {
        id: "A",
        teks: "Memiliki nilai jual ke luar negeri hingga puluhan juta dolar.",
        kunci: "Benar"
      },
      {
        id: "B",
        teks: "Sudah ada di Indonesia sejak abad ke-9 dan ke-10.",
        kunci: "Salah"
      },
      {
        id: "C",
        teks: "Dikirim ke luar negeri lebih dari 20 juta kilogram.",
        kunci: "Benar"
      }
    ],
    pembahasan: "Kunci jawaban: A = Benar, B = Salah, C = Benar. Alasan mendunia karena ekspornya bernilai lebih dari 35 juta dolar AS dan volume ekspor mencapai lebih dari 22 juta kg."
  },
  {
    id: 30,
    tipeSoal: "mcma_tabel",
    kategori: "Teks Prosedur, Puisi & Budaya",
    subkategori: "Tujuan Gambar Kerupuk",
    bacaan: STIMULUS_KERUPUK,
    judulStimulus: "Teks Budaya: Kerupuk, Pelengkap Makanan yang Mendunia",
    pertanyaan: "Mengapa terdapat gambar berbagai jenis kerupuk pada teks tersebut?\nPilihlah jawaban Benar atau Salah untuk setiap pernyataan berdasarkan isi teks!",
    kolomKategori: ["Benar", "Salah"],
    pernyataanTabel: [
      {
        id: "A",
        teks: "Menggambarkan aneka ragam kerupuk yang terdapat di Indonesia.",
        kunci: "Benar"
      },
      {
        id: "B",
        teks: "Menginformasikan macam-macam kerupuk yang dikenal di Indonesia.",
        kunci: "Benar"
      },
      {
        id: "C",
        teks: "Memberikan informasi tentang bahan-bahan kerupuk di Indonesia.",
        kunci: "Salah"
      }
    ],
    pembahasan: "Kunci jawaban: A = Benar, B = Benar, C = Salah. Gambar bertujuan memperlihatkan macam-macam ragam kerupuk nusantara, bukan resep bahan pembuatannya."
  }
];

// src/utils/scoring.ts
function isQuestionAnswered(soalId, answer) {
  if (answer === void 0 || answer === null) return false;
  if (typeof answer === "string") return answer.trim().length > 0;
  if (Array.isArray(answer)) return answer.length > 0;
  if (typeof answer === "object") {
    const keys = Object.keys(answer);
    return keys.length > 0 && keys.some((k) => !!answer[k]);
  }
  return false;
}
function isAnswerCorrect(soal, answer) {
  if (!isQuestionAnswered(soal.id, answer)) return false;
  if (soal.tipeSoal === "pilihan_ganda") {
    return answer === soal.kunci;
  }
  if (soal.tipeSoal === "mcma_centang") {
    if (!Array.isArray(answer)) return false;
    const studentSelected = [...answer].sort();
    const correctKeys = [...soal.kunciCentang || []].sort();
    if (studentSelected.length !== correctKeys.length) return false;
    return studentSelected.every((val, idx) => val === correctKeys[idx]);
  }
  if (soal.tipeSoal === "mcma_tabel") {
    if (typeof answer !== "object" || Array.isArray(answer)) return false;
    const statements = soal.pernyataanTabel || [];
    if (statements.length === 0) return false;
    return statements.every((stmt) => answer[stmt.id] === stmt.kunci);
  }
  return false;
}
function calculateExamScore(nisn, nama, jawabanSiswa, waktuMulai, waktuSelesai) {
  let totalBenar = 0;
  let totalSalah = 0;
  let totalKosong = 0;
  const kategoriBreakdown = {};
  QUESTIONS_BANK.forEach((soal) => {
    const cat = soal.kategori;
    if (!kategoriBreakdown[cat]) {
      kategoriBreakdown[cat] = { total: 0, benar: 0, salah: 0, kosong: 0, persentase: 0 };
    }
    kategoriBreakdown[cat].total += 1;
    const answer = jawabanSiswa[soal.id];
    const answered = isQuestionAnswered(soal.id, answer);
    if (!answered) {
      totalKosong += 1;
      kategoriBreakdown[cat].kosong += 1;
    } else if (isAnswerCorrect(soal, answer)) {
      totalBenar += 1;
      kategoriBreakdown[cat].benar += 1;
    } else {
      totalSalah += 1;
      kategoriBreakdown[cat].salah += 1;
    }
  });
  Object.keys(kategoriBreakdown).forEach((cat) => {
    const data = kategoriBreakdown[cat];
    data.persentase = data.total > 0 ? Math.round(data.benar / data.total * 100) : 0;
  });
  const totalSoal = QUESTIONS_BANK.length;
  const rawScore = totalBenar / totalSoal * 100;
  const skor = Math.round(rawScore * 10) / 10;
  let predikat = "Perlu Pendampingan Intensif";
  if (skor >= 85) {
    predikat = "Sangat Memuaskan / A (Sangat Baik)";
  } else if (skor >= 70) {
    predikat = "Baik / B (Memenuhi Standar)";
  } else if (skor >= 55) {
    predikat = "Cukup / C (Perlu Peningkatan)";
  }
  const durasiPengerjaanDetik = Math.max(0, Math.floor((waktuSelesai - waktuMulai) / 1e3));
  return {
    nisn,
    nama,
    waktuMulai: new Date(waktuMulai).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    waktuSelesai: new Date(waktuSelesai).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    durasiPengerjaanDetik,
    totalSoal,
    totalBenar,
    totalSalah,
    totalKosong,
    skor,
    predikat,
    kategoriBreakdown,
    jawabanSiswa
  };
}

// src/server/storage.ts
var CBTStorage = class {
  constructor() {
    this.sessions = /* @__PURE__ */ new Map();
    // key: nisn
    this.settings = {
      judulUjian: "Tes Kemampuan Akademik (TKA) SD/MI - Bahasa Indonesia",
      durasiMenit: 45,
      totalSoal: 30,
      isOpen: true,
      tampilkanHasilLangsung: true,
      tampilkanPembahasan: true,
      acakSoal: false
    };
  }
  getSettings() {
    return { ...this.settings };
  }
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    return { ...this.settings };
  }
  getSession(nisn) {
    return this.sessions.get(nisn);
  }
  startOrResumeSession(nisn, nama, ipAddress, userAgent) {
    const existing = this.sessions.get(nisn);
    const now = Date.now();
    if (existing) {
      if (existing.status === "selesai") {
        return existing;
      }
      existing.nama = nama;
      existing.terakhirAktif = now;
      if (ipAddress) existing.ipAddress = ipAddress;
      if (userAgent) existing.userAgent = userAgent;
      const elapsedSeconds = Math.floor((now - existing.waktuMulai) / 1e3);
      const totalSeconds2 = existing.durasiMenit * 60;
      const sisa = Math.max(0, totalSeconds2 - elapsedSeconds);
      existing.sisaDetik = sisa;
      if (sisa <= 0) {
        return this.finishSession(nisn);
      }
      existing.status = "mengerjakan";
      return existing;
    }
    const totalSeconds = this.settings.durasiMenit * 60;
    const session = {
      id: `SES-${nisn}-${Date.now().toString(36)}`,
      nisn,
      nama,
      waktuMulai: now,
      durasiMenit: this.settings.durasiMenit,
      sisaDetik: totalSeconds,
      jawaban: {},
      raguRagu: {},
      status: "mengerjakan",
      terakhirAktif: now,
      ipAddress,
      userAgent
    };
    this.sessions.set(nisn, session);
    return session;
  }
  syncSession(nisn, jawaban, raguRagu, sisaDetikClient) {
    const session = this.sessions.get(nisn);
    if (!session) return null;
    if (session.status === "selesai") {
      return session;
    }
    const now = Date.now();
    session.terakhirAktif = now;
    session.jawaban = { ...session.jawaban, ...jawaban };
    session.raguRagu = { ...session.raguRagu, ...raguRagu };
    const elapsedSeconds = Math.floor((now - session.waktuMulai) / 1e3);
    const totalSeconds = session.durasiMenit * 60;
    const serverSisa = Math.max(0, totalSeconds - elapsedSeconds);
    session.sisaDetik = typeof sisaDetikClient === "number" ? Math.min(serverSisa, sisaDetikClient) : serverSisa;
    if (session.sisaDetik <= 0) {
      return this.finishSession(nisn);
    }
    session.status = "mengerjakan";
    return session;
  }
  finishSession(nisn, finalAnswers) {
    let session = this.sessions.get(nisn);
    const now = Date.now();
    if (!session) {
      session = {
        id: `SES-${nisn}-${now.toString(36)}`,
        nisn,
        nama: "Peserta " + nisn,
        waktuMulai: now - 1e3,
        waktuSelesai: now,
        durasiMenit: this.settings.durasiMenit,
        sisaDetik: 0,
        jawaban: finalAnswers || {},
        raguRagu: {},
        status: "selesai",
        terakhirAktif: now
      };
      this.sessions.set(nisn, session);
    } else {
      if (finalAnswers) {
        session.jawaban = { ...session.jawaban, ...finalAnswers };
      }
      session.status = "selesai";
      session.waktuSelesai = now;
      session.sisaDetik = 0;
      session.terakhirAktif = now;
    }
    const hasil = calculateExamScore(
      session.nisn,
      session.nama,
      session.jawaban,
      session.waktuMulai,
      session.waktuSelesai || now
    );
    session.hasil = hasil;
    return session;
  }
  resetSession(nisn) {
    return this.sessions.delete(nisn);
  }
  getMonitoringList() {
    const now = Date.now();
    const list = [];
    this.sessions.forEach((session) => {
      let currentStatus = session.status;
      if (currentStatus === "mengerjakan" && now - session.terakhirAktif > 3e4) {
        currentStatus = "terputus";
      }
      const elapsed = Math.floor((now - session.waktuMulai) / 1e3);
      const total = session.durasiMenit * 60;
      const sisa = Math.max(0, total - elapsed);
      if (currentStatus === "mengerjakan" && sisa <= 0) {
        this.finishSession(session.nisn);
        currentStatus = "selesai";
      }
      const terjawabCount = Object.keys(session.jawaban).filter(
        (k) => isQuestionAnswered(Number(k), session.jawaban[Number(k)])
      ).length;
      list.push({
        ...session,
        status: currentStatus,
        sisaDetik: session.status === "selesai" ? 0 : sisa,
        terjawabCount
      });
    });
    return list.sort((a, b) => b.terakhirAktif - a.terakhirAktif);
  }
  getAllResults() {
    const results = [];
    this.sessions.forEach((sess) => {
      if (sess.hasil) {
        results.push(sess.hasil);
      }
    });
    return results.sort((a, b) => b.skor - a.skor);
  }
};
var cbtStorage = new CBTStorage();

// src/server/api.ts
var apiRouter = Router();
function verifyAdmin(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (authHeader === "Bearer admin-token-123456789") {
    return next();
  }
  return res.status(401).json({ success: false, message: "Akses khusus Guru / Administrator ditolak." });
}
apiRouter.get("/exam/info", (req, res) => {
  const settings = cbtStorage.getSettings();
  res.json({
    success: true,
    data: {
      ...settings,
      totalSoal: QUESTIONS_BANK.length
    }
  });
});
apiRouter.get("/exam/questions", (req, res) => {
  const authHeader = req.headers["authorization"];
  const isAdmin = authHeader === "Bearer admin-token-123456789";
  if (isAdmin) {
    return res.json({
      success: true,
      data: QUESTIONS_BANK
    });
  }
  const sanitized = QUESTIONS_BANK.map((q) => ({
    id: q.id,
    tipeSoal: q.tipeSoal,
    kategori: q.kategori,
    subkategori: q.subkategori,
    bacaan: q.bacaan,
    judulStimulus: q.judulStimulus,
    pertanyaan: q.pertanyaan,
    pilihan: q.pilihan,
    kolomKategori: q.kolomKategori,
    pernyataanTabel: q.pernyataanTabel ? q.pernyataanTabel.map((p) => ({ id: p.id, teks: p.teks, kunci: "" })) : void 0
  }));
  res.json({
    success: true,
    data: sanitized
  });
});
apiRouter.post("/student/login", (req, res) => {
  const { nisn, nama } = req.body;
  const settings = cbtStorage.getSettings();
  if (!settings.isOpen) {
    return res.status(403).json({
      success: false,
      message: "Ujian saat ini sedang ditutup oleh Guru / Pengawas."
    });
  }
  if (!nisn || !nama || typeof nisn !== "string" || typeof nama !== "string") {
    return res.status(400).json({
      success: false,
      message: "Nama dan NISN wajib diisi dengan benar."
    });
  }
  const cleanNisn = nisn.trim();
  const cleanNama = nama.trim();
  if (cleanNisn.length < 4) {
    return res.status(400).json({
      success: false,
      message: "NISN harus memiliki minimal 4 karakter numerik."
    });
  }
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  const userAgent = req.headers["user-agent"] || "unknown";
  const session = cbtStorage.startOrResumeSession(cleanNisn, cleanNama, clientIp, userAgent);
  res.json({
    success: true,
    message: session.status === "selesai" ? "Ujian sudah diselesaikan sebelumnya." : "Berhasil masuk ke ruang ujian.",
    session
  });
});
apiRouter.post("/student/sync", (req, res) => {
  const { nisn, jawaban, raguRagu, sisaDetik } = req.body;
  if (!nisn) {
    return res.status(400).json({ success: false, message: "NISN diperlukan." });
  }
  const updatedSession = cbtStorage.syncSession(
    nisn,
    jawaban || {},
    raguRagu || {},
    sisaDetik
  );
  if (!updatedSession) {
    return res.status(404).json({ success: false, message: "Sesi ujian tidak ditemukan." });
  }
  res.json({
    success: true,
    session: updatedSession
  });
});
apiRouter.post("/student/submit", (req, res) => {
  const { nisn, jawaban } = req.body;
  if (!nisn) {
    return res.status(400).json({ success: false, message: "NISN diperlukan." });
  }
  const finishedSession = cbtStorage.finishSession(nisn, jawaban);
  res.json({
    success: true,
    message: "Ujian berhasil diselesaikan!",
    session: finishedSession,
    hasil: finishedSession.hasil
  });
});
apiRouter.get("/student/result/:nisn", (req, res) => {
  const { nisn } = req.params;
  const session = cbtStorage.getSession(nisn);
  if (!session || !session.hasil) {
    return res.status(404).json({ success: false, message: "Hasil ujian belum tersedia atau tidak ditemukan." });
  }
  res.json({
    success: true,
    hasil: session.hasil
  });
});
apiRouter.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "administrator" && password === "123456789") {
    return res.json({
      success: true,
      message: "Login Administrator berhasil.",
      token: "admin-token-123456789",
      user: {
        role: "admin",
        nama: "Administrator Guru / Pengawas"
      }
    });
  }
  return res.status(401).json({
    success: false,
    message: "Username atau password salah! (Gunakan username: administrator & password: 123456789)"
  });
});
apiRouter.get("/admin/monitoring", verifyAdmin, (req, res) => {
  const monitoringList = cbtStorage.getMonitoringList();
  const settings = cbtStorage.getSettings();
  const totalSiswa = monitoringList.length;
  const sedangMengerjakan = monitoringList.filter((s) => s.status === "mengerjakan").length;
  const selesai = monitoringList.filter((s) => s.status === "selesai").length;
  const terputus = monitoringList.filter((s) => s.status === "terputus").length;
  const skorList = monitoringList.filter((s) => s.hasil).map((s) => s.hasil.skor);
  const avgScore = skorList.length > 0 ? Math.round(skorList.reduce((a, b) => a + b, 0) / skorList.length * 10) / 10 : 0;
  const maxScore = skorList.length > 0 ? Math.max(...skorList) : 0;
  const minScore = skorList.length > 0 ? Math.min(...skorList) : 0;
  res.json({
    success: true,
    data: {
      students: monitoringList,
      stats: {
        totalSiswa,
        sedangMengerjakan,
        selesai,
        terputus,
        avgScore,
        maxScore,
        minScore
      },
      settings
    }
  });
});
apiRouter.post("/admin/reset", verifyAdmin, (req, res) => {
  const { nisn } = req.body;
  if (!nisn) return res.status(400).json({ success: false, message: "NISN diperlukan." });
  const deleted = cbtStorage.resetSession(nisn);
  res.json({
    success: true,
    message: deleted ? `Sesi ujian murid NISN ${nisn} telah berhasil direset.` : "Murid tidak ditemukan."
  });
});
apiRouter.post("/admin/force-finish", verifyAdmin, (req, res) => {
  const { nisn } = req.body;
  if (!nisn) return res.status(400).json({ success: false, message: "NISN diperlukan." });
  const finished = cbtStorage.finishSession(nisn);
  res.json({
    success: true,
    message: `Ujian murid ${finished.nama} telah dipaksa selesai oleh pengawas.`,
    session: finished
  });
});
apiRouter.post("/admin/settings", verifyAdmin, (req, res) => {
  const updated = cbtStorage.updateSettings(req.body);
  res.json({
    success: true,
    message: "Pengaturan ujian berhasil diperbarui.",
    data: updated
  });
});
apiRouter.get("/admin/export-csv", verifyAdmin, (req, res) => {
  const results = cbtStorage.getAllResults();
  let csv = "NISN,Nama,Waktu Mulai,Waktu Selesai,Durasi (Detik),Total Soal,Benar,Salah,Kosong,Skor Akhir,Predikat,Verbal (%),Kuantitatif (%),Logika (%)\n";
  results.forEach((r) => {
    const row = [
      `"${r.nisn}"`,
      `"${r.nama.replace(/"/g, '""')}"`,
      `"${r.waktuMulai}"`,
      `"${r.waktuSelesai}"`,
      r.durasiPengerjaanDetik,
      r.totalSoal,
      r.totalBenar,
      r.totalSalah,
      r.totalKosong,
      r.skor,
      `"${r.predikat}"`,
      r.kategoriBreakdown.Verbal.persentase,
      r.kategoriBreakdown.Kuantitatif.persentase,
      r.kategoriBreakdown.Logika.persentase
    ].join(",");
    csv += row + "\n";
  });
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="Rekap_Nilai_CBT_TKA.csv"');
  res.send("\uFEFF" + csv);
});

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
  const isProd = process.env.NODE_ENV === "production";
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use("/api", apiRouter);
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "cbt-tka-server", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  if (isProd) {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F680} CBT TKA Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
