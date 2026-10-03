import { Router } from 'express';
import type { Request, Response } from 'express';
import { QUESTIONS_BANK } from '../data/questions.ts';
import { cbtStorage } from './storage.ts';

export const apiRouter = Router();

// Middleware for admin verification
function verifyAdmin(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers['authorization'];
  if (authHeader === 'Bearer admin-token-123456789') {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Akses khusus Guru / Administrator ditolak.' });
}

// 1. Get Exam Info
apiRouter.get('/exam/info', (req: Request, res: Response) => {
  const settings = cbtStorage.getSettings();
  res.json({
    success: true,
    data: {
      ...settings,
      totalSoal: QUESTIONS_BANK.length,
    },
  });
});

// 2. Get Questions (sanitized for students, complete for admin)
apiRouter.get('/exam/questions', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const isAdmin = authHeader === 'Bearer admin-token-123456789';

  if (isAdmin) {
    return res.json({
      success: true,
      data: QUESTIONS_BANK,
    });
  }

  // Student view: sanitize answer key and explanations
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
    pernyataanTabel: q.pernyataanTabel
      ? q.pernyataanTabel.map((p) => ({ id: p.id, teks: p.teks, kunci: '' }))
      : undefined,
  }));

  res.json({
    success: true,
    data: sanitized,
  });
});

// 3. Student Login
apiRouter.post('/student/login', (req: Request, res: Response) => {
  const { nisn, nama } = req.body;
  const settings = cbtStorage.getSettings();

  if (!settings.isOpen) {
    return res.status(403).json({
      success: false,
      message: 'Ujian saat ini sedang ditutup oleh Guru / Pengawas.',
    });
  }

  if (!nisn || !nama || typeof nisn !== 'string' || typeof nama !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Nama dan NISN wajib diisi dengan benar.',
    });
  }

  const cleanNisn = nisn.trim();
  const cleanNama = nama.trim();

  if (cleanNisn.length < 4) {
    return res.status(400).json({
      success: false,
      message: 'NISN harus memiliki minimal 4 karakter numerik.',
    });
  }

  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  const session = cbtStorage.startOrResumeSession(cleanNisn, cleanNama, clientIp, userAgent);

  res.json({
    success: true,
    message: session.status === 'selesai' ? 'Ujian sudah diselesaikan sebelumnya.' : 'Berhasil masuk ke ruang ujian.',
    session,
  });
});

// 4. Student Heartbeat / Sync
apiRouter.post('/student/sync', (req: Request, res: Response) => {
  const { nisn, jawaban, raguRagu, sisaDetik } = req.body;

  if (!nisn) {
    return res.status(400).json({ success: false, message: 'NISN diperlukan.' });
  }

  const updatedSession = cbtStorage.syncSession(
    nisn,
    jawaban || {},
    raguRagu || {},
    sisaDetik
  );

  if (!updatedSession) {
    return res.status(404).json({ success: false, message: 'Sesi ujian tidak ditemukan.' });
  }

  res.json({
    success: true,
    session: updatedSession,
  });
});

// 5. Student Submit
apiRouter.post('/student/submit', (req: Request, res: Response) => {
  const { nisn, jawaban } = req.body;

  if (!nisn) {
    return res.status(400).json({ success: false, message: 'NISN diperlukan.' });
  }

  const finishedSession = cbtStorage.finishSession(nisn, jawaban);

  res.json({
    success: true,
    message: 'Ujian berhasil diselesaikan!',
    session: finishedSession,
    hasil: finishedSession.hasil,
  });
});

// 6. Student Result
apiRouter.get('/student/result/:nisn', (req: Request, res: Response) => {
  const { nisn } = req.params;
  const session = cbtStorage.getSession(nisn);

  if (!session || !session.hasil) {
    return res.status(404).json({ success: false, message: 'Hasil ujian belum tersedia atau tidak ditemukan.' });
  }

  res.json({
    success: true,
    hasil: session.hasil,
  });
});

// 7. Admin Login
apiRouter.post('/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (username === 'administrator' && password === '123456789') {
    return res.json({
      success: true,
      message: 'Login Administrator berhasil.',
      token: 'admin-token-123456789',
      user: {
        role: 'admin',
        nama: 'Administrator Guru / Pengawas',
      },
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Username atau password salah! (Gunakan username: administrator & password: 123456789)',
  });
});

// 8. Admin Live Monitoring
apiRouter.get('/admin/monitoring', verifyAdmin, (req: Request, res: Response) => {
  const monitoringList = cbtStorage.getMonitoringList();
  const settings = cbtStorage.getSettings();

  const totalSiswa = monitoringList.length;
  const sedangMengerjakan = monitoringList.filter((s) => s.status === 'mengerjakan').length;
  const selesai = monitoringList.filter((s) => s.status === 'selesai').length;
  const terputus = monitoringList.filter((s) => s.status === 'terputus').length;

  const skorList = monitoringList
    .filter((s) => s.hasil)
    .map((s) => s.hasil!.skor);

  const avgScore = skorList.length > 0
    ? Math.round((skorList.reduce((a, b) => a + b, 0) / skorList.length) * 10) / 10
    : 0;
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
        minScore,
      },
      settings,
    },
  });
});

// 9. Admin Reset Student Session
apiRouter.post('/admin/reset', verifyAdmin, (req: Request, res: Response) => {
  const { nisn } = req.body;
  if (!nisn) return res.status(400).json({ success: false, message: 'NISN diperlukan.' });

  const deleted = cbtStorage.resetSession(nisn);
  res.json({
    success: true,
    message: deleted ? `Sesi ujian murid NISN ${nisn} telah berhasil direset.` : 'Murid tidak ditemukan.',
  });
});

// 10. Admin Force Finish
apiRouter.post('/admin/force-finish', verifyAdmin, (req: Request, res: Response) => {
  const { nisn } = req.body;
  if (!nisn) return res.status(400).json({ success: false, message: 'NISN diperlukan.' });

  const finished = cbtStorage.finishSession(nisn);
  res.json({
    success: true,
    message: `Ujian murid ${finished.nama} telah dipaksa selesai oleh pengawas.`,
    session: finished,
  });
});

// 11. Admin Update Settings
apiRouter.post('/admin/settings', verifyAdmin, (req: Request, res: Response) => {
  const updated = cbtStorage.updateSettings(req.body);
  res.json({
    success: true,
    message: 'Pengaturan ujian berhasil diperbarui.',
    data: updated,
  });
});

// 12. Admin Export CSV
apiRouter.get('/admin/export-csv', verifyAdmin, (req: Request, res: Response) => {
  const results = cbtStorage.getAllResults();

  let csv = 'NISN,Nama,Waktu Mulai,Waktu Selesai,Durasi (Detik),Total Soal,Benar,Salah,Kosong,Skor Akhir,Predikat,Verbal (%),Kuantitatif (%),Logika (%)\n';

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
      r.kategoriBreakdown.Logika.persentase,
    ].join(',');
    csv += row + '\n';
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="Rekap_Nilai_CBT_TKA.csv"');
  res.send('\uFEFF' + csv); // with UTF-8 BOM for Excel
});
