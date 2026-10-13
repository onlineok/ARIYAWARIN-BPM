import React, { useState, useMemo } from 'react';
import {
  DailyBPRecord,
  ChartViewMode,
  TimeFilterRange,
  BPStageInfo,
} from '../types/bp';
import { Member } from '../types/member';
import { ActiveTab } from './Navbar';
import {
  computeDailyMetrics,
  classifyBP,
  formatThaiDate,
  evaluatePulse,
  getBPEmoji,
  getPulseEmoji,
} from '../utils/bpClassification';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Heart,
  SlidersHorizontal,
  ChevronRight,
  Info,
  CalendarDays,
  ShieldCheck,
  AlertTriangle,
  Download,
  Activity,
  BarChart3,
  Clock,
  Sparkles,
  Calendar,
  Users,
  FileSpreadsheet,
  Bell,
  Stethoscope,
  Droplet,
  Scale,
  Target,
  ArrowRight,
} from 'lucide-react';
import { WeeklyTrendInsightsCard } from './WeeklyTrendInsightsCard';
import { AriyawarinLogo } from './AriyawarinLogo';
import { BackToHomeButton } from './BackToHomeButton';

interface DashboardViewProps {
  records: DailyBPRecord[];
  activeMember?: Member | null;
  onSelectDate: (date: string) => void;
  onOpenLogModal: () => void;
  onOpenCsvExport?: () => void;
  onNavigateTab?: (tab: ActiveTab) => void;
  onOpenBrandModal?: () => void;
  onOpenNotificationModal?: () => void;
}

interface ChartDataPoint {
  date: string;
  timestamp: string;
  label: string; // e.g. "12 ต.ค. เช้า 1"
  sys: number;
  dia: number;
  pul: number;
  stage: BPStageInfo;
  period: 'morning' | 'evening';
  isAverage: boolean;
  readingIndex?: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  records,
  activeMember,
  onSelectDate,
  onOpenLogModal,
  onOpenCsvExport,
  onNavigateTab,
  onOpenBrandModal,
  onOpenNotificationModal,
}) => {
  const [viewMode, setViewMode] = useState<ChartViewMode>('averages');
  const [timeFilter, setTimeFilter] = useState<TimeFilterRange>('14d');
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);

  // Sort records chronologically (oldest to newest for charts)
  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => a.date.localeCompare(b.date));
  }, [records]);

  // Filter records by time range
  const filteredRecords = useMemo(() => {
    if (sortedRecords.length === 0) return [];
    const count = sortedRecords.length;
    switch (timeFilter) {
      case '7d':
        return sortedRecords.slice(Math.max(0, count - 7));
      case '14d':
        return sortedRecords.slice(Math.max(0, count - 14));
      case '30d':
        return sortedRecords.slice(Math.max(0, count - 30));
      case '90d':
        return sortedRecords.slice(Math.max(0, count - 90));
      case 'all':
      default:
        return sortedRecords;
    }
  }, [sortedRecords, timeFilter]);

  // Transform records into chart data points based on viewMode
  const chartPoints = useMemo<ChartDataPoint[]>(() => {
    const points: ChartDataPoint[] = [];

    filteredRecords.forEach((record) => {
      const metrics = computeDailyMetrics(record);

      if (viewMode === 'averages') {
        // 2 points per day: Morning Average & Evening Average
        if (metrics.morningAvg) {
          points.push({
            date: record.date,
            timestamp: `${record.date} 07:00`,
            label: `${formatThaiDate(record.date, { shortMonth: true })} · เช้า (ค่าเฉลี่ย)`,
            sys: metrics.morningAvg.sys,
            dia: metrics.morningAvg.dia,
            pul: metrics.morningAvg.pul,
            stage: classifyBP(metrics.morningAvg.sys, metrics.morningAvg.dia),
            period: 'morning',
            isAverage: true,
          });
        }
        if (metrics.eveningAvg) {
          points.push({
            date: record.date,
            timestamp: `${record.date} 19:00`,
            label: `${formatThaiDate(record.date, { shortMonth: true })} · เย็น (ค่าเฉลี่ย)`,
            sys: metrics.eveningAvg.sys,
            dia: metrics.eveningAvg.dia,
            pul: metrics.eveningAvg.pul,
            stage: classifyBP(metrics.eveningAvg.sys, metrics.eveningAvg.dia),
            period: 'evening',
            isAverage: true,
          });
        }
      } else {
        // 4 points per day: Morning 1, Morning 2, Evening 1, Evening 2
        const m1 = record.morning.reading1;
        const m2 = record.morning.reading2;
        const e1 = record.evening.reading1;
        const e2 = record.evening.reading2;

        if (m1 && m1.sys > 0) {
          points.push({
            date: record.date,
            timestamp: `${record.date} ${m1.time || '07:00'}`,
            label: `${formatThaiDate(record.date, { shortMonth: true })} · เช้า ครั้งที่ 1`,
            sys: m1.sys,
            dia: m1.dia,
            pul: m1.pul,
            stage: classifyBP(m1.sys, m1.dia),
            period: 'morning',
            isAverage: false,
            readingIndex: 1,
          });
        }
        if (m2 && m2.sys > 0) {
          points.push({
            date: record.date,
            timestamp: `${record.date} ${m2.time || '07:05'}`,
            label: `${formatThaiDate(record.date, { shortMonth: true })} · เช้า ครั้งที่ 2`,
            sys: m2.sys,
            dia: m2.dia,
            pul: m2.pul,
            stage: classifyBP(m2.sys, m2.dia),
            period: 'morning',
            isAverage: false,
            readingIndex: 2,
          });
        }
        if (e1 && e1.sys > 0) {
          points.push({
            date: record.date,
            timestamp: `${record.date} ${e1.time || '18:30'}`,
            label: `${formatThaiDate(record.date, { shortMonth: true })} · เย็น ครั้งที่ 1`,
            sys: e1.sys,
            dia: e1.dia,
            pul: e1.pul,
            stage: classifyBP(e1.sys, e1.dia),
            period: 'evening',
            isAverage: false,
            readingIndex: 1,
          });
        }
        if (e2 && e2.sys > 0) {
          points.push({
            date: record.date,
            timestamp: `${record.date} ${e2.time || '18:35'}`,
            label: `${formatThaiDate(record.date, { shortMonth: true })} · เย็น ครั้งที่ 2`,
            sys: e2.sys,
            dia: e2.dia,
            pul: e2.pul,
            stage: classifyBP(e2.sys, e2.dia),
            period: 'evening',
            isAverage: false,
            readingIndex: 2,
          });
        }
      }
    });

    return points;
  }, [filteredRecords, viewMode]);

  // Overall Statistics & Trend Computations
  const stats = useMemo(() => {
    if (chartPoints.length === 0) {
      return {
        avgSys: 0,
        avgDia: 0,
        avgPul: 0,
        inTargetPercent: 0,
        deltaSys: 0,
        deltaDia: 0,
        deltaPul: 0,
        latestStage: null as BPStageInfo | null,
        morningSurgeAvg: 0,
        pulsePressure: 0,
      };
    }

    const totalSys = chartPoints.reduce((acc, p) => acc + p.sys, 0);
    const totalDia = chartPoints.reduce((acc, p) => acc + p.dia, 0);
    const totalPul = chartPoints.reduce((acc, p) => acc + p.pul, 0);
    const n = chartPoints.length;

    const avgSys = Math.round(totalSys / n);
    const avgDia = Math.round(totalDia / n);
    const avgPul = Math.round(totalPul / n);

    // In-target rate (optimal or normal < 130 and < 80)
    const inTargetCount = chartPoints.filter((p) => p.sys < 130 && p.dia < 80).length;
    const inTargetPercent = Math.round((inTargetCount / n) * 100);

    // Trend comparison: latest day vs previous day
    let deltaSys = 0;
    let deltaDia = 0;
    let deltaPul = 0;
    if (filteredRecords.length >= 2) {
      const latest = computeDailyMetrics(filteredRecords[filteredRecords.length - 1]);
      const prev = computeDailyMetrics(filteredRecords[filteredRecords.length - 2]);

      if (latest.dailyAvg && prev.dailyAvg) {
        deltaSys = latest.dailyAvg.sys - prev.dailyAvg.sys;
        deltaDia = latest.dailyAvg.dia - prev.dailyAvg.dia;
        deltaPul = latest.dailyAvg.pul - prev.dailyAvg.pul;
      }
    }

    // Morning Surge average
    const surges: number[] = [];
    filteredRecords.forEach((r) => {
      const m = computeDailyMetrics(r);
      if (m.morningSurge !== null) {
        surges.push(m.morningSurge);
      }
    });
    const morningSurgeAvg =
      surges.length > 0
        ? Math.round(surges.reduce((a, b) => a + b, 0) / surges.length)
        : 0;

    const latestStage = classifyBP(avgSys, avgDia);
    const pulsePressure = avgSys - avgDia;

    return {
      avgSys,
      avgDia,
      avgPul,
      inTargetPercent,
      deltaSys,
      deltaDia,
      deltaPul,
      latestStage,
      morningSurgeAvg,
      pulsePressure,
    };
  }, [chartPoints, filteredRecords]);

  // SVG Chart Dimensions & Scale calculations
  const chartWidth = 960;
  const chartHeight = 340;
  const paddingLeft = 52;
  const paddingRight = 24;
  const paddingTop = 36;
  const paddingBottom = 48;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  // Y-axis scale range (usually 50 to 190 mmHg)
  const minY = 50;
  const maxY = 180;

  const getYCoord = (val: number) => {
    const clamped = Math.max(minY, Math.min(maxY, val));
    return chartHeight - paddingBottom - ((clamped - minY) / (maxY - minY)) * innerHeight;
  };

  const getXCoord = (index: number) => {
    if (chartPoints.length <= 1) return paddingLeft + innerWidth / 2;
    return paddingLeft + (index / (chartPoints.length - 1)) * innerWidth;
  };

  // Generate SVG path strings
  const sysPath = useMemo(() => {
    if (chartPoints.length === 0) return '';
    return chartPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getXCoord(i).toFixed(1)} ${getYCoord(p.sys).toFixed(1)}`)
      .join(' ');
  }, [chartPoints]);

  const diaPath = useMemo(() => {
    if (chartPoints.length === 0) return '';
    return chartPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getXCoord(i).toFixed(1)} ${getYCoord(p.dia).toFixed(1)}`)
      .join(' ');
  }, [chartPoints]);

  const pulPath = useMemo(() => {
    if (chartPoints.length === 0) return '';
    return chartPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getXCoord(i).toFixed(1)} ${getYCoord(p.pul).toFixed(1)}`)
      .join(' ');
  }, [chartPoints]);

  // Standard Guideline Target threshold lines (120 and 80)
  const y120 = getYCoord(120);
  const y80 = getYCoord(80);
  const y140 = getYCoord(140);
  const y90 = getYCoord(90);

  const pulseEvaluation = evaluatePulse(stats.avgPul);

  return (
    <div className="space-y-6">
      {/* Top Banner / Headline & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenBrandModal}
            title="คลิกเพื่อดูรายละเอียด App Icon & System Icon"
            className="group shrink-0 cursor-pointer p-1 rounded-2xl hover:bg-teal-50 transition border border-transparent hover:border-teal-200"
          >
            <div className="transition-transform group-hover:scale-105 duration-200">
              <AriyawarinLogo variant="icon" size={42} />
            </div>
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {onNavigateTab && (
                <BackToHomeButton onNavigateHome={() => onNavigateTab('home')} />
              )}
              {onOpenBrandModal && (
                <button
                  onClick={onOpenBrandModal}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 hover:border-teal-300 transition cursor-pointer shadow-xs"
                  title="คลิกเพื่อดูรายละเอียด App Icon & System Assets"
                >
                  <Sparkles className="w-2.5 h-2.5 text-teal-600" />
                  <span>App Icon</span>
                </button>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              แดชบอร์ดติดตามความดันโลหิต
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              เกณฑ์สากล AHA/ESC · เช้า 2 ครั้ง · เย็น 2 ครั้ง · ประเมินแนวโน้มและอัตราการเปลี่ยนแปลง
            </p>
          </div>
        </div>

        {/* View Toggle, Filters, and Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Member Display Chip (if provided) */}
          {activeMember && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white font-bold"
                style={{ backgroundColor: activeMember.avatarColor || '#0d9488' }}
              >
                {activeMember.firstName.charAt(0)}
              </span>
              <span className="font-semibold text-slate-800 truncate max-w-[120px]">
                {activeMember.firstName} {activeMember.lastName}
              </span>
            </div>
          )}

          {/* View Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('averages')}
              className={`flex items-center gap-1 px-3 py-1.5 font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                viewMode === 'averages'
                  ? 'bg-white text-teal-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
              <span>ค่าเฉลี่ย (2 จุด)</span>
            </button>
            <button
              onClick={() => setViewMode('all_four')}
              className={`flex items-center gap-1 px-3 py-1.5 font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                viewMode === 'all_four'
                  ? 'bg-white text-teal-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-rose-600" />
              <span>แสดงทุกค่า (4 ครั้ง)</span>
            </button>
          </div>

          {/* Time Filter Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
            {(['7d', '14d', '30d', 'all'] as TimeFilterRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeFilter(range)}
                className={`px-2.5 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  timeFilter === range
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {range === '7d' ? '7 วัน' : range === '14d' ? '14 วัน' : range === '30d' ? '30 วัน' : 'ทั้งหมด'}
              </button>
            ))}
          </div>

          {/* Quick CSV Export Action */}
          {onOpenCsvExport && (
            <button
              onClick={onOpenCsvExport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-teal-600 rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer"
              title="ส่งออกไฟล์ CSV สำหรับแพทย์"
            >
              <Download className="w-3.5 h-3.5 text-teal-700" />
              <span>ส่งออก CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Health Status & Quick Action Banner */}
      <div className="p-4 sm:p-5 rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50/80 via-emerald-50/60 to-slate-50 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="text-3xl sm:text-4xl shrink-0 p-2 rounded-2xl bg-white border border-teal-100 shadow-xs">
              {stats.latestStage ? stats.latestStage.emoji : '🩺'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-teal-800 tracking-wider uppercase bg-teal-100/80 px-2 py-0.5 rounded-md">
                  ประเมินสุขภาพโดยรวม
                </span>
                {stats.latestStage && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${stats.latestStage.badgeBg} ${stats.latestStage.badgeText}`}
                  >
                    <span>{stats.latestStage.heartEmoji}</span>
                    <span>{stats.latestStage.titleTh}</span>
                  </span>
                )}
                {stats.avgSys > 0 && (
                  <span className="text-xs font-mono font-bold text-slate-700">
                    เฉลี่ย {stats.avgSys}/{stats.avgDia} mmHg · ชีพจร {stats.avgPul} bpm {getPulseEmoji(stats.avgPul).emoji}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {stats.avgSys === 0
                  ? 'ยังไม่มีข้อมูลบันทึกในระบบ เริ่มต้นบันทึกความดันโลหิตเช้าและเย็นเพื่อติดตามสุขภาพ'
                  : stats.latestStage?.severityIndex === 0 || stats.latestStage?.severityIndex === 1
                  ? 'ระดับความดันโลหิตเฉลี่ยอยู่ในเกณฑ์มาตรฐานความปลอดภัย สุขภาพหลอดเลือดและหัวใจสมดุลดีมาก'
                  : stats.latestStage?.severityIndex === 2
                  ? 'ความดันโลหิตเริ่มอยู่ในช่วงค่อนข้างสูง (Prehypertension) แนะนำปรับเปลี่ยนพฤติกรรม ลดอาหารเค็ม และออกกำลังกายสม่ำเสมอ'
                  : 'ความดันโลหิตสูงกว่าเกณฑ์เป้าหมาย แนะนำเฝ้าระวังอย่างต่อเนื่องและนำรายงานนี้ไปปรึกษาแพทย์ประจำตัว'}
              </p>
            </div>
          </div>

          {/* Quick Shortcuts with System Icons */}
          {onNavigateTab && (
            <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-teal-100">
              <button
                onClick={() => onNavigateTab('realtime')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-teal-200" />
                <span>บันทึกเรียลไทม์</span>
              </button>
              <button
                onClick={() => onNavigateTab('report')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" />
                <span>รายงานแพทย์</span>
              </button>
              {onOpenNotificationModal && (
                <button
                  onClick={onOpenNotificationModal}
                  className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition cursor-pointer"
                  title="ตั้งค่าการแจ้งเตือน"
                >
                  <Bell className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4 Essential Clinical Metrics KPI Cards with System Icons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: SYS Average */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 transition-all hover:border-rose-300 shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 mb-1">
            <div className="flex items-center gap-1.5 font-medium truncate">
              <div className="w-5 h-5 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Stethoscope className="w-3 h-3 stroke-[2.2]" />
              </div>
              <span className="truncate">ตัวบนเฉลี่ย (SYS)</span>
            </div>
            <span className="text-[10px] text-slate-400 hidden sm:inline">&lt;120 mmHg</span>
          </div>

          <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono-numbers">
              {stats.avgSys || '--'}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-500">mmHg</span>
          </div>

          <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 border-t border-slate-100 text-[10px] sm:text-xs">
            <div className="flex items-center gap-1">
              {stats.deltaSys > 0 ? (
                <span className="flex items-center text-rose-600 font-medium whitespace-nowrap">
                  <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5" />
                  +{stats.deltaSys}
                </span>
              ) : stats.deltaSys < 0 ? (
                <span className="flex items-center text-emerald-600 font-medium whitespace-nowrap">
                  <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5" />
                  {stats.deltaSys}
                </span>
              ) : (
                <span className="flex items-center text-slate-500 whitespace-nowrap">
                  <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5" />
                  คงที่
                </span>
              )}
              <span className="text-slate-400 truncate">เทียบวันก่อน</span>
            </div>
            <span className="text-[10px] text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.5 rounded">
              SYS
            </span>
          </div>
        </div>

        {/* Card 2: DIA Average */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 transition-all hover:border-teal-300 shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 mb-1">
            <div className="flex items-center gap-1.5 font-medium truncate">
              <div className="w-5 h-5 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Droplet className="w-3 h-3 stroke-[2.2]" />
              </div>
              <span className="truncate">ตัวล่างเฉลี่ย (DIA)</span>
            </div>
            <span className="text-[10px] text-slate-400 hidden sm:inline">&lt;80 mmHg</span>
          </div>

          <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono-numbers">
              {stats.avgDia || '--'}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-500">mmHg</span>
          </div>

          <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 border-t border-slate-100 text-[10px] sm:text-xs">
            <div className="flex items-center gap-1">
              {stats.deltaDia > 0 ? (
                <span className="flex items-center text-rose-600 font-medium whitespace-nowrap">
                  <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5" />
                  +{stats.deltaDia}
                </span>
              ) : stats.deltaDia < 0 ? (
                <span className="flex items-center text-emerald-600 font-medium whitespace-nowrap">
                  <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5" />
                  {stats.deltaDia}
                </span>
              ) : (
                <span className="flex items-center text-slate-500 whitespace-nowrap">
                  <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5" />
                  คงที่
                </span>
              )}
              <span className="text-slate-400 truncate">เทียบวันก่อน</span>
            </div>
            <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.5 rounded">
              DIA
            </span>
          </div>
        </div>

        {/* Card 3: Pulse & Pulse Pressure */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 transition-all hover:border-amber-300 shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 mb-1">
            <div className="flex items-center gap-1.5 font-medium truncate">
              <div className="w-5 h-5 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Heart className="w-3 h-3 stroke-[2.2] fill-amber-100" />
              </div>
              <span className="truncate">ชีพจรเฉลี่ย (PUL)</span>
            </div>
            <span className="text-[10px] text-slate-400 hidden sm:inline">60-100 bpm</span>
          </div>

          <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono-numbers">
              {stats.avgPul || '--'}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-500">bpm</span>
            <span className="text-base ml-1" title={pulseEvaluation.labelTh}>
              {getPulseEmoji(stats.avgPul).emoji}
            </span>
          </div>

          <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 border-t border-slate-100 text-[10px] sm:text-xs">
            <div className="flex items-center gap-1 text-slate-600 truncate">
              <span>PP:</span>
              <strong className="font-mono-numbers text-slate-800">{stats.pulsePressure}</strong>
              <span className="text-[10px] text-slate-400">mmHg</span>
            </div>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                stats.pulsePressure <= 50 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}
            >
              {stats.pulsePressure <= 50 ? 'ปกติ' : 'เฝ้าระวัง'}
            </span>
          </div>
        </div>

        {/* Card 4: Morning BP Surge / In-Target Rate */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 transition-all hover:border-indigo-300 shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 mb-1">
            <div className="flex items-center gap-1.5 font-medium truncate">
              <div className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Scale className="w-3 h-3 stroke-[2.2]" />
              </div>
              <span className="truncate">ความต่างเช้า-เย็น</span>
            </div>
            <span className="text-[10px] text-slate-400 hidden sm:inline">&lt;20 mmHg</span>
          </div>

          <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1">
            <span
              className={`text-2xl sm:text-3xl font-bold font-mono-numbers ${
                stats.morningSurgeAvg > 15 ? 'text-amber-600' : 'text-slate-900'
              }`}
            >
              {stats.morningSurgeAvg > 0 ? `+${stats.morningSurgeAvg}` : stats.morningSurgeAvg}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-500">mmHg</span>
          </div>

          <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 border-t border-slate-100 text-[10px] sm:text-xs">
            <div className="flex items-center gap-1 text-slate-500 truncate">
              <Target className="w-3 h-3 text-emerald-600" />
              <span>ในเป้า:</span>
              <strong className="text-emerald-700 font-mono-numbers">{stats.inTargetPercent}%</strong>
            </div>
            {/* Visual mini progress bar */}
            <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.min(100, stats.inTargetPercent)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Trend Insights Card (7-Day Moving Average & Clinical Highlights) */}
      <WeeklyTrendInsightsCard records={records} onSelectDate={onSelectDate} />

      {/* Main Interactive Chart Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                กราฟบันทึกความดันโลหิตและชีพจร
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                {viewMode === 'averages' ? 'ค่าเฉลี่ย 2 จุดต่อวัน' : 'แสดงครบทุกครั้ง 4 จุดต่อวัน'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              นำเมาส์หรือนิ้วชี้ไปที่จุดข้อมูลเพื่อดูรายละเอียดการวัดและผลการประเมิน
            </p>
          </div>

          {/* Legend Items */}
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-rose-500 rounded-full inline-block"></span>
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block -ml-2.5"></span>
              <span>SYS (ตัวบน)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-teal-600 rounded-full inline-block"></span>
              <span className="w-2 h-2 rounded-full bg-teal-600 inline-block -ml-2.5"></span>
              <span>DIA (ตัวล่าง)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-500 rounded-full inline-block border-b border-dashed"></span>
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block -ml-2.5"></span>
              <span>PUL (ชีพจร)</span>
            </div>
          </div>
        </div>

        {/* SVG Responsive Container */}
        {chartPoints.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-sm">
            <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            ยังไม่มีข้อมูลบันทึกความดันในช่วงเวลานี้
            <button
              onClick={onOpenLogModal}
              className="mt-3 block mx-auto px-4 py-2 bg-teal-700 text-white rounded-lg text-xs font-medium hover:bg-teal-800"
            >
              + บันทึกความดันครั้งแรก
            </button>
          </div>
        ) : (
          <div className="relative w-full overflow-x-auto">
            <div className="min-w-[700px]">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto overflow-visible"
              >
                <defs>
                  {/* Subtle vertical gradients */}
                  <linearGradient id="sysGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="diaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Background Optimal Range Band (SYS < 120 and DIA < 80) */}
                <rect
                  x={paddingLeft}
                  y={y120}
                  width={innerWidth}
                  height={getYCoord(minY) - y120}
                  fill="#10b981"
                  fillOpacity="0.03"
                />

                {/* Horizontal Grid lines with mmHg labels */}
                {[60, 80, 100, 120, 140, 160, 180].map((val) => {
                  const y = getYCoord(val);
                  const is120 = val === 120;
                  const is80 = val === 80;
                  const is140 = val === 140;

                  return (
                    <g key={val}>
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={chartWidth - paddingRight}
                        y2={y}
                        stroke={
                          is120 || is80
                            ? '#10b981'
                            : is140
                            ? '#ea580c'
                            : '#e2e8f0'
                        }
                        strokeWidth={is120 || is80 || is140 ? '1' : '0.8'}
                        strokeDasharray={is120 || is80 || is140 ? '4 3' : undefined}
                        strokeOpacity={is120 || is80 || is140 ? '0.7' : '1'}
                      />
                      <text
                        x={paddingLeft - 8}
                        y={y + 4}
                        textAnchor="end"
                        className="text-[11px] font-mono-numbers fill-slate-400 font-medium"
                      >
                        {val}
                      </text>
                      {/* Clinical target label flags */}
                      {is120 && (
                        <text
                          x={chartWidth - paddingRight + 4}
                          y={y + 3}
                          className="text-[9px] fill-emerald-600 font-medium"
                        >
                          เกณฑ์ &lt;120
                        </text>
                      )}
                      {is80 && (
                        <text
                          x={chartWidth - paddingRight + 4}
                          y={y + 3}
                          className="text-[9px] fill-teal-600 font-medium"
                        >
                          เกณฑ์ &lt;80
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* X-axis time ticks */}
                {chartPoints.map((point, index) => {
                  const x = getXCoord(index);
                  // Show x label only on first point, last point, or every N points to prevent clutter
                  const step = chartPoints.length > 20 ? 4 : chartPoints.length > 10 ? 2 : 1;
                  const showLabel = index % step === 0 || index === chartPoints.length - 1;

                  return (
                    <g key={index}>
                      {/* Subtle vertical tick line */}
                      <line
                        x1={x}
                        y1={chartHeight - paddingBottom}
                        x2={x}
                        y2={chartHeight - paddingBottom + 5}
                        stroke="#cbd5e1"
                      />
                      {showLabel && (
                        <text
                          x={x}
                          y={chartHeight - paddingBottom + 20}
                          textAnchor="middle"
                          className="text-[10px] fill-slate-500 font-medium"
                        >
                          {point.isAverage
                            ? point.period === 'morning'
                              ? `${point.date.slice(8)} ม.`
                              : `${point.date.slice(8)} ย.`
                            : `${point.date.slice(8)} (${point.period === 'morning' ? 'ม' : 'ย'}${point.readingIndex})`}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Connected Polylines */}
                {/* 1. Pulse line */}
                <path
                  d={pulPath}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  strokeOpacity="0.85"
                />

                {/* 2. Diastolic line */}
                <path
                  d={diaPath}
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* 3. Systolic line */}
                <path
                  d={sysPath}
                  fill="none"
                  stroke="#e11d48"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interactive Points on hover */}
                {chartPoints.map((point, index) => {
                  const x = getXCoord(index);
                  const ySys = getYCoord(point.sys);
                  const yDia = getYCoord(point.dia);
                  const yPul = getYCoord(point.pul);
                  const isHovered = hoveredPoint === point;

                  return (
                    <g
                      key={`pt-${index}`}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(point)}
                      onClick={() => onSelectDate(point.date)}
                    >
                      {/* Invisible hover trigger column */}
                      <rect
                        x={x - (innerWidth / (chartPoints.length * 2 || 1))}
                        y={paddingTop}
                        width={Math.max(16, innerWidth / (chartPoints.length || 1))}
                        height={innerHeight}
                        fill="transparent"
                      />

                      {/* Vertical indicator line when active */}
                      {isHovered && (
                        <line
                          x1={x}
                          y1={paddingTop}
                          x2={x}
                          y2={chartHeight - paddingBottom}
                          stroke="#94a3b8"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                        />
                      )}

                      {/* Pulse point dot */}
                      <circle
                        cx={x}
                        cy={yPul}
                        r={isHovered ? 4.5 : 2.5}
                        fill="#f59e0b"
                        stroke="#ffffff"
                        strokeWidth="1"
                      />

                      {/* DIA dot */}
                      <circle
                        cx={x}
                        cy={yDia}
                        r={isHovered ? 5.5 : 3.5}
                        fill="#0d9488"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />

                      {/* SYS dot with status color halo */}
                      <circle
                        cx={x}
                        cy={ySys}
                        r={isHovered ? 6 : 4}
                        fill="#e11d48"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* Hover / Active Reading Inspection Tooltip Card */}
        {hoveredPoint && (
          <div className="mt-4 p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: hoveredPoint.stage.accentColor }}
              ></span>
              <div>
                <span className="font-semibold text-slate-900">{hoveredPoint.label}</span>
                <span className="text-slate-500 ml-1.5 block xs:inline">
                  (ระดับ: <span className="font-medium text-slate-800">{hoveredPoint.stage.titleTh}</span>)
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
              <div className="flex items-baseline gap-1">
                <span className="text-slate-500">SYS:</span>
                <span className="font-bold text-rose-700 font-mono-numbers text-sm sm:text-base">
                  {hoveredPoint.sys}
                </span>
                <span className="text-[10px] text-slate-400">mmHg</span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-slate-500">DIA:</span>
                <span className="font-bold text-teal-800 font-mono-numbers text-sm sm:text-base">
                  {hoveredPoint.dia}
                </span>
                <span className="text-[10px] text-slate-400">mmHg</span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-slate-500">ชีพจร:</span>
                <span className="font-bold text-amber-700 font-mono-numbers text-sm sm:text-base">
                  {hoveredPoint.pul}
                </span>
                <span className="text-[10px] text-slate-400">bpm</span>
              </div>

              <button
                onClick={() => onSelectDate(hoveredPoint.date)}
                className="flex items-center text-teal-700 hover:text-teal-900 font-semibold gap-0.5 ml-auto sm:ml-2 py-1 px-2 rounded hover:bg-teal-50 transition-colors"
              >
                <span>ดูรายละเอียดวัน</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent 7 Records Touch Summary Cards (Great for Mobile & Tablet view) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-bold text-slate-900">
              บันทึกย้อนหลังล่าสุด (แตะเพื่อดูรายละเอียด)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            แสดง {Math.min(7, filteredRecords.length)} วันล่าสุด
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {filteredRecords.slice(-8).reverse().map((rec) => {
            const m = computeDailyMetrics(rec);
            if (!m.dailyAvg) return null;
            return (
              <button
                key={rec.id}
                onClick={() => onSelectDate(rec.date)}
                className="p-3 rounded-lg border border-slate-200 hover:border-teal-600 hover:bg-teal-50/30 transition-all text-left flex flex-col justify-between space-y-2 group"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5">
                    {m.stage && (
                      <span className="text-sm" title={m.stage.titleTh}>
                        {m.stage.emoji}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-slate-900 group-hover:text-teal-800">
                      {formatThaiDate(rec.date, { shortMonth: true })}
                    </span>
                  </div>
                  {m.stage && (
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: m.stage.accentColor }}
                      title={m.stage.titleTh}
                    />
                  )}
                </div>

                <div className="flex items-baseline justify-between w-full">
                  <div className="font-mono-numbers">
                    <span className="text-base font-bold text-rose-700">{m.dailyAvg.sys}</span>
                    <span className="text-slate-400 text-xs mx-0.5">/</span>
                    <span className="text-base font-bold text-teal-800">{m.dailyAvg.dia}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono-numbers flex items-center gap-1">
                    <span>{m.dailyAvg.pul} bpm</span>
                    <span>{getPulseEmoji(m.dailyAvg.pul).emoji}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 w-full">
                  <span className="truncate">{m.stage?.heartEmoji} {m.stage?.titleTh}</span>
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-teal-700 shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Morning vs Evening Clinical Comparison & Fluctuations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Box 1: Consecutive Reading Stability Analysis */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-bold text-slate-900">
              ความเสถียรของการวัด 2 ครั้ง (1-2 นาที)
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            ตามคำแนะนำทางการแพทย์ การวัดครั้งที่ 2 มักต่ำกว่าครั้งที่ 1 เล็กน้อย (ประมาณ 3-5 mmHg) เนื่องจากร่างกายผ่อนคลายลง หากต่างกันเกิน 10 mmHg แนะนำให้นั่งพัก 2 นาทีแล้ววัดครั้งที่ 3
          </p>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">สถานะความนิ่งของการวัด:</span>
            <span className="font-semibold text-emerald-700">อยู่ในเกณฑ์สม่ำเสมอ</span>
          </div>
        </div>

        {/* Box 2: Morning Blood Pressure Surge Risk */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              ค่าความดันพุ่งช่วงเช้า (Morning Surge)
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            ค่าเฉลี่ยช่วงเช้าสูงกว่าช่วงเย็นเฉลี่ย{' '}
            <span className="font-semibold text-slate-900 font-mono-numbers">
              {stats.morningSurgeAvg > 0 ? `+${stats.morningSurgeAvg}` : stats.morningSurgeAvg} mmHg
            </span>
            {stats.morningSurgeAvg > 20
              ? ' (ตรวจพบ Morning Surge สูง ควรปรึกษาแพทย์เรื่องการปรับเวลาทานยา)'
              : ' (อยู่ในเกณฑ์ปกติ ไม่พบความดันพุ่งสูงช่วงตื่นนอน)'}
          </p>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">เกณฑ์เฝ้าระวัง:</span>
            <span className="text-slate-700 font-medium">&lt; 20 mmHg</span>
          </div>
        </div>

        {/* Box 3: Quick Action & Guidance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">
              การประเมินโดยรวมล่าสุด
            </h3>
          </div>
          {stats.latestStage && (
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: stats.latestStage.accentColor }}
                ></span>
                <span className="text-sm font-bold text-slate-900">
                  {stats.latestStage.titleTh}
                </span>
                <span className="text-xs text-slate-500">({stats.latestStage.titleEn})</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                {stats.latestStage.actionGuidelineTh}
              </p>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">ข้อมูลทั้งหมด:</span>
            <span className="font-semibold text-slate-800 font-mono-numbers">
              {records.length} วันที่บันทึก
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
