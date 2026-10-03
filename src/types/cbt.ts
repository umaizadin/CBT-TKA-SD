export type OptionId = 'A' | 'B' | 'C' | 'D' | 'E';

export type QuestionCategory = string;

export type QuestionType = 'pilihan_ganda' | 'mcma_centang' | 'mcma_tabel';

export interface Option {
  id: OptionId;
  teks: string;
}

export interface TableStatement {
  id: string;
  teks: string;
  kunci: string; // e.g. 'Sesuai' | 'Tidak Sesuai' | 'Benar' | 'Salah' | 'Mendukung' | 'Tidak Mendukung'
}

export interface Question {
  id: number;
  tipeSoal: QuestionType;
  kategori: QuestionCategory;
  subkategori?: string;
  bacaan?: string; // Stimulus teks bacaan/infografis
  judulStimulus?: string;
  pertanyaan: string;
  // Untuk pilihan_ganda dan mcma_centang:
  pilihan?: Option[];
  kunci?: OptionId; // Untuk pilihan_ganda
  kunciCentang?: OptionId[]; // Untuk mcma_centang
  // Untuk mcma_tabel:
  kolomKategori?: [string, string]; // e.g. ['Sesuai', 'Tidak Sesuai'] atau ['Benar', 'Salah']
  pernyataanTabel?: TableStatement[];
  pembahasan: string;
}

// Student answer can be single option ('A'), array for checkbox (['B', 'C']), or object for table ({ A: 'Sesuai', B: 'Tidak Sesuai' })
export type StudentAnswerValue = OptionId | OptionId[] | Record<string, string>;

export interface StudentSession {
  id: string; // unique session id
  nisn: string;
  nama: string;
  waktuMulai: number; // timestamp
  waktuSelesai?: number; // timestamp
  durasiMenit: number; // e.g. 45
  sisaDetik: number;
  jawaban: Record<number, StudentAnswerValue>; // questionId -> answer
  raguRagu: Record<number, boolean>; // questionId -> boolean
  status: 'mengerjakan' | 'selesai' | 'terputus';
  terakhirAktif: number; // timestamp
  ipAddress?: string;
  userAgent?: string;
  hasil?: ExamResult;
}

export interface CategoryScore {
  total: number;
  benar: number;
  salah: number;
  kosong: number;
  persentase: number;
}

export interface ExamResult {
  nisn: string;
  nama: string;
  waktuMulai: string;
  waktuSelesai: string;
  durasiPengerjaanDetik: number;
  totalSoal: number;
  totalBenar: number;
  totalSalah: number;
  totalKosong: number;
  skor: number; // 0 - 100
  predikat: string;
  kategoriBreakdown: Record<string, CategoryScore>;
  jawabanSiswa: Record<number, StudentAnswerValue>;
}

export interface ExamSettings {
  judulUjian: string;
  durasiMenit: number;
  totalSoal: number;
  isOpen: boolean;
  tampilkanHasilLangsung: boolean;
  tampilkanPembahasan: boolean;
  acakSoal: boolean;
}
