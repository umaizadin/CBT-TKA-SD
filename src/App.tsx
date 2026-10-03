/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { ExamScreen } from './components/ExamScreen';
import { ResultScreen } from './components/ResultScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { ExamResult, Question, StudentSession } from './types/cbt';
import { cbtApi } from './services/api';
import { QUESTIONS_BANK } from './data/questions';

export default function App() {
  const [currentView, setCurrentView] = useState<'login' | 'exam' | 'result' | 'admin'>('login');
  const [userRole, setUserRole] = useState<'student' | 'admin' | null>(null);

  // Student active session & result
  const [studentSession, setStudentSession] = useState<StudentSession | null>(null);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  // Admin token
  const [adminToken, setAdminToken] = useState<string | null>(null);

  // Exam taking state for navbar
  const [questions, setQuestions] = useState<Question[]>(QUESTIONS_BANK);
  const [remainingSeconds, setRemainingSeconds] = useState(45 * 60);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  // Check saved session on initial mount
  useEffect(() => {
    try {
      const savedAdmin = sessionStorage.getItem('cbt_admin_token');
      if (savedAdmin) {
        setAdminToken(savedAdmin);
        setUserRole('admin');
        setCurrentView('admin');
        return;
      }

      const savedStudent = sessionStorage.getItem('cbt_student_session');
      if (savedStudent) {
        const parsed = JSON.parse(savedStudent) as StudentSession;
        setStudentSession(parsed);
        setUserRole('student');
        if (parsed.status === 'selesai' && parsed.hasil) {
          setExamResult(parsed.hasil);
          setCurrentView('result');
        } else {
          setCurrentView('exam');
        }
      }
    } catch {
      // ignore parsing error
    }
  }, []);

  // Fetch questions from API
  useEffect(() => {
    cbtApi.getQuestions(adminToken || undefined).then((data) => {
      if (data && data.length > 0) {
        setQuestions(data);
      }
    });
  }, [adminToken]);

  // Handle student login success
  const handleStudentLoginSuccess = (session: StudentSession) => {
    setStudentSession(session);
    setUserRole('student');
    sessionStorage.setItem('cbt_student_session', JSON.stringify(session));

    if (session.status === 'selesai' && session.hasil) {
      setExamResult(session.hasil);
      setCurrentView('result');
    } else {
      setRemainingSeconds(session.sisaDetik || 45 * 60);
      setCurrentView('exam');
    }
  };

  // Handle admin login success
  const handleAdminLoginSuccess = (token: string) => {
    setAdminToken(token);
    setUserRole('admin');
    sessionStorage.setItem('cbt_admin_token', token);
    setCurrentView('admin');
  };

  // Handle exam completed
  const handleExamFinished = (hasil: ExamResult) => {
    setExamResult(hasil);
    if (studentSession) {
      const updated = { ...studentSession, status: 'selesai' as const, hasil };
      setStudentSession(updated);
      sessionStorage.setItem('cbt_student_session', JSON.stringify(updated));
    }
    setCurrentView('result');
  };

  // Handle logout
  const handleLogout = () => {
    if (currentView === 'exam') {
      const confirm = window.confirm(
        'Perhatian: Anda sedang dalam sesi ujian. Jika Anda keluar sekarang, waktu pengerjaan akan tetap berjalan. Yakin ingin keluar?'
      );
      if (!confirm) return;
    }

    sessionStorage.removeItem('cbt_student_session');
    sessionStorage.removeItem('cbt_admin_token');
    setUserRole(null);
    setStudentSession(null);
    setExamResult(null);
    setAdminToken(null);
    setCurrentView('login');
  };

  const handleRetakeOrHome = () => {
    sessionStorage.removeItem('cbt_student_session');
    setUserRole(null);
    setStudentSession(null);
    setExamResult(null);
    setCurrentView('login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans">
      
      {/* Top Navbar Header */}
      <Navbar
        userRole={userRole}
        studentName={studentSession?.nama}
        studentNisn={studentSession?.nisn}
        remainingSeconds={remainingSeconds}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        onLogout={handleLogout}
        isExamActive={currentView === 'exam'}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'login' && (
          <LoginScreen
            onStudentLoginSuccess={handleStudentLoginSuccess}
            onAdminLoginSuccess={handleAdminLoginSuccess}
          />
        )}

        {currentView === 'exam' && studentSession && (
          <ExamScreen
            session={studentSession}
            questions={questions}
            fontSize={fontSize}
            onExamFinished={handleExamFinished}
            onUpdateRemainingSeconds={setRemainingSeconds}
            onUpdateAnsweredCount={setAnsweredCount}
          />
        )}

        {currentView === 'result' && examResult && (
          <ResultScreen
            result={examResult}
            onRetakeOrHome={handleRetakeOrHome}
          />
        )}

        {currentView === 'admin' && adminToken && (
          <AdminDashboard token={adminToken} />
        )}
      </main>

      {/* Minimalist Professional Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 CBT TKA - Sistem Ujian Berbasis Komputer & Multi-Gadget.</p>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
            <span>Server: Online</span>
            <span>·</span>
            <span>Sinkronisasi Otomatis</span>
            <span>·</span>
            <span>Standar TKA 30 Soal</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
