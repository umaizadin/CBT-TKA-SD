import React, { useState } from 'react';
import {
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Printer,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check,
  X,
  FileText,
  BarChart3,
  HelpCircle,
  BookOpen,
  CheckSquare,
  Table as TableIcon,
} from 'lucide-react';
import { ExamResult, OptionId } from '../types/cbt';
import { QUESTIONS_BANK } from '../data/questions';
import { formatTime, isAnswerCorrect, isQuestionAnswered } from '../utils/scoring';

interface ResultScreenProps {
  result: ExamResult;
  onRetakeOrHome: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ result, onRetakeOrHome }) => {
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong' | 'correct'>('all');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpandedQuestions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<number, boolean> = {};
    QUESTIONS_BANK.forEach((q) => {
      all[q.id] = true;
    });
    setExpandedQuestions(all);
  };

  const collapseAll = () => {
    setExpandedQuestions({});
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter questions for review
  const filteredQuestions = QUESTIONS_BANK.filter((q) => {
    const studentAns = result.jawabanSiswa[q.id];
    const isCorrect = isAnswerCorrect(q, studentAns);
    if (reviewFilter === 'correct') return isCorrect;
    if (reviewFilter === 'wrong') return !isCorrect;
    return true;
  });

  const isPass = result.skor >= 70;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Official Certificate / Report Card Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-600" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200 mb-3">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Ujian Telah Selesai & Terverifikasi Otomatis</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Laporan Hasil Tes Kemampuan Akademik (TKA)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl mx-auto">
          TKA SD/MI Bahasa Indonesia · Asesmen CBT Berbasis Komputer & Multi-Gadget
        </p>

        {/* Student identity box */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 inline-flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs sm:text-sm text-slate-700">
          <div>
            <span className="text-slate-400">Nama Siswa:</span>{' '}
            <strong className="text-slate-900">{result.nama}</strong>
          </div>
          <div>
            <span className="text-slate-400">NISN:</span>{' '}
            <strong className="text-slate-900 font-mono">{result.nisn}</strong>
          </div>
          <div>
            <span className="text-slate-400">Waktu Pengerjaan:</span>{' '}
            <strong className="text-slate-900 font-mono">{result.waktuMulai} - {result.waktuSelesai}</strong>
          </div>
        </div>

        {/* Main Score Hero Card */}
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-b from-indigo-50/70 to-white border border-indigo-100 max-w-md mx-auto space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">
            Skor Akhir Nilai TKA (Skala 0 - 100)
          </p>
          <div className="text-5xl sm:text-6xl font-black text-indigo-950 font-mono tracking-tight">
            {result.skor}
          </div>
          <div className="pt-2">
            <span
              className={`inline-block px-3.5 py-1 text-xs font-bold rounded-lg ${
                isPass
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              Predikat: {result.predikat}
            </span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-4 border-t border-slate-100">
          
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-center">
            <div className="flex items-center justify-center gap-1.5 text-emerald-700 text-xs font-semibold mb-1">
              <CheckCircle className="w-4 h-4" />
              <span>Jawaban Benar</span>
            </div>
            <div className="text-2xl font-black text-emerald-900 font-mono">
              {result.totalBenar} <span className="text-xs font-normal text-slate-500">/ {result.totalSoal}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/60 text-center">
            <div className="flex items-center justify-center gap-1.5 text-rose-700 text-xs font-semibold mb-1">
              <XCircle className="w-4 h-4" />
              <span>Jawaban Salah</span>
            </div>
            <div className="text-2xl font-black text-rose-900 font-mono">
              {result.totalSalah} <span className="text-xs font-normal text-slate-500">/ {result.totalSoal}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-100/70 border border-slate-200 text-center">
            <div className="flex items-center justify-center gap-1.5 text-slate-600 text-xs font-semibold mb-1">
              <AlertCircle className="w-4 h-4" />
              <span>Tidak Dijawab</span>
            </div>
            <div className="text-2xl font-black text-slate-800 font-mono">
              {result.totalKosong} <span className="text-xs font-normal text-slate-500">/ {result.totalSoal}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/60 text-center">
            <div className="flex items-center justify-center gap-1.5 text-blue-700 text-xs font-semibold mb-1">
              <Clock className="w-4 h-4" />
              <span>Durasi Pengerjaan</span>
            </div>
            <div className="text-2xl font-black text-blue-900 font-mono">
              {formatTime(result.durasiPengerjaanDetik)}
            </div>
          </div>

        </div>

      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-600" />
          <span>Analisis Kemampuan per Kategori Soal</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(result.kategoriBreakdown || {}).map(([catName, catData], idx) => {
            const colors = ['bg-indigo-600', 'bg-emerald-600', 'bg-purple-600', 'bg-blue-600'];
            const barColor = colors[idx % colors.length];

            return (
              <div key={catName} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[180px]">{catName}</span>
                  <span className="text-xs font-mono font-bold text-indigo-700">
                    {catData.benar} / {catData.total} Benar
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${barColor} h-2 rounded-full transition-all`}
                    style={{ width: `${catData.persentase}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Akurasi: {catData.persentase}%</span>
                  <span>Salah: {catData.salah}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Answer Key Review & Pembahasan Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Pembahasan Soal & Kunci Jawaban</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pelajari pembahasan lengkap untuk setiap nomor soal dan stimulus teks di bawah ini.
            </p>
          </div>

          {/* Review Filter Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => setReviewFilter('all')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  reviewFilter === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({QUESTIONS_BANK.length})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('wrong')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  reviewFilter === 'wrong' ? 'bg-white text-rose-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Salah ({result.totalSalah + result.totalKosong})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('correct')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  reviewFilter === 'correct' ? 'bg-white text-emerald-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Benar ({result.totalBenar})
              </button>
            </div>

            <button
              type="button"
              onClick={expandAll}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1"
            >
              Buka Semua
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="text-xs text-slate-500 hover:text-slate-700 font-semibold px-2 py-1"
            >
              Tutup Semua
            </button>
          </div>
        </div>

        {/* Question Review List */}
        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const studentAns = result.jawabanSiswa[q.id];
            const isCorrect = isAnswerCorrect(q, studentAns);
            const isAnswered = isQuestionAnswered(q.id, studentAns);
            const isExpanded = !!expandedQuestions[q.id];

            // Answer summary tag
            let answerSummaryBadge = null;
            if (!isAnswered) {
              answerSummaryBadge = (
                <span className="font-medium text-slate-500 text-xs">
                  Kosong / Tidak Dijawab
                </span>
              );
            } else if (isCorrect) {
              answerSummaryBadge = (
                <span className="font-bold text-emerald-700 flex items-center gap-1 text-xs">
                  <Check className="w-3.5 h-3.5" /> Benar
                </span>
              );
            } else {
              answerSummaryBadge = (
                <span className="font-bold text-rose-700 flex items-center gap-1 text-xs">
                  <X className="w-3.5 h-3.5" /> Kurang Tepat
                </span>
              );
            }

            return (
              <div
                key={q.id}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isCorrect
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : !isAnswered
                    ? 'border-slate-200 bg-slate-50/30'
                    : 'border-rose-200 bg-rose-50/20'
                }`}
              >
                {/* Header summary of question */}
                <button
                  type="button"
                  onClick={() => toggleExpand(q.id)}
                  className="w-full text-left p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs font-mono shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : !isAnswered
                          ? 'bg-slate-100 text-slate-600 border border-slate-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {q.id}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          Soal No. {q.id}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          · {q.kategori}
                        </span>
                        {q.tipeSoal === 'mcma_centang' && (
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                            Centang
                          </span>
                        )}
                        {q.tipeSoal === 'mcma_tabel' && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            Tabel
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 truncate mt-0.5 max-w-md sm:max-w-xl">
                        {q.pertanyaan}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {answerSummaryBadge}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {/* Expanded Details: Reading Passage, Options/Table, and Pembahasan */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 border-t border-slate-200/80 bg-white space-y-4 text-xs sm:text-sm">
                    
                    {/* Reading passage if exists */}
                    {q.bacaan && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
                        <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{q.judulStimulus || 'Teks Stimulus Bacaan Soal:'}</span>
                        </div>
                        <div className="whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto pr-2 border-t border-slate-200/60 pt-1.5">
                          {q.bacaan}
                        </div>
                      </div>
                    )}

                    <div className="font-semibold text-slate-900 whitespace-pre-line">
                      {q.pertanyaan}
                    </div>

                    {/* 1. Review Pilihan Ganda Tunggal */}
                    {q.tipeSoal === 'pilihan_ganda' && q.pilihan && (
                      <div className="space-y-1.5 pt-1">
                        {q.pilihan.map((opt) => {
                          const isStudentChoice = studentAns === opt.id;
                          const isKey = q.kunci === opt.id;

                          let style = 'bg-slate-50 text-slate-700 border-slate-200';
                          if (isKey) {
                            style = 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold';
                          } else if (isStudentChoice && !isKey) {
                            style = 'bg-rose-50 text-rose-900 border-rose-300 line-through';
                          }

                          return (
                            <div
                              key={opt.id}
                              className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${style}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold font-mono px-1.5 py-0.5 rounded bg-white/70 border border-slate-200">
                                  {opt.id}
                                </span>
                                <span>{opt.teks}</span>
                              </div>
                              <div>
                                {isKey && (
                                  <span className="text-[11px] font-bold text-emerald-700">
                                    ✓ Kunci Jawaban
                                  </span>
                                )}
                                {isStudentChoice && !isKey && (
                                  <span className="text-[11px] font-bold text-rose-700">
                                    ✗ Jawaban Anda
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 2. Review MCMA Centang */}
                    {q.tipeSoal === 'mcma_centang' && q.pilihan && (
                      <div className="space-y-1.5 pt-1">
                        {q.pilihan.map((opt) => {
                          const studentList = Array.isArray(studentAns) ? (studentAns as OptionId[]) : [];
                          const isStudentChecked = studentList.includes(opt.id);
                          const isKeyChecked = (q.kunciCentang || []).includes(opt.id);

                          let style = 'bg-slate-50 text-slate-700 border-slate-200';
                          if (isKeyChecked && isStudentChecked) {
                            style = 'bg-emerald-50 text-emerald-950 border-emerald-300 font-semibold';
                          } else if (isKeyChecked && !isStudentChecked) {
                            style = 'bg-amber-50 text-amber-950 border-amber-300 font-semibold';
                          } else if (!isKeyChecked && isStudentChecked) {
                            style = 'bg-rose-50 text-rose-900 border-rose-300';
                          }

                          return (
                            <div
                              key={opt.id}
                              className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${style}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold">{opt.id}.</span>
                                <span>{opt.teks}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] font-bold">
                                {isKeyChecked && (
                                  <span className="text-emerald-700">✓ Kunci (Harus Dicentang)</span>
                                )}
                                {isStudentChecked && !isKeyChecked && (
                                  <span className="text-rose-700">✗ Anda Centang (Salah)</span>
                                )}
                                {isStudentChecked && isKeyChecked && (
                                  <span className="text-emerald-700">(Anda Centang)</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 3. Review MCMA Tabel Kategori */}
                    {q.tipeSoal === 'mcma_tabel' && q.kolomKategori && q.pernyataanTabel && (
                      <div className="overflow-x-auto rounded-xl border border-slate-200 pt-1 text-xs">
                        <table className="w-full text-left divide-y divide-slate-200">
                          <thead className="bg-slate-50 font-bold text-slate-700">
                            <tr>
                              <th className="py-2.5 px-3 w-10 text-center">#</th>
                              <th className="py-2.5 px-4">Pernyataan</th>
                              <th className="py-2.5 px-3 text-center border-l border-slate-200">Jawaban Anda</th>
                              <th className="py-2.5 px-3 text-center border-l border-slate-200">Kunci Jawaban</th>
                              <th className="py-2.5 px-3 text-center border-l border-slate-200">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {q.pernyataanTabel.map((stmt) => {
                              const tableAnswers =
                                typeof studentAns === 'object' && !Array.isArray(studentAns)
                                  ? (studentAns as Record<string, string>)
                                  : {};
                              const userChoice = tableAnswers[stmt.id] || '-';
                              const isRowCorrect = userChoice === stmt.kunci;

                              return (
                                <tr key={stmt.id} className="hover:bg-slate-50/50">
                                  <td className="py-2.5 px-3 text-center font-bold font-mono">{stmt.id}.</td>
                                  <td className="py-2.5 px-4">{stmt.teks}</td>
                                  <td className={`py-2.5 px-3 text-center font-semibold border-l border-slate-200 ${
                                    isRowCorrect ? 'text-emerald-700' : 'text-rose-700 font-bold'
                                  }`}>
                                    {userChoice}
                                  </td>
                                  <td className="py-2.5 px-3 text-center font-bold text-slate-800 border-l border-slate-200">
                                    {stmt.kunci}
                                  </td>
                                  <td className="py-2.5 px-3 text-center border-l border-slate-200">
                                    {isRowCorrect ? (
                                      <span className="text-emerald-600 font-bold">✓ Benar</span>
                                    ) : (
                                      <span className="text-rose-600 font-bold">✗ Salah</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Pembahasan Box */}
                    <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-900">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                        <span>Pembahasan:</span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-line">
                        {q.pembahasan}
                      </p>
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>

      {/* Action Footer Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <button
          type="button"
          onClick={onRetakeOrHome}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Kembali ke Halaman Utama</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Hasil Ujian (PDF)</span>
        </button>
      </div>

    </div>
  );
};
