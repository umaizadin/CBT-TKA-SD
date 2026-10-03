import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Clock,
  Award,
  RefreshCw,
  Download,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  Settings,
  BookOpen,
  Filter,
  Check,
  X,
  Lock,
  Unlock,
  Sliders,
} from 'lucide-react';
import { cbtApi } from '../services/api';
import { ExamResult, ExamSettings, Question, StudentSession } from '../types/cbt';
import { formatTime, isAnswerCorrect, isQuestionAnswered } from '../utils/scoring';

interface AdminDashboardProps {
  token: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ token }) => {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'questions' | 'settings'>('monitoring');
  const [students, setStudents] = useState<Array<StudentSession & { terjawabCount: number }>>([]);
  const [stats, setStats] = useState({
    totalSiswa: 0,
    sedangMengerjakan: 0,
    selesai: 0,
    terputus: 0,
    avgScore: 0,
    maxScore: 0,
    minScore: 0,
  });
  const [settings, setSettings] = useState<ExamSettings>({
    judulUjian: 'Tes Kemampuan Akademik (TKA)',
    durasiMenit: 45,
    totalSoal: 30,
    isOpen: true,
    tampilkanHasilLangsung: true,
    tampilkanPembahasan: true,
    acakSoal: false,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'mengerjakan' | 'selesai' | 'terputus'>('all');

  // Selected student for detail modal
  const [selectedStudent, setSelectedStudent] = useState<(StudentSession & { terjawabCount: number }) | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Settings form states
  const [formDuration, setFormDuration] = useState(45);
  const [formIsOpen, setFormIsOpen] = useState(true);
  const [formShowResult, setFormShowResult] = useState(true);
  const [formShowDiscussion, setFormShowDiscussion] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Fetch monitoring data
  const fetchMonitoring = useCallback(async () => {
    try {
      const data = await cbtApi.getMonitoringData(token);
      if (data) {
        setStudents(data.students || []);
        setStats(data.stats || stats);
        if (data.settings) {
          setSettings(data.settings);
          setFormDuration(data.settings.durasiMenit);
          setFormIsOpen(data.settings.isOpen);
          setFormShowResult(data.settings.tampilkanHasilLangsung);
          setFormShowDiscussion(data.settings.tampilkanPembahasan);
        }
      }
    } catch (err) {
      console.error('Monitoring fetch error:', err);
    }
  }, [token, stats]);

  // Initial load
  useEffect(() => {
    fetchMonitoring();
    cbtApi.getQuestions(token).then((res) => {
      setQuestions(res);
    });
  }, [fetchMonitoring, token]);

  // Auto-refresh interval (every 3 seconds for live multi-gadget monitoring)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchMonitoring();
    }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchMonitoring]);

  const handleManualRefresh = async () => {
    setLoading(true);
    await fetchMonitoring();
    setLoading(false);
  };

  const handleResetStudent = async (nisn: string, nama: string) => {
    if (!window.confirm(`Yakin ingin mereset ujian siswa ${nama} (NISN: ${nisn})? Siswa akan dapat mengulang ujian dari awal.`)) {
      return;
    }
    const ok = await cbtApi.resetStudent(token, nisn);
    if (ok) {
      setActionMessage(`Ujian siswa ${nama} berhasil direset.`);
      setTimeout(() => setActionMessage(null), 4000);
      fetchMonitoring();
      if (selectedStudent?.nisn === nisn) setSelectedStudent(null);
    }
  };

  const handleForceFinish = async (nisn: string, nama: string) => {
    if (!window.confirm(`Yakin ingin memaksa pengumpulan ujian siswa ${nama} sekarang? Nilai akan langsung dihitung.`)) {
      return;
    }
    const ok = await cbtApi.forceFinishStudent(token, nisn);
    if (ok) {
      setActionMessage(`Ujian siswa ${nama} telah diselesaikan.`);
      setTimeout(() => setActionMessage(null), 4000);
      fetchMonitoring();
      if (selectedStudent?.nisn === nisn) setSelectedStudent(null);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    const updated = await cbtApi.updateSettings(token, {
      durasiMenit: Number(formDuration),
      isOpen: formIsOpen,
      tampilkanHasilLangsung: formShowResult,
      tampilkanPembahasan: formShowDiscussion,
    });
    setIsSavingSettings(false);
    if (updated) {
      setActionMessage('Pengaturan ujian CBT berhasil disimpan.');
      setTimeout(() => setActionMessage(null), 4000);
      fetchMonitoring();
    }
  };

  // Filter students list
  const filteredStudents = students.filter((s) => {
    const matchQuery =
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery);
    if (statusFilter === 'all') return matchQuery;
    return matchQuery && s.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner / Dashboard Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Dashboard Monitoring Pengawas CBT
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                settings.isOpen
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {settings.isOpen ? '● Ujian Dibuka' : '■ Ujian Ditutup'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitoring waktu pengerjaan multi-gadget, status peserta real-time, dan rekap skor otomatis.
          </p>
        </div>

        {/* Top Control Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Auto Refresh Toggle */}
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              autoRefresh
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`} />
            <span>Auto Refresh: {autoRefresh ? 'Aktif (3s)' : 'Mati'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={loading}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export CSV */}
          <a
            href="/api/admin/export-csv"
            download
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Rekap Nilai (CSV)</span>
          </a>

        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs sm:text-sm text-indigo-900 font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <span>{actionMessage}</span>
          <button type="button" onClick={() => setActionMessage(null)} className="text-indigo-600 hover:text-indigo-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Stats Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Peserta</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats.totalSiswa}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Siswa terdaftar</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-xs font-semibold">Sedang Ujian</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">
            {stats.sedangMengerjakan}
          </div>
          <div className="text-[11px] text-amber-600/80 mt-0.5">Multi-gadget aktif</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-xs font-semibold">Selesai Ujian</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-800 font-mono">
            {stats.selesai}
          </div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5">Nilai terhitung</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 mb-1">
            <span className="text-xs font-semibold">Terputus / Idle</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-800 font-mono">
            {stats.terputus}
          </div>
          <div className="text-[11px] text-rose-600/80 mt-0.5">Koneksi macet</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-indigo-700 mb-1">
            <span className="text-xs font-semibold">Rata-rata Skor</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-900 font-mono">
            {stats.avgScore}
          </div>
          <div className="text-[11px] text-indigo-500 mt-0.5">Skala 0 - 100</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Tertinggi / Rendah</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-800 font-mono">
            {stats.maxScore} <span className="text-xs font-normal text-slate-400">/ {stats.minScore}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Rentang nilai</div>
        </div>

      </div>

      {/* Navigation Tabs (Monitoring / Bank Soal / Pengaturan) */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('monitoring')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'monitoring'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Monitoring Waktu & Peserta ({students.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('questions')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'questions'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Bank Soal TKA (30 Soal & Kunci)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Pengaturan Waktu & Ujian</span>
        </button>
      </div>

      {/* TAB 1: LIVE MONITORING & PARTICIPANTS */}
      {activeTab === 'monitoring' && (
        <div className="space-y-4">
          
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari Nama atau NISN murid..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Semua ({students.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('mengerjakan')}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  statusFilter === 'mengerjakan'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-amber-700 border-slate-200 hover:bg-amber-50'
                }`}
              >
                Sedang Ujian ({stats.sedangMengerjakan})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('selesai')}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  statusFilter === 'selesai'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-emerald-700 border-slate-200 hover:bg-emerald-50'
                }`}
              >
                Selesai ({stats.selesai})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('terputus')}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  statusFilter === 'terputus'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-rose-700 border-slate-200 hover:bg-rose-50'
                }`}
              >
                Terputus ({stats.terputus})
              </button>
            </div>
          </div>

          {/* Student Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Nama Siswa & NISN</th>
                    <th className="py-3 px-4">Status Pengerjaan</th>
                    <th className="py-3 px-4">Sisa Waktu</th>
                    <th className="py-3 px-4">Progres Jawaban</th>
                    <th className="py-3 px-4">Skor Akhir</th>
                    <th className="py-3 px-4 text-right">Aksi Pengawas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-medium">Belum ada peserta yang masuk atau sesuai filter.</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Peserta dapat masuk menggunakan Nama dan NISN dari gadget masing-masing.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s, index) => {
                      const totalQ = settings.totalSoal || 30;
                      const progressPct = Math.round((s.terjawabCount / totalQ) * 100);

                      return (
                        <tr key={s.nisn} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                            {index + 1}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{s.nama}</div>
                            <div className="text-xs text-slate-500 font-mono">NISN: {s.nisn}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            {s.status === 'mengerjakan' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                                <span>Sedang Mengerjakan</span>
                              </span>
                            )}
                            {s.status === 'selesai' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Selesai</span>
                              </span>
                            )}
                            {s.status === 'terputus' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Terputus / Idle</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold">
                            {s.status === 'selesai' ? (
                              <span className="text-slate-400 font-normal">Selesai</span>
                            ) : (
                              <span className={s.sisaDetik <= 300 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}>
                                {formatTime(s.sisaDetik)}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-700">
                                {s.terjawabCount}/{totalQ}
                              </span>
                              <div className="w-20 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    s.status === 'selesai' ? 'bg-emerald-600' : 'bg-indigo-600'
                                  }`}
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {progressPct}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {s.hasil ? (
                              <div>
                                <span className="font-black text-slate-900 font-mono text-base">
                                  {s.hasil.skor}
                                </span>
                                <div className="text-[10px] text-emerald-600 font-semibold truncate max-w-[120px]">
                                  {s.hasil.totalBenar} Benar / {s.hasil.totalSalah} Salah
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs italic">Belum selesai</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Detail button */}
                              <button
                                type="button"
                                onClick={() => setSelectedStudent(s)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                                title="Lihat Detail Jawaban"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Force Finish */}
                              {s.status !== 'selesai' && (
                                <button
                                  type="button"
                                  onClick={() => handleForceFinish(s.nisn, s.nama)}
                                  className="p-1.5 rounded-lg text-amber-600 hover:text-amber-800 hover:bg-amber-50 transition-colors"
                                  title="Paksa Kumpulkan Ujian"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}

                              {/* Reset Exam */}
                              <button
                                type="button"
                                onClick={() => handleResetStudent(s.nisn, s.nama)}
                                className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
                                title="Reset Sesi Ujian (Ulang dari awal)"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BANK SOAL (30 SOAL) */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Bank Soal: Tes Kemampuan Akademik (TKA) SD/MI - Bahasa Indonesia
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                30 Butir Soal Resmi dari Latihan TKA dengan Kunci Jawaban & Pembahasan Lengkap.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                Literasi Fabel & Cerita
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                Teks Informasi & Sains
              </span>
              <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                Prosedur, Puisi & Budaya
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                      {q.id}
                    </span>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {q.kategori}
                    </span>
                    {q.subkategori && (
                      <span className="text-xs text-slate-500 font-medium">· {q.subkategori}</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-mono">
                    Kunci: {q.kunci}
                  </span>
                </div>

                {/* Bacaan if exists */}
                {q.bacaan && (
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                    <div className="font-bold text-indigo-900">Teks Bacaan Terkait:</div>
                    <div className="whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto pr-1">
                      {q.bacaan}
                    </div>
                  </div>
                )}

                <p className="text-sm font-semibold text-slate-900 whitespace-pre-line">
                  {q.pertanyaan}
                </p>

                {/* Pilihan Ganda / Centang Options */}
                {q.pilihan && q.pilihan.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                    {q.pilihan.map((opt) => {
                      const isCorrect = q.tipeSoal === 'pilihan_ganda'
                        ? opt.id === q.kunci
                        : (q.kunciCentang || []).includes(opt.id);

                      return (
                        <div
                          key={opt.id}
                          className={`p-2 rounded-lg border flex items-center gap-2 ${
                            isCorrect
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span className="font-mono">{opt.id}.</span>
                          <span>{opt.teks}</span>
                          {isCorrect && (
                            <span className="ml-auto text-[10px] text-emerald-700">✓ Kunci</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* MCMA Tabel Statements */}
                {q.tipeSoal === 'mcma_tabel' && q.pernyataanTabel && (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 text-xs">
                    <table className="w-full text-left divide-y divide-slate-200">
                      <thead className="bg-slate-50 font-bold text-slate-700">
                        <tr>
                          <th className="py-2 px-3 w-10 text-center">#</th>
                          <th className="py-2 px-4">Pernyataan</th>
                          <th className="py-2 px-4 text-center w-36">Kunci Kategori</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {q.pernyataanTabel.map((stmt) => (
                          <tr key={stmt.id}>
                            <td className="py-2 px-3 text-center font-mono font-bold">{stmt.id}.</td>
                            <td className="py-2 px-4">{stmt.teks}</td>
                            <td className="py-2 px-4 text-center font-bold text-emerald-700 bg-emerald-50/50">
                              {stmt.kunci}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-950">
                  <span className="font-bold text-amber-900">Pembahasan: </span>
                  {q.pembahasan}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PENGATURAN UJIAN */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Pengaturan Ujian CBT</h2>
            <p className="text-xs text-slate-500 mt-1">
              Atur durasi waktu pengerjaan, status aksesibilitas siswa, dan visibilitas hasil.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5 text-sm">
            
            {/* Status Akses Ujian (Open / Lock) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <label className="font-bold text-slate-900 flex items-center gap-2">
                {formIsOpen ? <Unlock className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-rose-600" />}
                <span>Status Ketersediaan Ujian</span>
              </label>
              <p className="text-xs text-slate-500">
                Jika ditutup, murid baru tidak dapat login untuk memulai ujian.
              </p>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setFormIsOpen(true)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                    formIsOpen ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-600'
                  }`}
                >
                  🟢 Buka Ujian (Aktif)
                </button>
                <button
                  type="button"
                  onClick={() => setFormIsOpen(false)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                    !formIsOpen ? 'bg-rose-600 text-white' : 'bg-white border text-slate-600'
                  }`}
                >
                  🔴 Kunci / Tutup Ujian
                </button>
              </div>
            </div>

            {/* Durasi Pengerjaan */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Durasi Waktu Pengerjaan (Menit)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={formDuration}
                  onChange={(e) => setFormDuration(parseInt(e.target.value, 10) || 45)}
                  className="w-32 px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
                <span className="text-xs text-slate-500">
                  Waktu default adalah 45 Menit untuk 30 Soal TKA.
                </span>
              </div>
            </div>

            {/* Tampilkan Hasil Langsung */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formShowResult}
                  onChange={(e) => setFormShowResult(e.target.checked)}
                  className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-semibold text-slate-800">
                    Tampilkan Skor Otomatis Langsung ke Murid
                  </span>
                  <p className="text-xs text-slate-500">
                    Murid langsung melihat nilai akhir dan analisis predikat kelulusan begitu selesai klik kumpulkan.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formShowDiscussion}
                  onChange={(e) => setFormShowDiscussion(e.target.checked)}
                  className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-semibold text-slate-800">
                    Tampilkan Pembahasan Soal & Kunci Jawaban ke Murid
                  </span>
                  <p className="text-xs text-slate-500">
                    Murid dapat mempelajari review penjelasan untuk setiap soal setelah ujian selesai.
                  </p>
                </div>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isSavingSettings ? 'Menyimpan...' : 'Simpan Perubahan Pengaturan'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* STUDENT DETAIL MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Detail Pengerjaan Siswa: {selectedStudent.nama}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  NISN: {selectedStudent.nisn} · Status: {selectedStudent.status}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 text-xs sm:text-sm">
              {/* Hasil Ringkasan if finished */}
              {selectedStudent.hasil ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div>
                    <span className="text-[11px] text-slate-500">Skor Akhir</span>
                    <div className="text-2xl font-black text-indigo-900 font-mono">
                      {selectedStudent.hasil.skor}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Benar</span>
                    <div className="text-2xl font-black text-emerald-700 font-mono">
                      {selectedStudent.hasil.totalBenar}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Salah</span>
                    <div className="text-2xl font-black text-rose-700 font-mono">
                      {selectedStudent.hasil.totalSalah}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Kosong</span>
                    <div className="text-2xl font-black text-slate-700 font-mono">
                      {selectedStudent.hasil.totalKosong}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-amber-50 text-amber-800 text-xs border border-amber-200">
                  Siswa masih dalam proses ujian. Sisa waktu: {formatTime(selectedStudent.sisaDetik)}.
                </div>
              )}

              {/* Answers Grid */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Jawaban Siswa (30 Soal):</h4>
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                  {questions.map((q) => {
                    const studentAns = selectedStudent.jawaban[q.id];
                    const isAnswered = isQuestionAnswered(q.id, studentAns);
                    const isKey = isAnswerCorrect(q, studentAns);
                    const isDoubt = selectedStudent.raguRagu[q.id];

                    let boxStyle = 'bg-slate-100 text-slate-400 border-slate-200';
                    if (isAnswered) {
                      boxStyle = isKey
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                        : 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
                    }

                    let displayText = '-';
                    if (isAnswered) {
                      if (typeof studentAns === 'string') {
                        displayText = studentAns;
                      } else if (Array.isArray(studentAns)) {
                        displayText = studentAns.join(',');
                      } else if (typeof studentAns === 'object') {
                        displayText = isKey ? '✓ TAB' : '✗ TAB';
                      }
                    }

                    return (
                      <div
                        key={q.id}
                        className={`p-2 rounded-lg border text-center font-mono text-xs ${boxStyle}`}
                      >
                        <div className="text-[10px] text-slate-500">No {q.id}</div>
                        <div className="text-sm font-bold truncate">
                          {displayText}
                        </div>
                        <div className="text-[9px] text-slate-400 truncate">
                          {q.tipeSoal === 'pilihan_ganda' ? `K: ${q.kunci}` : q.tipeSoal === 'mcma_centang' ? `K: ${(q.kunciCentang || []).join(',')}` : 'TAB'} {isDoubt ? '⚠️' : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => handleResetStudent(selectedStudent.nisn, selectedStudent.nama)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                Reset Ujian Siswa Ini
              </button>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
