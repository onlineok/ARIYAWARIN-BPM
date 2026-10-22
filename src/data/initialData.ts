import { DailyBPRecord } from '../types/bp';

// Helper to format date offset from reference date (today)
function getDateOffset(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const INITIAL_BP_RECORDS: DailyBPRecord[] = [
  // Records for Member 1: กฤตนัฐ เดชศาสตร์ (mem-1)
  {
    id: 'bp-record-1',
    date: getDateOffset(0),
    memberId: 'mem-1',
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
    id: 'bp-record-2',
    date: getDateOffset(1),
    memberId: 'mem-1',
    memberName: 'กฤตนัฐ เดชศาสตร์',
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
    updatedAt: Date.now() - 1000 * 60 * 60 * 28,
  },
  {
    id: 'bp-record-3',
    date: getDateOffset(2),
    memberId: 'mem-1',
    memberName: 'กฤตนัฐ เดชศาสตร์',
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
    updatedAt: Date.now() - 1000 * 60 * 60 * 52,
  },
  {
    id: 'bp-record-4',
    date: getDateOffset(3),
    memberId: 'mem-1',
    memberName: 'กฤตนัฐ เดชศาสตร์',
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
    updatedAt: Date.now() - 1000 * 60 * 60 * 76,
  },
  {
    id: 'bp-record-5',
    date: getDateOffset(4),
    memberId: 'mem-1',
    memberName: 'กฤตนัฐ เดชศาสตร์',
    morning: {
      reading1: { sys: 125, dia: 80, pul: 71, time: '07:15' },
      reading2: { sys: 122, dia: 78, pul: 70, time: '07:17' },
    },
    evening: {
      reading1: { sys: 127, dia: 81, pul: 73, time: '18:50' },
      reading2: { sys: 124, dia: 79, pul: 72, time: '18:52' },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 100,
    updatedAt: Date.now() - 1000 * 60 * 60 * 100,
  },
  {
    id: 'bp-record-6',
    date: getDateOffset(5),
    memberId: 'mem-1',
    memberName: 'กฤตนัฐ เดชศาสตร์',
    morning: {
      reading1: { sys: 119, dia: 77, pul: 69, time: '07:05' },
      reading2: { sys: 117, dia: 75, pul: 67, time: '07:07' },
    },
    evening: {
      reading1: { sys: 121, dia: 78, pul: 71, time: '18:45' },
      reading2: { sys: 119, dia: 76, pul: 70, time: '18:47' },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 124,
    updatedAt: Date.now() - 1000 * 60 * 60 * 124,
  },
  {
    id: 'bp-record-7',
    date: getDateOffset(6),
    memberId: 'mem-1',
    memberName: 'กฤตนัฐ เดชศาสตร์',
    morning: {
      reading1: { sys: 116, dia: 74, pul: 66, time: '07:20' },
      reading2: { sys: 114, dia: 73, pul: 65, time: '07:22' },
    },
    evening: {
      reading1: { sys: 118, dia: 76, pul: 69, time: '18:30' },
      reading2: { sys: 117, dia: 75, pul: 68, time: '18:32' },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 148,
    updatedAt: Date.now() - 1000 * 60 * 60 * 148,
  },

  // Records for Member 2: วรินทร เดชศาสตร์ (mem-2)
  {
    id: 'bp-record-mem2-1',
    date: getDateOffset(0),
    memberId: 'mem-2',
    memberName: 'วรินทร เดชศาสตร์',
    morning: {
      reading1: { sys: 112, dia: 72, pul: 68, time: '06:50' },
      reading2: { sys: 110, dia: 70, pul: 66, time: '06:52' },
      note: 'สุขภาพปกติ สบายดี',
    },
    evening: {
      reading1: { sys: 115, dia: 74, pul: 70, time: '19:30' },
      reading2: { sys: 114, dia: 72, pul: 69, time: '19:32' },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
    updatedAt: Date.now() - 1000 * 60 * 60 * 3,
  },
  {
    id: 'bp-record-mem2-2',
    date: getDateOffset(1),
    memberId: 'mem-2',
    memberName: 'วรินทร เดชศาสตร์',
    morning: {
      reading1: { sys: 114, dia: 73, pul: 69, time: '07:00' },
      reading2: { sys: 111, dia: 71, pul: 67, time: '07:02' },
    },
    evening: {
      reading1: { sys: 116, dia: 75, pul: 71, time: '19:15' },
      reading2: { sys: 113, dia: 73, pul: 70, time: '19:17' },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 27,
    updatedAt: Date.now() - 1000 * 60 * 60 * 27,
  },

  // Records for Member 3: สมหมาย สุขเกษม (mem-3)
  {
    id: 'bp-record-mem3-1',
    date: getDateOffset(0),
    memberId: 'mem-3',
    memberName: 'สมหมาย สุขเกษม',
    morning: {
      reading1: { sys: 138, dia: 86, pul: 76, time: '07:00' },
      reading2: { sys: 135, dia: 84, pul: 74, time: '07:02' },
      note: 'ทานยาควบคุมความดันหลังอาหารเช้า',
    },
    evening: {
      reading1: { sys: 140, dia: 88, pul: 78, time: '18:15' },
      reading2: { sys: 137, dia: 85, pul: 75, time: '18:17' },
      note: 'พักผ่อนดูทีวีช่วงค่ำ',
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: 'bp-record-mem3-2',
    date: getDateOffset(1),
    memberId: 'mem-3',
    memberName: 'สมหมาย สุขเกษม',
    morning: {
      reading1: { sys: 142, dia: 88, pul: 77, time: '07:15' },
      reading2: { sys: 139, dia: 86, pul: 75, time: '07:17' },
    },
    evening: {
      reading1: { sys: 141, dia: 87, pul: 79, time: '18:40' },
      reading2: { sys: 138, dia: 85, pul: 76, time: '18:42' },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 26,
    updatedAt: Date.now() - 1000 * 60 * 60 * 26,
  },
];
