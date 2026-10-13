import React, { useState, useMemo } from 'react';
import { DailyBPRecord, SingleReading } from '../types/bp';
import {
  computeDailyMetrics,
  formatThaiDate,
  evaluatePulse,
  classifyBP,
  getBPEmoji,
  getPulseEmoji,
  BP_STAGES,
} from '../utils/bpClassification';
import { DailyIntradayBPChart } from './DailyIntradayBPChart';
import { BackToHomeButton } from './BackToHomeButton';
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Clock,
  Heart,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Activity,
  Sparkles,
} from 'lucide-react';

interface CalendarLogViewProps {
  records: DailyBPRecord[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenLogModalForDate: (date: string) => void;
  onDeleteRecord: (id: string) => void;
  onNavigateHome?: () => void;
}

export const CalendarLogView: React.FC<CalendarLogViewProps> = ({
  records,
  selectedDate,
  onSelectDate,
  onOpenLogModalForDate,
  onDeleteRecord,
  onNavigateHome,
}) => {
  // Calendar current browsing month state
  const [currentYearMonth, setCurrentYearMonth] = useState(() => {
    // initialize from selectedDate or today (2026-10)
    const parts = selectedDate.split('-');
    if (parts.length >= 2) {
      return { year: parseInt(parts[0], 10), month: parseInt(parts[1], 10) - 1 };
    }
    return { year: 2026, month: 9 };
  });

  // Map records by date string for O(1) lookup
  const recordMap = useMemo(() => {
    const map = new Map<string, DailyBPRecord>();
    records.forEach((r) => map.set(r.date, r));
    return map;
  }, [records]);

  // Selected date record & calculated metrics
  const selectedRecord = recordMap.get(selectedDate) || null;
  const selectedMetrics = useMemo(() => {
    if (!selectedRecord) return null;
    return computeDailyMetrics(selectedRecord);
  }, [selectedRecord]);

  // Calendar month grid generation
  const daysInMonth = new Date(currentYearMonth.year, currentYearMonth.month + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYearMonth.year, currentYearMonth.month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentYearMonth((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setCurrentYearMonth((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const monthNamesTh = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          {onNavigateHome && (
            <div className="mb-1.5">
              <BackToHomeButton onNavigateHome={onNavigateHome} />
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            ประเมินผลรายวัน & ปฏิทินบันทึก
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            เลือกดูข้อมูลย้อนหลังตามวันที่ พร้อมแถบสีประเมินระดับสุขภาพและคำแนะนำตามหลักการแพทย์สากล
          </p>
        </div>

        <button
          onClick={() => onOpenLogModalForDate(selectedDate)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{selectedRecord ? 'แก้ไขบันทึกวันนี้' : 'เพิ่มบันทึกวันที่เลือก'}</span>
        </button>
      </div>

      {/* 2-Column Split: Left = Calendar Picker, Right = Daily Detailed Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Calendar (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-3.5 sm:p-5 space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              {monthNamesTh[currentYearMonth.month]} {currentYearMonth.year + 543}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                aria-label="Next month"
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] sm:text-xs font-semibold text-slate-400">
            {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10 sm:h-11" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYearMonth.year}-${String(
                currentYearMonth.month + 1
              ).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr;
              const record = recordMap.get(dateStr);
              const metrics = record ? computeDailyMetrics(record) : null;
              const stage = metrics?.stage;

              return (
                <button
                  key={dateStr}
                  onClick={() => onSelectDate(dateStr)}
                  className={`h-11 sm:h-12 rounded-xl flex flex-col items-center justify-center relative transition-all text-xs p-1 ${
                    isSelected
                      ? 'bg-teal-700 text-white font-bold ring-2 ring-teal-700 ring-offset-2 shadow-sm'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="font-mono-numbers text-[11px] leading-tight font-semibold">
                    {dayNum}
                  </span>

                  {/* Status indicator emoji & color dot */}
                  {stage ? (
                    <div className="flex items-center gap-0.5 mt-0.5" title={`${stage.heartEmoji} ${stage.emoji} ${stage.titleTh} (${metrics?.dailyAvg?.sys}/${metrics?.dailyAvg?.dia})`}>
                      <span className="text-[10px] sm:text-xs leading-none">
                        {stage.emoji}
                      </span>
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: isSelected ? '#ffffff' : stage.accentColor,
                        }}
                      />
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Status Color & Emoji Guide Legend */}
          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <span className="text-slate-400 font-medium block text-[10px] sm:text-[11px]">
              อิโมจิและระดับสีประเมินสุขภาพ (AHA / ESC):
            </span>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">😊</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="truncate">เหมาะสม (&lt;120/80)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">😐</span>
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                <span className="truncate">เฝ้าระวัง (130-139)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">😟</span>
                <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0"></span>
                <span className="truncate">ระดับ 1 (140-159)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">😨</span>
                <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>
                <span className="truncate">ระดับ 2+ (≥160)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Daily Breakdown & Clinical Assessment (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {selectedRecord && selectedMetrics ? (
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-5 sm:space-y-6">
              {/* Daily Title & Action Buttons */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="text-3xl sm:text-4xl p-2 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs flex items-center justify-center">
                    {selectedMetrics.stage?.emoji || '📋'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wider">
                        ผลการประเมินประจำวัน
                      </span>
                      {selectedMetrics.stage && (
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${selectedMetrics.stage.badgeBg} ${selectedMetrics.stage.badgeText}`}
                        >
                          {selectedMetrics.stage.heartEmoji} {selectedMetrics.stage.titleTh}
                        </span>
                      )}
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      {formatThaiDate(selectedDate, { showDayOfWeek: true })}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => onOpenLogModalForDate(selectedDate)}
                    className="p-2 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="แก้ไขข้อมูลวันนี้"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('คุณต้องการลบข้อมูลบันทึกของวันนี้หรือไม่?')) {
                        onDeleteRecord(selectedRecord.id);
                      }
                    }}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="ลบข้อมูลวันนี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Color-Coded Status Gradient Bar (Mandatory Requirement) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">แถบระดับความดันโลหิตสากล:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{selectedMetrics.stage?.emoji}</span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: selectedMetrics.stage?.accentColor }}
                    ></span>
                    <span className="font-bold text-slate-900">
                      {selectedMetrics.stage?.titleTh}
                    </span>
                    <span className="text-slate-400 hidden xs:inline">({selectedMetrics.stage?.titleEn})</span>
                  </div>
                </div>

                {/* Smooth Gradient Visual Bar */}
                <div className="relative h-3 w-full rounded-full bg-gradient-to-r from-emerald-500 via-yellow-400 via-orange-500 to-rose-600 shadow-inner">
                  {/* Marker Pin based on severity index (0 to 6) */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-slate-900 shadow-md transition-all"
                    style={{
                      left: `calc(${
                        ((selectedMetrics.stage?.severityIndex ?? 1) / 6) * 94
                      }% + 2%)`,
                    }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
                  <span>เหมาะสม (&lt;120)</span>
                  <span>เฝ้าระวัง (130)</span>
                  <span>ระดับ 1 (140)</span>
                  <span>วิกฤต (≥180)</span>
                </div>
              </div>

              {/* Combined Daily Summary Card */}
              <div className="p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700">ค่าเฉลี่ยรวมประจำวัน</span>
                    {selectedMetrics.stage && (
                      <span className="text-xs">
                        {selectedMetrics.stage.heartEmoji} {selectedMetrics.stage.emoji}
                      </span>
                    )}
                  </div>
                  <span>{selectedMetrics.dailyAvg?.count} ครั้ง</span>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                  <div className="p-2 sm:p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] sm:text-[11px] text-slate-500 block">
                      SYS (บน) {selectedMetrics.stage?.heartEmoji}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-rose-700 font-mono-numbers">
                      {selectedMetrics.dailyAvg?.sys}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 block">mmHg</span>
                  </div>

                  <div className="p-2 sm:p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] sm:text-[11px] text-slate-500 block">
                      DIA (ล่าง) 🟢
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-teal-800 font-mono-numbers">
                      {selectedMetrics.dailyAvg?.dia}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 block">mmHg</span>
                  </div>

                  <div className="p-2 sm:p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] sm:text-[11px] text-slate-500 block">
                      ชีพจร {selectedMetrics.dailyAvg?.pul ? getPulseEmoji(selectedMetrics.dailyAvg.pul).emoji : '💓'}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-amber-700 font-mono-numbers">
                      {selectedMetrics.dailyAvg?.pul}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 block">bpm</span>
                  </div>
                </div>

                {/* Additional Clinical Indicators: Pulse Pressure & MAP */}
                <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mt-3 pt-3 border-t border-slate-200 text-[11px] sm:text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400">PP:</span>{' '}
                    <span className="font-semibold font-mono-numbers">
                      {selectedMetrics.pulsePressure} mmHg
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">MAP:</span>{' '}
                    <span className="font-semibold font-mono-numbers">
                      {selectedMetrics.meanArterialPressure} mmHg
                    </span>
                  </div>
                  {selectedMetrics.morningSurge !== null && (
                    <div>
                      <span className="text-slate-400">เช้า-เย็น:</span>{' '}
                      <span className="font-semibold font-mono-numbers">
                        {selectedMetrics.morningSurge > 0
                          ? `+${selectedMetrics.morningSurge}`
                          : selectedMetrics.morningSurge}{' '}
                        mmHg {selectedMetrics.morningSurge >= 20 ? '⚠️' : '✅'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Daily Intraday BP Chart (Mandatory Requirement) */}
              <DailyIntradayBPChart
                record={selectedRecord}
                selectedDate={selectedDate}
              />

              {/* Data Input Structure: Morning & Evening Detail (Mandatory Requirement) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Morning Round */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-amber-700 font-bold text-sm">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>รอบเช้า 🌅 (Morning)</span>
                    </div>
                    {selectedMetrics.morningAvg && (
                      <span className="text-xs font-semibold text-slate-700 bg-amber-50/80 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span>{classifyBP(selectedMetrics.morningAvg.sys, selectedMetrics.morningAvg.dia).emoji}</span>
                        <span>เฉลี่ย: {selectedMetrics.morningAvg.sys}/{selectedMetrics.morningAvg.dia}</span>
                      </span>
                    )}
                  </div>

                  {/* Reading 1 and Reading 2 */}
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-700">ครั้งที่ 1</span>
                        {selectedRecord.morning.reading1?.time && (
                          <span className="text-slate-400 ml-1.5">
                            ({selectedRecord.morning.reading1.time})
                          </span>
                        )}
                      </div>
                      {selectedRecord.morning.reading1 ? (
                        <div className="font-mono-numbers font-medium text-slate-800 flex items-center gap-1.5">
                          <span className="text-xs">
                            {classifyBP(selectedRecord.morning.reading1.sys, selectedRecord.morning.reading1.dia).emoji}
                          </span>
                          <span>
                            {selectedRecord.morning.reading1.sys} / {selectedRecord.morning.reading1.dia}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            ({selectedRecord.morning.reading1.pul} bpm)
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">ไม่ได้บันทึก</span>
                      )}
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-700">ครั้งที่ 2</span>
                        {selectedRecord.morning.reading2?.time && (
                          <span className="text-slate-400 ml-1.5">
                            ({selectedRecord.morning.reading2.time})
                          </span>
                        )}
                      </div>
                      {selectedRecord.morning.reading2 ? (
                        <div className="font-mono-numbers font-medium text-slate-800 flex items-center gap-1.5">
                          <span className="text-xs">
                            {classifyBP(selectedRecord.morning.reading2.sys, selectedRecord.morning.reading2.dia).emoji}
                          </span>
                          <span>
                            {selectedRecord.morning.reading2.sys} / {selectedRecord.morning.reading2.dia}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            ({selectedRecord.morning.reading2.pul} bpm)
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">ไม่ได้บันทึก</span>
                      )}
                    </div>
                  </div>

                  {selectedRecord.morning.note && (
                    <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded">
                      บันทึกเช้า: {selectedRecord.morning.note}
                    </p>
                  )}
                </div>

                {/* Evening Round */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-sm">
                      <Moon className="w-4 h-4 text-indigo-500" />
                      <span>รอบเย็น 🌙 (Evening)</span>
                    </div>
                    {selectedMetrics.eveningAvg && (
                      <span className="text-xs font-semibold text-slate-700 bg-indigo-50/80 border border-indigo-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span>{classifyBP(selectedMetrics.eveningAvg.sys, selectedMetrics.eveningAvg.dia).emoji}</span>
                        <span>เฉลี่ย: {selectedMetrics.eveningAvg.sys}/{selectedMetrics.eveningAvg.dia}</span>
                      </span>
                    )}
                  </div>

                  {/* Reading 1 and Reading 2 */}
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-700">ครั้งที่ 1</span>
                        {selectedRecord.evening.reading1?.time && (
                          <span className="text-slate-400 ml-1.5">
                            ({selectedRecord.evening.reading1.time})
                          </span>
                        )}
                      </div>
                      {selectedRecord.evening.reading1 ? (
                        <div className="font-mono-numbers font-medium text-slate-800 flex items-center gap-1.5">
                          <span className="text-xs">
                            {classifyBP(selectedRecord.evening.reading1.sys, selectedRecord.evening.reading1.dia).emoji}
                          </span>
                          <span>
                            {selectedRecord.evening.reading1.sys} / {selectedRecord.evening.reading1.dia}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            ({selectedRecord.evening.reading1.pul} bpm)
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">ไม่ได้บันทึก</span>
                      )}
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-700">ครั้งที่ 2</span>
                        {selectedRecord.evening.reading2?.time && (
                          <span className="text-slate-400 ml-1.5">
                            ({selectedRecord.evening.reading2.time})
                          </span>
                        )}
                      </div>
                      {selectedRecord.evening.reading2 ? (
                        <div className="font-mono-numbers font-medium text-slate-800 flex items-center gap-1.5">
                          <span className="text-xs">
                            {classifyBP(selectedRecord.evening.reading2.sys, selectedRecord.evening.reading2.dia).emoji}
                          </span>
                          <span>
                            {selectedRecord.evening.reading2.sys} / {selectedRecord.evening.reading2.dia}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            ({selectedRecord.evening.reading2.pul} bpm)
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">ไม่ได้บันทึก</span>
                      )}
                    </div>
                  </div>

                  {selectedRecord.evening.note && (
                    <p className="text-[11px] text-slate-500 italic bg-indigo-50/50 p-2 rounded">
                      บันทึกเย็น: {selectedRecord.evening.note}
                    </p>
                  )}
                </div>
              </div>

              {/* Medical Insights & Evidence-Based Guidelines (Mandatory Requirement) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{selectedMetrics.stage?.emoji || '🩺'}</span>
                  <Activity className="w-4 h-4 text-teal-700" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    คำแนะนำด้านสุขภาพตามหลักการแพทย์สากล (Medical Insights)
                  </h3>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedMetrics.stage?.actionGuidelineTh}
                </p>

                <div className="pt-2 border-t border-slate-200 flex items-start gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-800">แนวทางติดตาม:</strong>{' '}
                    {selectedMetrics.stage?.followUpAdviceTh}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State for selected date */
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  ยังไม่มีบันทึกในวันที่ {formatThaiDate(selectedDate)}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  คุณสามารถบันทึกค่าความดันโลหิตย้อนหลัง หรือบันทึกข้อมูลของวันใหม่ได้ทันที
                </p>
              </div>

              <button
                onClick={() => onOpenLogModalForDate(selectedDate)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 text-white rounded-lg text-xs font-semibold hover:bg-teal-800 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>+ บันทึกความดันของวันนี้</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
