import React, { useState } from 'react';
import { User, Lock, Award, BookOpen, Clock, ShieldCheck, CheckCircle2, Smartphone, ArrowRight, Laptop } from 'lucide-react';
import { cbtApi } from '../services/api';
import { StudentSession } from '../types/cbt';

interface LoginScreenProps {
  onStudentLoginSuccess: (session: StudentSession) => void;
  onAdminLoginSuccess: (token: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onStudentLoginSuccess,
  onAdminLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');

  // Student inputs
  const [nama, setNama] = useState('');
  const [nisn, setNisn] = useState('');
  const [studentError, setStudentError] = useState('');
  const [studentLoading, setStudentLoading] = useState(false);

  // Admin inputs
  const [adminUsername, setAdminUsername] = useState('administrator');
  const [adminPassword, setAdminPassword] = useState('123456789');
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  // Handle Student Login
  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError('');

    if (!nama.trim()) {
      setStudentError('Mohon isi Nama Lengkap siswa.');
      return;
    }
    if (!nisn.trim() || nisn.trim().length < 4) {
      setStudentError('NISN minimal 4 digit angka.');
      return;
    }

    setStudentLoading(true);
    try {
      const res = await cbtApi.studentLogin(nama.trim(), nisn.trim());
      if (res.success && res.session) {
        onStudentLoginSuccess(res.session);
      } else {
        setStudentError(res.message || 'Gagal masuk ujian.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kendala saat login.';
      setStudentError(msg);
    } finally {
      setStudentLoading(false);
    }
  };

  // Handle Admin Login
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    setAdminLoading(true);
    try {
      const res = await cbtApi.adminLogin(adminUsername.trim(), adminPassword);
      if (res.success && res.token) {
        onAdminLoginSuccess(res.token);
      } else {
        setAdminError(res.message || 'Username atau password salah.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghubungi server.';
      setAdminError(msg);
    } finally {
      setAdminLoading(false);
    }
  };

  const prefillStudent = (nameVal: string, nisnVal: string) => {
    setNama(nameVal);
    setNisn(nisnVal);
    setStudentError('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left column: Exam Information & Specifications */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>CBT Tes Kemampuan Akademik SD/MI</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              TKA Bahasa Indonesia
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Platform asesmen CBT terpadu untuk menguji literasi membaca, pemahaman fabel, teks informasi sains, prosedur, puisi, dan wawasan budaya.
              Dapat diakses lancar di berbagai gadget secara serentak.
            </p>
          </div>

          {/* Key CBT Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">30 Soal TKA</h2>
                <p className="text-xs text-slate-500 mt-0.5">Literasi Fabel · Teks Sains · Prosedur & Puisi</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Waktu 45 Menit</h2>
                <p className="text-xs text-slate-500 mt-0.5">Monitoring waktu pengerjaan otomatis</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Penilaian Otomatis</h2>
                <p className="text-xs text-slate-500 mt-0.5">Hasil skor langsung keluar begitu selesai</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Multi-Gadget</h2>
                <p className="text-xs text-slate-500 mt-0.5">Responsif di HP, Tablet, Laptop & PC</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-100/80 p-4 border border-slate-200/60 text-xs text-slate-600 space-y-1.5">
            <p className="font-semibold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Petunjuk Pengerjaan:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
              <li>Pilihlah salah satu jawaban yang paling tepat dari 5 opsi (A, B, C, D, E).</li>
              <li>Gunakan tombol "Ragu-ragu" jika Anda masih ingin mempertimbangkan jawaban.</li>
              <li>Waktu akan terus berjalan otomatis dan kumpulkan sebelum waktu habis.</li>
            </ul>
          </div>
        </div>

        {/* Right column: Login Box */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
            
            {/* Role Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('student');
                  setStudentError('');
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-xl transition-all ${
                  activeTab === 'student'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Masuk Murid</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setActiveTab('admin');
                  setAdminError('');
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-xl transition-all ${
                  activeTab === 'admin'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>Masuk Guru / Admin</span>
              </button>
            </div>

            {/* Student Login Form */}
            {activeTab === 'student' && (
              <form onSubmit={handleStudentSubmit} className="p-6 sm:p-8 space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Masuk Ruang Ujian Siswa
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Silakan isi Nama Lengkap dan NISN untuk memulai ujian.
                  </p>
                </div>

                {studentError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                    {studentError}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nama Lengkap Siswa
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        placeholder="Contoh: Budi Pratama"
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      NISN (Nomor Induk Siswa Nasional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Award className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={nisn}
                        onChange={(e) => setNisn(e.target.value.replace(/\D/g, ''))}
                        placeholder="Contoh: 0081234567"
                        maxLength={12}
                        className="w-full pl-10 pr-4 py-2.5 text-sm font-mono bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Demo Pre-fill for reviewer convenience */}
                <div className="pt-1">
                  <p className="text-[11px] text-slate-500 font-medium mb-1.5">Pilih contoh akun uji coba:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => prefillStudent('Ahmad Fauzi', '0085432101')}
                      className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200"
                    >
                      Ahmad (NISN: 0085432101)
                    </button>
                    <button
                      type="button"
                      onClick={() => prefillStudent('Siti Rahmania', '0087654321')}
                      className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200"
                    >
                      Siti (NISN: 0087654321)
                    </button>
                    <button
                      type="button"
                      onClick={() => prefillStudent('Bima Satria', '0089123456')}
                      className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200"
                    >
                      Bima (NISN: 0089123456)
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={studentLoading}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 shadow-sm transition-all disabled:opacity-60 cursor-pointer"
                >
                  {studentLoading ? (
                    <span>Menghubungkan ke Ruang Ujian...</span>
                  ) : (
                    <>
                      <span>Mulai Mengerjakan Ujian TKA</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Admin Login Form */}
            {activeTab === 'admin' && (
              <form onSubmit={handleAdminSubmit} className="p-6 sm:p-8 space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Masuk Guru / Administrator
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Gunakan kredensial pengawas untuk monitoring waktu dan rekap nilai.
                  </p>
                </div>

                {adminError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                    {adminError}
                  </div>
                )}

                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 space-y-1">
                  <p className="font-semibold text-amber-950">Kredensial Login Pengawas:</p>
                  <p>Username: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">administrator</code></p>
                  <p>Password: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">123456789</code></p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Username Administrator
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="administrator"
                        className="w-full pl-10 pr-4 py-2.5 text-sm font-mono bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="•••••••••"
                        className="w-full pl-10 pr-4 py-2.5 text-sm font-mono bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={adminLoading}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-500/20 shadow-sm transition-all disabled:opacity-60 cursor-pointer"
                >
                  {adminLoading ? (
                    <span>Memverifikasi...</span>
                  ) : (
                    <>
                      <span>Buka Dashboard Monitoring Guru</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
