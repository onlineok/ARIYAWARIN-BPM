/**
 * Blood Pressure Data Types and Classification Interfaces
 * Aligned with AHA/ACC & ESC/ESH Clinical Guidelines
 */

export interface SingleReading {
  sys: number; // Systolic (mmHg)
  dia: number; // Diastolic (mmHg)
  pul: number; // Pulse / Heart rate (bpm)
  time?: string; // Optional time of measurement e.g. "07:15"
}

export interface PeriodReadings {
  reading1: SingleReading | null;
  reading2: SingleReading | null;
  note?: string;
}

export interface DailyBPRecord {
  id: string;
  date: string; // YYYY-MM-DD
  memberId?: string; // Associated registered member ID
  memberName?: string; // Associated registered member display name
  morning: PeriodReadings;
  evening: PeriodReadings;
  overallNote?: string;
  createdAt: number;
  updatedAt?: number;
  lastSavedAt?: number;
  timestamp?: string; // Formatted timestamp (ทามสแตมป์) when saved
  syncedToSheets?: boolean;
}

export type BPStageKey =
  | 'hypotension'
  | 'optimal'
  | 'normal'
  | 'high_normal'
  | 'grade1'
  | 'grade2'
  | 'crisis';

export interface BPStageInfo {
  key: BPStageKey;
  titleTh: string;
  titleEn: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string; // Hex for charts/gradients
  gradientClass: string;
  severityIndex: number; // 0 to 6
  emoji: string; // Health face/mood emoji e.g. 😊, 😃, 😐, 😟, 😨, 🚨, 🥶
  heartEmoji: string; // Heart color indicator e.g. 💚, 💛, 🧡, 🔴, 🚨, 💙
  sysRange: string;
  diaRange: string;
  clinicalSummary: string;
  actionGuidelineTh: string;
  followUpAdviceTh: string;
}

export interface AverageResult {
  sys: number;
  dia: number;
  pul: number;
  count: number;
}

export interface DailyCalculatedMetrics {
  morningAvg: AverageResult | null;
  eveningAvg: AverageResult | null;
  dailyAvg: AverageResult | null;
  stage: BPStageInfo | null;
  morningSurge: number | null; // morning SYS avg - evening SYS avg
  pulsePressure: number | null; // SYS - DIA
  meanArterialPressure: number | null; // MAP = DIA + (SYS - DIA) / 3
}

export type ChartViewMode = 'all_four' | 'averages';
export type TimeFilterRange = '7d' | '14d' | '30d' | '90d' | 'all';
