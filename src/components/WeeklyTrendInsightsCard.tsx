import React, { useMemo } from 'react';
import { DailyBPRecord } from '../types/bp';
import {
  computeDailyMetrics,
  classifyBP,
  formatThaiDate,
  BP_STAGES,
} from '../utils/bpClassification';
import {
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface WeeklyTrendInsightsCardProps {
  records: DailyBPRecord[];
  onSelectDate?: (date: string) => void;
}

export type TrendStatusType = 'improving' | 'warning' | 'stable';

export interface WeeklyAnalysisResult {
  hasEnoughData: boolean;
  totalDays: number;
  current7Days: DailyBPRecord[];
  // Current 7-Day Moving Averages
  currSys: number;
  currDia: number;
  currPul: number;
  currStage: ReturnType<typeof classifyBP>;
  // Previous 7-Day Averages (if >= 8 days)
  hasPrevWeek: boolean;
  prevSys: number;
  prevDia: number;
  prevPul: number;
  // Deltas
  deltaSys: number;
  deltaDia: number;
  deltaPul: number;
  // Deep Clinical Flags
  trendStatus: TrendStatusType;
  statusTitleTh: string;
  statusBadgeBg: string;
  statusBadgeText: string;
  inTargetCount: number;
  inTargetPercent: number;
  avgMorningSurge: number;
  isHighSurge: boolean;
  avgPulsePressure: number;
  sysStdDev: number; // Stability indicator
  // Medical Commentary
  clinicalInsightTh: string;
  keyHighlights: {
    type: 'success' | 'warning' | 'neutral';
    text: string;
  }[];
  // 7 Days Daily Points for Sparkline
  dailyPoints: {
    date: string;
    dayLabel: string;
    sys: number;
    dia: number;
    pul: number;
  }[];
}

export const WeeklyTrendInsightsCard: React.FC<WeeklyTrendInsightsCardProps> = ({
  records,
  onSelectDate,
}) => {
  // Compute the 7-Day Moving Average and Clinical Insights
  const analysis = useMemo<WeeklyAnalysisResult | null>(() => {
    // Sort records chronologically
    const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
    if (sorted.length === 0) return null;

    // Filter only records that have valid daily averages
    const validRecords = sorted.filter((r) => {
      const m = computeDailyMetrics(r);
      return m.dailyAvg !== null && m.dailyAvg.sys > 0;
    });

    if (validRecords.length === 0) return null;

    const count = validRecords.length;
    // Current 7 records (or available records up to 7)
    const current7Days = validRecords.slice(Math.max(0, count - 7));
    // Previous 7 records (e.g. index count-14 to count-7)
    const previous7Days = count >= 8 ? validRecords.slice(Math.max(0, count - 14), count - 7) : [];

    // Current 7-Day average calculation
    const currTotal = current7Days.reduce(
      (acc, r) => {
        const m = computeDailyMetrics(r);
        return {
          sys: acc.sys + (m.dailyAvg?.sys || 0),
          dia: acc.dia + (m.dailyAvg?.dia || 0),
          pul: acc.pul + (m.dailyAvg?.pul || 0),
        };
      },
      { sys: 0, dia: 0, pul: 0 }
    );

    const nCurr = current7Days.length;
    const currSys = Math.round(currTotal.sys / nCurr);
    const currDia = Math.round(currTotal.dia / nCurr);
    const currPul = Math.round(currTotal.pul / nCurr);
    const currStage = classifyBP(currSys, currDia);

    // Previous 7-Day average calculation
    let prevSys = 0;
    let prevDia = 0;
    let prevPul = 0;
    const hasPrevWeek = previous7Days.length > 0;

    if (hasPrevWeek) {
      const prevTotal = previous7Days.reduce(
        (acc, r) => {
          const m = computeDailyMetrics(r);
          return {
            sys: acc.sys + (m.dailyAvg?.sys || 0),
            dia: acc.dia + (m.dailyAvg?.dia || 0),
            pul: acc.pul + (m.dailyAvg?.pul || 0),
          };
        },
        { sys: 0, dia: 0, pul: 0 }
      );
      const nPrev = previous7Days.length;
      prevSys = Math.round(prevTotal.sys / nPrev);
      prevDia = Math.round(prevTotal.dia / nPrev);
      prevPul = Math.round(prevTotal.pul / nPrev);
    }

    const deltaSys = hasPrevWeek ? currSys - prevSys : 0;
    const deltaDia = hasPrevWeek ? currDia - prevDia : 0;
    const deltaPul = hasPrevWeek ? currPul - prevPul : 0;

    // Time in Target (Days with SYS < 130 and DIA < 80)
    const inTargetCount = current7Days.filter((r) => {
      const m = computeDailyMetrics(r);
      return m.dailyAvg && m.dailyAvg.sys < 130 && m.dailyAvg.dia < 80;
    }).length;
    const inTargetPercent = Math.round((inTargetCount / nCurr) * 100);

    // 7-Day Morning Surge average
    const surges: number[] = [];
    current7Days.forEach((r) => {
      const m = computeDailyMetrics(r);
      if (m.morningSurge !== null) surges.push(m.morningSurge);
    });
    const avgMorningSurge =
      surges.length > 0 ? Math.round(surges.reduce((a, b) => a + b, 0) / surges.length) : 0;
    const isHighSurge = avgMorningSurge > 20;

    const avgPulsePressure = currSys - currDia;

    // Standard deviation of SYS over the 7 days (measuring fluctuation/stability)
    const sysValues = current7Days.map((r) => computeDailyMetrics(r).dailyAvg?.sys || currSys);
    const sysVariance =
      sysValues.reduce((acc, val) => acc + Math.pow(val - currSys, 2), 0) / nCurr;
    const sysStdDev = Math.round(Math.sqrt(sysVariance) * 10) / 10;

    // Determine Trend Status (Improving vs Warning vs Stable)
    let trendStatus: TrendStatusType = 'stable';
    let statusTitleTh = 'ระดับความดันคงที่ (Stable Control)';
    let statusBadgeBg = 'bg-teal-50 border-teal-200';
    let statusBadgeText = 'text-teal-800';

    const highlights: { type: 'success' | 'warning' | 'neutral'; text: string }[] = [];

    // Evaluate Warning Conditions
    if (
      deltaSys >= 5 ||
      deltaDia >= 4 ||
      currSys >= 140 ||
      currDia >= 90 ||
      isHighSurge
    ) {
      trendStatus = 'warning';
      statusTitleTh = 'สัญญาณเตือนเฝ้าระวัง (Warning / Rising Trend)';
      statusBadgeBg = 'bg-rose-50 border-rose-200';
      statusBadgeText = 'text-rose-800';
    } else if (
      (deltaSys <= -3 || deltaDia <= -2) ||
      (currSys < 125 && currDia < 80 && inTargetPercent >= 80)
    ) {
      trendStatus = 'improving';
      statusTitleTh = 'แนวโน้มพัฒนาดีขึ้นอย่างมีนัยสำคัญ (Improving Trend)';
      statusBadgeBg = 'bg-emerald-50 border-emerald-200';
      statusBadgeText = 'text-emerald-800';
    }

    // Populate Key Highlights (Improvements & Warning Signs)
    if (hasPrevWeek) {
      if (deltaSys < 0) {
        highlights.push({
          type: 'success',
          text: `ความดันตัวบนเฉลี่ย 7 วัน ลดลง ${Math.abs(deltaSys)} mmHg เทียบกับสัปดาห์ก่อนหน้า`,
        });
      } else if (deltaSys > 0) {
        highlights.push({
          type: 'warning',
          text: `ความดันตัวบนเฉลี่ย 7 วัน ขยับสูงขึ้น +${deltaSys} mmHg เทียบกับสัปดาห์ก่อนหน้า`,
        });
      }

      if (deltaDia < 0) {
        highlights.push({
          type: 'success',
          text: `ความดันตัวล่างเฉลี่ย 7 วัน ลดลง ${Math.abs(deltaDia)} mmHg`,
        });
      } else if (deltaDia > 0) {
        highlights.push({
          type: 'warning',
          text: `ความดันตัวล่างเฉลี่ย 7 วัน สูงขึ้น +${deltaDia} mmHg`,
        });
      }
    }

    if (inTargetPercent >= 80) {
      highlights.push({
        type: 'success',
        text: `ความดันอยู่ในเกณฑ์เป้าหมายดีเยี่ยม (${inTargetPercent}% ในรอบ 7 วันที่ผ่านมา)`,
      });
    } else if (inTargetPercent < 50) {
      highlights.push({
        type: 'warning',
        text: `ค่าความดันอยู่ในเกณฑ์เป้าหมายเพียง ${inTargetPercent}% ใน 7 วัน แนะนำตรวจสอบพฤติกรรม`,
      });
    }

    if (isHighSurge) {
      highlights.push({
        type: 'warning',
        text: `ตรวจพบความดันพุ่งช่วงเช้า (Morning Surge) สูงเฉลี่ย +${avgMorningSurge} mmHg (เกณฑ์เฝ้าระวัง >20 mmHg)`,
      });
    } else if (avgMorningSurge <= 15) {
      highlights.push({
        type: 'success',
        text: `ความต่างความดันเช้า-เย็นอยู่ในเกณฑ์สมดุล (+${avgMorningSurge} mmHg)`,
      });
    }

    if (sysStdDev > 6) {
      highlights.push({
        type: 'warning',
        text: `ความดันมีความผันผวนค่อนข้างสูง (ค่าเบี่ยงเบน ±${sysStdDev} mmHg) ควรนั่งพักนิ่งๆ 5 นาทีก่อนวัด`,
      });
    } else {
      highlights.push({
        type: 'neutral',
        text: `ความสม่ำเสมอในการวัดอยู่ในเกณฑ์เสถียร (ความผันผวน ±${sysStdDev} mmHg)`,
      });
    }

    // Evidence-based Clinical Medical Insight
    let clinicalInsightTh = '';
    if (trendStatus === 'improving') {
      clinicalInsightTh =
        'ค่าเฉลี่ยเคลื่อนที่ 7 วัน (7-Day Moving Average) แสดงให้เห็นถึงการตอบสนองเชิงบวก การปรับเปลี่ยนพฤติกรรมชีวิต (ลดโซเดียม ออกกำลังกาย พักผ่อนเพียงพอ) หรือการใช้ยาลดความดันโลหิตสามารถควบคุมหลอดเลือดได้มีประสิทธิภาพ ควรรักษากิจวัตรสุขภาพนี้อย่างต่อเนื่อง';
    } else if (trendStatus === 'warning') {
      clinicalInsightTh =
        'ค่าเฉลี่ยเคลื่อนที่ 7 วันมีทิศทางขยับสูงขึ้นหรือมีสัญญาณความดันพุ่งช่วงเช้า (Morning Surge) เกินเกณฑ์มาตรฐาน แนะนำให้ประเมินปัจจัยกระตุ้น เช่น การนอนหลับ ความเครียด การบริโภคอาหารรสเค็ม หรือนำข้อมูลกราฟ 7 วันนี้ปรึกษาแพทย์เพื่อพิจารณาการรักษาหรือปรับขนาดยา';
    } else {
      clinicalInsightTh =
        'ค่าเฉลี่ยเคลื่อนที่ 7 วันอยู่ในระดับคงที่สม่ำเสมอ การติดตามค่าเฉลี่ยเคลื่อนที่เป็นมาตรฐานทางการแพทย์ที่ช่วยตัดสัญญาณรบกวนจากการวัดรายวัน แนะนำให้บันทึกสม่ำเสมอวันละ 2 รอบเพื่อคงข้อมูลติดตามต่อเนื่อง';
    }

    // Daily Points for Sparkline
    const thaiDaysShort = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
    const dailyPoints = current7Days.map((r) => {
      const m = computeDailyMetrics(r);
      const d = new Date(r.date);
      const dayLabel = thaiDaysShort[d.getDay()] || r.date.slice(8);
      return {
        date: r.date,
        dayLabel,
        sys: m.dailyAvg?.sys || 120,
        dia: m.dailyAvg?.dia || 80,
        pul: m.dailyAvg?.pul || 70,
      };
    });

    return {
      hasEnoughData: current7Days.length >= 3,
      totalDays: validRecords.length,
      current7Days,
      currSys,
      currDia,
      currPul,
      currStage,
      hasPrevWeek,
      prevSys,
      prevDia,
      prevPul,
      deltaSys,
      deltaDia,
      deltaPul,
      trendStatus,
      statusTitleTh,
      statusBadgeBg,
      statusBadgeText,
      inTargetCount,
      inTargetPercent,
      avgMorningSurge,
      isHighSurge,
      avgPulsePressure,
      sysStdDev,
      clinicalInsightTh,
      keyHighlights: highlights.slice(0, 4), // Top 4 highlights
      dailyPoints,
    };
  }, [records]);

  if (!analysis || !analysis.hasEnoughData) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 text-center text-xs text-slate-500">
        <Activity className="w-5 h-5 text-slate-400 mx-auto mb-2" />
        <p className="font-semibold text-slate-700">ต้องการข้อมูลอย่างน้อย 3-7 วัน</p>
        <p className="text-slate-400 mt-0.5">
          เพื่อคำนวณค่าเฉลี่ยเคลื่อนที่ 7 วัน (7-Day Moving Average) และวิเคราะห์แนวโน้มสุขภาพ
        </p>
      </div>
    );
  }

  // Sparkline Chart dimensions
  const sparkWidth = 420;
  const sparkHeight = 110;
  const padX = 24;
  const padY = 16;
  const innerW = sparkWidth - padX * 2;
  const innerH = sparkHeight - padY * 2;

  const minVal = 60;
  const maxVal = 160;

  const getY = (val: number) => {
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    return sparkHeight - padY - ((clamped - minVal) / (maxVal - minVal)) * innerH;
  };

  const getX = (idx: number) => {
    if (analysis.dailyPoints.length <= 1) return sparkWidth / 2;
    return padX + (idx / (analysis.dailyPoints.length - 1)) * innerW;
  };

  const sysLinePath = analysis.dailyPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(p.sys).toFixed(1)}`)
    .join(' ');

  const diaLinePath = analysis.dailyPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(p.dia).toFixed(1)}`)
    .join(' ');

  const y120 = getY(120);
  const y80 = getY(80);
  const yMovingAvgSys = getY(analysis.currSys);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Banner Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 via-white to-slate-50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Weekly Trend Insights</span>
              <span className="text-xs text-teal-700 font-semibold hidden xs:inline">
                · ค่าเฉลี่ยเคลื่อนที่ 7 วันล่าสุด
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            วิเคราะห์แนวโน้มสุขภาพ 7-Day Moving Average ตามมาตรฐานการแพทย์ ช่วยขจัดความผันผวนรายวัน
          </p>
        </div>

        {/* Status Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold self-start md:self-auto ${analysis.statusBadgeBg} ${analysis.statusBadgeText}`}
        >
          {analysis.trendStatus === 'improving' ? (
            <TrendingDown className="w-4 h-4 stroke-[2.5]" />
          ) : analysis.trendStatus === 'warning' ? (
            <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
          ) : (
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
          )}
          <span>{analysis.statusTitleTh}</span>
        </div>
      </div>

      {/* Main Grid: Left = 7-Day Moving Average KPIs, Right = Mini Sparkline & Highlights */}
      <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (5 cols): 7-Day Moving Average Metrics Card */}
        <div className="lg:col-span-5 bg-slate-50/80 rounded-xl border border-slate-200 p-4 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-700" />
              <span>ค่าเฉลี่ยเคลื่อนที่ (7-Day Moving Avg)</span>
            </span>
            <span className="text-[11px] text-slate-400">จาก 7 วันล่าสุด</span>
          </div>

          {/* Large BP Numbers */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">
                7-Day Average BP
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl sm:text-4xl font-bold text-rose-700 font-mono-numbers">
                  {analysis.currSys}
                </span>
                <span className="text-xl text-slate-300 font-bold mx-0.5">/</span>
                <span className="text-3xl sm:text-4xl font-bold text-teal-800 font-mono-numbers">
                  {analysis.currDia}
                </span>
                <span className="text-xs text-slate-500 ml-1.5">mmHg</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">
                Pulse
              </span>
              <div className="flex items-baseline gap-1 mt-0.5 justify-end">
                <span className="text-2xl sm:text-3xl font-bold text-amber-700 font-mono-numbers">
                  {analysis.currPul}
                </span>
                <span className="text-xs text-slate-400">bpm</span>
              </div>
            </div>
          </div>

          {/* Delta Comparison vs Previous 7 Days */}
          <div className="space-y-2">
            <span className="text-[11px] text-slate-500 font-medium block">
              {analysis.hasPrevWeek
                ? 'อัตราการเปลี่ยนแปลงเทียบกับ 7 วันก่อนหน้า:'
                : 'ข้อมูลเปรียบเทียบสัปดาห์ก่อนหน้า (สะสมครบ 14 วันเพื่อดูการเปลี่ยนแปลง):'}
            </span>

            {analysis.hasPrevWeek ? (
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {/* Delta SYS */}
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">SYS ตัวบน</span>
                  <div
                    className={`font-mono-numbers font-bold text-sm mt-0.5 flex items-center justify-center gap-0.5 ${
                      analysis.deltaSys < 0
                        ? 'text-emerald-600'
                        : analysis.deltaSys > 0
                        ? 'text-rose-600'
                        : 'text-slate-600'
                    }`}
                  >
                    {analysis.deltaSys < 0 ? (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    ) : analysis.deltaSys > 0 ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <Minus className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {analysis.deltaSys > 0 ? `+${analysis.deltaSys}` : analysis.deltaSys}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 block">mmHg</span>
                </div>

                {/* Delta DIA */}
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">DIA ตัวล่าง</span>
                  <div
                    className={`font-mono-numbers font-bold text-sm mt-0.5 flex items-center justify-center gap-0.5 ${
                      analysis.deltaDia < 0
                        ? 'text-emerald-600'
                        : analysis.deltaDia > 0
                        ? 'text-rose-600'
                        : 'text-slate-600'
                    }`}
                  >
                    {analysis.deltaDia < 0 ? (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    ) : analysis.deltaDia > 0 ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <Minus className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {analysis.deltaDia > 0 ? `+${analysis.deltaDia}` : analysis.deltaDia}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 block">mmHg</span>
                </div>

                {/* Delta Pulse */}
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">ชีพจร</span>
                  <div
                    className={`font-mono-numbers font-bold text-sm mt-0.5 flex items-center justify-center gap-0.5 ${
                      analysis.deltaPul < 0
                        ? 'text-emerald-600'
                        : analysis.deltaPul > 0
                        ? 'text-amber-600'
                        : 'text-slate-600'
                    }`}
                  >
                    {analysis.deltaPul < 0 ? (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    ) : analysis.deltaPul > 0 ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <Minus className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {analysis.deltaPul > 0 ? `+${analysis.deltaPul}` : analysis.deltaPul}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 block">bpm</span>
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-500 text-[11px] text-center">
                บันทึกสะสมได้ {analysis.totalDays} วัน (ระบบจะเปรียบเทียบสัปดาห์ต่อสัปดาห์เมื่อครบ 14 วัน)
              </div>
            )}
          </div>

          {/* Clinical Classification Badge */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">ระดับค่าเฉลี่ย 7 วัน:</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: analysis.currStage.accentColor }}
              />
              <span>{analysis.currStage.titleTh}</span>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Sparkline Visualization & Highlights */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          {/* Sparkline Header & Mini Graph */}
          <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">
                  กราฟค่าเฉลี่ยรายวัน vs ค่าเฉลี่ยเคลื่อนที่ 7 วัน
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-rose-600 inline-block"></span> SYS
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-teal-600 inline-block"></span> DIA
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-slate-400 border-b border-dashed inline-block"></span> เส้นเฉลี่ย
                </span>
              </div>
            </div>

            {/* SVG Sparkline Container */}
            <div className="w-full overflow-hidden">
              <svg
                viewBox={`0 0 ${sparkWidth} ${sparkHeight}`}
                className="w-full h-28 overflow-visible"
              >
                {/* Healthy Baseline reference band (< 120 and < 80) */}
                <rect
                  x={padX}
                  y={y120}
                  width={innerW}
                  height={getY(minVal) - y120}
                  fill="#10b981"
                  fillOpacity="0.04"
                />

                {/* 120 and 80 grid lines */}
                <line
                  x1={padX}
                  y1={y120}
                  x2={sparkWidth - padX}
                  y2={y120}
                  stroke="#10b981"
                  strokeWidth="0.8"
                  strokeDasharray="3 2"
                  strokeOpacity="0.6"
                />
                <line
                  x1={padX}
                  y1={y80}
                  x2={sparkWidth - padX}
                  y2={y80}
                  stroke="#0d9488"
                  strokeWidth="0.8"
                  strokeDasharray="3 2"
                  strokeOpacity="0.6"
                />

                {/* 7-Day Moving Average Line for SYS */}
                <line
                  x1={padX}
                  y1={yMovingAvgSys}
                  x2={sparkWidth - padX}
                  y2={yMovingAvgSys}
                  stroke="#94a3b8"
                  strokeWidth="1.2"
                  strokeDasharray="4 2"
                />

                {/* DIA Path */}
                <path
                  d={diaLinePath}
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* SYS Path */}
                <path
                  d={sysLinePath}
                  fill="none"
                  stroke="#e11d48"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                {/* Data Points and Day Labels */}
                {analysis.dailyPoints.map((p, i) => {
                  const cx = getX(i);
                  const cySys = getY(p.sys);
                  const cyDia = getY(p.dia);

                  return (
                    <g key={p.date} className="cursor-pointer" onClick={() => onSelectDate?.(p.date)}>
                      {/* Vertical day indicator line */}
                      <line
                        x1={cx}
                        y1={sparkHeight - padY}
                        x2={cx}
                        y2={sparkHeight - padY + 3}
                        stroke="#cbd5e1"
                      />
                      {/* Day Label */}
                      <text
                        x={cx}
                        y={sparkHeight - padY + 12}
                        textAnchor="middle"
                        className="text-[9px] fill-slate-400 font-medium"
                      >
                        {p.dayLabel}
                      </text>

                      {/* DIA dot */}
                      <circle
                        cx={cx}
                        cy={cyDia}
                        r="3"
                        fill="#0d9488"
                        stroke="#ffffff"
                        strokeWidth="1"
                      />

                      {/* SYS dot */}
                      <circle
                        cx={cx}
                        cy={cySys}
                        r="3.5"
                        fill="#e11d48"
                        stroke="#ffffff"
                        strokeWidth="1"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Key Clinical Highlights (Improvements vs Warning Signs) */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-700" />
              <span>สรุปสัญญาณพัฒนาการและข้อพึงระวัง (Clinical Highlights):</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {analysis.keyHighlights.map((hl, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                    hl.type === 'success'
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                      : hl.type === 'warning'
                      ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  {hl.type === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : hl.type === 'warning' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-snug text-[11px] font-medium">{hl.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence-Based Medical Commentary */}
          <div className="p-3 bg-teal-50/60 rounded-lg border border-teal-200/80 text-[11px] text-teal-950 leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-teal-900">คำแนะนำตามหลักการแพทย์: </strong>
              <span>{analysis.clinicalInsightTh}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
