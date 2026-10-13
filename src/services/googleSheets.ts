import { Member } from '../types/member';
import { DailyBPRecord } from '../types/bp';
import { calculateBMI } from '../utils/bmi';
import { computeDailyMetrics, formatThaiDate } from '../utils/bpClassification';

export const SHEETS_STORAGE_KEY = 'ariyawarin_bp_spreadsheet_id';
export const SHEETS_URL_STORAGE_KEY = 'ariyawarin_bp_spreadsheet_url';

export interface SpreadsheetConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  lastSyncedAt?: number;
}

/**
 * Format a timestamp into standard Thai format (DD/MM/YYYY พ.ศ. HH:mm:ss)
 * e.g., 12/10/2569 18:25:30
 */
export function getThaiTimestamp(dateOrEpoch: number | Date = Date.now()): string {
  const d = typeof dateOrEpoch === 'number' ? new Date(dateOrEpoch) : dateOrEpoch;
  const pad = (n: number) => String(n).padStart(2, '0');
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const yearBe = d.getFullYear() + 543;
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${day}/${month}/${yearBe} ${hours}:${minutes}:${seconds}`;
}

/**
 * Create a new Google Spreadsheet with structured sheets for Members & BP Records
 */
export async function createGoogleHealthSpreadsheet(
  accessToken: string,
  title = 'ARIYAWARIN - ทะเบียนสมาชิกและบันทึกความดันโลหิต'
): Promise<SpreadsheetConfig> {
  const requestBody = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: 'บันทึกความดันโลหิต',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
      {
        properties: {
          title: 'ทะเบียนสมาชิกและBMI',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
    ],
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`สร้าง Google Sheets ไม่สำเร็จ: ${errorText}`);
  }

  const sheetData = await response.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl =
    sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Write header rows to both sheets
  const bpHeaders = [
    [
      'วันที่',
      'สมาชิก',
      'เช้า ครั้งที่ 1 (SYS/DIA/PUL)',
      'เช้า ครั้งที่ 2 (SYS/DIA/PUL)',
      'ค่าเฉลี่ยรอบเช้า',
      'เย็น ครั้งที่ 1 (SYS/DIA/PUL)',
      'เย็น ครั้งที่ 2 (SYS/DIA/PUL)',
      'ค่าเฉลี่ยรอบเย็น',
      'ค่าเฉลี่ยรวมทั้งวัน',
      'การประเมินทางการแพทย์ (AHA/ESC)',
      'คำแนะนำสุขภาพ',
      'หมายเหตุ',
      'ทามสแตมป์ (Timestamp)',
    ],
  ];

  const memberHeaders = [
    [
      'รหัสสมาชิก',
      'ชื่อ',
      'นามสกุล',
      'เพศ',
      'อายุ (ปี)',
      'ส่วนสูง (ซม.)',
      'น้ำหนัก (กก.)',
      'ค่า BMI',
      'ผลการประเมิน BMI',
      'เกณฑ์มาตรฐาน (WHO-Asia)',
      'ช่วงน้ำหนักที่เหมาะสม (กก.)',
      'ผลต่างน้ำหนัก',
      'คำแนะนำการดูแลสุขภาพ',
      'วันที่ลงทะเบียน',
    ],
  ];

  // Populate Headers
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'บันทึกความดันโลหิต'!A1:M1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: bpHeaders }),
    }
  );

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'ทะเบียนสมาชิกและBMI'!A1:N1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: memberHeaders }),
    }
  );

  const config: SpreadsheetConfig = {
    spreadsheetId,
    spreadsheetUrl,
    title,
    lastSyncedAt: Date.now(),
  };

  localStorage.setItem(SHEETS_STORAGE_KEY, spreadsheetId);
  localStorage.setItem(SHEETS_URL_STORAGE_KEY, spreadsheetUrl);

  return config;
}

/**
 * Format a DailyBPRecord into a row for Google Sheets
 */
export function formatBPRecordRow(
  record: DailyBPRecord,
  memberNameFallback = 'ทั่วไป',
  timestampOverride?: string
): (string | number)[] {
  const metrics = computeDailyMetrics(record);
  const m1 = record.morning.reading1
    ? `${record.morning.reading1.sys}/${record.morning.reading1.dia} (${record.morning.reading1.pul})`
    : '-';
  const m2 = record.morning.reading2
    ? `${record.morning.reading2.sys}/${record.morning.reading2.dia} (${record.morning.reading2.pul})`
    : '-';
  const mAvg = metrics.morningAvg
    ? `${metrics.morningAvg.sys}/${metrics.morningAvg.dia} (${metrics.morningAvg.pul})`
    : '-';

  const e1 = record.evening.reading1
    ? `${record.evening.reading1.sys}/${record.evening.reading1.dia} (${record.evening.reading1.pul})`
    : '-';
  const e2 = record.evening.reading2
    ? `${record.evening.reading2.sys}/${record.evening.reading2.dia} (${record.evening.reading2.pul})`
    : '-';
  const eAvg = metrics.eveningAvg
    ? `${metrics.eveningAvg.sys}/${metrics.eveningAvg.dia} (${metrics.eveningAvg.pul})`
    : '-';

  const dAvg = metrics.dailyAvg
    ? `${metrics.dailyAvg.sys}/${metrics.dailyAvg.dia} (${metrics.dailyAvg.pul})`
    : '-';

  const stageTitle = metrics.stage ? `${metrics.stage.titleTh} (${metrics.stage.titleEn})` : 'ไม่มีข้อมูล';
  const actionGuide = metrics.stage ? metrics.stage.actionGuidelineTh : '-';
  const noteCombined = [record.morning.note, record.evening.note, record.overallNote]
    .filter(Boolean)
    .join(' | ') || '-';

  const memberName = record.memberName || memberNameFallback;
  // Always record exact timestamp when saved
  const timeRecorded =
    timestampOverride ||
    record.timestamp ||
    (record.lastSavedAt
      ? getThaiTimestamp(record.lastSavedAt)
      : record.updatedAt
      ? getThaiTimestamp(record.updatedAt)
      : getThaiTimestamp(Date.now()));

  return [
    record.date,
    memberName,
    m1,
    m2,
    mAvg,
    e1,
    e2,
    eAvg,
    dAvg,
    stageTitle,
    actionGuide,
    noteCombined,
    timeRecorded,
  ];
}

/**
 * Format Member data into row for Google Sheets
 */
export function formatMemberRow(member: Member): (string | number)[] {
  const analysis = calculateBMI(member.weight, member.height);
  const genderTh = member.gender === 'male' ? 'ชาย' : member.gender === 'female' ? 'หญิง' : 'อื่นๆ';
  const weightDiff =
    analysis.weightDifference > 0
      ? `เกิน ${analysis.weightDifference} กก.`
      : analysis.weightDifference < 0
      ? `ต่ำกว่าเกณฑ์ ${Math.abs(analysis.weightDifference)} กก.`
      : 'อยู่ในเกณฑ์สมส่วน';

  const registeredDate = new Date(member.createdAt).toLocaleDateString('th-TH');

  return [
    member.id,
    member.firstName,
    member.lastName,
    genderTh,
    member.age,
    member.height,
    member.weight,
    analysis.bmi,
    `${analysis.category.labelTh} (${analysis.category.labelEn})`,
    analysis.category.rangeTh,
    `${analysis.idealWeightRange.min} - ${analysis.idealWeightRange.max}`,
    weightDiff,
    analysis.category.recommendationTh,
    registeredDate,
  ];
}

/**
 * Append or Update a single BP record to Google Sheets
 */
export async function appendOrUpdateBPRecordInSheet(
  accessToken: string,
  spreadsheetId: string,
  record: DailyBPRecord,
  memberName = 'ทั่วไป',
  customTimestamp?: string
): Promise<boolean> {
  const currentTimestamp =
    customTimestamp ||
    record.timestamp ||
    (record.lastSavedAt
      ? getThaiTimestamp(record.lastSavedAt)
      : record.updatedAt
      ? getThaiTimestamp(record.updatedAt)
      : getThaiTimestamp(Date.now()));

  const row = formatBPRecordRow(record, memberName, currentTimestamp);

  // Ensure column M header is labeled 'ทามสแตมป์ (Timestamp)'
  try {
    fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'บันทึกความดันโลหิต'!M1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [['ทามสแตมป์ (Timestamp)']] }),
      }
    ).catch(() => {});
  } catch {
    // Ignore header touch failure
  }

  // Check if date row already exists in the sheet to avoid duplication
  try {
    const checkRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'บันทึกความดันโลหิต'!A:B`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (checkRes.ok) {
      const data = await checkRes.json();
      const rows: string[][] = data.values || [];
      // Look for match by date and member name
      let existingRowIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === record.date && (rows[i][1] === memberName || !rows[i][1])) {
          existingRowIndex = i + 1; // 1-indexed for Sheets
          break;
        }
      }

      if (existingRowIndex > 1) {
        // Update existing row
        const updateRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'บันทึกความดันโลหิต'!A${existingRowIndex}:M${existingRowIndex}?valueInputOption=USER_ENTERED`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ values: [row] }),
          }
        );
        return updateRes.ok;
      }
    }
  } catch (e) {
    console.warn('Could not check existing row, appending instead', e);
  }

  // Append new row
  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'บันทึกความดันโลหิต'!A1:M1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [row] }),
    }
  );

  return appendRes.ok;
}

/**
 * Sync entire members registry to Google Sheets tab
 */
export async function syncMembersToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  members: Member[]
): Promise<boolean> {
  const memberHeaders = [
    'รหัสสมาชิก',
    'ชื่อ',
    'นามสกุล',
    'เพศ',
    'อายุ (ปี)',
    'ส่วนสูง (ซม.)',
    'น้ำหนัก (กก.)',
    'ค่า BMI',
    'ผลการประเมิน BMI',
    'เกณฑ์มาตรฐาน (WHO-Asia)',
    'ช่วงน้ำหนักที่เหมาะสม (กก.)',
    'ผลต่างน้ำหนัก',
    'คำแนะนำการดูแลสุขภาพ',
    'วันที่ลงทะเบียน',
  ];

  const rows = [memberHeaders, ...members.map((m) => formatMemberRow(m))];

  // Clear and rewrite sheet
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'ทะเบียนสมาชิกและBMI'!A1:N100:clear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'ทะเบียนสมาชิกและBMI'!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: rows }),
    }
  );

  return res.ok;
}

/**
 * Full Sync: sync all records and members to Google Sheets
 */
export async function syncAllToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  records: DailyBPRecord[],
  members: Member[]
): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Sync Members
    await syncMembersToGoogleSheet(accessToken, spreadsheetId, members);

    // 2. Sync BP Records
    const bpHeaders = [
      'วันที่',
      'สมาชิก',
      'เช้า ครั้งที่ 1 (SYS/DIA/PUL)',
      'เช้า ครั้งที่ 2 (SYS/DIA/PUL)',
      'ค่าเฉลี่ยรอบเช้า',
      'เย็น ครั้งที่ 1 (SYS/DIA/PUL)',
      'เย็น ครั้งที่ 2 (SYS/DIA/PUL)',
      'ค่าเฉลี่ยรอบเย็น',
      'ค่าเฉลี่ยรวมทั้งวัน',
      'การประเมินทางการแพทย์ (AHA/ESC)',
      'คำแนะนำสุขภาพ',
      'หมายเหตุ',
      'ทามสแตมป์ (Timestamp)',
    ];

    // Map members by ID for fast lookup
    const memberMap = new Map(members.map((m) => [m.id, `${m.firstName} ${m.lastName}`]));

    // Sort records descending by date
    const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date));
    const bpRows = [
      bpHeaders,
      ...sortedRecords.map((r) => {
        const memberName = r.memberId ? memberMap.get(r.memberId) || r.memberName || 'ทั่วไป' : r.memberName || 'ทั่วไป';
        return formatBPRecordRow(r, memberName);
      }),
    ];

    // Clear and rewrite BP sheet
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'บันทึกความดันโลหิต'!A1:M500:clear`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'บันทึกความดันโลหิต'!A1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: bpRows }),
      }
    );

    if (res.ok) {
      return { success: true, message: `ซิงค์ข้อมูล ${records.length} รายการ และสมาชิก ${members.length} ท่านไปยัง Google Sheets สำเร็จ` };
    } else {
      const err = await res.text();
      return { success: false, message: `เกิดข้อผิดพลาดในการซิงค์: ${err}` };
    }
  } catch (error: any) {
    return { success: false, message: error.message || 'ไม่สามารถซิงค์ข้อมูลกับ Google Sheets ได้' };
  }
}
