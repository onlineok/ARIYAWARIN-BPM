import { DailyBPRecord } from '../types/bp';
import { computeDailyMetrics, classifyBP, formatThaiDate } from './bpClassification';

export interface CsvExportOptions {
  dateRange: '7d' | '14d' | '30d' | '90d' | 'all' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  language: 'th' | 'en' | 'bilingual';
  includeClinicalSummary: boolean;
  patientName?: string;
  patientId?: string; // e.g. Hospital Number (HN)
}

/**
 * Filter records based on selected export range
 */
export function filterRecordsForExport(
  records: DailyBPRecord[],
  options: Pick<CsvExportOptions, 'dateRange' | 'customStartDate' | 'customEndDate'>
): DailyBPRecord[] {
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date)); // chronological
  if (sorted.length === 0) return [];

  if (options.dateRange === 'custom') {
    return sorted.filter((r) => {
      if (options.customStartDate && r.date < options.customStartDate) return false;
      if (options.customEndDate && r.date > options.customEndDate) return false;
      return true;
    });
  }

  const count = sorted.length;
  switch (options.dateRange) {
    case '7d':
      return sorted.slice(Math.max(0, count - 7));
    case '14d':
      return sorted.slice(Math.max(0, count - 14));
    case '30d':
      return sorted.slice(Math.max(0, count - 30));
    case '90d':
      return sorted.slice(Math.max(0, count - 90));
    case 'all':
    default:
      return sorted;
  }
}

/**
 * Generate CSV content string with UTF-8 BOM
 */
export function generateBloodPressureCsv(
  records: DailyBPRecord[],
  options: CsvExportOptions
): string {
  const filtered = filterRecordsForExport(records, options);
  const rows: string[] = [];

  // Escape CSV string values
  const escapeCell = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Optional Clinical Metadata Header for Healthcare Provider
  if (options.includeClinicalSummary) {
    rows.push(escapeCell('=== รายงานบันทึกความดันโลหิตสำหรับแพทย์ (Home Blood Pressure Monitoring Record) ==='));
    if (options.patientName) {
      rows.push(`${escapeCell('ชื่อผู้รับบริการ / Patient Name')},${escapeCell(options.patientName)}`);
    }
    if (options.patientId) {
      rows.push(`${escapeCell('รหัสผู้ป่วย / Hospital Number (HN)')},${escapeCell(options.patientId)}`);
    }
    rows.push(`${escapeCell('วันที่ส่งออกข้อมูล / Export Date')},${escapeCell(new Date().toISOString().slice(0, 10))}`);
    rows.push(`${escapeCell('จำนวนวันที่บันทึก / Total Days')},${escapeCell(filtered.length)}`);

    // Calculate overall statistics across filtered records
    let totalSys = 0;
    let totalDia = 0;
    let totalPul = 0;
    let dailyCount = 0;
    let morningCount = 0;
    let totalMorningSys = 0;
    let totalMorningDia = 0;
    let eveningCount = 0;
    let totalEveningSys = 0;
    let totalEveningDia = 0;
    let inTargetDays = 0;

    filtered.forEach((r) => {
      const m = computeDailyMetrics(r);
      if (m.dailyAvg) {
        totalSys += m.dailyAvg.sys;
        totalDia += m.dailyAvg.dia;
        totalPul += m.dailyAvg.pul;
        dailyCount++;
        if (m.dailyAvg.sys < 130 && m.dailyAvg.dia < 80) inTargetDays++;
      }
      if (m.morningAvg) {
        totalMorningSys += m.morningAvg.sys;
        totalMorningDia += m.morningAvg.dia;
        morningCount++;
      }
      if (m.eveningAvg) {
        totalEveningSys += m.eveningAvg.sys;
        totalEveningDia += m.eveningAvg.dia;
        eveningCount++;
      }
    });

    if (dailyCount > 0) {
      const avgSys = Math.round(totalSys / dailyCount);
      const avgDia = Math.round(totalDia / dailyCount);
      const avgPul = Math.round(totalPul / dailyCount);
      const stage = classifyBP(avgSys, avgDia);
      const avgMSys = morningCount ? Math.round(totalMorningSys / morningCount) : 0;
      const avgMDia = morningCount ? Math.round(totalMorningDia / morningCount) : 0;
      const avgESys = eveningCount ? Math.round(totalEveningSys / eveningCount) : 0;
      const avgEDia = eveningCount ? Math.round(totalEveningDia / eveningCount) : 0;
      const surge = avgMSys - avgESys;

      rows.push(`${escapeCell('ค่าเฉลี่ยรวมทุกรอบ / Overall Average BP')},${escapeCell(`${avgSys}/${avgDia} mmHg (Pulse: ${avgPul} bpm)`)}`);
      rows.push(`${escapeCell('ค่าเฉลี่ยรอบเช้า / Morning Average BP')},${escapeCell(`${avgMSys}/${avgMDia} mmHg`)}`);
      rows.push(`${escapeCell('ค่าเฉลี่ยรอบเย็น / Evening Average BP')},${escapeCell(`${avgESys}/${avgEDia} mmHg`)}`);
      rows.push(`${escapeCell('ความต่างเช้า-เย็น / Morning Surge')},${escapeCell(`${surge > 0 ? `+${surge}` : surge} mmHg`)}`);
      rows.push(`${escapeCell('ระดับการประเมินสากล / Stage Classification')},${escapeCell(`${stage.titleTh} (${stage.titleEn})`)}`);
      rows.push(`${escapeCell('สัดส่วนคุมได้ตามเกณฑ์ / In-Target Rate (<130/80)')},${escapeCell(`${Math.round((inTargetDays / dailyCount) * 100)}%`)}`);
    }
    rows.push(''); // Blank separator row
  }

  // Column Headers based on language selection
  let headers: string[] = [];
  if (options.language === 'en') {
    headers = [
      'Date',
      'Morning_R1_SYS_mmHg',
      'Morning_R1_DIA_mmHg',
      'Morning_R1_Pulse_bpm',
      'Morning_R1_Time',
      'Morning_R2_SYS_mmHg',
      'Morning_R2_DIA_mmHg',
      'Morning_R2_Pulse_bpm',
      'Morning_R2_Time',
      'Morning_Avg_SYS',
      'Morning_Avg_DIA',
      'Morning_Avg_Pulse',
      'Evening_R1_SYS_mmHg',
      'Evening_R1_DIA_mmHg',
      'Evening_R1_Pulse_bpm',
      'Evening_R1_Time',
      'Evening_R2_SYS_mmHg',
      'Evening_R2_DIA_mmHg',
      'Evening_R2_Pulse_bpm',
      'Evening_R2_Time',
      'Evening_Avg_SYS',
      'Evening_Avg_DIA',
      'Evening_Avg_Pulse',
      'Daily_Avg_SYS',
      'Daily_Avg_DIA',
      'Daily_Avg_Pulse',
      'Pulse_Pressure_mmHg',
      'Mean_Arterial_Pressure_MAP',
      'Morning_Surge_mmHg',
      'BP_Classification',
      'Notes',
    ];
  } else if (options.language === 'bilingual') {
    headers = [
      'วันที่ (Date)',
      'เช้า_ครั้ง1_SYS (Morning R1 SYS)',
      'เช้า_ครั้ง1_DIA (Morning R1 DIA)',
      'เช้า_ครั้ง1_PUL (Morning R1 Pulse)',
      'เวลาเช้า1 (Time)',
      'เช้า_ครั้ง2_SYS (Morning R2 SYS)',
      'เช้า_ครั้ง2_DIA (Morning R2 DIA)',
      'เช้า_ครั้ง2_PUL (Morning R2 Pulse)',
      'เวลาเช้า2 (Time)',
      'ค่าเฉลี่ยเช้า_SYS (Morning Avg SYS)',
      'ค่าเฉลี่ยเช้า_DIA (Morning Avg DIA)',
      'ค่าเฉลี่ยเช้า_PUL (Morning Avg Pulse)',
      'เย็น_ครั้ง1_SYS (Evening R1 SYS)',
      'เย็น_ครั้ง1_DIA (Evening R1 DIA)',
      'เย็น_ครั้ง1_PUL (Evening R1 Pulse)',
      'เวลาเย็น1 (Time)',
      'เย็น_ครั้ง2_SYS (Evening R2 SYS)',
      'เย็น_ครั้ง2_DIA (Evening R2 DIA)',
      'เย็น_ครั้ง2_PUL (Evening R2 Pulse)',
      'เวลาเย็น2 (Time)',
      'ค่าเฉลี่ยเย็น_SYS (Evening Avg SYS)',
      'ค่าเฉลี่ยเย็น_DIA (Evening Avg DIA)',
      'ค่าเฉลี่ยเย็น_PUL (Evening Avg Pulse)',
      'ค่าเฉลี่ยประจำวัน_SYS (Daily Avg SYS)',
      'ค่าเฉลี่ยประจำวัน_DIA (Daily Avg DIA)',
      'ค่าเฉลี่ยประจำวัน_PUL (Daily Avg Pulse)',
      'Pulse Pressure (SYS-DIA)',
      'Mean Arterial Pressure (MAP)',
      'ความต่างเช้าเย็น (Morning Surge)',
      'ระดับความดัน (Stage)',
      'หมายเหตุ (Notes)',
    ];
  } else {
    // Default Thai
    headers = [
      'วันที่',
      'เช้า_ครั้งที่1_SYS',
      'เช้า_ครั้งที่1_DIA',
      'เช้า_ครั้งที่1_PUL',
      'เวลาเช้า_ครั้งที่1',
      'เช้า_ครั้งที่2_SYS',
      'เช้า_ครั้งที่2_DIA',
      'เช้า_ครั้งที่2_PUL',
      'เวลาเช้า_ครั้งที่2',
      'ค่าเฉลี่ยเช้า_SYS',
      'ค่าเฉลี่ยเช้า_DIA',
      'ค่าเฉลี่ยเช้า_PUL',
      'เย็น_ครั้งที่1_SYS',
      'เย็น_ครั้งที่1_DIA',
      'เย็น_ครั้งที่1_PUL',
      'เวลาเย็น_ครั้งที่1',
      'เย็น_ครั้งที่2_SYS',
      'เย็น_ครั้งที่2_DIA',
      'เย็น_ครั้งที่2_PUL',
      'เวลาเย็น_ครั้งที่2',
      'ค่าเฉลี่ยเย็น_SYS',
      'ค่าเฉลี่ยเย็น_DIA',
      'ค่าเฉลี่ยเย็น_PUL',
      'ค่าเฉลี่ยประจำวัน_SYS',
      'ค่าเฉลี่ยประจำวัน_DIA',
      'ค่าเฉลี่ยประจำวัน_PUL',
      'Pulse_Pressure',
      'MAP_ความดันหลอดเลือดเฉลี่ย',
      'ความต่างเช้าเย็น_Surge',
      'ระดับความดันสากล',
      'หมายเหตุ',
    ];
  }

  rows.push(headers.map(escapeCell).join(','));

  // Data Rows (Sorted chronologically from oldest to newest)
  filtered.forEach((r) => {
    const m = computeDailyMetrics(r);
    const m1 = r.morning.reading1;
    const m2 = r.morning.reading2;
    const e1 = r.evening.reading1;
    const e2 = r.evening.reading2;

    const rowData = [
      r.date,
      m1 ? m1.sys : '',
      m1 ? m1.dia : '',
      m1 ? m1.pul : '',
      m1?.time || '',
      m2 ? m2.sys : '',
      m2 ? m2.dia : '',
      m2 ? m2.pul : '',
      m2?.time || '',
      m.morningAvg ? m.morningAvg.sys : '',
      m.morningAvg ? m.morningAvg.dia : '',
      m.morningAvg ? m.morningAvg.pul : '',
      e1 ? e1.sys : '',
      e1 ? e1.dia : '',
      e1 ? e1.pul : '',
      e1?.time || '',
      e2 ? e2.sys : '',
      e2 ? e2.dia : '',
      e2 ? e2.pul : '',
      e2?.time || '',
      m.eveningAvg ? m.eveningAvg.sys : '',
      m.eveningAvg ? m.eveningAvg.dia : '',
      m.eveningAvg ? m.eveningAvg.pul : '',
      m.dailyAvg ? m.dailyAvg.sys : '',
      m.dailyAvg ? m.dailyAvg.dia : '',
      m.dailyAvg ? m.dailyAvg.pul : '',
      m.pulsePressure !== null ? m.pulsePressure : '',
      m.meanArterialPressure !== null ? m.meanArterialPressure : '',
      m.morningSurge !== null ? m.morningSurge : '',
      options.language === 'en'
        ? m.stage?.titleEn || ''
        : options.language === 'bilingual'
        ? `${m.stage?.titleTh || ''} (${m.stage?.titleEn || ''})`
        : m.stage?.titleTh || '',
      [r.overallNote, r.morning.note, r.evening.note].filter(Boolean).join(' | '),
    ];

    rows.push(rowData.map(escapeCell).join(','));
  });

  // Prepend UTF-8 Byte Order Mark (BOM: \uFEFF) to make sure Excel detects UTF-8 correctly
  return '\uFEFF' + rows.join('\r\n');
}

/**
 * Trigger client-side file download
 */
export function triggerCsvDownload(csvString: string, filename: string): void {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
