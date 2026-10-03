import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  BookmarkCheck,
  Check,
  X,
  LayoutGrid,
  Send,
  AlertTriangle,
  Clock,
  CheckSquare,
  Square,
  BookOpen,
  Table as TableIcon,
  HelpCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Question, StudentSession, ExamResult, StudentAnswerValue, OptionId } from '../types/cbt';
import { cbtApi } from '../services/api';
import { formatTime, isQuestionAnswered } from '../utils/scoring';

interface ExamScreenProps {
  session: StudentSession;
  questions: Question[];
  fontSize: 'sm' | 'base' | 'lg';
  onExamFinished: (hasil: ExamResult) => void;
  onUpdateRemainingSeconds: (seconds: number) => void;
  onUpdateAnsweredCount: (count: number) => void;
}

export const ExamScreen: React.FC<ExamScreenProps> = ({
  session,
  questions,
  fontSize,
  onExamFinished,
  onUpdateRemainingSeconds,
  onUpdateAnsweredCount,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, StudentAnswerValue>>(session.jawaban || {});
  const [doubtMap, setDoubtMap] = useState<Record<number, boolean>>(session.raguRagu || {});
  const [remainingSeconds, setRemainingSeconds] = useState<number>(session.sisaDetik || 45 * 60);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAccepted, setConfirmAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeExpiredModal, setTimeExpiredModal] = useState(false);
  const [isStimulusCollapsed, setIsStimulusCollapsed] = useState(false);

  const answersRef = useRef(answers);
  answersRef.current = answers;

  const doubtMapRef = useRef(doubtMap);
  doubtMapRef.current = doubtMap;

  const remainingSecondsRef = useRef(remainingSeconds);
  remainingSecondsRef.current = remainingSeconds;

  const currentQuestion = questions[currentIndex] || questions[0];
  const totalQuestions = questions.length;

  const answeredCount = questions.filter((q) => isQuestionAnswered(q.id, answers[q.id])).length;
  const doubtCount = Object.keys(doubtMap).filter((k) => !!doubtMap[Number(k)]).length;
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);

  // Sync state up to parent for navbar
  useEffect(() => {
    onUpdateRemainingSeconds(remainingSeconds);
  }, [remainingSeconds, onUpdateRemainingSeconds]);

  useEffect(() => {
    onUpdateAnsweredCount(answeredCount);
  }, [answeredCount, onUpdateAnsweredCount]);

  // Primary Final Submit Handler
  const handleFinalSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await cbtApi.submitExam(
        session.nisn,
        session.nama,
        answersRef.current,
        session.waktuMulai
      );
      if (res.success && res.hasil) {
        onExamFinished(res.hasil);
      }
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, session.nisn, session.nama, session.waktuMulai, onExamFinished]);

  // Countdown Timer Interval
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeExpiredModal(true);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleFinalSubmit]);

  // Periodic heartbeat sync to server every 8 seconds for multi-device monitoring
  useEffect(() => {
    const syncInterval = setInterval(() => {
      cbtApi.syncSession(
        session.nisn,
        answersRef.current,
        doubtMapRef.current,
        remainingSecondsRef.current
      );
    }, 8000);

    return () => clearInterval(syncInterval);
  }, [session.nisn]);

  // Option select handler for Pilihan Ganda Tunggal
  const handleSelectSingleOption = (optionId: OptionId) => {
    if (!currentQuestion) return;
    const newAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(newAnswers);
    cbtApi.syncSession(session.nisn, newAnswers, doubtMap, remainingSeconds);
  };

  // Option toggle handler for MCMA Centang (Multiple Checkboxes)
  const handleToggleCheckboxOption = (optionId: OptionId) => {
    if (!currentQuestion) return;
    const currentList = Array.isArray(answers[currentQuestion.id])
      ? (answers[currentQuestion.id] as OptionId[])
      : [];

    let updatedList: OptionId[];
    if (currentList.includes(optionId)) {
      updatedList = currentList.filter((item) => item !== optionId);
    } else {
      updatedList = [...currentList, optionId].sort();
    }

    const newAnswers = { ...answers, [currentQuestion.id]: updatedList };
    setAnswers(newAnswers);
    cbtApi.syncSession(session.nisn, newAnswers, doubtMap, remainingSeconds);
  };

  // Option select handler for MCMA Tabel (Kategori Matrix)
  const handleSelectTableCategory = (statementId: string, categoryValue: string) => {
    if (!currentQuestion) return;
    const currentTableAnswers =
      typeof answers[currentQuestion.id] === 'object' && !Array.isArray(answers[currentQuestion.id])
        ? (answers[currentQuestion.id] as Record<string, string>)
        : {};

    const updatedTable = {
      ...currentTableAnswers,
      [statementId]: categoryValue,
    };

    const newAnswers = { ...answers, [currentQuestion.id]: updatedTable };
    setAnswers(newAnswers);
    cbtApi.syncSession(session.nisn, newAnswers, doubtMap, remainingSeconds);
  };

  const toggleDoubt = () => {
    if (!currentQuestion) return;
    const currentDoubt = !!doubtMap[currentQuestion.id];
    const newDoubt = { ...doubtMap, [currentQuestion.id]: !currentDoubt };
    setDoubtMap(newDoubt);
    cbtApi.syncSession(session.nisn, answers, newDoubt, remainingSeconds);
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
    setIsDrawerOpen(false);
  };

  // Font size styling mappings
  const questionTextClass =
    fontSize === 'sm' ? 'text-base sm:text-lg' : fontSize === 'lg' ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl';
  const optionTextClass =
    fontSize === 'sm' ? 'text-xs sm:text-sm' : fontSize === 'lg' ? 'text-base sm:text-lg' : 'text-sm sm:text-base';

  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isCurrentDoubt = currentQuestion ? !!doubtMap[currentQuestion.id] : false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Mobile Top Navigation Helper bar */}
      <div className="flex items-center justify-between lg:hidden mb-4 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Soal:</span>
          <span className="text-sm font-bold text-slate-900 font-mono">
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Daftar Soal ({answeredCount}/{totalQuestions})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Test Area (Left 8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Question Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
            
            {/* Meta bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-slate-900 text-white font-bold text-sm rounded-lg font-mono">
                  Soal No. {currentIndex + 1}
                </span>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                  {currentQuestion?.kategori}
                </span>

                {/* Question Type Badge */}
                {currentQuestion?.tipeSoal === 'mcma_centang' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                    <CheckSquare className="w-3 h-3" />
                    Pilihan Ganda Kompleks (Centang)
                  </span>
                )}
                {currentQuestion?.tipeSoal === 'mcma_tabel' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    <TableIcon className="w-3 h-3" />
                    Pilihan Ganda Kompleks (Tabel Kategori)
                  </span>
                )}
                {currentQuestion?.tipeSoal === 'pilihan_ganda' && (
                  <span className="hidden sm:inline-flex items-center text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    Pilihan Ganda
                  </span>
                )}
              </div>

              {/* Ragu-ragu badge if active */}
              {isCurrentDoubt && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                  <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                  Ditandai Ragu-Ragu
                </span>
              )}
            </div>

            {/* STIMULUS TEKS BACAAN (Muncul di semua nomor soal yang memiliki stimulus terkait) */}
            {currentQuestion?.bacaan && (
              <div className="rounded-2xl border border-indigo-100 bg-slate-50/70 overflow-hidden shadow-xs">
                {/* Stimulus Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-indigo-50/80 border-b border-indigo-100 text-xs font-bold text-indigo-950">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>{currentQuestion.judulStimulus || 'Teks Stimulus Bacaan Soal'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsStimulusCollapsed(!isStimulusCollapsed)}
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-700 hover:text-indigo-900 font-semibold"
                  >
                    {isStimulusCollapsed ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Buka Teks Bacaan</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Ciutkan</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Stimulus Body Content */}
                {!isStimulusCollapsed && (
                  <div className="p-4 sm:p-5 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line max-h-88 overflow-y-auto pr-3 border-t border-slate-100 font-normal">
                    {currentQuestion.bacaan}
                  </div>
                )}
              </div>
            )}

            {/* Question Text */}
            <div className="text-slate-900 font-semibold leading-relaxed whitespace-pre-line select-none">
              <p className={questionTextClass}>
                {currentQuestion?.pertanyaan}
              </p>
            </div>

            {/* 1. TIPE: PILIHAN GANDA TUNGGAL (A, B, C, D) */}
            {currentQuestion?.tipeSoal === 'pilihan_ganda' && (
              <div className="space-y-3 pt-2">
                {currentQuestion?.pilihan?.map((option) => {
                  const isSelected = currentAnswer === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelectSingleOption(option.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                      }`}
                    >
                      {/* Option Alphabet Box */}
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 font-mono transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {option.id}
                      </div>

                      {/* Option Text */}
                      <div className="flex-1 pt-0.5">
                        <span className={`font-normal text-slate-800 ${optionTextClass}`}>
                          {option.teks}
                        </span>
                      </div>

                      {/* Radio indicator */}
                      <div className="pt-1 text-indigo-600 shrink-0">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 2. TIPE: MCMA CENTANG (CHECKBOX MULTIPLE CHOICE) */}
            {currentQuestion?.tipeSoal === 'mcma_centang' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100">
                  <span className="font-semibold">
                    Klik kotak untuk mencentang. Anda dapat memilih lebih dari satu jawaban benar.
                  </span>
                  <span className="font-mono font-bold">
                    {Array.isArray(currentAnswer) ? currentAnswer.length : 0} dipilih
                  </span>
                </div>

                {currentQuestion?.pilihan?.map((option) => {
                  const selectedList = Array.isArray(currentAnswer) ? (currentAnswer as OptionId[]) : [];
                  const isChecked = selectedList.includes(option.id);

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleToggleCheckboxOption(option.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 cursor-pointer ${
                        isChecked
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                      }`}
                    >
                      {/* Checkbox indicator */}
                      <div className="pt-0.5 shrink-0 text-indigo-600">
                        {isChecked ? (
                          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-md border-2 border-slate-300 bg-white" />
                        )}
                      </div>

                      {/* Option Text */}
                      <div className="flex-1">
                        <span className={`font-normal text-slate-800 ${optionTextClass}`}>
                          {option.teks}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 3. TIPE: MCMA TABEL KATEGORI (MATRIX TABLE CLICK) */}
            {currentQuestion?.tipeSoal === 'mcma_tabel' && currentQuestion.kolomKategori && (
              <div className="space-y-3 pt-2">
                <div className="text-xs text-emerald-800 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 font-semibold">
                  Tentukan pilihan Anda pada tabel di bawah ini. Klik langsung kolom yang sesuai untuk setiap pernyataan!
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
                  <table className="w-full text-left text-xs sm:text-sm divide-y divide-slate-200">
                    <thead className="bg-slate-50 text-slate-700 font-bold">
                      <tr>
                        <th className="py-3 px-3 w-12 text-center">#</th>
                        <th className="py-3 px-4">Pernyataan</th>
                        <th className="py-3 px-4 w-32 sm:w-36 text-center bg-indigo-50/70 text-indigo-900 border-l border-slate-200">
                          {currentQuestion.kolomKategori[0]}
                        </th>
                        <th className="py-3 px-4 w-32 sm:w-36 text-center bg-slate-100 text-slate-800 border-l border-slate-200">
                          {currentQuestion.kolomKategori[1]}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {currentQuestion.pernyataanTabel?.map((stmt) => {
                        const tableAnswers =
                          typeof currentAnswer === 'object' && !Array.isArray(currentAnswer)
                            ? (currentAnswer as Record<string, string>)
                            : {};
                        const selectedVal = tableAnswers[stmt.id];

                        const isCol1Selected = selectedVal === currentQuestion.kolomKategori![0];
                        const isCol2Selected = selectedVal === currentQuestion.kolomKategori![1];

                        return (
                          <tr key={stmt.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-3 text-center font-bold text-slate-700 font-mono">
                              {stmt.id}.
                            </td>
                            <td className="py-3.5 px-4 font-normal text-slate-800 leading-relaxed">
                              {stmt.teks}
                            </td>

                            {/* Col 1 Button Click */}
                            <td
                              onClick={() => handleSelectTableCategory(stmt.id, currentQuestion.kolomKategori![0])}
                              className={`py-3.5 px-4 text-center cursor-pointer border-l border-slate-200 transition-all select-none ${
                                isCol1Selected
                                  ? 'bg-emerald-100/80 font-bold text-emerald-950 ring-2 ring-emerald-500 inset-0'
                                  : 'hover:bg-indigo-50/50'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                                    isCol1Selected
                                      ? 'bg-emerald-600 text-white'
                                      : 'border-2 border-slate-300 bg-white'
                                  }`}
                                >
                                  {isCol1Selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>
                                <span className="text-xs font-semibold">
                                  {currentQuestion.kolomKategori![0]}
                                </span>
                              </div>
                            </td>

                            {/* Col 2 Button Click */}
                            <td
                              onClick={() => handleSelectTableCategory(stmt.id, currentQuestion.kolomKategori![1])}
                              className={`py-3.5 px-4 text-center cursor-pointer border-l border-slate-200 transition-all select-none ${
                                isCol2Selected
                                  ? 'bg-rose-100/80 font-bold text-rose-950 ring-2 ring-rose-500 inset-0'
                                  : 'hover:bg-slate-100/50'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                                    isCol2Selected
                                      ? 'bg-rose-600 text-white'
                                      : 'border-2 border-slate-300 bg-white'
                                  }`}
                                >
                                  {isCol2Selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>
                                <span className="text-xs font-semibold">
                                  {currentQuestion.kolomKategori![1]}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

          {/* Action Navigation Buttons */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            
            {/* Previous Button */}
            <button
              type="button"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            {/* Ragu-Ragu Button */}
            <button
              type="button"
              onClick={toggleDoubt}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all border ${
                isCurrentDoubt
                  ? 'bg-amber-500 border-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <BookmarkCheck className={`w-4 h-4 ${isCurrentDoubt ? 'text-white' : 'text-amber-600'}`} />
              <span>{isCurrentDoubt ? 'Batalkan Ragu-Ragu' : 'Ragu-Ragu'}</span>
            </button>

            {/* Next / Finish Button */}
            {currentIndex < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={goToNext}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Selesaikan Ujian</span>
              </button>
            )}

          </div>

        </div>

        {/* Desktop Sidebar Grid (Right 4 cols on desktop) */}
        <div className="hidden lg:block lg:col-span-4 sticky top-22 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-indigo-600" />
                <span>Navigasi Soal Ujian</span>
              </h2>
              <span className="text-xs font-mono font-bold text-slate-600">
                {answeredCount}/{totalQuestions} Dijawab
              </span>
            </div>

            {/* 30 Question Number Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-[380px] overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const ans = answers[q.id];
                const isAnswered = isQuestionAnswered(q.id, ans);
                const isDoubt = !!doubtMap[q.id];
                const isCurrent = idx === currentIndex;

                let btnStyle = 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200';
                if (isDoubt) {
                  btnStyle = 'bg-amber-400 text-slate-900 border-amber-500 font-bold';
                } else if (isAnswered) {
                  btnStyle = 'bg-indigo-600 text-white border-indigo-700 font-bold shadow-xs';
                }

                // Render small indicator of answer in box
                let badgeText = '';
                if (isAnswered) {
                  if (typeof ans === 'string') {
                    badgeText = ans;
                  } else if (Array.isArray(ans)) {
                    badgeText = `${ans.length}✓`;
                  } else if (typeof ans === 'object') {
                    badgeText = 'TAB';
                  }
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => goToQuestion(idx)}
                    className={`h-11 rounded-xl text-xs flex flex-col items-center justify-center border transition-all cursor-pointer relative ${btnStyle} ${
                      isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                    }`}
                  >
                    <span className="font-mono text-sm leading-none">{idx + 1}</span>
                    {badgeText && (
                      <span className="text-[9px] uppercase leading-none mt-0.5 opacity-90 font-mono font-bold">
                        {badgeText}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-indigo-600 shrink-0" />
                <span>Dijawab ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-amber-400 shrink-0" />
                <span>Ragu ({doubtCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300 shrink-0" />
                <span>Belum ({unansweredCount})</span>
              </div>
            </div>

            {/* Finish exam button from sidebar */}
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Selesaikan Ujian Sekarang</span>
            </button>

          </div>
        </div>

      </div>

      {/* Mobile Drawer Question Grid Modal */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-t-3xl max-h-[85vh] flex flex-col p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Daftar Nomor Soal</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {answeredCount} Terjawab · {doubtCount} Ragu · {unansweredCount} Belum
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2.5 overflow-y-auto py-4">
              {questions.map((q, idx) => {
                const ans = answers[q.id];
                const isAnswered = isQuestionAnswered(q.id, ans);
                const isDoubt = !!doubtMap[q.id];
                const isCurrent = idx === currentIndex;

                let btnStyle = 'bg-slate-100 text-slate-700 border-slate-200';
                if (isDoubt) {
                  btnStyle = 'bg-amber-400 text-slate-900 border-amber-500 font-bold';
                } else if (isAnswered) {
                  btnStyle = 'bg-indigo-600 text-white border-indigo-700 font-bold';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => goToQuestion(idx)}
                    className={`h-12 rounded-xl text-sm flex flex-col items-center justify-center border transition-all ${btnStyle} ${
                      isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                    }`}
                  >
                    <span className="font-mono">{idx + 1}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  setShowConfirmModal(true);
                }}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                Selesaikan Ujian ({answeredCount}/{totalQuestions})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal Before Final Submission */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Konfirmasi Pengumpulan Ujian
                </h3>
                <p className="text-xs text-slate-500">
                  Periksa kembali ringkasan jawaban Anda sebelum mengumpulkan.
                </p>
              </div>
            </div>

            {/* Status breakdown box */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span>Soal Sudah Dijawab:</span>
                <span className="font-bold text-emerald-600 font-mono text-sm">{answeredCount} Soal</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Soal Masih Ragu-Ragu:</span>
                <span className="font-bold text-amber-600 font-mono text-sm">{doubtCount} Soal</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Soal Belum Dijawab:</span>
                <span className="font-bold text-rose-600 font-mono text-sm">{unansweredCount} Soal</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                Peringatan: Masih terdapat {unansweredCount} soal yang belum Anda jawab! Nilai akan dihitung berdasarkan jawaban yang telah diisi.
              </div>
            )}

            {/* Checkbox confirmation */}
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={confirmAccepted}
                onChange={(e) => setConfirmAccepted(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="select-none">
                Saya yakin dan menyatakan telah menyelesaikan ujian ini secara mandiri dan jujur.
              </span>
            </label>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Kembali Mengerjakan
              </button>
              <button
                type="button"
                disabled={!confirmAccepted || isSubmitting}
                onClick={handleFinalSubmit}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {isSubmitting ? 'Mengumpulkan & Menilai...' : 'Ya, Kumpulkan Jawaban'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Expired Modal */}
      {timeExpiredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Waktu Pengerjaan Habis!
            </h3>
            <p className="text-xs text-slate-600">
              Waktu ujian Anda telah habis. Sistem sedang mengumpulkan seluruh jawaban Anda secara otomatis dan menghitung skor akhir...
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
