import React, { useState, useEffect } from 'react';
import { DailyBPRecord, SingleReading } from '../types/bp';
import { classifyBP, formatThaiDate } from '../utils/bpClassification';
import { getThaiTimestamp } from '../services/googleSheets';
import {
  X,
  Sun,
  Moon,
  Clock,
  Heart,
  Timer,
  Play,
  RotateCcw,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface LogEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRecord: (record: DailyBPRecord) => void;
  existingRecord?: DailyBPRecord | null;
  targetDate: string;
}

export const LogEntryModal: React.FC<LogEntryModalProps> = ({
  isOpen,
  onClose,
  onSaveRecord,
  existingRecord,
  targetDate,
}) => {
  const [date, setDate] = useState(targetDate);

  // Morning Readings
  const [m1Sys, setM1Sys] = useState<string>('');
  const [m1Dia, setM1Dia] = useState<string>('');
  const [m1Pul, setM1Pul] = useState<string>('');
  const [m1Time, setM1Time] = useState<string>('07:15');

  const [m2Sys, setM2Sys] = useState<string>('');
  const [m2Dia, setM2Dia] = useState<string>('');
  const [m2Pul, setM2Pul] = useState<string>('');
  const [m2Time, setM2Time] = useState<string>('07:17');
  const [mNote, setMNote] = useState<string>('');

  // Evening Readings
  const [e1Sys, setE1Sys] = useState<string>('');
  const [e1Dia, setE1Dia] = useState<string>('');
  const [e1Pul, setE1Pul] = useState<string>('');
  const [e1Time, setE1Time] = useState<string>('18:30');

  const [e2Sys, setE2Sys] = useState<string>('');
  const [e2Dia, setE2Dia] = useState<string>('');
  const [e2Pul, setE2Pul] = useState<string>('');
  const [e2Time, setE2Time] = useState<string>('18:32');
  const [eNote, setENote] = useState<string>('');

  const [overallNote, setOverallNote] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  // Built-in 5-Minute Rest Countdown Timer (เวลารอพักระหว่างครั้ง : 5:00 นาที)
  const [timerSeconds, setTimerSeconds] = useState<number>(300);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [selectedTimerDuration, setSelectedTimerDuration] = useState<number>(300);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  // Sync state with existing record or fresh date
  useEffect(() => {
    if (isOpen) {
      setDate(targetDate);
      if (existingRecord) {
        setM1Sys(existingRecord.morning.reading1?.sys?.toString() || '');
        setM1Dia(existingRecord.morning.reading1?.dia?.toString() || '');
        setM1Pul(existingRecord.morning.reading1?.pul?.toString() || '');
        setM1Time(existingRecord.morning.reading1?.time || '07:15');

        setM2Sys(existingRecord.morning.reading2?.sys?.toString() || '');
        setM2Dia(existingRecord.morning.reading2?.dia?.toString() || '');
        setM2Pul(existingRecord.morning.reading2?.pul?.toString() || '');
        setM2Time(existingRecord.morning.reading2?.time || '07:17');
        setMNote(existingRecord.morning.note || '');

        setE1Sys(existingRecord.evening.reading1?.sys?.toString() || '');
        setE1Dia(existingRecord.evening.reading1?.dia?.toString() || '');
        setE1Pul(existingRecord.evening.reading1?.pul?.toString() || '');
        setE1Time(existingRecord.evening.reading1?.time || '18:30');

        setE2Sys(existingRecord.evening.reading2?.sys?.toString() || '');
        setE2Dia(existingRecord.evening.reading2?.dia?.toString() || '');
        setE2Pul(existingRecord.evening.reading2?.pul?.toString() || '');
        setE2Time(existingRecord.evening.reading2?.time || '18:32');
        setENote(existingRecord.evening.note || '');

        setOverallNote(existingRecord.overallNote || '');
      } else {
        // Reset fields
        setM1Sys('');
        setM1Dia('');
        setM1Pul('');
        setM1Time('07:15');
        setM2Sys('');
        setM2Dia('');
        setM2Pul('');
        setM2Time('07:17');
        setMNote('');

        setE1Sys('');
        setE1Dia('');
        setE1Pul('');
        setE1Time('18:30');
        setE2Sys('');
        setE2Dia('');
        setE2Pul('');
        setE2Time('18:32');
        setENote('');

        setOverallNote('');
      }
      setIsTimerRunning(false);
      setTimerSeconds(300);
      setSelectedTimerDuration(300);
    }
  }, [isOpen, targetDate, existingRecord]);

  if (!isOpen) return null;

  // Real-time calculation of Morning Average
  const morningValues: SingleReading[] = [];
  if (Number(m1Sys) > 0 && Number(m1Dia) > 0) {
    morningValues.push({
      sys: Number(m1Sys),
      dia: Number(m1Dia),
      pul: Number(m1Pul) || 70,
    });
  }
  if (Number(m2Sys) > 0 && Number(m2Dia) > 0) {
    morningValues.push({
      sys: Number(m2Sys),
      dia: Number(m2Dia),
      pul: Number(m2Pul) || 70,
    });
  }
  const morningAvg =
    morningValues.length > 0
      ? {
          sys: Math.round(morningValues.reduce((a, b) => a + b.sys, 0) / morningValues.length),
          dia: Math.round(morningValues.reduce((a, b) => a + b.dia, 0) / morningValues.length),
          pul: Math.round(morningValues.reduce((a, b) => a + b.pul, 0) / morningValues.length),
        }
      : null;

  // Real-time calculation of Evening Average
  const eveningValues: SingleReading[] = [];
  if (Number(e1Sys) > 0 && Number(e1Dia) > 0) {
    eveningValues.push({
      sys: Number(e1Sys),
      dia: Number(e1Dia),
      pul: Number(e1Pul) || 70,
    });
  }
  if (Number(e2Sys) > 0 && Number(e2Dia) > 0) {
    eveningValues.push({
      sys: Number(e2Sys),
      dia: Number(e2Dia),
      pul: Number(e2Pul) || 70,
    });
  }
  const eveningAvg =
    eveningValues.length > 0
      ? {
          sys: Math.round(eveningValues.reduce((a, b) => a + b.sys, 0) / eveningValues.length),
          dia: Math.round(eveningValues.reduce((a, b) => a + b.dia, 0) / eveningValues.length),
          pul: Math.round(eveningValues.reduce((a, b) => a + b.pul, 0) / eveningValues.length),
        }
      : null;

  // Preview Stage
  const previewSys = morningAvg ? morningAvg.sys : eveningAvg ? eveningAvg.sys : 0;
  const previewDia = morningAvg ? morningAvg.dia : eveningAvg ? eveningAvg.dia : 0;
  const previewStage = previewSys > 0 ? classifyBP(previewSys, previewDia) : null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const m1: SingleReading | null =
      Number(m1Sys) > 0 && Number(m1Dia) > 0
        ? {
            sys: Number(m1Sys),
            dia: Number(m1Dia),
            pul: Number(m1Pul) || 70,
            time: m1Time,
          }
        : null;

    const m2: SingleReading | null =
      Number(m2Sys) > 0 && Number(m2Dia) > 0
        ? {
            sys: Number(m2Sys),
            dia: Number(m2Dia),
            pul: Number(m2Pul) || 70,
            time: m2Time,
          }
        : null;

    const e1: SingleReading | null =
      Number(e1Sys) > 0 && Number(e1Dia) > 0
        ? {
            sys: Number(e1Sys),
            dia: Number(e1Dia),
            pul: Number(e1Pul) || 70,
            time: e1Time,
          }
        : null;

    const e2: SingleReading | null =
      Number(e2Sys) > 0 && Number(e2Dia) > 0
        ? {
            sys: Number(e2Sys),
            dia: Number(e2Dia),
            pul: Number(e2Pul) || 70,
            time: e2Time,
          }
        : null;

    if (!m1 && !m2 && !e1 && !e2) {
      setValidationError('กรุณากรอกข้อมูลความดันโลหิตอย่างน้อย 1 ครั้ง');
      return;
    }

    const now = Date.now();
    const timestampFormatted = getThaiTimestamp(now);

    const record: DailyBPRecord = {
      id: existingRecord?.id || `bp-${now}`,
      date,
      memberId: existingRecord?.memberId,
      memberName: existingRecord?.memberName,
      morning: {
        reading1: m1,
        reading2: m2,
        note: mNote.trim() || undefined,
      },
      evening: {
        reading1: e1,
        reading2: e2,
        note: eNote.trim() || undefined,
      },
      overallNote: overallNote.trim() || undefined,
      createdAt: existingRecord?.createdAt || now,
      updatedAt: now,
      lastSavedAt: now,
      timestamp: timestampFormatted,
      syncedToSheets: existingRecord?.syncedToSheets,
    };

    onSaveRecord(record);
    onClose();
  };

  const startTimer = (duration: number) => {
    setSelectedTimerDuration(duration);
    setTimerSeconds(duration);
    setIsTimerRunning(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {existingRecord ? 'แก้ไขบันทึกความดันโลหิต' : 'บันทึกความดันโลหิตประจำวัน'}
            </h2>
            <p className="text-xs text-slate-500">
              วันละ 2 ช่วงเวลา (เช้าและเย็น) ช่วงละ 2 ครั้งตามคำแนะนำทางการแพทย์
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Date Picker Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span>วันที่ทำการวัด:</span>
              <span className="text-teal-700 font-bold">{formatThaiDate(date)}</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          {/* Clinical Rest Countdown Timer Widget (เวลารอพักระหว่างครั้ง : 5:00 นาที) */}
          <div className="p-3.5 bg-teal-50/60 border border-teal-200/80 rounded-xl text-xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-teal-900 font-bold">
                <Timer className="w-4 h-4 text-teal-700" />
                <span>ตัวจับเวลานั่งพักระหว่างครั้ง : 5:00 นาที</span>
              </div>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => startTimer(300)}
                  className={`px-2 py-0.5 rounded cursor-pointer transition ${
                    selectedTimerDuration === 300
                      ? 'bg-teal-700 text-white font-semibold shadow-xs'
                      : 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                  }`}
                >
                  5:00 นาที
                </button>
                <button
                  type="button"
                  onClick={() => startTimer(120)}
                  className={`px-2 py-0.5 rounded cursor-pointer transition ${
                    selectedTimerDuration === 120
                      ? 'bg-teal-700 text-white font-semibold shadow-xs'
                      : 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                  }`}
                >
                  2:00 นาที
                </button>
                <button
                  type="button"
                  onClick={() => startTimer(60)}
                  className={`px-2 py-0.5 rounded cursor-pointer transition ${
                    selectedTimerDuration === 60
                      ? 'bg-teal-700 text-white font-semibold shadow-xs'
                      : 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                  }`}
                >
                  1:00 นาที
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-teal-800">
                {isTimerRunning
                  ? 'กำลังจับเวลาพัก กรุณานั่งนิ่งๆ ผ่อนคลาย ไม่พูดคุย...'
                  : timerSeconds === 0
                  ? 'ครบกำหนดเวลาพักแล้ว พร้อมวัดครั้งที่ 2 ได้ทันที'
                  : 'กดเริ่มเพื่อจับเวลานั่งพักก่อนวัดซ้ำ'}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono-numbers font-bold text-teal-900 text-sm">
                  {Math.floor(timerSeconds / 60)}:
                  {String(timerSeconds % 60).padStart(2, '0')}
                </span>
                {!isTimerRunning ? (
                  <button
                    type="button"
                    onClick={() => setIsTimerRunning(true)}
                    className="p-1 rounded bg-teal-700 text-white hover:bg-teal-800"
                    title="เริ่มจับเวลา"
                  >
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds(selectedTimerDuration);
                    }}
                    className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
                    title="รีเซ็ต"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 1: Morning Measurements (รอบเช้า) */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Sun className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  รอบเช้า (ตื่นนอน / ก่อนทานอาหารเช้า)
                </h3>
              </div>
              {morningAvg && (
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono-numbers">
                  ค่าเฉลี่ยเช้า: {morningAvg.sys}/{morningAvg.dia} ({morningAvg.pul} bpm)
                </span>
              )}
            </div>

            {/* Reading 1 & Reading 2 Form Rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Morning 1 */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>ครั้งที่ 1 (เช้า)</span>
                  <input
                    type="time"
                    value={m1Time}
                    onChange={(e) => setM1Time(e.target.value)}
                    className="text-[11px] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">SYS (ตัวบน)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="120"
                      value={m1Sys}
                      onChange={(e) => setM1Sys(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs font-mono-numbers font-medium bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">DIA (ตัวล่าง)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="80"
                      value={m1Dia}
                      onChange={(e) => setM1Dia(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs font-mono-numbers font-medium bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">PUL (ชีพจร)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="72"
                      value={m1Pul}
                      onChange={(e) => setM1Pul(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs font-mono-numbers font-medium bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Morning 2 */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>ครั้งที่ 2 (เช้า - ห่าง 1-2 นาที)</span>
                  <input
                    type="time"
                    value={m2Time}
                    onChange={(e) => setM2Time(e.target.value)}
                    className="text-[11px] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">SYS (ตัวบน)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="118"
                      value={m2Sys}
                      onChange={(e) => setM2Sys(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs font-mono-numbers font-medium bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">DIA (ตัวล่าง)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="78"
                      value={m2Dia}
                      onChange={(e) => setM2Dia(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs font-mono-numbers font-medium bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">PUL (ชีพจร)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="70"
                      value={m2Pul}
                      onChange={(e) => setM2Pul(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs font-mono-numbers font-medium bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <input
              type="text"
              placeholder="หมายเหตุรอบเช้า (เช่น นอนหลับสบาย, ดื่มกาแฟก่อนวัด, ปัสสาวะก่อนวัด)"
              value={mNote}
              onChange={(e) => setMNote(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          {/* Section 2: Evening Measurements (รอบเย็น) */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Moon className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  รอบเย็น (ก่อนเข้านอน / หลังพักผ่อน)
                </h3>
              </div>
              {eveningAvg && (
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono-numbers">
                  ค่าเฉลี่ยเย็น: {eveningAvg.sys}/{eveningAvg.dia} ({eveningAvg.pul} bpm)
                </span>
              )}
            </div>

            {/* Reading 1 & Reading 2 Form Rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Evening 1 */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>ครั้งที่ 1 (เย็น)</span>
                  <input
                    type="time"
                    value={e1Time}
                    onChange={(e) => setE1Time(e.target.value)}
                    className="text-[11px] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">SYS (ตัวบน)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="122"
                      value={e1Sys}
                      onChange={(e) => setE1Sys(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs font-mono-numbers font-medium bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">DIA (ตัวล่าง)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="80"
                      value={e1Dia}
                      onChange={(e) => setE1Dia(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs font-mono-numbers font-medium bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">PUL (ชีพจร)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="74"
                      value={e1Pul}
                      onChange={(e) => setE1Pul(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs font-mono-numbers font-medium bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Evening 2 */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>ครั้งที่ 2 (เย็น - ห่าง 1-2 นาที)</span>
                  <input
                    type="time"
                    value={e2Time}
                    onChange={(e) => setE2Time(e.target.value)}
                    className="text-[11px] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">SYS (ตัวบน)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="120"
                      value={e2Sys}
                      onChange={(e) => setE2Sys(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs font-mono-numbers font-medium bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">DIA (ตัวล่าง)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="79"
                      value={e2Dia}
                      onChange={(e) => setE2Dia(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs font-mono-numbers font-medium bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">PUL (ชีพจร)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="72"
                      value={e2Pul}
                      onChange={(e) => setE2Pul(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs font-mono-numbers font-medium bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <input
              type="text"
              placeholder="หมายเหตุรอบเย็น (เช่น ออกกำลังกายเสร็จพัก 45 นาที, ทานยาลดความดันแล้ว)"
              value={eNote}
              onChange={(e) => setENote(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          {/* Daily Overall Note */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              บันทึกสุขภาพหรืออาการเพิ่มเติมประจำวัน
            </label>
            <textarea
              rows={2}
              placeholder="เช่น มีอาการมึนศีรษะเล็กน้อย, ทานอาหารรสจัด, รู้สึกผ่อนคลายดี"
              value={overallNote}
              onChange={(e) => setOverallNote(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          {/* Live Preview Assessment Badge */}
          {previewStage && (
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-600">การประเมินเบื้องต้นจากการกรอก:</span>
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: previewStage.accentColor }}
                ></span>
                <span className="font-bold text-slate-900">{previewStage.titleTh}</span>
                <span className="text-slate-500">({previewStage.titleEn})</span>
              </div>
            </div>
          )}

          {/* Action Buttons (Sticky Footer for comfortable one-hand access on mobile) */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md -mx-5 -mb-6 px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-3 mt-4 z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors min-h-[40px]"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 active:scale-[0.98] rounded-lg transition-all shadow-sm min-h-[40px]"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>บันทึกข้อมูล</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
