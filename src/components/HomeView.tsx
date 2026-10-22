import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Plus,
  FileSpreadsheet,
  Calendar,
  BookOpen,
  BarChart3,
  Users,
  Clock,
  Bell,
  Sparkles,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Heart,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Sun,
  Moon,
  ChevronRight,
  User,
  Scale,
} from 'lucide-react';
import { DailyBPRecord } from '../types/bp';
import { Member } from '../types/member';
import { User as FirebaseUser } from 'firebase/auth';
import { AriyawarinLogo } from './AriyawarinLogo';
import { computeDailyMetrics, classifyBP, formatThaiDate } from '../utils/bpClassification';
import { calculateBMI } from '../utils/bmi';
import { ActiveTab } from './Navbar';

interface HomeViewProps {
  records: DailyBPRecord[];
  allRecords: DailyBPRecord[];
  members: Member[];
  activeMember: Member | null;
  onSelectMember: (id: string) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenLogModal: () => void;
  onOpenBrandModal: () => void;
  onOpenNotificationModal: () => void;
  onOpenCsvExport?: () => void;
  googleUser: FirebaseUser | null;
  onGoogleLogout: () => void;
}

const THAI_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export const HomeView: React.FC<HomeViewProps> = ({
  records,
  members,
  activeMember,
  onSelectMember,
  onNavigateTab,
  onOpenLogModal,
  onOpenBrandModal,
  onOpenNotificationModal,
  onOpenCsvExport,
  googleUser,
  onGoogleLogout,
}) => {
  // Real-time Live Clock State
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Time calculations
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  const dayOfWeek = THAI_DAYS[currentTime.getDay()];
  const thaiDate = currentTime.getDate();
  const thaiMonth = THAI_MONTHS[currentTime.getMonth()];
  const thaiYear = currentTime.getFullYear() + 543;
  const gregorianYear = currentTime.getFullYear();

  // Dynamic Salutation based on real time
  const timeGreeting = useMemo(() => {
    if (hours >= 5 && hours < 12) return 'สวัสดีตอนเช้า';
    if (hours >= 12 && hours < 17) return 'สวัสดีตอนบ่าย';
    if (hours >= 17 && hours < 21) return 'สวัสดีตอนเย็น';
    return 'ราตรีสวัสดิ์';
  }, [hours]);

  // Current Measurement Slot Context
  const currentSlot = useMemo(() => {
    const totalMins = hours * 60 + minutes;
    if (totalMins >= 5 * 60 && totalMins <= 11 * 60 + 30) {
      return {
        label: 'ช่วงเวลาวัดรอบเช้า (ตื่นนอน/ก่อนอาหาร)',
        icon: Sun,
        color: 'text-amber-600 bg-amber-50 border-amber-200',
      };
    }
    if (totalMins >= 15 * 60 && totalMins <= 23 * 60) {
      return {
        label: 'ช่วงเวลาวัดรอบเย็น (ก่อนนอน)',
        icon: Moon,
        color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      };
    }
    return {
      label: 'ช่วงเวลาระหว่างวัน (พร้อมสำหรับการบันทึก)',
      icon: Sparkles,
      color: 'text-teal-700 bg-teal-50 border-teal-200',
    };
  }, [hours, minutes]);

  // Today's date string in YYYY-MM-DD
  const todayDateStr = useMemo(() => {
    const y = currentTime.getFullYear();
    const m = String(currentTime.getMonth() + 1).padStart(2, '0');
    const d = String(currentTime.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [currentTime]);

  // Today's record for active member
  const todayRecord = useMemo(() => {
    if (!activeMember) return null;
    return records.find((r) => r.date === todayDateStr && (r.memberId || 'mem-1') === activeMember.id) || null;
  }, [records, todayDateStr, activeMember]);

  // Latest record overall for active member
  const latestRecord = useMemo(() => {
    if (records.length === 0) return null;
    return [...records].sort((a, b) => b.date.localeCompare(a.date))[0];
  }, [records]);

  // Today's or latest metrics
  const metricsToDisplay = useMemo(() => {
    if (todayRecord) return computeDailyMetrics(todayRecord);
    if (latestRecord) return computeDailyMetrics(latestRecord);
    return null;
  }, [todayRecord, latestRecord]);

  // Active Member BMI
  const memberBMI = useMemo(() => {
    if (!activeMember) return null;
    return calculateBMI(activeMember.weight, activeMember.height);
  }, [activeMember]);

  // Quick stats
  const totalRecordedDays = records.length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Hero Welcome & Real-Time Clock Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white shadow-xl border border-teal-800/40 p-6 sm:p-8">
        {/* Glow circles for depth */}
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Brand & Greeting Section */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ระบบสุขภาพอัจฉริยะ มาตรฐานสากล
              </span>

              <button
                onClick={onOpenBrandModal}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 transition cursor-pointer"
                title="คลิกดู App Icon และ System Assets"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>ARIYAWARIN System Assets</span>
              </button>
            </div>

            <div className="flex items-start sm:items-center gap-3.5 flex-wrap">
              <div
                onClick={onOpenBrandModal}
                className="p-2 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/20 transition cursor-pointer shrink-0 shadow-inner group"
                title="คลิกดูรายละเอียดโลโก้และ App Icon"
              >
                <div className="group-hover:scale-105 transition-transform duration-200">
                  <AriyawarinLogo variant="icon" size={46} animated={true} />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-teal-200 font-medium tracking-wide">
                  {timeGreeting}
                </p>
                {activeMember && (
                  <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm text-slate-200">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                        style={{ backgroundColor: activeMember.avatarColor || '#0d9488' }}
                      >
                        {activeMember.firstName.charAt(0)}
                      </span>
                      <span>
                        กำลังใช้งาน: <strong className="text-white">{activeMember.firstName} {activeMember.lastName}</strong>
                      </span>
                      {activeMember.age && <span className="text-slate-400">({activeMember.age} ปี)</span>}
                    </div>

                    {members.length > 1 && (
                      <select
                        value={activeMember.id}
                        onChange={(e) => onSelectMember(e.target.value)}
                        className="bg-white/10 text-teal-200 hover:text-white border border-white/15 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer"
                        title="สลับสมาชิก"
                      >
                        {members.map((m) => (
                          <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                            สลับเป็น: {m.firstName} {m.lastName}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              ยินดีต้อนรับสู่ระบบติดตามและประเมินผลความดันโลหิตส่วนบุคคล บันทึกค่าเช้า-เย็น 4 ครั้ง/วัน พร้อมการคำนวณ MAP & Pulse Pressure และเกณฑ์ทางการแพทย์ AHA/ESC
            </p>
          </div>

          {/* Real-time Live Clock Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 lg:min-w-[300px] flex flex-col justify-between shadow-inner">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-semibold text-teal-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-300" />
                เวลาเรียลไทม์ (Live ICT)
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                กำลังทำงาน
              </span>
            </div>

            {/* Live Big Clock */}
            <div className="py-3 text-center sm:text-left">
              <div className="font-mono text-3xl sm:text-4xl font-extrabold tracking-wider text-white flex items-baseline justify-center sm:justify-start gap-1">
                <span>{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                <span className="text-xs sm:text-sm font-sans font-normal text-teal-300 ml-1">น.</span>
              </div>
              <div className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                วัน{dayOfWeek}ที่ {thaiDate} {thaiMonth} พ.ศ. {thaiYear}
              </div>
              <div className="text-[11px] text-slate-400">
                (ค.ศ. {gregorianYear} • Timezone UTC+7)
              </div>
            </div>

            {/* Current Slot Info */}
            <div className={`mt-2 p-2.5 rounded-xl border text-xs flex items-center gap-2 bg-white/5 border-white/10 text-teal-100`}>
              <currentSlot.icon className="w-4 h-4 text-teal-300 shrink-0" />
              <span className="text-[11px] leading-tight font-medium">{currentSlot.label}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. In-App Health Database & Personalized Account Section */}
      <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-100 border border-teal-200 flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6 text-teal-700" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  ระบบฐานข้อมูลสุขภาพส่วนบุคคล (In-App Database)
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  กรองเฉพาะข้อมูลของคุณแบบเฉพาะเจาะจง
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                บันทึกและจัดการข้อมูลในตัวระบบแบบแยกตามบัญชีผู้ใช้งาน ไม่สามารถเห็นข้อมูลของบุคคลอื่น และข้อมูลไม่สูญหายเมื่อปิดแอป
              </p>

              {activeMember && (
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-600 font-medium flex-wrap">
                  <span className="flex items-center gap-1.5 text-teal-800 font-semibold bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    เจ้าของข้อมูล: {activeMember.firstName} {activeMember.lastName}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>บันทึกแล้วทั้งหมด: <strong className="text-slate-800">{records.length} วัน</strong></span>
                  {memberBMI && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span>BMI: <strong className="text-teal-700">{memberBMI.bmi} ({memberBMI.category.labelTh})</strong></span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center flex-wrap gap-2.5 w-full lg:w-auto justify-start lg:justify-end pt-3 lg:pt-0 border-t border-slate-100 lg:border-t-0">
            <button
              onClick={() => onNavigateTab('realtime')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>บันทึกความดันวันนี้</span>
            </button>

            <button
              onClick={() => onNavigateTab('members')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition shadow-2xs cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-slate-600" />
              <span>ข้อมูลโปรไฟล์ & BMI</span>
            </button>

            {onOpenCsvExport && (
              <button
                onClick={onOpenCsvExport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition shadow-2xs cursor-pointer"
              >
                <span>ส่งออก CSV</span>
              </button>
            )}

            <button
              onClick={onGoogleLogout}
              className="px-3 py-2 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition cursor-pointer"
              title="ออกจากระบบ"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </section>

      {/* 3. Quick Health Snapshot Card for Active Member */}
      <section className="bg-gradient-to-r from-teal-50/70 via-cyan-50/50 to-slate-50 rounded-3xl border border-teal-200/80 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-600 text-white rounded-xl shadow-xs">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                สถานะสุขภาพความดันโลหิตวันนี้
              </h3>
              <p className="text-xs text-slate-500">
                {todayRecord ? 'มีบันทึกข้อมูลของวันนี้แล้ว' : 'ยังไม่มีบันทึกสำหรับวันนี้ แนะนำให้ตรวจวัดรอบเช้าและเย็น'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('realtime')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{todayRecord ? 'อัปเดตค่าวันนี้' : '+ บันทึกความดันตอนนี้'}</span>
            </button>
          </div>
        </div>

        {/* 3-Column Quick Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
          {/* Morning Status */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
              <span className="flex items-center gap-1.5 text-amber-700">
                <Sun className="w-3.5 h-3.5" />
                รอบเช้า (2 ครั้ง)
              </span>
              <span className="text-[10px] text-slate-400">05:00-11:30 น.</span>
            </div>
            {todayRecord && (todayRecord.morning.reading1 || todayRecord.morning.reading2) ? (
              <div>
                <div className="text-xl font-bold font-mono-numbers text-slate-900">
                  {metricsToDisplay?.morningAvg ? (
                    <>
                      {metricsToDisplay.morningAvg.sys}/{metricsToDisplay.morningAvg.dia}
                      <span className="text-xs font-normal text-slate-500 ml-1">mmHg</span>
                    </>
                  ) : (
                    'บันทึกแล้ว'
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  ชีพจร: {metricsToDisplay?.morningAvg?.pul ? `${metricsToDisplay.morningAvg.pul} bpm` : '-'}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-1">
                ยังไม่ได้บันทึกรอบเช้า
              </div>
            )}
          </div>

          {/* Evening Status */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
              <span className="flex items-center gap-1.5 text-indigo-700">
                <Moon className="w-3.5 h-3.5" />
                รอบเย็น (2 ครั้ง)
              </span>
              <span className="text-[10px] text-slate-400">หลัง 15:00 น.</span>
            </div>
            {todayRecord && (todayRecord.evening.reading1 || todayRecord.evening.reading2) ? (
              <div>
                <div className="text-xl font-bold font-mono-numbers text-slate-900">
                  {metricsToDisplay?.eveningAvg ? (
                    <>
                      {metricsToDisplay.eveningAvg.sys}/{metricsToDisplay.eveningAvg.dia}
                      <span className="text-xs font-normal text-slate-500 ml-1">mmHg</span>
                    </>
                  ) : (
                    'บันทึกแล้ว'
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  ชีพจร: {metricsToDisplay?.eveningAvg?.pul ? `${metricsToDisplay.eveningAvg.pul} bpm` : '-'}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-1">
                ยังไม่ได้บันทึกรอบเย็น
              </div>
            )}
          </div>

          {/* Evaluation Category */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
            <div className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
              <span>ระดับการประเมิน AHA</span>
              {metricsToDisplay?.stage && (
                <span className="text-base">{metricsToDisplay.stage.emoji}</span>
              )}
            </div>
            {metricsToDisplay?.stage ? (
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {metricsToDisplay.stage.titleTh}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  MAP: {metricsToDisplay.meanArterialPressure || '-'} • PP: {metricsToDisplay.pulsePressure || '-'}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-1">
                รอข้อมูลเพื่อประเมิน
              </div>
            )}
          </div>

          {/* Active Member BMI & Total Days */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
            <div className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
              <span>ดัชนีมวลกาย (BMI)</span>
              <Scale className="w-3.5 h-3.5 text-teal-600" />
            </div>
            {memberBMI ? (
              <div>
                <div className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <span>BMI {memberBMI.bmi.toFixed(1)}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${memberBMI.category.badgeBg}`}>
                    {memberBMI.category.labelTh}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  บันทึกสะสม {totalRecordedDays} วัน
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-1">
                บันทึกสะสม {totalRecordedDays} วัน
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Portal Navigation Grid (เมนูต่างๆ ที่จะลิ้งไปหน้าต่างๆ) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              เมนูบริการและระบบทั้งหมด (Navigation Portal)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              เลือกเมนูด้านล่างเพื่อเข้าถึงหน้าการทำงานต่างๆ ทุกหน้ามีปุ่มกลับหน้า Home ได้ตลอดเวลา
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Dashboard */}
          <div
            onClick={() => onNavigateTab('dashboard')}
            className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-teal-500/80 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-teal-50 text-teal-700 rounded-xl group-hover:bg-teal-700 group-hover:text-white transition-colors">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/50">
                  กราฟและแนวโน้ม
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                แดชบอร์ดติดตามความดันโลหิต
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                ดูกราฟวิเคราะห์แนวโน้ม 7/14/30 วัน, ค่าเฉลี่ยเช้า-เย็น, MAP, Pulse Pressure และการกระจายตัวตามเกณฑ์สากล
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-teal-700 pt-4 mt-3 border-t border-slate-100">
              <span>เปิดแดชบอร์ด</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Real-time Smart Entry */}
          <div
            onClick={() => onNavigateTab('realtime')}
            className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-emerald-500/80 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/50">
                  บันทึกเรียลไทม์
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                บันทึกความดันวันนี้ (Smart Entry)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                แบบฟอร์มกรอกค่า 4 ครั้ง/วัน ตรวจจับช่วงเวลาอัตโนมัติ คำนวณค่าเฉลี่ยและระดับความดันทันที พร้อมส่งเข้าคลาวด์
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 pt-4 mt-3 border-t border-slate-100">
              <span>เริ่มบันทึกตอนนี้</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Member Registry & BMI */}
          <div
            onClick={() => onNavigateTab('members')}
            className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-blue-500/80 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-blue-50 text-blue-700 rounded-xl group-hover:bg-blue-700 group-hover:text-white transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/50">
                  {members.length} สมาชิก
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-800 transition-colors">
                ทะเบียนสมาชิก & ประเมิน BMI
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                จัดการโปรไฟล์คนในครอบครัวหรือคนไข้ คำนวณ BMI อัตโนมัติตามเกณฑ์เอเชีย และแยกประวัติรายบุคคล
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-blue-700 pt-4 mt-3 border-t border-slate-100">
              <span>จัดการสมาชิก</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Calendar Log View */}
          <div
            onClick={() => onNavigateTab('calendar')}
            className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-violet-500/80 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-violet-50 text-violet-700 rounded-xl group-hover:bg-violet-700 group-hover:text-white transition-colors">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-200/50">
                  ปฏิทินย้อนหลัง
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-800 transition-colors">
                ปฏิทินบันทึกประวัติสุขภาพ
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                ดูประวัติรายวันในมุมมองปฏิทินรายเดือน แสดงจุดสีระดับความดันทุกวัน และเลือกบันทึกย้อนหลังได้สะดวก
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-violet-700 pt-4 mt-3 border-t border-slate-100">
              <span>เปิดปฏิทิน</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: Doctor Report */}
          <div
            onClick={() => onNavigateTab('report')}
            className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-rose-500/80 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl group-hover:bg-rose-700 group-hover:text-white transition-colors">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/50">
                  พร้อมพิมพ์/PDF
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-800 transition-colors">
                รายงานประเมินสำหรับแพทย์
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                รายงานเวชระเบียนทางการแพทย์ พร้อมกราฟแนวโน้ม สถิติสัดส่วน และตารางค่าความดัน 4 ครั้ง/วัน พร้อมชื่อสมาชิกและดาวน์โหลด CSV
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-rose-700 pt-4 mt-3 border-t border-slate-100">
              <span>ดูรายงานแพทย์</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: Medical Guidelines */}
          <div
            onClick={() => onNavigateTab('guidelines')}
            className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-amber-500/80 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-amber-50 text-amber-700 rounded-xl group-hover:bg-amber-700 group-hover:text-white transition-colors">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/50">
                  มาตรฐานสากล
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                คู่มือเกณฑ์มาตรฐานการแพทย์
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                ตารางเกณฑ์ AHA/ACC และ ESC/ESH, คำแนะนำการเตรียมตัวก่อนวัดความดัน, วิธีวัดที่ถูกต้อง และสัญญาณอันตรายฉุกเฉิน
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-amber-700 pt-4 mt-3 border-t border-slate-100">
              <span>อ่านคู่มือแพทย์</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Quick Utility Actions Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Notification Quick Access */}
          <div
            onClick={onOpenNotificationModal}
            className="bg-slate-50 hover:bg-teal-50/50 border border-slate-200 hover:border-teal-300 rounded-2xl p-4 transition flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                  ตั้งเวลาแจ้งเตือนวัดความดัน
                </h4>
                <p className="text-[11px] text-slate-500">
                  แจ้งเตือนรอบเช้าและรอบเย็นอัตโนมัติบนอุปกรณ์ของคุณ
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          {/* App Icon & System Assets Quick Access */}
          <div
            onClick={onOpenBrandModal}
            className="bg-slate-50 hover:bg-teal-50/50 border border-slate-200 hover:border-teal-300 rounded-2xl p-4 transition flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-100 text-teal-800 rounded-xl">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                  App Icon & ARIYAWARIN System Assets
                </h4>
                <p className="text-[11px] text-slate-500">
                  ดูโลโก้ทางการ, App Icon และชุดไอคอนระบบพร้อมดาวน์โหลด
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </section>

      {/* 5. Health Knowledge Card */}
      <section className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>คำแนะนำทางการแพทย์สำหรับการวัดความดันโลหิตที่บ้าน (Home Blood Pressure Monitoring):</span>
        </div>
        <p className="leading-relaxed">
          ควรนั่งพักอย่างน้อย 5 นาทีก่อนวัด, ไม่ดื่มชา กาแฟ หรือสูบบุหรี่ก่อนวัด 30 นาที, วางแขนให้อยู่ระดับเดียวกับหัวใจ และวัดรอบละ 2 ครั้งห่างกัน 1-2 นาที ทั้งช่วงเช้า (หลังตื่นนอน) และช่วงเย็น (ก่อนนอน)
        </p>
      </section>
    </div>
  );
};
