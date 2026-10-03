import React, { useState } from 'react';
import { LogOut, Monitor, UserCheck, Clock, AlertTriangle, Maximize2, Minimize2, Share2, Copy, Check, ExternalLink } from 'lucide-react';
import { formatTime } from '../utils/scoring';

interface NavbarProps {
  userRole: 'student' | 'admin' | null;
  studentName?: string;
  studentNisn?: string;
  remainingSeconds?: number;
  totalQuestions?: number;
  answeredCount?: number;
  fontSize?: 'sm' | 'base' | 'lg';
  onChangeFontSize?: (size: 'sm' | 'base' | 'lg') => void;
  onLogout: () => void;
  isExamActive?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  userRole,
  studentName,
  studentNisn,
  remainingSeconds = 0,
  totalQuestions = 30,
  answeredCount = 0,
  fontSize = 'base',
  onChangeFontSize,
  onLogout,
  isExamActive = false,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const isUrgent = remainingSeconds <= 300 && remainingSeconds > 0; // <= 5 min
  const isCritical = remainingSeconds <= 60 && remainingSeconds > 0; // <= 1 min

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-xs font-bold text-lg tracking-wider shrink-0">
                TKA
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-slate-900 truncate">
                    CBT TKA Online
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-md border border-indigo-100">
                    Kemampuan Akademik
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate hidden xs:block">
                  Sistem Ujian Berbasis Komputer & Multi-Gadget
                </p>
              </div>
            </div>

            {/* Exam Mode: Student Active Test Controls */}
            {isExamActive && userRole === 'student' && (
              <div className="flex items-center gap-2 sm:gap-4">
                
                {/* Font Size Selector */}
                {onChangeFontSize && (
                  <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                    <span className="text-slate-500 text-[11px] px-1 font-medium">Font:</span>
                    <button
                      type="button"
                      onClick={() => onChangeFontSize('sm')}
                      className={`px-2 py-1 rounded transition-colors ${
                        fontSize === 'sm' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Ukuran Teks Kecil"
                    >
                      A-
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeFontSize('base')}
                      className={`px-2 py-1 rounded transition-colors ${
                        fontSize === 'base' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Ukuran Teks Normal"
                    >
                      A
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeFontSize('lg')}
                      className={`px-2 py-1 rounded transition-colors ${
                        fontSize === 'lg' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Ukuran Teks Besar"
                    >
                      A+
                    </button>
                  </div>
                )}

                {/* Live Timer Indicator */}
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm sm:text-base transition-colors ${
                    isCritical
                      ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                      : isUrgent
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                  }`}
                  title="Sisa Waktu Pengerjaan"
                >
                  {isCritical ? (
                    <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
                  ) : (
                    <Clock className="w-4 h-4 text-indigo-600" />
                  )}
                  <span>{formatTime(remainingSeconds)}</span>
                </div>

                {/* Progress Count (e.g. 18 / 30) */}
                <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                  <span>Terjawab:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {answeredCount}/{totalQuestions}
                  </span>
                </div>

                {/* Fullscreen toggle */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="hidden sm:inline-flex p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            )}

            {/* User Profile & Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Share / Multi-device Link Button */}
              {!isExamActive && (
                <button
                  type="button"
                  onClick={() => setShowShareModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1.5 rounded-lg transition-colors"
                  title="Bagikan Tautan Ujian ke Banyak Gadget"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Bagikan Link Ujian</span>
                </button>
              )}

              {userRole === 'student' && studentName && (
                <div className="flex items-center gap-2.5 text-right">
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold text-slate-900 truncate max-w-[140px] md:max-w-[180px]">
                      {studentName}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      NISN: {studentNisn}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs ring-2 ring-indigo-200/50">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
              )}

              {userRole === 'admin' && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md text-xs font-medium border border-emerald-200">
                    <Monitor className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pengawas CBT</span>
                  </div>
                </div>
              )}

              {userRole && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 p-2 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Share / Multi-Device Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Tautan Akses Ujian Multi-Gadget
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bagikan link ini kepada seluruh murid dan pengawas. Aplikasi CBT ini dapat diakses secara serentak dari HP, tablet, maupun laptop.
            </p>

            {/* URL input box */}
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <input
                type="text"
                readOnly
                value={typeof window !== 'undefined' ? window.location.origin : ''}
                className="flex-1 text-xs font-mono bg-transparent text-slate-800 outline-none px-2 select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin'}</span>
              </button>
            </div>

            {/* Login notes for students and teachers */}
            <div className="space-y-2 text-xs bg-slate-50 rounded-xl p-3 border border-slate-200/80">
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900 shrink-0">Untuk Siswa:</span>
                <span className="text-slate-600">Masuk dengan Nama Lengkap & NISN siswa masing-masing.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900 shrink-0">Untuk Guru:</span>
                <span className="text-slate-600">Username: <code className="font-mono font-bold text-indigo-700">administrator</code> & Password: <code className="font-mono font-bold text-indigo-700">123456789</code></span>
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

