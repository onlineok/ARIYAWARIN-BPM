import React, { useMemo, useState } from 'react';
import { DailyBPRecord } from '../types/bp';
import { Member } from '../types/member';
import {
  computeDailyMetrics,
  formatThaiDate,
  classifyBP,
  getBPEmoji,
  getPulseEmoji,
} from '../utils/bpClassification';
import { calculateBMI } from '../utils/bmi';
import {
  Printer,
  Download,
  Calendar,
  Activity,
  FileText,
  User,
  Heart,
  Scale,
  ShieldCheck,
  TrendingUp,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { AriyawarinLogo } from './AriyawarinLogo';
import { BackToHomeButton } from './BackToHomeButton';

interface DoctorReportViewProps {
  records: DailyBPRecord[];
  allRecords?: DailyBPRecord[];
  patientName?: string;
  activeMember?: Member | null;
  members?: Member[];
  onSelectMember?: (id: string) => void;
  onOpenCsvExport?: () => void;
  onNavigateHome?: () => void;
}

type ChartTimeRange = '7d' | '14d' | '30d' | 'all';

export const DoctorReportView: React.FC<DoctorReportViewProps> = ({
  records,
  allRecords,
  patientName = 'ผู้รับบริการตรวจวัดสุขภาพ',
  activeMember,
  members = [],
  onSelectMember,
  onOpenCsvExport,
  onNavigateHome,
}) => {
  const [timeRange, setTimeRange] = useState<ChartTimeRange>('all');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Active member details
  const memberDisplayName = activeMember
    ? `${activeMember.firstName} ${activeMember.lastName}`
    : patientName;

  const bmiAnalysis = useMemo(() => {
    if (activeMember && activeMember.height > 0 && activeMember.weight > 0) {
      return calculateBMI(activeMember.weight, activeMember.height);
    }
    return null;
  }, [activeMember]);

  // Filter records for active member if allRecords is provided and member is selected
  const memberRecords = useMemo(() => {
    if (activeMember && allRecords && allRecords.length > 0) {
      const filtered = allRecords.filter(
        (r) => !r.memberId || r.memberId === activeMember.id
      );
      return filtered.length > 0 ? filtered : records;
    }
    return records;
  }, [records, allRecords, activeMember]);

  // Sort records newest first for clinical review & table
  const sortedRecords = useMemo(() => {
    return [...memberRecords].sort((a, b) => b.date.localeCompare(a.date));
  }, [memberRecords]);

  // Sort records oldest first for chart chronology
  const chronologicalRecords = useMemo(() => {
    return [...memberRecords].sort((a, b) => a.date.localeCompare(b.date));
  }, [memberRecords]);

  // Filter records based on selected time range for the chart
  const filteredChartRecords = useMemo(() => {
    const total = chronologicalRecords.length;
    if (total === 0) return [];
    switch (timeRange) {
      case '7d':
        return chronologicalRecords.slice(Math.max(0, total - 7));
      case '14d':
        return chronologicalRecords.slice(Math.max(0, total - 14));
      case '30d':
        return chronologicalRecords.slice(Math.max(0, total - 30));
      case 'all':
      default:
        return chronologicalRecords;
    }
  }, [chronologicalRecords, timeRange]);

  // Overall calculations across all recorded days
  const summary = useMemo(() => {
    if (memberRecords.length === 0) return null;

    let totalMorningSys = 0;
    let totalMorningDia = 0;
    let totalMorningPul = 0;
    let morningCount = 0;

    let totalEveningSys = 0;
    let totalEveningDia = 0;
    let totalEveningPul = 0;
    let eveningCount = 0;

    let totalDailySys = 0;
    let totalDailyDia = 0;
    let totalDailyPul = 0;
    let dailyCount = 0;

    let inTargetCount = 0;

    memberRecords.forEach((r) => {
      const m = computeDailyMetrics(r);
      if (m.morningAvg) {
        totalMorningSys += m.morningAvg.sys;
        totalMorningDia += m.morningAvg.dia;
        totalMorningPul += m.morningAvg.pul;
        morningCount++;
      }
      if (m.eveningAvg) {
        totalEveningSys += m.eveningAvg.sys;
        totalEveningDia += m.eveningAvg.dia;
        totalEveningPul += m.eveningAvg.pul;
        eveningCount++;
      }
      if (m.dailyAvg) {
        totalDailySys += m.dailyAvg.sys;
        totalDailyDia += m.dailyAvg.dia;
        totalDailyPul += m.dailyAvg.pul;
        dailyCount++;
        // Target < 130/80 mmHg per home BP guidelines
        if (m.dailyAvg.sys < 130 && m.dailyAvg.dia < 80) {
          inTargetCount++;
        }
      }
    });

    const avgMorningSys = morningCount ? Math.round(totalMorningSys / morningCount) : 0;
    const avgMorningDia = morningCount ? Math.round(totalMorningDia / morningCount) : 0;
    const avgMorningPul = morningCount ? Math.round(totalMorningPul / morningCount) : 0;

    const avgEveningSys = eveningCount ? Math.round(totalEveningSys / eveningCount) : 0;
    const avgEveningDia = eveningCount ? Math.round(totalEveningDia / eveningCount) : 0;
    const avgEveningPul = eveningCount ? Math.round(totalEveningPul / eveningCount) : 0;

    const avgDailySys = dailyCount ? Math.round(totalDailySys / dailyCount) : 0;
    const avgDailyDia = dailyCount ? Math.round(totalDailyDia / dailyCount) : 0;
    const avgDailyPul = dailyCount ? Math.round(totalDailyPul / dailyCount) : 0;

    const inTargetRate = dailyCount ? Math.round((inTargetCount / dailyCount) * 100) : 0;
    const morningSurge = avgMorningSys - avgEveningSys;

    return {
      totalDays: memberRecords.length,
      avgMorningSys,
      avgMorningDia,
      avgMorningPul,
      avgEveningSys,
      avgEveningDia,
      avgEveningPul,
      avgDailySys,
      avgDailyDia,
      avgDailyPul,
      inTargetRate,
      morningSurge,
      overallStage: classifyBP(avgDailySys, avgDailyDia),
    };
  }, [memberRecords]);

  // Chart Coordinates & Dimensions
  const chartWidth = 760;
  const chartHeight = 270;
  const padLeft = 45;
  const padRight = 35;
  const padTop = 32;
  const padBottom = 45;
  const innerWidth = chartWidth - padLeft - padRight;
  const innerHeight = chartHeight - padTop - padBottom;

  const chartPoints = useMemo(() => {
    return filteredChartRecords
      .map((r) => {
        const m = computeDailyMetrics(r);
        if (!m.dailyAvg) return null;
        return {
          date: r.date,
          shortDate: formatThaiDate(r.date, { shortMonth: true }),
          sys: m.dailyAvg.sys,
          dia: m.dailyAvg.dia,
          pul: m.dailyAvg.pul,
          morningAvg: m.morningAvg,
          eveningAvg: m.eveningAvg,
          stage: m.stage,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);
  }, [filteredChartRecords]);

  const minY = 50;
  const maxY = Math.max(
    180,
    ...chartPoints.map((p) => Math.max(p.sys, p.pul) + 15)
  );

  const getYCoord = (val: number) => {
    const clamped = Math.max(minY, Math.min(maxY, val));
    return padTop + innerHeight - ((clamped - minY) / (maxY - minY)) * innerHeight;
  };

  const getXCoord = (index: number, total: number) => {
    if (total <= 1) return padLeft + innerWidth / 2;
    return padLeft + (index / (total - 1)) * innerWidth;
  };

  const y130 = getYCoord(130);
  const y120 = getYCoord(120);
  const y80 = getYCoord(80);
  const y140 = getYCoord(140);

  // Export CSV Function with Member Name and UTF-8 BOM
  const exportCSV = () => {
    if (sortedRecords.length === 0) return;

    const headers = [
      'ชื่อสมาชิก',
      'วันที่',
      'เช้า_ครั้งที่1_SYS',
      'เช้า_ครั้งที่1_DIA',
      'เช้า_ครั้งที่1_PUL',
      'เช้า_ครั้งที่2_SYS',
      'เช้า_ครั้งที่2_DIA',
      'เช้า_ครั้งที่2_PUL',
      'ค่าเฉลี่ยเช้า_SYS',
      'ค่าเฉลี่ยเช้า_DIA',
      'เย็น_ครั้งที่1_SYS',
      'เย็น_ครั้งที่1_DIA',
      'เย็น_ครั้งที่1_PUL',
      'เย็น_ครั้งที่2_SYS',
      'เย็น_ครั้งที่2_DIA',
      'เย็น_ครั้งที่2_PUL',
      'ค่าเฉลี่ยเย็น_SYS',
      'ค่าเฉลี่ยเย็น_DIA',
      'ค่าเฉลี่ยประจำวัน_SYS',
      'ค่าเฉลี่ยประจำวัน_DIA',
      'ค่าเฉลี่ยประจำวัน_PUL',
      'ระดับความดัน',
      'ทามสแตมป์',
      'หมายเหตุ',
    ];

    const rows = sortedRecords.map((r) => {
      const m = computeDailyMetrics(r);
      return [
        `"${memberDisplayName.replace(/"/g, '""')}"`,
        r.date,
        r.morning.reading1?.sys || '',
        r.morning.reading1?.dia || '',
        r.morning.reading1?.pul || '',
        r.morning.reading2?.sys || '',
        r.morning.reading2?.dia || '',
        r.morning.reading2?.pul || '',
        m.morningAvg?.sys || '',
        m.morningAvg?.dia || '',
        r.evening.reading1?.sys || '',
        r.evening.reading1?.dia || '',
        r.evening.reading1?.pul || '',
        r.evening.reading2?.sys || '',
        r.evening.reading2?.dia || '',
        r.evening.reading2?.pul || '',
        m.eveningAvg?.sys || '',
        m.eveningAvg?.dia || '',
        m.dailyAvg?.sys || '',
        m.dailyAvg?.dia || '',
        m.dailyAvg?.pul || '',
        m.stage?.titleTh || '',
        r.timestamp || '',
        `"${(r.overallNote || r.morning.note || r.evening.note || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const cleanFileName = memberDisplayName.replace(/\s+/g, '_');
    link.setAttribute(
      'download',
      `รายงานความดัน_${cleanFileName}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Action Header & Member Selector (Hidden on Paper Print) */}
      <div className="no-print flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          {onNavigateHome && (
            <div className="mb-2">
              <BackToHomeButton onNavigateHome={onNavigateHome} />
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            รายงานประเมินความดันโลหิตสำหรับแพทย์
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            สรุปข้อมูลสถิติ กราฟแนวโน้มสำหรับแพทย์ และตารางบันทึก 4 ครั้ง/วัน พร้อมพิมพ์หรือดาวน์โหลด
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Member Switcher Dropdown */}
          {members && members.length > 0 && onSelectMember && (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs">
              <User className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <label htmlFor="memberSelect" className="text-xs font-semibold text-slate-600 shrink-0">
                เลือกสมาชิก:
              </label>
              <select
                id="memberSelect"
                value={activeMember?.id || ''}
                onChange={(e) => onSelectMember(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer pr-1"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName} ({m.gender === 'male' ? 'ชาย' : 'หญิง'}, {m.age} ปี)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Export CSV Button */}
          <button
            onClick={onOpenCsvExport || exportCSV}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-teal-600 rounded-xl shadow-xs transition-colors min-h-[38px] cursor-pointer"
            title="ส่งออกไฟล์ CSV สำหรับแพทย์"
          >
            <Download className="w-3.5 h-3.5 text-teal-700" />
            <span>ดาวน์โหลด CSV</span>
          </button>

          {/* Print / Save PDF Button */}
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-sm transition-colors min-h-[38px] cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>พิมพ์รายงาน / บันทึก PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Clinical Report Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-8 space-y-6 shadow-xs print:border-none print:shadow-none print:p-0">
        {/* Clinical Document Header */}
        <div className="border-b-2 border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-800 font-bold text-sm tracking-wide uppercase">
              <AriyawarinLogo variant="icon" size={24} />
              <span className="font-serif tracking-wider">
                ARIYAWARIN · Home Blood Pressure Monitoring Report
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              รายงานผลการวัดความดันโลหิตที่บ้าน (HBPM)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              เกณฑ์มาตรฐาน ESC/ESH 2024 & AHA/ACC Clinical Practice Guidelines
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-600 space-y-1">
            <div>
              <span className="text-slate-400">วันที่พิมพ์รายงาน:</span>{' '}
              <strong className="text-slate-800 font-mono-numbers">
                {formatThaiDate(new Date().toISOString().slice(0, 10))}
              </strong>
            </div>
            <div>
              <span className="text-slate-400">จำนวนวันที่บันทึก:</span>{' '}
              <strong className="text-slate-800 font-mono-numbers">
                {memberRecords.length} วัน
              </strong>
            </div>
          </div>
        </div>

        {/* Member / Patient Demographic & Clinical Profile Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                {activeMember ? activeMember.firstName.charAt(0) : <User className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                  ข้อมูลสมาชิก / ผู้รับการตรวจ (Patient / Member Profile)
                </span>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    {memberDisplayName}
                  </h3>
                  {summary?.overallStage && (
                    <span className="text-lg" title={summary.overallStage.titleTh}>
                      {summary.overallStage.emoji}
                    </span>
                  )}
                </div>
                {activeMember?.id && (
                  <span className="text-[11px] text-slate-500 font-mono">
                    รหัสประจำตัว: {activeMember.id}
                  </span>
                )}
              </div>
            </div>

            {/* Demographic and Biometric Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 block">เพศ / อายุ</span>
                <span className="font-bold text-slate-800">
                  {activeMember ? (activeMember.gender === 'male' ? 'ชาย' : 'หญิง') : '-'} ·{' '}
                  {activeMember ? `${activeMember.age} ปี` : '-'}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 block">ส่วนสูง / น้ำหนัก</span>
                <span className="font-bold text-slate-800 font-mono-numbers">
                  {activeMember ? `${activeMember.height} cm` : '-'} ·{' '}
                  {activeMember ? `${activeMember.weight} kg` : '-'}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 block">ดัชนีมวลกาย (BMI)</span>
                {bmiAnalysis ? (
                  <div>
                    <span className="font-bold text-slate-900 font-mono-numbers">
                      {bmiAnalysis.bmi.toFixed(1)}
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium block">
                      {bmiAnalysis.category.labelTh}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 block">ระดับเฉลี่ยรวม</span>
                <span className="font-bold text-slate-900 block truncate text-[11px]">
                  {summary ? summary.overallStage.titleTh : 'ไม่มีข้อมูล'}
                </span>
                {summary && (
                  <span className="text-[10px] text-emerald-700 font-semibold block">
                    {summary.overallStage.heartEmoji} อยู่ในเกณฑ์ {summary.inTargetRate}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {activeMember?.notes && (
            <div className="mt-3 pt-2.5 border-t border-slate-200 text-xs text-slate-600 flex items-start gap-1.5">
              <span className="font-bold text-slate-700 shrink-0">ประวัติ/ข้อสังเกต:</span>
              <span className="text-slate-600 leading-relaxed">{activeMember.notes}</span>
            </div>
          )}
        </div>

        {/* Clinical Summary KPI Cards for Physician */}
        {summary && (
          <div className="p-4 sm:p-5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-700" />
              <span>สรุปค่าสถิติโดยรวม (Clinical Statistical Summary)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                  <span>ค่าเฉลี่ยช่วงเช้า 🌅</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-slate-900 font-mono-numbers">
                  {summary.avgMorningSys}/{summary.avgMorningDia}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  ชีพจร {summary.avgMorningPul} bpm
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                  <span>ค่าเฉลี่ยช่วงเย็น 🌙</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-slate-900 font-mono-numbers">
                  {summary.avgEveningSys}/{summary.avgEveningDia}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  ชีพจร {summary.avgEveningPul} bpm
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                  <span>ค่าเฉลี่ยรวมทุกรอบ 📊</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-teal-800 font-mono-numbers">
                  {summary.avgDailySys}/{summary.avgDailyDia}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  ชีพจร {summary.avgDailyPul} bpm
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                  <span>ระดับประเมินสากล</span>
                  <span>{summary.overallStage.emoji}</span>
                </div>
                <span className="text-base font-bold text-slate-900 block truncate">
                  {summary.overallStage.titleTh}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                  {summary.inTargetRate}% อยู่ในเป้าหมาย (&lt;130/80)
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-4 pt-1">
              <span>
                ความต่างเฉลี่ยเช้า-เย็น (Morning Surge):{' '}
                <strong className="font-mono-numbers text-slate-800">
                  {summary.morningSurge > 0 ? `+${summary.morningSurge}` : summary.morningSurge} mmHg
                </strong>{' '}
                {summary.morningSurge >= 20 ? '⚠️ (มีภาวะ Morning Surge)' : '✅ (สมดุลดี)'}
              </span>
              <span>
                ชีพจรเฉลี่ยรวม:{' '}
                <strong className="font-mono-numbers text-slate-800">
                  {summary.avgDailyPul} bpm {getPulseEmoji(summary.avgDailyPul).emoji}
                </strong>
              </span>
            </div>
          </div>
        )}

        {/* CLINICAL GRAPH SECTION (แทรกกราฟสำหรับแพทย์) */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-700" />
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                  กราฟแนวโน้มความดันโลหิตสำหรับแพทย์ (Clinical Blood Pressure Trend Chart)
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                พล็อตค่าเฉลี่ยตัวบน (SYS) · ตัวล่าง (DIA) · ชีพจร (PUL) และเกณฑ์เป้าหมายสากล AHA/ESC
              </p>
            </div>

            {/* Time Filter Buttons (No-print) */}
            <div className="no-print flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs self-start sm:self-auto">
              {(['7d', '14d', '30d', 'all'] as ChartTimeRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all text-[11px] cursor-pointer ${
                    timeRange === r
                      ? 'bg-white text-teal-800 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r === '7d' ? '7 วัน' : r === '14d' ? '14 วัน' : r === '30d' ? '30 วัน' : 'ทั้งหมด'}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Vector Chart Container (Designed for crisp screen and high-resolution printing) */}
          {chartPoints.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              ยังไม่มีข้อมูลสำหรับสร้างกราฟของสมาชิกท่านนี้
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
              {/* Legend row */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600 pb-3 border-b border-slate-100 mb-2">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-rose-600 rounded-full inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block -ml-2"></span>
                    <span className="font-semibold text-rose-700">SYS (ตัวบน)</span>
                    <span className="text-[10px] text-slate-400">&lt;130</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-teal-600 rounded-full inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block -ml-2"></span>
                    <span className="font-semibold text-teal-700">DIA (ตัวล่าง)</span>
                    <span className="text-[10px] text-slate-400">&lt;80</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-amber-500 rounded-full inline-block border-b border-dashed"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block -ml-2"></span>
                    <span className="font-semibold text-amber-700">PUL (ชีพจร)</span>
                    <span className="text-[10px] text-slate-400">bpm</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-300"></span>
                  <span>โซนเป้าหมายตามเกณฑ์สากล (&lt;130/80 mmHg)</span>
                </div>
              </div>

              {/* Responsive SVG Chart */}
              <div className="w-full overflow-x-auto">
                <div className="min-w-[650px]">
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-auto overflow-visible select-none"
                  >
                    <defs>
                      <linearGradient id="docSysGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e11d48" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#e11d48" stopOpacity="0.01" />
                      </linearGradient>
                      <linearGradient id="docDiaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0d9488" stopOpacity="0.14" />
                        <stop offset="100%" stopColor="#0d9488" stopOpacity="0.01" />
                      </linearGradient>
                    </defs>

                    {/* Shaded Optimal Target Safe Zone (Between 80 DIA and 130 SYS) */}
                    <rect
                      x={padLeft}
                      y={y130}
                      width={innerWidth}
                      height={Math.max(0, y80 - y130)}
                      fill="#10b981"
                      fillOpacity="0.06"
                      rx="3"
                    />

                    {/* Horizontal Grid lines and mmHg labels */}
                    {[60, 80, 100, 120, 130, 140, 160, 180]
                      .filter((v) => v >= minY && v <= maxY)
                      .map((val) => {
                        const y = getYCoord(val);
                        const is130 = val === 130;
                        const is80 = val === 80;
                        const is140 = val === 140;

                        return (
                          <g key={val}>
                            <line
                              x1={padLeft}
                              y1={y}
                              x2={chartWidth - padRight}
                              y2={y}
                              stroke={
                                is130 || is80
                                  ? '#059669'
                                  : is140
                                  ? '#ea580c'
                                  : '#e2e8f0'
                              }
                              strokeDasharray={is130 || is80 || is140 ? '4 3' : 'none'}
                              strokeWidth={is130 || is80 || is140 ? 1.2 : 0.75}
                              opacity={is130 || is80 ? 0.75 : 0.85}
                            />
                            <text
                              x={padLeft - 6}
                              y={y + 3}
                              textAnchor="end"
                              className="text-[9px] fill-slate-400 font-mono"
                            >
                              {val}
                            </text>
                            {is130 && (
                              <text
                                x={chartWidth - padRight + 5}
                                y={y + 3}
                                className="text-[8px] fill-emerald-700 font-bold"
                              >
                                เป้า 130
                              </text>
                            )}
                            {is80 && (
                              <text
                                x={chartWidth - padRight + 5}
                                y={y + 3}
                                className="text-[8px] fill-teal-700 font-bold"
                              >
                                เป้า 80
                              </text>
                            )}
                            {is140 && (
                              <text
                                x={chartWidth - padRight + 5}
                                y={y + 3}
                                className="text-[8px] fill-orange-700 font-bold"
                              >
                                เกณฑ์สูง 140
                              </text>
                            )}
                          </g>
                        );
                      })}

                    {/* Area fills if >= 2 points */}
                    {chartPoints.length > 1 && (
                      <>
                        {/* SYS Area */}
                        <path
                          d={`
                            M ${getXCoord(0, chartPoints.length)} ${getYCoord(chartPoints[0].sys)}
                            ${chartPoints
                              .map((p, i) => `L ${getXCoord(i, chartPoints.length)} ${getYCoord(p.sys)}`)
                              .join(' ')}
                            L ${getXCoord(chartPoints.length - 1, chartPoints.length)} ${getYCoord(minY)}
                            L ${getXCoord(0, chartPoints.length)} ${getYCoord(minY)}
                            Z
                          `}
                          fill="url(#docSysGrad)"
                        />

                        {/* DIA Area */}
                        <path
                          d={`
                            M ${getXCoord(0, chartPoints.length)} ${getYCoord(chartPoints[0].dia)}
                            ${chartPoints
                              .map((p, i) => `L ${getXCoord(i, chartPoints.length)} ${getYCoord(p.dia)}`)
                              .join(' ')}
                            L ${getXCoord(chartPoints.length - 1, chartPoints.length)} ${getYCoord(minY)}
                            L ${getXCoord(0, chartPoints.length)} ${getYCoord(minY)}
                            Z
                          `}
                          fill="url(#docDiaGrad)"
                        />

                        {/* SYS Line */}
                        <path
                          d={`
                            M ${getXCoord(0, chartPoints.length)} ${getYCoord(chartPoints[0].sys)}
                            ${chartPoints
                              .map((p, i) => `L ${getXCoord(i, chartPoints.length)} ${getYCoord(p.sys)}`)
                              .join(' ')}
                          `}
                          fill="none"
                          stroke="#e11d48"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* DIA Line */}
                        <path
                          d={`
                            M ${getXCoord(0, chartPoints.length)} ${getYCoord(chartPoints[0].dia)}
                            ${chartPoints
                              .map((p, i) => `L ${getXCoord(i, chartPoints.length)} ${getYCoord(p.dia)}`)
                              .join(' ')}
                          `}
                          fill="none"
                          stroke="#0d9488"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Pulse Line */}
                        <path
                          d={`
                            M ${getXCoord(0, chartPoints.length)} ${getYCoord(chartPoints[0].pul)}
                            ${chartPoints
                              .map((p, i) => `L ${getXCoord(i, chartPoints.length)} ${getYCoord(p.pul)}`)
                              .join(' ')}
                          `}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="1.6"
                          strokeDasharray="4 3"
                          strokeLinecap="round"
                        />
                      </>
                    )}

                    {/* Data Points, Connecting vertical pillars, and X-axis Dates */}
                    {chartPoints.map((p, i) => {
                      const x = getXCoord(i, chartPoints.length);
                      const ySys = getYCoord(p.sys);
                      const yDia = getYCoord(p.dia);
                      const yPul = getYCoord(p.pul);
                      const isHovered = hoveredPointIndex === i;

                      return (
                        <g key={p.date} className="cursor-pointer">
                          {/* Vertical dotted connector line between SYS and DIA */}
                          <line
                            x1={x}
                            y1={ySys}
                            x2={x}
                            y2={yDia}
                            stroke="#94a3b8"
                            strokeWidth={isHovered ? 2 : 1}
                            strokeDasharray="2 2"
                            opacity={0.65}
                          />

                          {/* Hover highlight bar */}
                          {isHovered && (
                            <line
                              x1={x}
                              y1={padTop}
                              x2={x}
                              y2={chartHeight - padBottom}
                              stroke="#0d9488"
                              strokeWidth={1}
                              strokeDasharray="2 2"
                              opacity={0.4}
                            />
                          )}

                          {/* SYS Point */}
                          <circle
                            cx={x}
                            cy={ySys}
                            r={isHovered ? 5.5 : 4}
                            fill="#e11d48"
                            stroke="#ffffff"
                            strokeWidth={1.8}
                          />
                          {/* SYS Text label */}
                          <text
                            x={x}
                            y={ySys - 7}
                            textAnchor="middle"
                            className="text-[9px] font-bold fill-rose-700 font-mono"
                          >
                            {p.sys}
                          </text>

                          {/* DIA Point */}
                          <circle
                            cx={x}
                            cy={yDia}
                            r={isHovered ? 5.5 : 4}
                            fill="#0d9488"
                            stroke="#ffffff"
                            strokeWidth={1.8}
                          />
                          {/* DIA Text label */}
                          <text
                            x={x}
                            y={yDia + 12}
                            textAnchor="middle"
                            className="text-[9px] font-bold fill-teal-800 font-mono"
                          >
                            {p.dia}
                          </text>

                          {/* PUL Point */}
                          <circle
                            cx={x}
                            cy={yPul}
                            r={3}
                            fill="#f59e0b"
                            stroke="#ffffff"
                            strokeWidth={1.2}
                          />

                          {/* X-axis date label */}
                          <text
                            x={x}
                            y={chartHeight - padBottom + 16}
                            textAnchor="middle"
                            className="text-[9px] font-medium fill-slate-700 font-mono"
                          >
                            {p.shortDate.split(' ')[0]} {p.shortDate.split(' ')[1]}
                          </text>

                          {/* Hover target rect */}
                          <rect
                            x={x - 18}
                            y={padTop}
                            width={36}
                            height={innerHeight}
                            fill="transparent"
                            onMouseEnter={() => setHoveredPointIndex(i)}
                            onMouseLeave={() => setHoveredPointIndex(null)}
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Hover callout banner if hovered */}
              {hoveredPointIndex !== null && chartPoints[hoveredPointIndex] && (
                <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">
                      {formatThaiDate(chartPoints[hoveredPointIndex].date)}:
                    </span>
                    <span className="font-mono text-rose-700 font-bold">
                      SYS {chartPoints[hoveredPointIndex].sys}
                    </span>
                    <span>/</span>
                    <span className="font-mono text-teal-800 font-bold">
                      DIA {chartPoints[hoveredPointIndex].dia} mmHg
                    </span>
                    <span className="text-slate-400">|</span>
                    <span className="font-mono text-amber-700">
                      ชีพจร {chartPoints[hoveredPointIndex].pul} bpm
                    </span>
                  </div>
                  {chartPoints[hoveredPointIndex].stage && (
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <span>{chartPoints[hoveredPointIndex].stage.emoji}</span>
                      <span>{chartPoints[hoveredPointIndex].stage.titleTh}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Detailed High-Density Clinical Table */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              ตารางบันทึกความดันรายวัน (Daily Log Sheets)
            </h3>
            <span className="text-[11px] text-slate-500">
              รวม {sortedRecords.length} วันบันทึก
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">วันที่</th>
                  <th className="py-2.5 px-2 text-center" colSpan={3}>
                    รอบเช้า (ครั้ง 1 / ครั้ง 2 / เฉลี่ย)
                  </th>
                  <th className="py-2.5 px-2 text-center" colSpan={3}>
                    รอบเย็น (ครั้ง 1 / ครั้ง 2 / เฉลี่ย)
                  </th>
                  <th className="py-2.5 px-2 text-center">เฉลี่ยวัน</th>
                  <th className="py-2.5 px-3">ระดับการประเมิน</th>
                  <th className="py-2.5 px-3">หมายเหตุ</th>
                </tr>
                <tr className="bg-slate-50 text-[10px] text-slate-500 border-b border-slate-200">
                  <th className="py-1 px-3"></th>
                  <th className="py-1 px-2 text-center">ครั้ง 1</th>
                  <th className="py-1 px-2 text-center">ครั้ง 2</th>
                  <th className="py-1 px-2 text-center font-bold text-slate-700">เฉลี่ยเช้า</th>
                  <th className="py-1 px-2 text-center">ครั้ง 1</th>
                  <th className="py-1 px-2 text-center">ครั้ง 2</th>
                  <th className="py-1 px-2 text-center font-bold text-slate-700">เฉลี่ยเย็น</th>
                  <th className="py-1 px-2 text-center">SYS/DIA</th>
                  <th className="py-1 px-3"></th>
                  <th className="py-1 px-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono-numbers">
                {sortedRecords.map((r) => {
                  const m = computeDailyMetrics(r);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium text-slate-900 font-sans whitespace-nowrap">
                        {r.date}
                      </td>

                      {/* Morning R1 */}
                      <td className="py-2 px-2 text-center text-slate-600 text-[11px]">
                        {r.morning.reading1
                          ? `${r.morning.reading1.sys}/${r.morning.reading1.dia}`
                          : '-'}
                      </td>

                      {/* Morning R2 */}
                      <td className="py-2 px-2 text-center text-slate-600 text-[11px]">
                        {r.morning.reading2
                          ? `${r.morning.reading2.sys}/${r.morning.reading2.dia}`
                          : '-'}
                      </td>

                      {/* Morning Avg */}
                      <td className="py-2 px-2 text-center font-bold text-slate-900 text-[11px] bg-slate-50/50">
                        {m.morningAvg ? `${m.morningAvg.sys}/${m.morningAvg.dia}` : '-'}
                      </td>

                      {/* Evening R1 */}
                      <td className="py-2 px-2 text-center text-slate-600 text-[11px]">
                        {r.evening.reading1
                          ? `${r.evening.reading1.sys}/${r.evening.reading1.dia}`
                          : '-'}
                      </td>

                      {/* Evening R2 */}
                      <td className="py-2 px-2 text-center text-slate-600 text-[11px]">
                        {r.evening.reading2
                          ? `${r.evening.reading2.sys}/${r.evening.reading2.dia}`
                          : '-'}
                      </td>

                      {/* Evening Avg */}
                      <td className="py-2 px-2 text-center font-bold text-slate-900 text-[11px] bg-slate-50/50">
                        {m.eveningAvg ? `${m.eveningAvg.sys}/${m.eveningAvg.dia}` : '-'}
                      </td>

                      {/* Daily Avg */}
                      <td className="py-2 px-2 text-center font-bold text-teal-800 text-xs">
                        {m.dailyAvg ? `${m.dailyAvg.sys}/${m.dailyAvg.dia}` : '-'}
                      </td>

                      {/* Stage with Emoji */}
                      <td className="py-2 px-3 font-sans whitespace-nowrap">
                        {m.stage && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs">{m.stage.emoji}</span>
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: m.stage.accentColor }}
                            />
                            <span className="text-[11px] font-medium text-slate-800">
                              {m.stage.titleTh}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Note */}
                      <td className="py-2 px-3 text-[11px] text-slate-500 font-sans max-w-[150px] truncate">
                        {r.overallNote || r.morning.note || r.evening.note || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Doctor Signature & Notes Section (for Print) */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">
              ความคิดเห็น / คำแนะนำจากแพทย์ผู้รักษา:
            </span>
            <div className="h-16 border-b border-dashed border-slate-300"></div>
          </div>

          <div className="flex flex-col justify-end items-end space-y-6 pt-4 text-right">
            <div>
              <div className="w-48 border-b border-slate-400 mb-1"></div>
              <span className="text-slate-500">ลงชื่อแพทย์ผู้ตรวจ / ผู้ประเมิน</span>
            </div>
            <div className="text-[11px] text-slate-400">
              วันที่ ..... / ..... / ..........
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
