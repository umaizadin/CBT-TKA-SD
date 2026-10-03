import { QUESTIONS_BANK } from '../data/questions.ts';
import type { CategoryScore, ExamResult, StudentAnswerValue } from '../types/cbt.ts';

export function isQuestionAnswered(soalId: number, answer: StudentAnswerValue | undefined): boolean {
  if (answer === undefined || answer === null) return false;
  if (typeof answer === 'string') return answer.trim().length > 0;
  if (Array.isArray(answer)) return answer.length > 0;
  if (typeof answer === 'object') {
    const keys = Object.keys(answer);
    return keys.length > 0 && keys.some((k) => !!answer[k]);
  }
  return false;
}

export function isAnswerCorrect(soal: (typeof QUESTIONS_BANK)[0], answer: StudentAnswerValue | undefined): boolean {
  if (!isQuestionAnswered(soal.id, answer)) return false;

  if (soal.tipeSoal === 'pilihan_ganda') {
    return answer === soal.kunci;
  }

  if (soal.tipeSoal === 'mcma_centang') {
    if (!Array.isArray(answer)) return false;
    const studentSelected = [...answer].sort();
    const correctKeys = [...(soal.kunciCentang || [])].sort();
    if (studentSelected.length !== correctKeys.length) return false;
    return studentSelected.every((val, idx) => val === correctKeys[idx]);
  }

  if (soal.tipeSoal === 'mcma_tabel') {
    if (typeof answer !== 'object' || Array.isArray(answer)) return false;
    const statements = soal.pernyataanTabel || [];
    if (statements.length === 0) return false;
    // Check if every statement matches its key
    return statements.every((stmt) => (answer as Record<string, string>)[stmt.id] === stmt.kunci);
  }

  return false;
}

export function calculateExamScore(
  nisn: string,
  nama: string,
  jawabanSiswa: Record<number, StudentAnswerValue>,
  waktuMulai: number,
  waktuSelesai: number
): ExamResult {
  let totalBenar = 0;
  let totalSalah = 0;
  let totalKosong = 0;

  const kategoriBreakdown: Record<string, CategoryScore> = {};

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

  // Calculate percentage per category
  Object.keys(kategoriBreakdown).forEach((cat) => {
    const data = kategoriBreakdown[cat];
    data.persentase = data.total > 0 ? Math.round((data.benar / data.total) * 100) : 0;
  });

  const totalSoal = QUESTIONS_BANK.length;
  const rawScore = (totalBenar / totalSoal) * 100;
  const skor = Math.round(rawScore * 10) / 10; // 1 decimal place

  let predikat = 'Perlu Pendampingan Intensif';
  if (skor >= 85) {
    predikat = 'Sangat Memuaskan / A (Sangat Baik)';
  } else if (skor >= 70) {
    predikat = 'Baik / B (Memenuhi Standar)';
  } else if (skor >= 55) {
    predikat = 'Cukup / C (Perlu Peningkatan)';
  }

  const durasiPengerjaanDetik = Math.max(0, Math.floor((waktuSelesai - waktuMulai) / 1000));

  return {
    nisn,
    nama,
    waktuMulai: new Date(waktuMulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    waktuSelesai: new Date(waktuSelesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    durasiPengerjaanDetik,
    totalSoal,
    totalBenar,
    totalSalah,
    totalKosong,
    skor,
    predikat,
    kategoriBreakdown,
    jawabanSiswa,
  };
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const mm = m < 10 ? `0${m}` : `${m}`;
  const ss = s < 10 ? `0${s}` : `${s}`;
  return `${mm}:${ss}`;
}
