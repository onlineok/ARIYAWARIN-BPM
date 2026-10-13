import React, { useState } from 'react';
import { DailyBPRecord, SingleReading } from '../types/bp';
import {
  classifyBP,
  getBPEmoji,
  getPulseEmoji,
  BP_STAGES,
} from '../utils/bpClassification';
import {
  Sun,
  Moon,
  TrendingUp,
  Activity,
  Heart,
  Info,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';

interface DailyIntradayBPChartProps {
  record: DailyBPRecord;
  selectedDate: string;
}

interface IntradayPoint {
  id: string;
  period: 'morning' | 'evening';
  index: 1 | 2;
  labelTh: string;
  shortLabel: string;
  time: string;
  sys: number;
  dia: number;
  pul: number;
  stage: ReturnType<typeof classifyBP>;
  emoji: ReturnType<typeof getBPEmoji>;
  pulseEmoji: ReturnType<typeof getPulseEmoji>;
}

export const DailyIntradayBPChart: React.FC<DailyIntradayBPChartProps> = ({
  record,
  selectedDate,
}) => {
  const [activePointId, setActivePointId] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<'readings' | 'averages'>('readings');

  // Extract all valid readings of the day
  const points: IntradayPoint[] = [];

  const addPointIfValid = (
    reading: SingleReading | null | undefined,
    period: 'morning' | 'evening',
    index: 1 | 2,
    defaultTime: string
  ) => {
    if (reading && reading.sys > 0 && reading.dia > 0) {
      const timeStr = reading.time || defaultTime;
      const stage = classifyBP(reading.sys, reading.dia);
      const emoji = getBPEmoji(stage.key);
      const pulseEmoji = getPulseEmoji(reading.pul);

      points.push({
        id: `${period}-${index}`,
        period,
        index,
        labelTh: `${period === 'morning' ? 'รอบเช้า' : 'รอบเย็น'} ครั้งที่ ${index}`,
        shortLabel: `${period === 'morning' ? 'เช้า' : 'เย็น'} #${index}`,
        time: timeStr,
        sys: reading.sys,
        dia: reading.dia,
        pul: reading.pul,
        stage,
        emoji,
        pulseEmoji,
      });
    }
  };

  addPointIfValid(record.morning.reading1, 'morning', 1, '07:00');
  addPointIfValid(record.morning.reading2, 'morning', 2, '07:05');
  addPointIfValid(record.evening.reading1, 'evening', 1, '18:30');
  addPointIfValid(record.evening.reading2, 'evening', 2, '18:35');

  // If no readings at all
  if (points.length === 0) {
    return (
      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
        <Activity className="w-8 h-8 mx-auto text-slate-300" />
        <p className="text-xs font-semibold text-slate-600">
          ยังไม่มีข้อมูลการวัดความดันสำหรับสร้างกราฟในวันนี้
        </p>
        <p className="text-[11px] text-slate-400">
          บันทึกการวัดรอบเช้าหรือรอบเย็นเพื่อดูกราฟวิเคราะห์ความดันโลหิตรายวัน
        </p>
      </div>
    );
  }

  // Calculate morning and evening averages for comparison mode
  const morningPoints = points.filter((p) => p.period === 'morning');
  const eveningPoints = points.filter((p) => p.period === 'evening');

  const morningAvg =
    morningPoints.length > 0
      ? {
          sys: Math.round(
            morningPoints.reduce((acc, p) => acc + p.sys, 0) / morningPoints.length
          ),
          dia: Math.round(
            morningPoints.reduce((acc, p) => acc + p.dia, 0) / morningPoints.length
          ),
          pul: Math.round(
            morningPoints.reduce((acc, p) => acc + p.pul, 0) / morningPoints.length
          ),
        }
      : null;

  const eveningAvg =
    eveningPoints.length > 0
      ? {
          sys: Math.round(
            eveningPoints.reduce((acc, p) => acc + p.sys, 0) / eveningPoints.length
          ),
          dia: Math.round(
            eveningPoints.reduce((acc, p) => acc + p.dia, 0) / eveningPoints.length
          ),
          pul: Math.round(
            eveningPoints.reduce((acc, p) => acc + p.pul, 0) / eveningPoints.length
          ),
        }
      : null;

  // SVG Chart Geometry
  const width = 640;
  const height = 260;
  const padLeft = 45;
  const padRight = 35;
  const padTop = 30;
  const padBottom = 45;

  const chartInnerWidth = width - padLeft - padRight;
  const chartInnerHeight = height - padTop - padBottom;

  // Y-axis range (typically 40 to 190 mmHg)
  const minY = 40;
  const maxY = Math.max(
    180,
    ...points.map((p) => Math.max(p.sys, p.pul) + 15)
  );

  const getY = (val: number) => {
    const clamped = Math.max(minY, Math.min(maxY, val));
    return padTop + chartInnerHeight - ((clamped - minY) / (maxY - minY)) * chartInnerHeight;
  };

  // Determine active item to display in callout
  const activePoint =
    points.find((p) => p.id === activePointId) || points[points.length - 1];

  // Grid lines to display
  const yGridValues = [60, 80, 100, 120, 140, 160, 180].filter(
    (v) => v >= minY && v <= maxY
  );

  // X Coordinates calculation
  const getX = (index: number, total: number) => {
    if (total <= 1) return padLeft + chartInnerWidth / 2;
    return padLeft + (index / (total - 1)) * chartInnerWidth;
  };

  // Safe zones geometry
  const y80 = getY(80);
  const y120 = getY(120);
  const y140 = getY(140);

  // Morning surge detection
  const morningSurge =
    morningAvg && eveningAvg ? morningAvg.sys - eveningAvg.sys : null;

  return (
    <div className="bg-gradient-to-b from-white to-slate-50/60 rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-xs">
      {/* Chart Top Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              กราฟผลบันทึกความดันโลหิตของวันนี้ (Intraday BP Graph)
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            ค่าความดันตัวบน (SYS) · ตัวล่าง (DIA) · ชีพจร (PUL) ในแต่ละรอบของวัน
          </p>
        </div>

        {/* View Mode Toggle Button */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartMode('readings')}
            className={`px-3 py-1 rounded-lg font-medium transition-all text-xs cursor-pointer ${
              chartMode === 'readings'
                ? 'bg-white text-teal-800 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            แสดงทุกจุดวัด ({points.length} ครั้ง)
          </button>
          <button
            type="button"
            onClick={() => setChartMode('averages')}
            className={`px-3 py-1 rounded-lg font-medium transition-all text-xs cursor-pointer ${
              chartMode === 'averages'
                ? 'bg-white text-teal-800 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            เปรียบเทียบ เช้า vs เย็น
          </button>
        </div>
      </div>

      {/* Legend & Target Thresholds */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600 px-1">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 ring-2 ring-rose-200"></span>
            <span className="font-semibold text-rose-700">SYS (ตัวบน)</span>
            <span className="text-[10px] text-slate-400">&lt;120</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-teal-600 ring-2 ring-teal-200"></span>
            <span className="font-semibold text-teal-700">DIA (ตัวล่าง)</span>
            <span className="text-[10px] text-slate-400">&lt;80</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-200"></span>
            <span className="font-semibold text-amber-700">PUL (ชีพจร)</span>
            <span className="text-[10px] text-slate-400">bpm</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-300"></span>
          <span>โซนเหมาะสมตามเกณฑ์ AHA/ESC</span>
        </div>
      </div>

      {/* SVG Responsive Chart View */}
      {chartMode === 'readings' ? (
        <div className="relative w-full overflow-hidden rounded-xl bg-white border border-slate-100 p-2 sm:p-3">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible select-none"
          >
            <defs>
              {/* Gradients for SYS and DIA areas */}
              <linearGradient id="intraSysGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.01" />
              </linearGradient>
              <linearGradient id="intraDiaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0d9488" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#0d9488" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Shaded Optimal Target Safe Zone (Between 80 DIA and 120 SYS) */}
            <rect
              x={padLeft}
              y={y120}
              width={chartInnerWidth}
              height={Math.max(0, y80 - y120)}
              fill="#10b981"
              fillOpacity="0.06"
              rx="4"
            />

            {/* Horizontal Grid lines and mmHg labels */}
            {yGridValues.map((val) => {
              const y = getY(val);
              const isTarget120 = val === 120;
              const isTarget80 = val === 80;
              const isWarning140 = val === 140;

              return (
                <g key={val}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke={
                      isTarget120 || isTarget80
                        ? '#059669'
                        : isWarning140
                        ? '#ea580c'
                        : '#e2e8f0'
                    }
                    strokeDasharray={isTarget120 || isTarget80 || isWarning140 ? '4 3' : 'none'}
                    strokeWidth={isTarget120 || isTarget80 || isWarning140 ? 1.2 : 0.8}
                    opacity={isTarget120 || isTarget80 ? 0.7 : 0.9}
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[9px] fill-slate-400 font-mono"
                  >
                    {val}
                  </text>
                  {isTarget120 && (
                    <text
                      x={width - padRight + 6}
                      y={y + 3}
                      className="text-[8px] fill-emerald-700 font-bold"
                    >
                      เป้า 120
                    </text>
                  )}
                  {isTarget80 && (
                    <text
                      x={width - padRight + 6}
                      y={y + 3}
                      className="text-[8px] fill-teal-700 font-bold"
                    >
                      เป้า 80
                    </text>
                  )}
                  {isWarning140 && (
                    <text
                      x={width - padRight + 6}
                      y={y + 3}
                      className="text-[8px] fill-orange-700 font-bold"
                    >
                      สูง 140
                    </text>
                  )}
                </g>
              );
            })}

            {/* Area and Line Paths if >= 2 points */}
            {points.length > 1 && (
              <>
                {/* SYS Filled Area */}
                <path
                  d={`
                    M ${getX(0, points.length)} ${getY(points[0].sys)}
                    ${points
                      .map((p, i) => `L ${getX(i, points.length)} ${getY(p.sys)}`)
                      .join(' ')}
                    L ${getX(points.length - 1, points.length)} ${getY(minY)}
                    L ${getX(0, points.length)} ${getY(minY)}
                    Z
                  `}
                  fill="url(#intraSysGrad)"
                />

                {/* DIA Filled Area */}
                <path
                  d={`
                    M ${getX(0, points.length)} ${getY(points[0].dia)}
                    ${points
                      .map((p, i) => `L ${getX(i, points.length)} ${getY(p.dia)}`)
                      .join(' ')}
                    L ${getX(points.length - 1, points.length)} ${getY(minY)}
                    L ${getX(0, points.length)} ${getY(minY)}
                    Z
                  `}
                  fill="url(#intraDiaGrad)"
                />

                {/* SYS Connecting Line */}
                <path
                  d={`
                    M ${getX(0, points.length)} ${getY(points[0].sys)}
                    ${points
                      .map((p, i) => `L ${getX(i, points.length)} ${getY(p.sys)}`)
                      .join(' ')}
                  `}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* DIA Connecting Line */}
                <path
                  d={`
                    M ${getX(0, points.length)} ${getY(points[0].dia)}
                    ${points
                      .map((p, i) => `L ${getX(i, points.length)} ${getY(p.dia)}`)
                      .join(' ')}
                  `}
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Pulse Line */}
                <path
                  d={`
                    M ${getX(0, points.length)} ${getY(points[0].pul)}
                    ${points
                      .map((p, i) => `L ${getX(i, points.length)} ${getY(p.pul)}`)
                      .join(' ')}
                  `}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.8"
                  strokeDasharray="4 3"
                  strokeLinecap="round"
                />
              </>
            )}

            {/* Vertical connector line for each reading (SYS down to DIA) */}
            {points.map((p, i) => {
              const x = getX(i, points.length);
              const ySys = getY(p.sys);
              const yDia = getY(p.dia);
              const yPul = getY(p.pul);
              const isHovered = activePointId === p.id;

              return (
                <g key={p.id} className="cursor-pointer">
                  {/* Subtle vertical spine */}
                  <line
                    x1={x}
                    y1={ySys}
                    x2={x}
                    y2={yDia}
                    stroke="#94a3b8"
                    strokeWidth={isHovered ? 2 : 1}
                    strokeDasharray="2 2"
                    opacity={0.7}
                  />

                  {/* Active highlight pillar */}
                  {isHovered && (
                    <line
                      x1={x}
                      y1={padTop}
                      x2={x}
                      y2={height - padBottom}
                      stroke="#0d9488"
                      strokeWidth={1}
                      strokeDasharray="2 2"
                      opacity={0.5}
                    />
                  )}

                  {/* SYS Data Point */}
                  <circle
                    cx={x}
                    cy={ySys}
                    r={isHovered ? 6 : 4.5}
                    fill="#f43f5e"
                    stroke="#ffffff"
                    strokeWidth={2}
                    className="transition-all"
                  />
                  {/* SYS Value label */}
                  <text
                    x={x}
                    y={ySys - 9}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-rose-700 font-mono"
                  >
                    {p.sys}
                  </text>

                  {/* DIA Data Point */}
                  <circle
                    cx={x}
                    cy={yDia}
                    r={isHovered ? 6 : 4.5}
                    fill="#0d9488"
                    stroke="#ffffff"
                    strokeWidth={2}
                    className="transition-all"
                  />
                  {/* DIA Value label */}
                  <text
                    x={x}
                    y={yDia + 14}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-teal-800 font-mono"
                  >
                    {p.dia}
                  </text>

                  {/* PUL Data Point */}
                  <circle
                    cx={x}
                    cy={yPul}
                    r={isHovered ? 4.5 : 3.5}
                    fill="#f59e0b"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                  />

                  {/* Bottom X-axis label with Time and Round */}
                  <text
                    x={x}
                    y={height - padBottom + 16}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-slate-700"
                  >
                    {p.shortLabel}
                  </text>
                  <text
                    x={x}
                    y={height - padBottom + 28}
                    textAnchor="middle"
                    className="text-[9px] fill-slate-400 font-mono"
                  >
                    {p.time}
                  </text>

                  {/* Stage Emoji on top of reading */}
                  <text
                    x={x}
                    y={padTop - 8}
                    textAnchor="middle"
                    className="text-xs"
                  >
                    {p.emoji.face}
                  </text>

                  {/* Click/Hover target zone */}
                  <rect
                    x={x - 24}
                    y={padTop}
                    width={48}
                    height={chartInnerHeight}
                    fill="transparent"
                    onMouseEnter={() => setActivePointId(p.id)}
                    onClick={() => setActivePointId(p.id)}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      ) : (
        /* Comparison Mode: Morning Average vs Evening Average side by side */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          {/* Morning Round Average Card */}
          <div className="p-4 rounded-xl bg-white border border-amber-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-amber-100">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-xs sm:text-sm text-slate-800">
                  รอบเช้า (Morning Average)
                </span>
              </div>
              {morningAvg && (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {classifyBP(morningAvg.sys, morningAvg.dia).emoji}{' '}
                  {classifyBP(morningAvg.sys, morningAvg.dia).titleTh}
                </span>
              )}
            </div>

            {morningAvg ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-rose-50/60 rounded-lg border border-rose-100">
                    <span className="text-[10px] text-slate-500 block">SYS</span>
                    <span className="text-lg font-bold text-rose-700 font-mono">
                      {morningAvg.sys}
                    </span>
                  </div>
                  <div className="p-2 bg-teal-50/60 rounded-lg border border-teal-100">
                    <span className="text-[10px] text-slate-500 block">DIA</span>
                    <span className="text-lg font-bold text-teal-800 font-mono">
                      {morningAvg.dia}
                    </span>
                  </div>
                  <div className="p-2 bg-amber-50/60 rounded-lg border border-amber-100">
                    <span className="text-[10px] text-slate-500 block">PUL</span>
                    <span className="text-lg font-bold text-amber-700 font-mono">
                      {morningAvg.pul}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  คำนวณจาก {morningPoints.length} ครั้งที่บันทึกช่วงเช้า
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                ยังไม่มีข้อมูลรอบเช้า
              </p>
            )}
          </div>

          {/* Evening Round Average Card */}
          <div className="p-4 rounded-xl bg-white border border-indigo-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-xs sm:text-sm text-slate-800">
                  รอบเย็น (Evening Average)
                </span>
              </div>
              {eveningAvg && (
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  {classifyBP(eveningAvg.sys, eveningAvg.dia).emoji}{' '}
                  {classifyBP(eveningAvg.sys, eveningAvg.dia).titleTh}
                </span>
              )}
            </div>

            {eveningAvg ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-rose-50/60 rounded-lg border border-rose-100">
                    <span className="text-[10px] text-slate-500 block">SYS</span>
                    <span className="text-lg font-bold text-rose-700 font-mono">
                      {eveningAvg.sys}
                    </span>
                  </div>
                  <div className="p-2 bg-teal-50/60 rounded-lg border border-teal-100">
                    <span className="text-[10px] text-slate-500 block">DIA</span>
                    <span className="text-lg font-bold text-teal-800 font-mono">
                      {eveningAvg.dia}
                    </span>
                  </div>
                  <div className="p-2 bg-amber-50/60 rounded-lg border border-amber-100">
                    <span className="text-[10px] text-slate-500 block">PUL</span>
                    <span className="text-lg font-bold text-amber-700 font-mono">
                      {eveningAvg.pul}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  คำนวณจาก {eveningPoints.length} ครั้งที่บันทึกช่วงเย็น
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                ยังไม่มีข้อมูลรอบเย็น
              </p>
            )}
          </div>
        </div>
      )}

      {/* Interactive Selected Point Inspector / Callout with Emojis */}
      {activePoint && (
        <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="text-2xl sm:text-3xl p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
              {activePoint.emoji.face}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  {activePoint.labelTh}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  ({activePoint.time})
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${activePoint.stage.badgeBg} ${activePoint.stage.badgeText}`}
                >
                  {activePoint.stage.heartEmoji} {activePoint.stage.titleTh}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {activePoint.stage.clinicalSummary}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-xl border border-slate-200 shrink-0">
            <div>
              <span className="text-[9px] text-slate-400 block">ความดัน</span>
              <span className="font-bold font-mono text-slate-800 text-sm">
                <span className="text-rose-600">{activePoint.sys}</span> /{' '}
                <span className="text-teal-700">{activePoint.dia}</span>
              </span>
              <span className="text-[9px] text-slate-400 ml-1">mmHg</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-[9px] text-slate-400 block">ชีพจร</span>
              <span className="font-bold font-mono text-amber-700 text-sm">
                {activePoint.pul}
              </span>
              <span className="text-[9px] text-slate-400 ml-1">
                {activePoint.pulseEmoji.emoji} bpm
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Morning Surge Clinical Evaluation Bar with Emojis */}
      {morningSurge !== null && (
        <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-200/80 flex items-start gap-2.5 text-xs">
          <div className="text-lg">
            {morningSurge >= 20 ? '⚠️' : '🌅'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">
                ประเมินส่วนต่างความดันเช้า-เย็น (Morning BP Surge):
              </span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                  morningSurge >= 20
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {morningSurge > 0 ? `+${morningSurge}` : morningSurge} mmHg
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              {morningSurge >= 20
                ? '⚠️ ตรวจพบความดันช่วงเช้าสูงกว่าช่วงเย็นเกิน 20 mmHg (Morning Surge) เสี่ยงต่อโรคหลอดเลือดสมองและหัวใจ แนะนำแจ้งแพทย์ประจำตัว'
                : '✅ ภาวะความดันโลหิตช่วงเช้าและช่วงเย็นมีความสมดุลตามเกณฑ์มาตรฐานสากล'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
