import { ExamResult, ExamSettings, Question, StudentAnswerValue, StudentSession } from '../types/cbt';
import { QUESTIONS_BANK } from '../data/questions';
import { calculateExamScore } from '../utils/scoring';

const API_BASE = '/api';

export const cbtApi = {
  // 1. Get Exam Info
  async getExamInfo(): Promise<ExamSettings> {
    try {
      const res = await fetch(`${API_BASE}/exam/info`);
      if (!res.ok) throw new Error('Gagal mengambil info ujian');
      const data = await res.json();
      return data.data;
    } catch {
      return {
        judulUjian: 'Tes Kemampuan Akademik (TKA) Standar Nasional',
        durasiMenit: 45,
        totalSoal: 30,
        isOpen: true,
        tampilkanHasilLangsung: true,
        tampilkanPembahasan: true,
        acakSoal: false,
      };
    }
  },

  // 2. Get Questions
  async getQuestions(adminToken?: string): Promise<Question[]> {
    try {
      const headers: Record<string, string> = {};
      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }
      const res = await fetch(`${API_BASE}/exam/questions`, { headers });
      if (!res.ok) throw new Error('Gagal memuat soal');
      const data = await res.json();
      return data.data;
    } catch {
      // Local fallback with all 30 questions
      return QUESTIONS_BANK;
    }
  },

  // 3. Student Login
  async studentLogin(nama: string, nisn: string): Promise<{ success: boolean; message: string; session: StudentSession }> {
    try {
      const res = await fetch(`${API_BASE}/student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, nisn }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal login siswa');
      return data;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Koneksi server gagal';
      // Local fallback in case of standalone demo
      const now = Date.now();
      const localSession: StudentSession = {
        id: `LOCAL-${nisn}-${now}`,
        nisn,
        nama,
        waktuMulai: now,
        durasiMenit: 45,
        sisaDetik: 45 * 60,
        jawaban: {},
        raguRagu: {},
        status: 'mengerjakan',
        terakhirAktif: now,
      };
      return {
        success: true,
        message: 'Masuk mode offline/lokal',
        session: localSession,
      };
    }
  },

  // 4. Student Sync
  async syncSession(
    nisn: string,
    jawaban: Record<number, StudentAnswerValue>,
    raguRagu: Record<number, boolean>,
    sisaDetik: number
  ): Promise<StudentSession | null> {
    try {
      const res = await fetch(`${API_BASE}/student/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nisn, jawaban, raguRagu, sisaDetik }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.session;
    } catch {
      return null;
    }
  },

  // 5. Student Submit
  async submitExam(
    nisn: string,
    nama: string,
    jawaban: Record<number, StudentAnswerValue>,
    waktuMulai: number
  ): Promise<{ success: boolean; hasil: ExamResult }> {
    try {
      const res = await fetch(`${API_BASE}/student/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nisn, jawaban }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal mengirim ujian');
      return { success: true, hasil: data.hasil };
    } catch {
      // Local calculation fallback
      const now = Date.now();
      const hasil = calculateExamScore(nisn, nama, jawaban, waktuMulai, now);
      return { success: true, hasil };
    }
  },

  // 6. Admin Login
  async adminLogin(username: string, password: string): Promise<{ success: boolean; token?: string; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Login admin gagal' };
      }
      return { success: true, token: data.token, message: data.message };
    } catch {
      // Fallback verification
      if (username === 'administrator' && password === '123456789') {
        return { success: true, token: 'admin-token-123456789', message: 'Login Administrator berhasil' };
      }
      return { success: false, message: 'Username atau password salah!' };
    }
  },

  // 7. Admin Monitoring
  async getMonitoringData(token: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/monitoring`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      throw new Error('Gagal mengambil data monitoring');
    }
    const json = await res.json();
    return json.data;
  },

  // 8. Admin Reset Student
  async resetStudent(token: string, nisn: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nisn }),
    });
    return res.ok;
  },

  // 9. Admin Force Finish
  async forceFinishStudent(token: string, nisn: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/force-finish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nisn }),
    });
    return res.ok;
  },

  // 10. Admin Update Settings
  async updateSettings(token: string, settings: Partial<ExamSettings>): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    });
    return res.ok;
  },
};
