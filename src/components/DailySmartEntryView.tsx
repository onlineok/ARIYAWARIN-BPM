import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Calendar,
  Sun,
  Moon,
  Heart,
  Timer,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ExternalLink,
  Users,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Activity,
  Play,
  RotateCcw,
  Bell,
  BellRing,
} from 'lucide-react';
import { DailyBPRecord, SingleReading } from '../types/bp';
import { Member } from '../types/member';
import { classifyBP, getThaiTimestamp } from '../utils/bpClassification';
import { calculateBMI } from '../utils/bmi';
import { BackToHomeButton } from './BackToHomeButton';

interface DailySmartEntryViewProps {
  records: DailyBPRecord[];
  members: Member[];
  activeMemberId: string;
  onSelectMember: (id: string) => void;
  onSaveRecord: (record: DailyBPRecord) => void;
  onConnectGoogle?: () => void;
  isGoogleConnected?: boolean;
  onOpenNotificationSettings?: () => void;
  onNavigateHome?: () => void;
}

export const DailySmartEntryView: React.FC<DailySmartEntryViewProps> = ({
  records,
  members,
  activeMemberId,
  onSelectMember,
  onSaveRecord,
  onConnectGoogle,
  isGoogleConnected,
  onOpenNotificationSettings,
  onNavigateHome,
}) => {
  // Real-time Live Clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format real-time Thai Date & Clock
  const thaiDateString = useMemo(() => {
    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
    ];
    const dayName = days[currentTime.getDay()];
    const dateNum = currentTime.getDate();
    const monthName = months[currentTime.getMonth()];
    const yearBuddhist = currentTime.getFullYear() + 543;
    return `วัน${dayName}ที่ ${dateNum} ${monthName} พ.ศ. ${yearBuddhist}`;
  }, [currentTime]);

  const clockString = useMemo(() => {
    return currentTime.toLocaleTimeString('th-TH', { hour12: false });
  }, [currentTime]);

  // Current Date in YYYY-MM-DD
  const todayDateStr = useMemo(() => {
    const y = currentTime.getFullYear();
    const m = String(currentTime.getMonth() + 1).padStart(2, '0');
    const d = String(currentTime.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [currentTime]);

  // Determine automatic time slot based on user rules:
  // - 05:00 - 11:30: Morning Slot
  // - After 15:00: Evening Slot
  // - 11:31 - 14:59: Afternoon (defaults to morning or evening view based on preference)
  const currentSlotDetected = useMemo<'morning' | 'evening' | 'afternoon'>(() => {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    const minutesTotal = hour * 60 + minute;

    const morningStart = 5 * 60; // 05:00
    const morningEnd = 11 * 60 + 30; // 11:30
    const eveningStart = 15 * 60; // 15:00

    if (minutesTotal >= morningStart && minutesTotal <= morningEnd) {
      return 'morning';
    } else if (minutesTotal >= eveningStart) {
      return 'evening';
    } else {
      return 'afternoon';
    }
  }, [currentTime]);

  // Active view period (auto-selected by current time, but user can toggle)
  const [activePeriod, setActivePeriod] = useState<'morning' | 'evening'>(() => {
    const h = new Date().getHours();
    const m = new Date().getMinutes();
    const total = h * 60 + m;
    return total >= 15 * 60 ? 'evening' : 'morning';
  });

  // Automatically switch active tab when entering slots
  useEffect(() => {
    if (currentSlotDetected === 'morning') {
      setActivePeriod('morning');
    } else if (currentSlotDetected === 'evening') {
      setActivePeriod('evening');
    }
  }, [currentSlotDetected]);

  // Active Member
  const activeMember = members.find((m) => m.id === activeMemberId) || members[0] || null;
  const activeMemberBMI = activeMember ? calculateBMI(activeMember.weight, activeMember.height) : null;

  // Find existing record for today & active member
  const existingRecord = useMemo(() => {
    if (!activeMember) return null;
    return (
      records.find((r) => r.date === todayDateStr && (r.memberId || 'mem-1') === activeMember.id) ||
      null
    );
  }, [records, todayDateStr, activeMember]);

  // Form State for Morning
  const [m1Sys, setM1Sys] = useState<number | ''>('');
  const [m1Dia, setM1Dia] = useState<number | ''>('');
  const [m1Pul, setM1Pul] = useState<number | ''>('');

  const [m2Sys, setM2Sys] = useState<number | ''>('');
  const [m2Dia, setM2Dia] = useState<number | ''>('');
  const [m2Pul, setM2Pul] = useState<number | ''>('');
  const [mNote, setMNote] = useState('');

  // Form State for Evening
  const [e1Sys, setE1Sys] = useState<number | ''>('');
  const [e1Dia, setE1Dia] = useState<number | ''>('');
  const [e1Pul, setE1Pul] = useState<number | ''>('');

  const [e2Sys, setE2Sys] = useState<number | ''>('');
  const [e2Dia, setE2Dia] = useState<number | ''>('');
  const [e2Pul, setE2Pul] = useState<number | ''>('');
  const [eNote, setENote] = useState('');

  // Sync / Save Feedback State
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
    timestamp?: string;
    sheetUrl?: string;
  } | null>(null);

  // Load existing readings if already recorded for today
  useEffect(() => {
    if (existingRecord) {
      if (existingRecord.morning.reading1) {
        setM1Sys(existingRecord.morning.reading1.sys);
        setM1Dia(existingRecord.morning.reading1.dia);
        setM1Pul(existingRecord.morning.reading1.pul);
      }
      if (existingRecord.morning.reading2) {
        setM2Sys(existingRecord.morning.reading2.sys);
        setM2Dia(existingRecord.morning.reading2.dia);
        setM2Pul(existingRecord.morning.reading2.pul);
      }
      if (existingRecord.morning.note) setMNote(existingRecord.morning.note);

      if (existingRecord.evening.reading1) {
        setE1Sys(existingRecord.evening.reading1.sys);
        setE1Dia(existingRecord.evening.reading1.dia);
        setE1Pul(existingRecord.evening.reading1.pul);
      }
      if (existingRecord.evening.reading2) {
        setE2Sys(existingRecord.evening.reading2.sys);
        setE2Dia(existingRecord.evening.reading2.dia);
        setE2Pul(existingRecord.evening.reading2.pul);
      }
      if (existingRecord.evening.note) setENote(existingRecord.evening.note);
    }
  }, [existingRecord, todayDateStr]);

  // Rest Timer State (5 minutes interval between reading 1 and reading 2: 5:00 นาที)
  const [restSeconds, setRestSeconds] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [hasTimerCompleted, setHasTimerCompleted] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds((prev) => {
          if (prev <= 1) {
            setHasTimerCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (restSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, restSeconds]);

  const startRestTimer = (seconds: number = 300) => {
    setRestSeconds(seconds);
    setIsTimerRunning(true);
    setHasTimerCompleted(false);
  };

  const resetRestTimer = () => {
    setIsTimerRunning(false);
    setRestSeconds(300);
    setHasTimerCompleted(false);
  };

  // Check if Morning round is fully filled (Round 1 & Round 2 have SYS, DIA, PUL)
  const isMorningComplete = useMemo(() => {
    return Boolean(
      m1Sys && m1Dia && m1Pul &&
      m2Sys && m2Dia && m2Pul
    );
  }, [m1Sys, m1Dia, m1Pul, m2Sys, m2Dia, m2Pul]);

  // Check if Evening round is fully filled
  const isEveningComplete = useMemo(() => {
    return Boolean(
      e1Sys && e1Dia && e1Pul &&
      e2Sys && e2Dia && e2Pul
    );
  }, [e1Sys, e1Dia, e1Pul, e2Sys, e2Dia, e2Pul]);

  // Compute Averages in real-time
  const morningAvg = useMemo(() => {
    const list: SingleReading[] = [];
    if (m1Sys && m1Dia && m1Pul) list.push({ sys: Number(m1Sys), dia: Number(m1Dia), pul: Number(m1Pul) });
    if (m2Sys && m2Dia && m2Pul) list.push({ sys: Number(m2Sys), dia: Number(m2Dia), pul: Number(m2Pul) });
    if (list.length === 0) return null;
    return {
      sys: Math.round(list.reduce((acc, c) => acc + c.sys, 0) / list.length),
      dia: Math.round(list.reduce((acc, c) => acc + c.dia, 0) / list.length),
      pul: Math.round(list.reduce((acc, c) => acc + c.pul, 0) / list.length),
      stage: classifyBP(
        Math.round(list.reduce((acc, c) => acc + c.sys, 0) / list.length),
        Math.round(list.reduce((acc, c) => acc + c.dia, 0) / list.length)
      ),
    };
  }, [m1Sys, m1Dia, m1Pul, m2Sys, m2Dia, m2Pul]);

  const eveningAvg = useMemo(() => {
    const list: SingleReading[] = [];
    if (e1Sys && e1Dia && e1Pul) list.push({ sys: Number(e1Sys), dia: Number(e1Dia), pul: Number(e1Pul) });
    if (e2Sys && e2Dia && e2Pul) list.push({ sys: Number(e2Sys), dia: Number(e2Dia), pul: Number(e2Pul) });
    if (list.length === 0) return null;
    return {
      sys: Math.round(list.reduce((acc, c) => acc + c.sys, 0) / list.length),
      dia: Math.round(list.reduce((acc, c) => acc + c.dia, 0) / list.length),
      pul: Math.round(list.reduce((acc, c) => acc + c.pul, 0) / list.length),
      stage: classifyBP(
        Math.round(list.reduce((acc, c) => acc + c.sys, 0) / list.length),
        Math.round(list.reduce((acc, c) => acc + c.dia, 0) / list.length)
      ),
    };
  }, [e1Sys, e1Dia, e1Pul, e2Sys, e2Dia, e2Pul]);

  // Handle Save and Immediate Sync to Google Sheets
  const handleSaveAndSync = async (targetPeriod: 'morning' | 'evening') => {
    setIsSaving(true);
    setSyncStatusMsg(null);
    const saveTimeEpoch = Date.now();
    const saveTimestampTh = getThaiTimestamp(saveTimeEpoch);

    try {
      const recordToSave: DailyBPRecord = {
        id: existingRecord?.id || `bp-${saveTimeEpoch}`,
        date: todayDateStr,
        memberId: activeMember?.id,
        memberName: activeMember ? `${activeMember.firstName} ${activeMember.lastName}` : 'ทั่วไป',
        createdAt: existingRecord?.createdAt || saveTimeEpoch,
        updatedAt: saveTimeEpoch,
        lastSavedAt: saveTimeEpoch,
        timestamp: saveTimestampTh,
        morning: {
          reading1:
            m1Sys && m1Dia && m1Pul
              ? { sys: Number(m1Sys), dia: Number(m1Dia), pul: Number(m1Pul), time: clockString.slice(0, 5) }
              : existingRecord?.morning.reading1 || null,
          reading2:
            m2Sys && m2Dia && m2Pul
              ? { sys: Number(m2Sys), dia: Number(m2Dia), pul: Number(m2Pul), time: clockString.slice(0, 5) }
              : existingRecord?.morning.reading2 || null,
          note: mNote || existingRecord?.morning.note,
        },
        evening: {
          reading1:
            e1Sys && e1Dia && e1Pul
              ? { sys: Number(e1Sys), dia: Number(e1Dia), pul: Number(e1Pul), time: clockString.slice(0, 5) }
              : existingRecord?.evening.reading1 || null,
          reading2:
            e2Sys && e2Dia && e2Pul
              ? { sys: Number(e2Sys), dia: Number(e2Dia), pul: Number(e2Pul), time: clockString.slice(0, 5) }
              : existingRecord?.evening.reading2 || null,
          note: eNote || existingRecord?.evening.note,
        },
        overallNote: existingRecord?.overallNote,
        syncedToSheets: false,
      };

      // Save directly to in-app database
      onSaveRecord(recordToSave);

      setSyncStatusMsg({
        type: 'success',
        text: `บันทึกข้อมูลรอบ${targetPeriod === 'morning' ? 'เช้า' : 'เย็น'} ลงในฐานข้อมูลส่วนบุคคลเรียบร้อยแล้ว!`,
        timestamp: saveTimestampTh,
      });
    } catch (err: any) {
      console.error('Error saving record', err);
      setSyncStatusMsg({
        type: 'error',
        text: `เกิดข้อผิดพลาดในการบันทึก: ${err.message || 'กรุณาลองใหม่อีกครั้ง'}`,
        timestamp: saveTimestampTh,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Live Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-teal-800/40 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {onNavigateHome && (
                <BackToHomeButton onNavigateHome={onNavigateHome} />
              )}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[11px] font-semibold tracking-wider text-teal-300">
                  ระบบบันทึกสุขภาพเรียลไทม์
                </span>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
              {thaiDateString}
            </h1>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-white font-mono-numbers text-lg sm:text-xl font-bold tracking-wider">
                <Clock className="w-4 h-4 text-teal-300" />
                <span>{clockString} น.</span>
              </div>

              {/* Slot Detection Badge */}
              {currentSlotDetected === 'morning' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-200 border border-amber-400/30 text-xs font-semibold">
                  <Sun className="w-4 h-4 text-amber-300" />
                  <span>ช่วงเวลาบันทึกรอบเช้า (05:00 - 11:30 น.)</span>
                </div>
              )}

              {currentSlotDetected === 'evening' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-semibold">
                  <Moon className="w-4 h-4 text-indigo-300" />
                  <span>ช่วงเวลาบันทึกรอบเย็น (หลัง 15:00 น.)</span>
                </div>
              )}

              {currentSlotDetected === 'afternoon' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-semibold">
                  <Sparkles className="w-4 h-4 text-teal-300" />
                  <span>ช่วงเวลาระหว่างวัน (สามารถกรอก/บันทึกย้อนหลังได้)</span>
                </div>
              )}

              {onOpenNotificationSettings && (
                <button
                  onClick={onOpenNotificationSettings}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-teal-100 border border-white/20 text-xs font-semibold transition cursor-pointer"
                  title="ตั้งค่าหรือทดสอบการแจ้งเตือน Push Notification"
                >
                  <Bell className="w-3.5 h-3.5 text-teal-300" />
                  <span>ตั้งค่าแจ้งเตือน (05:00-11:30 & 15:00+)</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Member Selection Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 sm:p-4 min-w-[280px]">
            <div className="text-[11px] font-semibold text-teal-200 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-teal-300" />
                สมาชิกที่บันทึก
              </span>
              <span className="text-[10px] text-teal-300/80">คลิกเพื่อเปลี่ยน</span>
            </div>

            {/* Member Dropdown Picker */}
            <select
              value={activeMemberId}
              onChange={(e) => onSelectMember(e.target.value)}
              className="w-full bg-slate-900/90 text-white text-sm font-semibold rounded-xl px-3 py-2 border border-teal-400/40 focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer mb-2.5"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                  {m.firstName} {m.lastName} (อายุ {m.age} ปี)
                </option>
              ))}
            </select>

            {activeMember && activeMemberBMI && (
              <div className="flex items-center justify-between text-xs text-slate-200 pt-2 border-t border-white/10">
                <span>
                  ส่วนสูง: <strong>{activeMember.height}</strong> ซม.
                </span>
                <span>
                  น้ำหนัก: <strong>{activeMember.weight}</strong> กก.
                </span>
                <span className="font-semibold text-teal-300">
                  BMI: {activeMemberBMI.bmi} ({activeMemberBMI.category.labelTh})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sync Status Feedback Toast / Banner */}
      {syncStatusMsg && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center justify-between gap-3 shadow-md animate-in fade-in duration-200 ${
            syncStatusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : syncStatusMsg.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-teal-50 border-teal-200 text-teal-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {syncStatusMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : syncStatusMsg.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <Sparkles className="w-5 h-5 text-teal-600 shrink-0" />
            )}
            <div>
              <span className="font-medium">{syncStatusMsg.text}</span>
              {syncStatusMsg.timestamp && (
                <div className="text-xs opacity-90 font-mono-numbers mt-0.5">
                  ทามสแตมป์ที่บันทึก: <strong>{syncStatusMsg.timestamp}</strong>
                </div>
              )}
            </div>
          </div>

          {syncStatusMsg.sheetUrl && (
            <a
              href={syncStatusMsg.sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition shrink-0"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>เปิดดูในชีต</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* Period Tabs Selector (Morning vs Evening) */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex p-1 bg-slate-200/80 rounded-2xl max-w-md w-full">
          <button
            onClick={() => setActivePeriod('morning')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              activePeriod === 'morning'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sun className={`w-4 h-4 ${activePeriod === 'morning' ? 'text-amber-500' : 'text-slate-400'}`} />
            <span>รอบเช้า (05:00 - 11:30 น.)</span>
            {isMorningComplete && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="ใส่ข้อมูลครบแล้ว" />
            )}
          </button>

          <button
            onClick={() => setActivePeriod('evening')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              activePeriod === 'evening'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Moon className={`w-4 h-4 ${activePeriod === 'evening' ? 'text-indigo-500' : 'text-slate-400'}`} />
            <span>รอบเย็น (หลัง 15:00 น.)</span>
            {isEveningComplete && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="ใส่ข้อมูลครบแล้ว" />
            )}
          </button>
        </div>

        {/* 5-Minute Rest Countdown Timer Widget (เวลารอพักระหว่างครั้ง : 5:00 นาที) */}
        <div className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl shadow-sm text-xs border transition-colors ${
          hasTimerCompleted
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
            : isTimerRunning
            ? 'bg-amber-50/80 border-amber-300 text-amber-900'
            : 'bg-white border-slate-200 text-slate-700'
        }`}>
          <Timer className={`w-4 h-4 ${hasTimerCompleted ? 'text-emerald-600' : 'text-teal-600'}`} />
          <span className="text-slate-600 hidden sm:inline">เวลารอพักระหว่างครั้ง:</span>
          <span className="font-mono-numbers font-bold text-slate-900 text-sm">
            {Math.floor(restSeconds / 60)}:{String(restSeconds % 60).padStart(2, '0')} นาที
          </span>

          {!isTimerRunning ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => startRestTimer(300)}
                className="p-1 px-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition cursor-pointer flex items-center gap-1 shadow-xs"
                title="เริ่มจับเวลาพัก 5:00 นาที"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>เริ่มจับเวลา 5:00 นาที</span>
              </button>
              {restSeconds !== 300 && (
                <button
                  onClick={resetRestTimer}
                  className="p-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition cursor-pointer"
                  title="รีเซ็ตเป็น 5:00 นาที"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-amber-700 font-medium hidden md:inline animate-pulse">
                กำลังพักผ่อน...
              </span>
              <button
                onClick={resetRestTimer}
                className="p-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition cursor-pointer flex items-center gap-1"
                title="หยุด / รีเซ็ต"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="text-[11px]">รีเซ็ต</span>
              </button>
            </div>
          )}

          {hasTimerCompleted && (
            <span className="text-[11px] font-bold text-emerald-700">
              ✓ พักครบ 5 นาทีแล้ว วัดครั้งที่ 2 ได้ทันที
            </span>
          )}
        </div>
      </div>

      {/* Main Data Input Section */}
      {activePeriod === 'morning' ? (
        <div className="bg-white rounded-3xl border border-amber-200/80 shadow-md overflow-hidden">
          {/* Section Header */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/50 border-b border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-inner">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  บันทึกความดันโลหิตรอบเช้า (ครั้งที่ 1 & ครั้งที่ 2)
                </h2>
                <p className="text-xs text-slate-500">
                  วัดภายใน 1 ชั่วโมงหลังตื่นนอน ปัสสาวะเรียบร้อย นั่งพัก 5 นาที ก่อนทานอาหารเช้าหรือกาแฟ
                </p>
              </div>
            </div>

            {morningAvg && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs text-slate-500">ค่าเฉลี่ยเช้า:</span>
                <span className="font-bold text-slate-900 text-sm font-mono-numbers">
                  {morningAvg.sys}/{morningAvg.dia}
                </span>
                <span className="text-xs text-slate-500 font-mono-numbers">({morningAvg.pul} bpm)</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border flex items-center gap-1 ${morningAvg.stage.badgeBg} ${morningAvg.stage.badgeText}`}>
                  <span>{morningAvg.stage.emoji}</span>
                  <span>{morningAvg.stage.titleTh}</span>
                </span>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Morning Reading 1 */}
              <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <span className="font-bold text-slate-800 text-sm">การวัดครั้งที่ 1 (เช้า)</span>
                  </div>
                  <span className="text-[11px] text-slate-500">หน่วย: mmHg / bpm</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      SYS (ตัวบน) *
                    </label>
                    <input
                      type="number"
                      min="60"
                      max="260"
                      value={m1Sys}
                      onChange={(e) => setM1Sys(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="120"
                      className="w-full px-3 py-2.5 text-base font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono-numbers text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      DIA (ตัวล่าง) *
                    </label>
                    <input
                      type="number"
                      min="40"
                      max="160"
                      value={m1Dia}
                      onChange={(e) => setM1Dia(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="80"
                      className="w-full px-3 py-2.5 text-base font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono-numbers text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      PUL (ชีพจร) *
                    </label>
                    <input
                      type="number"
                      min="35"
                      max="220"
                      value={m1Pul}
                      onChange={(e) => setM1Pul(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="72"
                      className="w-full px-3 py-2.5 text-base font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono-numbers text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Morning Reading 2 */}
              <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <span className="font-bold text-slate-800 text-sm">การวัดครั้งที่ 2 (เช้า)</span>
                  </div>
                  <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    เวลารอพักระหว่างครั้ง: 5:00 นาที
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      SYS (ตัวบน) *
                    </label>
                    <input
                      type="number"
                      min="60"
                      max="260"
                      value={m2Sys}
                      onChange={(e) => setM2Sys(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="118"
                      className="w-full px-3 py-2.5 text-base font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono-numbers text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      DIA (ตัวล่าง) *
                    </label>
                    <input
                      type="number"
                      min="40"
                      max="160"
                      value={m2Dia}
                      onChange={(e) => setM2Dia(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="78"
                      className="w-full px-3 py-2.5 text-base font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono-numbers text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      PUL (ชีพจร) *
                    </label>
                    <input
                      type="number"
                      min="35"
                      max="220"
                      value={m2Pul}
                      onChange={(e) => setM2Pul(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="70"
                      className="w-full px-3 py-2.5 text-base font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono-numbers text-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Note input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                บันทึกหมายเหตุรอบเช้า (ไม่บังคับ)
              </label>
              <input
                type="text"
                value={mNote}
                onChange={(e) => setMNote(e.target.value)}
                placeholder="เช่น วัดก่อนทานยาลดความดัน, นอนหลับเต็มอิ่ม 8 ชม."
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Save & Instant Google Sheets Sync Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                {isMorningComplete ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    กรอกข้อมูลรอบเช้าครบทั้ง 2 ครั้งแล้ว พร้อมบันทึก
                  </span>
                ) : (
                  <span>* กรุณากรอกข้อมูล SYS, DIA, PUL ให้ครบทั้ง 2 ครั้งเพื่อเปิดใช้งานปุ่มบันทึก</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleSaveAndSync('morning')}
                disabled={!isMorningComplete || isSaving}
                className={`w-full sm:w-auto px-6 py-3 rounded-2xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                  isMorningComplete && !isSaving
                    ? 'bg-gradient-to-r from-amber-600 to-teal-600 hover:from-amber-700 hover:to-teal-700 text-white shadow-teal-700/20'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>
                  {isSaving
                    ? 'กำลังบันทึกและส่งข้อมูล...'
                    : 'บันทึกข้อมูลรอบเช้า & ส่งไป Google ชีต ทันที'}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-indigo-200/80 shadow-md overflow-hidden">
          {/* Section Header */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/50 border-b border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-inner">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  บันทึกความดันโลหิตรอบเย็น (ครั้งที่ 1 & ครั้งที่ 2)
                </h2>
                <p className="text-xs text-slate-500">
                  วัดช่วงเย็นหรือก่อนเข้านอน (หลังเวลา 15:00 น.) เว้นระยะหลังทานอาหารหรือออกกำลังกายอย่างน้อย 30 นาที
                </p>
              </div>
            </div>

            {eveningAvg && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs text-slate-500">ค่าเฉลี่ยเย็น:</span>
                <span className="font-bold text-slate-900 text-sm font-mono-numbers">
                  {eveningAvg.sys}/{eveningAvg.dia}
                </span>
                <span className="text-xs text-slate-500 font-mono-numbers">({eveningAvg.pul} bpm)</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border flex items-center gap-1 ${eveningAvg.stage.badgeBg} ${eveningAvg.stage.badgeText}`}>
                  <span>{eveningAvg.stage.emoji}</span>
                  <span>{eveningAvg.stage.titleTh}</span>
                </span>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Evening Reading 1 */}
              <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <span className="font-bold text-slate-800 text-sm">การวัดครั้งที่ 1 (เย็น)</span>
                  </div>
                  <span className="text-[11px] text-slate-500">หน่วย: mmHg / bpm</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      SYS (ตัวบน) *
                    </label>
                    <input
                      type="number"
                      min="60"
                      max="260"
                      value={e1Sys}
                      onChange={(e) => setE1Sys(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="122"
                      className="w-full px-3 py-2.5 text-base font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono-numbers text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      DIA (ตัวล่าง) *
                    </label>
                    <input
                      type="number"
                      min="40"
                      max="160"
                      value={e1Dia}
                      onChange={(e) => setE1Dia(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="80"
                      className="w-full px-3 py-2.5 text-base font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono-numbers text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      PUL (ชีพจร) *
                    </label>
                    <input
                      type="number"
                      min="35"
                      max="220"
                      value={e1Pul}
                      onChange={(e) => setE1Pul(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="74"
                      className="w-full px-3 py-2.5 text-base font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono-numbers text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Evening Reading 2 */}
              <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <span className="font-bold text-slate-800 text-sm">การวัดครั้งที่ 2 (เย็น)</span>
                  </div>
                  <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    เวลารอพักระหว่างครั้ง: 5:00 นาที
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      SYS (ตัวบน) *
                    </label>
                    <input
                      type="number"
                      min="60"
                      max="260"
                      value={e2Sys}
                      onChange={(e) => setE2Sys(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="120"
                      className="w-full px-3 py-2.5 text-base font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono-numbers text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      DIA (ตัวล่าง) *
                    </label>
                    <input
                      type="number"
                      min="40"
                      max="160"
                      value={e2Dia}
                      onChange={(e) => setE2Dia(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="79"
                      className="w-full px-3 py-2.5 text-base font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono-numbers text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      PUL (ชีพจร) *
                    </label>
                    <input
                      type="number"
                      min="35"
                      max="220"
                      value={e2Pul}
                      onChange={(e) => setE2Pul(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="72"
                      className="w-full px-3 py-2.5 text-base font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono-numbers text-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Note input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                บันทึกหมายเหตุรอบเย็น (ไม่บังคับ)
              </label>
              <input
                type="text"
                value={eNote}
                onChange={(e) => setENote(e.target.value)}
                placeholder="เช่น วัดหลังอาบน้ำอุ่น, รู้สึกผ่อนคลาย"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Save & Instant Google Sheets Sync Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                {isEveningComplete ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    กรอกข้อมูลรอบเย็นครบทั้ง 2 ครั้งแล้ว พร้อมบันทึก
                  </span>
                ) : (
                  <span>* กรุณากรอกข้อมูล SYS, DIA, PUL ให้ครบทั้ง 2 ครั้งเพื่อเปิดใช้งานปุ่มบันทึก</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleSaveAndSync('evening')}
                disabled={!isEveningComplete || isSaving}
                className={`w-full sm:w-auto px-6 py-3 rounded-2xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                  isEveningComplete && !isSaving
                    ? 'bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white shadow-teal-700/20'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>
                  {isSaving
                    ? 'กำลังบันทึกและส่งข้อมูล...'
                    : 'บันทึกข้อมูลรอบเย็น & ส่งไป Google ชีต ทันที'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
