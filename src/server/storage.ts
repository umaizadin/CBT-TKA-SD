import type { ExamResult, ExamSettings, StudentAnswerValue, StudentSession } from '../types/cbt.ts';
import { calculateExamScore, isQuestionAnswered } from '../utils/scoring.ts';

class CBTStorage {
  private sessions: Map<string, StudentSession> = new Map(); // key: nisn
  private settings: ExamSettings = {
    judulUjian: 'Tes Kemampuan Akademik (TKA) SD/MI - Bahasa Indonesia',
    durasiMenit: 45,
    totalSoal: 30,
    isOpen: true,
    tampilkanHasilLangsung: true,
    tampilkanPembahasan: true,
    acakSoal: false,
  };

  public getSettings(): ExamSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<ExamSettings>): ExamSettings {
    this.settings = { ...this.settings, ...newSettings };
    return { ...this.settings };
  }

  public getSession(nisn: string): StudentSession | undefined {
    return this.sessions.get(nisn);
  }

  public startOrResumeSession(
    nisn: string,
    nama: string,
    ipAddress?: string,
    userAgent?: string
  ): StudentSession {
    const existing = this.sessions.get(nisn);
    const now = Date.now();

    if (existing) {
      // If already finished, return as finished
      if (existing.status === 'selesai') {
        return existing;
      }
      // Update metadata and last active
      existing.nama = nama;
      existing.terakhirAktif = now;
      if (ipAddress) existing.ipAddress = ipAddress;
      if (userAgent) existing.userAgent = userAgent;

      // Recalculate remaining seconds based on start time and total duration
      const elapsedSeconds = Math.floor((now - existing.waktuMulai) / 1000);
      const totalSeconds = existing.durasiMenit * 60;
      const sisa = Math.max(0, totalSeconds - elapsedSeconds);
      existing.sisaDetik = sisa;

      if (sisa <= 0) {
        return this.finishSession(nisn);
      }

      existing.status = 'mengerjakan';
      return existing;
    }

    // New session
    const totalSeconds = this.settings.durasiMenit * 60;
    const session: StudentSession = {
      id: `SES-${nisn}-${Date.now().toString(36)}`,
      nisn,
      nama,
      waktuMulai: now,
      durasiMenit: this.settings.durasiMenit,
      sisaDetik: totalSeconds,
      jawaban: {},
      raguRagu: {},
      status: 'mengerjakan',
      terakhirAktif: now,
      ipAddress,
      userAgent,
    };

    this.sessions.set(nisn, session);
    return session;
  }

  public syncSession(
    nisn: string,
    jawaban: Record<number, StudentAnswerValue>,
    raguRagu: Record<number, boolean>,
    sisaDetikClient?: number
  ): StudentSession | null {
    const session = this.sessions.get(nisn);
    if (!session) return null;

    if (session.status === 'selesai') {
      return session;
    }

    const now = Date.now();
    session.terakhirAktif = now;
    session.jawaban = { ...session.jawaban, ...jawaban };
    session.raguRagu = { ...session.raguRagu, ...raguRagu };

    // Calculate remaining time server-side
    const elapsedSeconds = Math.floor((now - session.waktuMulai) / 1000);
    const totalSeconds = session.durasiMenit * 60;
    const serverSisa = Math.max(0, totalSeconds - elapsedSeconds);

    session.sisaDetik = typeof sisaDetikClient === 'number'
      ? Math.min(serverSisa, sisaDetikClient)
      : serverSisa;

    if (session.sisaDetik <= 0) {
      return this.finishSession(nisn);
    }

    session.status = 'mengerjakan';
    return session;
  }

  public finishSession(
    nisn: string,
    finalAnswers?: Record<number, StudentAnswerValue>
  ): StudentSession {
    let session = this.sessions.get(nisn);
    const now = Date.now();

    if (!session) {
      session = {
        id: `SES-${nisn}-${now.toString(36)}`,
        nisn,
        nama: 'Peserta ' + nisn,
        waktuMulai: now - 1000,
        waktuSelesai: now,
        durasiMenit: this.settings.durasiMenit,
        sisaDetik: 0,
        jawaban: finalAnswers || {},
        raguRagu: {},
        status: 'selesai',
        terakhirAktif: now,
      };
      this.sessions.set(nisn, session);
    } else {
      if (finalAnswers) {
        session.jawaban = { ...session.jawaban, ...finalAnswers };
      }
      session.status = 'selesai';
      session.waktuSelesai = now;
      session.sisaDetik = 0;
      session.terakhirAktif = now;
    }

    // Compute automatic evaluation
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

  public resetSession(nisn: string): boolean {
    return this.sessions.delete(nisn);
  }

  public getMonitoringList(): Array<StudentSession & { terjawabCount: number }> {
    const now = Date.now();
    const list: Array<StudentSession & { terjawabCount: number }> = [];

    this.sessions.forEach((session) => {
      // If student hasn't pinged in 30 seconds and not finished, mark as 'terputus'
      let currentStatus = session.status;
      if (currentStatus === 'mengerjakan' && now - session.terakhirAktif > 30000) {
        currentStatus = 'terputus';
      }

      // Check if time expired
      const elapsed = Math.floor((now - session.waktuMulai) / 1000);
      const total = session.durasiMenit * 60;
      const sisa = Math.max(0, total - elapsed);
      if (currentStatus === 'mengerjakan' && sisa <= 0) {
        this.finishSession(session.nisn);
        currentStatus = 'selesai';
      }

      const terjawabCount = Object.keys(session.jawaban).filter((k) =>
        isQuestionAnswered(Number(k), session.jawaban[Number(k)])
      ).length;

      list.push({
        ...session,
        status: currentStatus,
        sisaDetik: session.status === 'selesai' ? 0 : sisa,
        terjawabCount,
      });
    });

    // Sort by recent activity
    return list.sort((a, b) => b.terakhirAktif - a.terakhirAktif);
  }

  public getAllResults(): ExamResult[] {
    const results: ExamResult[] = [];
    this.sessions.forEach((sess) => {
      if (sess.hasil) {
        results.push(sess.hasil);
      }
    });
    return results.sort((a, b) => b.skor - a.skor);
  }
}

export const cbtStorage = new CBTStorage();
