import { Member } from '../types/member';
import { DailyBPRecord } from '../types/bp';

export interface UserHealthDatabase {
  email: string;
  profile: Member;
  records: DailyBPRecord[];
  lastUpdated: number;
}

const DB_PREFIX = 'ariyawarin_local_health_db_';

// Helper to format date offset from today (YYYY-MM-DD)
function getDateOffset(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Standard seed profiles customized per authorized account
 */
const DEFAULT_USER_PROFILES: Record<string, { profile: Member; initialRecords: DailyBPRecord[] }> = {
  'kritchanat.ds@gmail.com': {
    profile: {
      id: 'usr-kritchanat',
      firstName: 'กฤตนัฐ',
      lastName: 'เดชศาสตร์',
      age: 42,
      gender: 'male',
      height: 175,
      weight: 68.5,
      notes: 'ไม่มีโรคประจำตัว ออกกำลังกายสัปดาห์ละ 3 วัน ตรวจสุขภาพประจำปีปกติ',
      avatarColor: '#0d9488',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
      updatedAt: Date.now(),
    },
    initialRecords: [
      {
        id: 'bp-kr-1',
        date: getDateOffset(0),
        memberId: 'usr-kritchanat',
        memberName: 'กฤตนัฐ เดชศาสตร์',
        morning: {
          reading1: { sys: 118, dia: 76, pul: 68, time: '07:15' },
          reading2: { sys: 115, dia: 74, pul: 66, time: '07:17' },
          note: 'ตื่นนอนดื่มน้ำอุ่น นั่งพัก 5 นาทีแล้ววัด',
        },
        evening: {
          reading1: { sys: 122, dia: 78, pul: 72, time: '18:40' },
          reading2: { sys: 120, dia: 77, pul: 70, time: '18:42' },
          note: 'หลังเลิกงาน พัก 10 นาทีก่อนวัด',
        },
        overallNote: 'รู้สึกสดชื่น ไม่มีอาการปวดศีรษะ',
        createdAt: Date.now() - 1000 * 60 * 60 * 4,
        updatedAt: Date.now() - 1000 * 60 * 60 * 4,
      },
      {
        id: 'bp-kr-2',
        date: getDateOffset(1),
        memberId: 'usr-kritchanat',
        memberName: 'กฤตนัฐ เดชศาสตร์',
        morning: {
          reading1: { sys: 121, dia: 78, pul: 70, time: '07:20' },
          reading2: { sys: 119, dia: 77, pul: 69, time: '07:22' },
        },
        evening: {
          reading1: { sys: 124, dia: 80, pul: 74, time: '19:10' },
          reading2: { sys: 122, dia: 79, pul: 73, time: '19:12' },
          note: 'เดินเร็วช่วงเย็น 30 นาที',
        },
        createdAt: Date.now() - 1000 * 60 * 60 * 28,
        updatedAt: Date.now() - 1000 * 60 * 60 * 28,
      },
      {
        id: 'bp-kr-3',
        date: getDateOffset(2),
        memberId: 'usr-kritchanat',
        memberName: 'กฤตนัฐ เดชศาสตร์',
        morning: {
          reading1: { sys: 125, dia: 80, pul: 71, time: '07:10' },
          reading2: { sys: 122, dia: 78, pul: 70, time: '07:12' },
        },
        evening: {
          reading1: { sys: 126, dia: 81, pul: 73, time: '18:30' },
          reading2: { sys: 123, dia: 79, pul: 71, time: '18:32' },
        },
        createdAt: Date.now() - 1000 * 60 * 60 * 52,
        updatedAt: Date.now() - 1000 * 60 * 60 * 52,
      },
      {
        id: 'bp-kr-4',
        date: getDateOffset(3),
        memberId: 'usr-kritchanat',
        memberName: 'กฤตนัฐ เดชศาสตร์',
        morning: {
          reading1: { sys: 120, dia: 77, pul: 69, time: '07:30' },
          reading2: { sys: 118, dia: 75, pul: 67, time: '07:32' },
        },
        evening: {
          reading1: { sys: 123, dia: 79, pul: 72, time: '19:00' },
          reading2: { sys: 121, dia: 77, pul: 70, time: '19:02' },
        },
        createdAt: Date.now() - 1000 * 60 * 60 * 76,
        updatedAt: Date.now() - 1000 * 60 * 60 * 76,
      },
    ],
  },
  'onlineok.tent@gmail.com': {
    profile: {
      id: 'usr-onlineok',
      firstName: 'ออนไลน์โอเค',
      lastName: 'เดชศาสตร์',
      age: 38,
      gender: 'male',
      height: 172,
      weight: 66.0,
      notes: 'ติดตามสุขภาพและความดันโลหิตส่วนบุคคล',
      avatarColor: '#2563eb',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
      updatedAt: Date.now(),
    },
    initialRecords: [
      {
        id: 'bp-on-1',
        date: getDateOffset(0),
        memberId: 'usr-onlineok',
        memberName: 'ออนไลน์โอเค เดชศาสตร์',
        morning: {
          reading1: { sys: 116, dia: 74, pul: 68, time: '07:00' },
          reading2: { sys: 114, dia: 72, pul: 66, time: '07:02' },
          note: 'พักผ่อนเต็มที่ สบายดี',
        },
        evening: {
          reading1: { sys: 120, dia: 76, pul: 70, time: '18:50' },
          reading2: { sys: 118, dia: 75, pul: 69, time: '18:52' },
        },
        createdAt: Date.now() - 1000 * 60 * 60 * 4,
        updatedAt: Date.now() - 1000 * 60 * 60 * 4,
      },
    ],
  },
  '0655530119ig@gmail.com': {
    profile: {
      id: 'usr-0655530119',
      firstName: 'สมาชิก',
      lastName: '0655530119',
      age: 35,
      gender: 'male',
      height: 168,
      weight: 64.0,
      notes: 'ระบบติดตามความดันโลหิตและดัชนีมวลกายส่วนบุคคล',
      avatarColor: '#d97706',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
      updatedAt: Date.now(),
    },
    initialRecords: [
      {
        id: 'bp-065-1',
        date: getDateOffset(0),
        memberId: 'usr-0655530119',
        memberName: 'สมาชิก 0655530119',
        morning: {
          reading1: { sys: 119, dia: 76, pul: 70, time: '07:10' },
          reading2: { sys: 117, dia: 74, pul: 68, time: '07:12' },
        },
        evening: {
          reading1: { sys: 122, dia: 78, pul: 72, time: '19:15' },
          reading2: { sys: 120, dia: 77, pul: 71, time: '19:17' },
        },
        createdAt: Date.now() - 1000 * 60 * 60 * 3,
        updatedAt: Date.now() - 1000 * 60 * 60 * 3,
      },
    ],
  },
  'thanwa55530@gmail.com': {
    profile: {
      id: 'usr-thanwa',
      firstName: 'ธันวา',
      lastName: 'เดชศาสตร์',
      age: 32,
      gender: 'male',
      height: 172,
      weight: 70.0,
      notes: 'ดูแลสุขภาพและออกกำลังกายเป็นประจำ',
      avatarColor: '#7c3aed',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
      updatedAt: Date.now(),
    },
    initialRecords: [
      {
        id: 'bp-th-1',
        date: getDateOffset(0),
        memberId: 'usr-thanwa',
        memberName: 'ธันวา เดชศาสตร์',
        morning: {
          reading1: { sys: 115, dia: 73, pul: 67, time: '07:05' },
          reading2: { sys: 113, dia: 71, pul: 65, time: '07:07' },
        },
        evening: {
          reading1: { sys: 118, dia: 75, pul: 69, time: '18:45' },
          reading2: { sys: 116, dia: 74, pul: 68, time: '18:47' },
        },
        createdAt: Date.now() - 1000 * 60 * 60 * 2,
        updatedAt: Date.now() - 1000 * 60 * 60 * 2,
      },
    ],
  },
};

/**
 * Clean & normalize email key
 */
export function normalizeUserEmail(email?: string | null): string {
  if (!email) return 'guest';
  return email.trim().toLowerCase();
}

/**
 * Get internal storage key for specific user
 */
function getStorageKey(email: string): string {
  const clean = normalizeUserEmail(email);
  return `${DB_PREFIX}${clean}`;
}

/**
 * Load isolated database partition for the currently logged-in user
 */
export function loadUserDatabase(
  userEmail: string,
  userDisplayName?: string | null
): UserHealthDatabase {
  const cleanEmail = normalizeUserEmail(userEmail);
  const key = getStorageKey(cleanEmail);

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed: UserHealthDatabase = JSON.parse(raw);
      if (parsed && parsed.profile && Array.isArray(parsed.records)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse user database from localStorage:', err);
  }

  // If no saved database yet, initialize default profile for this user
  const defaultPreset = DEFAULT_USER_PROFILES[cleanEmail];
  let profile: Member;
  let initialRecords: DailyBPRecord[] = [];

  if (defaultPreset) {
    profile = { ...defaultPreset.profile };
    initialRecords = [...defaultPreset.initialRecords];
  } else {
    // Generic fallback for any authorized email
    const nameParts = (userDisplayName || 'ผู้ใช้งาน').trim().split(' ');
    const firstName = nameParts[0] || 'ผู้ใช้งาน';
    const lastName = nameParts.slice(1).join(' ') || 'เดชศาสตร์';

    profile = {
      id: `usr-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      firstName,
      lastName,
      age: 40,
      gender: 'male',
      height: 170,
      weight: 65.0,
      notes: 'ข้อมูลสุขภาพส่วนบุคคล',
      avatarColor: '#0d9488',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  const initialDb: UserHealthDatabase = {
    email: cleanEmail,
    profile,
    records: initialRecords,
    lastUpdated: Date.now(),
  };

  saveUserDatabase(initialDb);
  return initialDb;
}

/**
 * Save user database partition immediately to storage
 */
export function saveUserDatabase(db: UserHealthDatabase): void {
  try {
    const key = getStorageKey(db.email);
    localStorage.setItem(key, JSON.stringify(db));
  } catch (err) {
    console.error('Failed to save user database:', err);
  }
}

/**
 * Add or update a BP record in the user's isolated database
 */
export function saveUserBPRecord(
  userEmail: string,
  newOrUpdatedRecord: DailyBPRecord,
  userDisplayName?: string | null
): UserHealthDatabase {
  const db = loadUserDatabase(userEmail, userDisplayName);
  const now = Date.now();

  const recordWithMeta: DailyBPRecord = {
    ...newOrUpdatedRecord,
    memberId: db.profile.id,
    memberName: `${db.profile.firstName} ${db.profile.lastName}`.trim(),
    updatedAt: now,
    lastSavedAt: now,
  };

  const existingIdx = db.records.findIndex((r) => r.date === recordWithMeta.date);
  let updatedRecords: DailyBPRecord[];

  if (existingIdx >= 0) {
    updatedRecords = [...db.records];
    updatedRecords[existingIdx] = recordWithMeta;
  } else {
    updatedRecords = [recordWithMeta, ...db.records];
  }

  // Sort newest first
  updatedRecords.sort((a, b) => b.date.localeCompare(a.date));

  const updatedDb: UserHealthDatabase = {
    ...db,
    records: updatedRecords,
    lastUpdated: now,
  };

  saveUserDatabase(updatedDb);
  return updatedDb;
}

/**
 * Delete a BP record from the user's isolated database
 */
export function deleteUserBPRecord(
  userEmail: string,
  recordId: string,
  userDisplayName?: string | null
): UserHealthDatabase {
  const db = loadUserDatabase(userEmail, userDisplayName);
  const now = Date.now();

  const updatedRecords = db.records.filter((r) => r.id !== recordId);
  const updatedDb: UserHealthDatabase = {
    ...db,
    records: updatedRecords,
    lastUpdated: now,
  };

  saveUserDatabase(updatedDb);
  return updatedDb;
}

/**
 * Update the user's health profile (Height, Weight, Age, Gender, Notes)
 */
export function updateUserHealthProfile(
  userEmail: string,
  updates: Partial<Member>,
  userDisplayName?: string | null
): UserHealthDatabase {
  const db = loadUserDatabase(userEmail, userDisplayName);
  const now = Date.now();

  const updatedProfile: Member = {
    ...db.profile,
    ...updates,
    updatedAt: now,
  };

  // Also update memberName in records if name changed
  const fullName = `${updatedProfile.firstName} ${updatedProfile.lastName}`.trim();
  const updatedRecords = db.records.map((r) => ({
    ...r,
    memberName: fullName,
  }));

  const updatedDb: UserHealthDatabase = {
    ...db,
    profile: updatedProfile,
    records: updatedRecords,
    lastUpdated: now,
  };

  saveUserDatabase(updatedDb);
  return updatedDb;
}

/**
 * Export user data as a JSON file string for offline backup
 */
export function exportUserDatabaseJSON(userEmail: string): string {
  const db = loadUserDatabase(userEmail);
  return JSON.stringify(db, null, 2);
}

/**
 * Import and replace user database from backup JSON
 */
export function importUserDatabaseJSON(
  userEmail: string,
  jsonString: string
): UserHealthDatabase {
  const cleanEmail = normalizeUserEmail(userEmail);
  const parsed = JSON.parse(jsonString);

  if (!parsed || !parsed.profile || !Array.isArray(parsed.records)) {
    throw new Error('รูปแบบไฟล์ฐานข้อมูลไม่ถูกต้อง');
  }

  const restoredDb: UserHealthDatabase = {
    email: cleanEmail,
    profile: {
      ...parsed.profile,
      id: `usr-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      updatedAt: Date.now(),
    },
    records: parsed.records.map((r: DailyBPRecord) => ({
      ...r,
      memberId: `usr-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
    })),
    lastUpdated: Date.now(),
  };

  saveUserDatabase(restoredDb);
  return restoredDb;
}
