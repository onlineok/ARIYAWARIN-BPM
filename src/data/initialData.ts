import { DailyBPRecord } from '../types/bp';

// Helper to format date offset from reference date (2026-10-12)
function getDateOffset(daysAgo: number): string {
  const d = new Date(2026, 9, 12); // Oct is month index 9
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const INITIAL_BP_RECORDS: DailyBPRecord[] = [
  {
    id: 'bp-record-1',
    date: getDateOffset(0), // 2026-10-12 (Today)
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
  },
  {
    id: 'bp-record-2',
    date: getDateOffset(1), // 2026-10-11
    morning: {
      reading1: { sys: 121, dia: 78, pul: 70, time: '07:20' },
      reading2: { sys: 119, dia: 77, pul: 69, time: '07:22' },
    },
    evening: {
      reading1: { sys: 124, dia: 80, pul: 74, time: '19:10' },
      reading2: { sys: 122, dia: 79, pul: 73, time: '19:12' },
      note: 'เดินเร็วช่วงเย็น 30 นาที พัก 45 นาทีก่อนวัด',
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 28,
  },
  {
    id: 'bp-record-3',
    date: getDateOffset(2), // 2026-10-10
    morning: {
      reading1: { sys: 126, dia: 82, pul: 72, time: '07:10' },
      reading2: { sys: 123, dia: 80, pul: 71, time: '07:12' },
    },
    evening: {
      reading1: { sys: 128, dia: 83, pul: 76, time: '18:30' },
      reading2: { sys: 125, dia: 81, pul: 74, time: '18:32' },
      note: 'ทานอาหารรสเค็มเล็กน้อยในมื้อเที่ยง',
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 52,
  },
  {
    id: 'bp-record-4',
    date: getDateOffset(3), // 2026-10-09
    morning: {
      reading1: { sys: 132, dia: 84, pul: 75, time: '07:30' },
      reading2: { sys: 130, dia: 82, pul: 73, time: '07:32' },
      note: 'นอนดึก นอนหลับได้เพียง 5 ชั่วโมง',
    },
    evening: {
      reading1: { sys: 134, dia: 86, pul: 78, time: '19:00' },
      reading2: { sys: 131, dia: 84, pul: 76, time: '19:02' },
    },
    overallNote: 'เริ่มสูงเฝ้าระวัง เนื่องจากพักผ่อนน้อย',
    createdAt: Date.now() - 1000 * 60 * 60 * 76,
  },
  {
    id: 'bp-record-5',
    date: getDateOffset(4), // 2026-10-08
    morning: {
      reading1: { sys: 125, dia: 80, pul: 71, time: '07:15' },
      reading2: { sys: 122, dia: 78, pul: 70, time: '07:17' },
    },
    evening: {
      reading1: { sys: 127, dia: 81, pul: 73, time: '18:50' },
      reading2: { sys: 124, dia: 79, pul: 72, time: '18:52' },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 100,
  },
  {
    id: 'bp-record-6',
    date: getDateOffset(5), // 2026-10-07
    morning: {
      reading1: { sys: 119, dia: 77, pul: 69, time: '07:05' },
      reading2: { sys: 117, dia: 75, pul: 67, time: '07:07' },
    },
    evening: {
      reading1: { sys: 121, dia: 78, pul: 71, time: '18:45' },
      reading2: { sys: 119, dia: 76, pul: 70, time: '18:47' },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 124,
  },
  {
    id: 'bp-record-7',
    date: getDateOffset(6), // 2026-10-06
    morning: {
      reading1: { sys: 116, dia: 74, pul: 66, time: '07:20' },
      reading2: { sys: 114, dia: 73, pul: 65, time: '07:22' },
    },
    evening: {
      reading1: { sys: 118, dia: 76, pul: 69, time: '18:30' },
      reading2: { sys: 117, dia: 75, pul: 68, time: '18:32' },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 148,
  },
  {
    id: 'bp-record-8',
    date: getDateOffset(7), // 2026-10-05
    morning: {
      reading1: { sys: 122, dia: 79, pul: 70, time: '07:15' },
      reading2: { sys: 120, dia: 77, pul: 69, time: '07:17' },
    },
    evening: {
      reading1: { sys: 125, dia: 80, pul: 72, time: '18:40' },
      reading2: { sys: 123, dia: 79, pul: 71, time: '18:42' },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 172,
  },
  {
    id: 'bp-record-9',
    date: getDateOffset(8), // 2026-10-04
    morning: {
      reading1: { sys: 127, dia: 81, pul: 73, time: '07:25' },
      reading2: { sys: 124, dia: 79, pul: 71, time: '07:27' },
    },
    evening: {
      reading1: { sys: 129, dia: 82, pul: 75, time: '19:15' },
      reading2: { sys: 126, dia: 80, pul: 74, time: '19:17' },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 196,
  },
  {
    id: 'bp-record-10',
    date: getDateOffset(9), // 2026-10-03
    morning: {
      reading1: { sys: 124, dia: 78, pul: 70, time: '07:10' },
      reading2: { sys: 121, dia: 76, pul: 68, time: '07:12' },
    },
    evening: {
      reading1: { sys: 123, dia: 77, pul: 71, time: '18:50' },
      reading2: { sys: 120, dia: 76, pul: 69, time: '18:52' },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 220,
  },
  {
    id: 'bp-record-11',
    date: getDateOffset(10), // 2026-10-02
    morning: {
      reading1: { sys: 118, dia: 75, pul: 67, time: '07:15' },
      reading2: { sys: 115, dia: 73, pul: 66, time: '07:17' },
    },
    evening: {
      reading1: { sys: 120, dia: 77, pul: 70, time: '18:35' },
      reading2: { sys: 118, dia: 75, pul: 68, time: '18:37' },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 244,
  },
  {
    id: 'bp-record-12',
    date: getDateOffset(11), // 2026-10-01
    morning: {
      reading1: { sys: 130, dia: 83, pul: 74, time: '07:30' },
      reading2: { sys: 127, dia: 81, pul: 72, time: '07:32' },
    },
    evening: {
      reading1: { sys: 133, dia: 85, pul: 77, time: '19:00' },
      reading2: { sys: 129, dia: 83, pul: 75, time: '19:02' },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 268,
  },
  {
    id: 'bp-record-13',
    date: getDateOffset(12), // 2026-09-30
    morning: {
      reading1: { sys: 123, dia: 78, pul: 71, time: '07:20' },
      reading2: { sys: 120, dia: 76, pul: 69, time: '07:22' },
    },
    evening: {
      reading1: { sys: 124, dia: 79, pul: 72, time: '18:40' },
      reading2: { sys: 121, dia: 77, pul: 70, time: '18:42' },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 292,
  },
  {
    id: 'bp-record-14',
    date: getDateOffset(13), // 2026-09-29
    morning: {
      reading1: { sys: 120, dia: 76, pul: 68, time: '07:15' },
      reading2: { sys: 117, dia: 74, pul: 67, time: '07:17' },
    },
    evening: {
      reading1: { sys: 122, dia: 78, pul: 70, time: '18:30' },
      reading2: { sys: 119, dia: 76, pul: 69, time: '18:32' },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 316,
  },
];
