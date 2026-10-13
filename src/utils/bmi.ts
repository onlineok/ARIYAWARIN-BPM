import { Member, BMICategoryInfo, BMICategoryKey, MemberBMIAnalysis } from '../types/member';

/**
 * Asian BMI Criteria (WHO Western Pacific Region standard)
 * Widely adopted by Ministry of Public Health Thailand:
 * - < 18.5: น้ำหนักน้อยกว่าเกณฑ์ (Underweight)
 * - 18.5 - 22.9: สมส่วน / ปกติ (Normal)
 * - 23.0 - 24.9: น้ำหนักเกิน / ท้วม (Overweight / Pre-obese)
 * - 25.0 - 29.9: อ้วนระดับ 1 (Obese Class 1)
 * - >= 30.0: อ้วนระดับ 2 / อันตราย (Obese Class 2)
 */
export const BMI_CATEGORIES: Record<BMICategoryKey, BMICategoryInfo> = {
  underweight: {
    key: 'underweight',
    labelTh: 'น้ำหนักน้อยกว่าเกณฑ์',
    labelEn: 'Underweight',
    rangeTh: '< 18.5',
    colorHex: '#3b82f6',
    badgeBg: 'bg-blue-50 border-blue-200',
    badgeText: 'text-blue-800',
    riskDescriptionTh: 'เสี่ยงต่อภาวะขาดสารอาหาร ภูมิคุ้มกันต่ำ และกระดูกพรุน',
    recommendationTh: 'รับประทานอาหารที่มีคุณค่าทางโภชนาการครบถ้วน เพิ่มโปรตีนและพลังงานที่มีประโยชน์ และเสริมสร้างกล้ามเนื้อ',
  },
  normal: {
    key: 'normal',
    labelTh: 'สมส่วน / ปกติ',
    labelEn: 'Normal (Healthy)',
    rangeTh: '18.5 - 22.9',
    colorHex: '#10b981',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    badgeText: 'text-emerald-800',
    riskDescriptionTh: 'ความเสี่ยงต่อโรคหลอดเลือดหัวใจ เบาหวาน และความดันโลหิตอยู่ในเกณฑ์ต่ำสุด',
    recommendationTh: 'รักษาสมดุลอาหารและออกกำลังกายสม่ำเสมออย่างน้อย 150 นาทีต่อสัปดาห์เพื่อคงน้ำหนักนี้ไว้',
  },
  overweight: {
    key: 'overweight',
    labelTh: 'น้ำหนักเกิน / ท้วม',
    labelEn: 'Overweight',
    rangeTh: '23.0 - 24.9',
    colorHex: '#f59e0b',
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-amber-800',
    riskDescriptionTh: 'เริ่มมีความเสี่ยงต่อภาวะความดันโลหิตสูง ไขมันในเลือด และเบาหวานชนิดที่ 2',
    recommendationTh: 'ควบคุมปริมาณคาร์โบไฮเดรตและไขมันอิ่มตัว ออกกำลังกายแบบแอโรบิกร่วมกับเวทเทรนนิ่งเพื่อลดไขมันสะสม',
  },
  obese1: {
    key: 'obese1',
    labelTh: 'อ้วนระดับ 1',
    labelEn: 'Obese Class 1',
    rangeTh: '25.0 - 29.9',
    colorHex: '#ea580c',
    badgeBg: 'bg-orange-50 border-orange-200',
    badgeText: 'text-orange-800',
    riskDescriptionTh: 'เพิ่มความเสี่ยงโรคหัวใจ ความดันโลหิตสูง ภาวะหยุดหายใจขณะหลับ และไขมันพอกตับ',
    recommendationTh: 'จำกัดปริมาณแคลอรีต่อวัน ปรึกษานักโภชนาการ และออกกำลังกายสม่ำเสมอโดยเลือกชนิดที่ไม่กระแทกข้อเข่า',
  },
  obese2: {
    key: 'obese2',
    labelTh: 'อ้วนระดับ 2 (อันตราย)',
    labelEn: 'Obese Class 2',
    rangeTh: '≥ 30.0',
    colorHex: '#dc2626',
    badgeBg: 'bg-rose-50 border-rose-200',
    badgeText: 'text-rose-800',
    riskDescriptionTh: 'ความเสี่ยงสูงมากต่อภาวะแทรกซ้อนทางระบบหัวใจและหลอดเลือด รวมถึงโรคไตเรื้อรัง',
    recommendationTh: 'ควรปรึกษาแพทย์และทีมสหสาขาวิชาชีพเพื่อวางแผนลดน้ำหนักอย่างถูกวิธีและตรวจคัดกรองโรคร่วม',
  },
};

/**
 * Calculate BMI and return comprehensive analysis
 */
export function calculateBMI(weightKg: number, heightCm: number): MemberBMIAnalysis {
  if (weightKg <= 0 || heightCm <= 0) {
    return {
      bmi: 0,
      category: BMI_CATEGORIES.normal,
      idealWeightRange: { min: 0, max: 0 },
      weightDifference: 0,
    };
  }

  // Defensive guard: in case height and weight were inadvertently swapped
  // (e.g. height 175 passed as weightKg, and weight 68.5 passed as heightCm)
  let actualWeight = weightKg;
  let actualHeight = heightCm;
  if (actualWeight > 100 && actualHeight < 100 && actualWeight > actualHeight) {
    actualWeight = heightCm;
    actualHeight = weightKg;
  }

  const heightM = actualHeight / 100;
  const bmiRaw = actualWeight / (heightM * heightM);
  const bmi = Math.round(bmiRaw * 10) / 10;

  let category: BMICategoryInfo;
  if (bmi < 18.5) {
    category = BMI_CATEGORIES.underweight;
  } else if (bmi <= 22.9) {
    category = BMI_CATEGORIES.normal;
  } else if (bmi <= 24.9) {
    category = BMI_CATEGORIES.overweight;
  } else if (bmi <= 29.9) {
    category = BMI_CATEGORIES.obese1;
  } else {
    category = BMI_CATEGORIES.obese2;
  }

  // Ideal weight range for Asians (BMI 18.5 - 22.9)
  const minIdeal = Math.round(18.5 * heightM * heightM * 10) / 10;
  const maxIdeal = Math.round(22.9 * heightM * heightM * 10) / 10;

  let weightDifference = 0;
  if (weightKg > maxIdeal) {
    weightDifference = Math.round((weightKg - maxIdeal) * 10) / 10; // Overweight by X kg
  } else if (weightKg < minIdeal) {
    weightDifference = Math.round((weightKg - minIdeal) * 10) / 10; // Underweight by X kg
  }

  return {
    bmi,
    category,
    idealWeightRange: { min: minIdeal, max: maxIdeal },
    weightDifference,
  };
}

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem-1',
    firstName: 'กฤตนัฐ',
    lastName: 'เดชศาสตร์',
    age: 42,
    gender: 'male',
    height: 175,
    weight: 68.5,
    notes: 'ไม่มีโรคประจำตัว ออกกำลังกายสัปดาห์ละ 3 วัน',
    avatarColor: '#0d9488',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
  },
  {
    id: 'mem-2',
    firstName: 'วรินทร',
    lastName: 'เดชศาสตร์',
    age: 38,
    gender: 'female',
    height: 162,
    weight: 54.0,
    notes: 'สุขภาพแข็งแรง ตรวจสุขภาพประจำปีปกติ',
    avatarColor: '#6366f1',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
  },
  {
    id: 'mem-3',
    firstName: 'สมหมาย',
    lastName: 'สุขเกษม',
    age: 65,
    gender: 'male',
    height: 168,
    weight: 74.0,
    notes: 'ประวัติความดันโลหิตสูง ทานยาควบคุมความดันตามแพทย์สั่ง',
    avatarColor: '#f59e0b',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
  },
];
