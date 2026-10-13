import {
  BPStageInfo,
  BPStageKey,
  DailyBPRecord,
  DailyCalculatedMetrics,
  AverageResult,
  PeriodReadings,
} from '../types/bp';

export const BP_STAGES: Record<BPStageKey, BPStageInfo> = {
  hypotension: {
    key: 'hypotension',
    titleTh: 'ความดันโลหิตต่ำ',
    titleEn: 'Hypotension',
    badgeBg: 'bg-indigo-50 border-indigo-200',
    badgeText: 'text-indigo-800',
    accentColor: '#6366f1',
    gradientClass: 'from-blue-500 to-indigo-600',
    severityIndex: 0,
    emoji: '🥶',
    heartEmoji: '💙',
    sysRange: '< 90',
    diaRange: '< 60',
    clinicalSummary: 'ระดับความดันโลหิตต่ำกว่าเกณฑ์มาตรฐาน อาจทำให้หน้ามืดหรือวิงเวียนศีรษะขณะเปลี่ยนอิริยาบถ',
    actionGuidelineTh: 'หากไม่มีอาการวิงเวียน หน้ามืด หรือเป็นลม ถือเป็นสรีรวิทยาปกติ แต่หากมีอาการ ควรพักผ่อน ดื่มน้ำให้เพียงพอ และหลีกเลี่ยงการลุกยืนขึ้นอย่างรวดเร็ว',
    followUpAdviceTh: 'สังเกตอาการวิงเวียน หากเกิดขึ้นบ่อยหรือเป็นลมหมดสติ ควรปรึกษาแพทย์เพื่อตรวจหาสาเหตุ',
  },
  optimal: {
    key: 'optimal',
    titleTh: 'เหมาะสม / ดีเยี่ยม',
    titleEn: 'Optimal (Ideal)',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    badgeText: 'text-emerald-800',
    accentColor: '#10b981',
    gradientClass: 'from-emerald-500 to-teal-600',
    severityIndex: 1,
    emoji: '😊',
    heartEmoji: '💚',
    sysRange: '< 120',
    diaRange: '< 80',
    clinicalSummary: 'ระดับความดันโลหิตอยู่ในเกณฑ์เหมาะสมตามมาตรฐานสากล สุขภาพหลอดเลือดและหัวใจดีเยี่ยม',
    actionGuidelineTh: 'รักษาพฤติกรรมสุขภาพที่ดีอย่างต่อเนื่อง ออกกำลังกายสม่ำเสมอ รับประทานอาหารครบ 5 หมู่ และควบคุมปริมาณโซเดียมในอาหาร',
    followUpAdviceTh: 'ตรวจวัดและบันทึกความดันโลหิตสม่ำเสมอ เพื่อคงสภาวะความดันปกติในระยะยาว',
  },
  normal: {
    key: 'normal',
    titleTh: 'ปกติ',
    titleEn: 'Normal',
    badgeBg: 'bg-teal-50 border-teal-200',
    badgeText: 'text-teal-800',
    accentColor: '#059669',
    gradientClass: 'from-teal-500 to-emerald-600',
    severityIndex: 2,
    emoji: '😃',
    heartEmoji: '💚',
    sysRange: '120 - 129',
    diaRange: '< 80',
    clinicalSummary: 'ระดับความดันปกติ แต่เริ่มขยับใกล้ขอบบนของค่ามาตรฐาน',
    actionGuidelineTh: 'เน้นการปรับเปลี่ยนพฤติกรรมชีวิต เช่น ลดอาหารรสเค็มจัด ลดการดื่มแอลกอฮอล์ พักผ่อนให้เพียงพอ 7-8 ชั่วโมงต่อวัน',
    followUpAdviceTh: 'ตรวจวัดความดันโลหิตต่อเนื่องสัปดาห์ละ 2-3 วัน หรือตามคำแนะนำของแพทย์',
  },
  high_normal: {
    key: 'high_normal',
    titleTh: 'เริ่มสูง / ต้องเฝ้าระวัง',
    titleEn: 'High-Normal (Elevated)',
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-amber-800',
    accentColor: '#f59e0b',
    gradientClass: 'from-amber-400 to-yellow-600',
    severityIndex: 3,
    emoji: '😐',
    heartEmoji: '💛',
    sysRange: '130 - 139',
    diaRange: '80 - 89',
    clinicalSummary: 'ระดับความดันเริ่มสูงกว่าปกติ (Prehypertension) มีความเสี่ยงที่จะพัฒนาเป็นโรคความดันโลหิตสูงหากไม่ปรับเปลี่ยนพฤติกรรม',
    actionGuidelineTh: 'ปฏิบัติตามหลัก DASH Diet (เน้นผักผลไม้ ธัญพืช ลดไขมันอิ่มตัว จำกัดโซเดียมไม่เกิน 2,000 มก./วัน) ออกกำลังกายแบบแอโรบิกอย่างน้อย 150 นาที/สัปดาห์',
    followUpAdviceTh: 'ติดตามวัดความดันโลหิตเช้าและเย็นอย่างสม่ำเสมอ หากค่ายังคงสูงต่อเนื่อง 2-3 สัปดาห์ ควรปรึกษาแพทย์',
  },
  grade1: {
    key: 'grade1',
    titleTh: 'ความดันสูงระดับที่ 1',
    titleEn: 'Grade 1 Hypertension',
    badgeBg: 'bg-orange-50 border-orange-200',
    badgeText: 'text-orange-800',
    accentColor: '#ea580c',
    gradientClass: 'from-amber-500 to-orange-600',
    severityIndex: 4,
    emoji: '😟',
    heartEmoji: '🧡',
    sysRange: '140 - 159',
    diaRange: '90 - 99',
    clinicalSummary: 'เข้าเกณฑ์โรคความดันโลหิตสูงระดับที่ 1 (Mild Hypertension) เพิ่มความเสี่ยงต่อโรคหลอดเลือดหัวใจและไต',
    actionGuidelineTh: 'ปรับเปลี่ยนพฤติกรรมการใช้ชีวิตอย่างเข้มงวด งดสูบบุหรี่ ลดความเครียด หากได้รับยาลดความดันโลหิตจากแพทย์แล้ว ต้องรับประทานยาอย่างสม่ำเสมอห้ามหยุดยาเอง',
    followUpAdviceTh: 'นัดหมายพบแพทย์เพื่อประเมินความเสี่ยงโรคหัวใจและหลอดเลือด และพิจารณาการรักษาที่เหมาะสม',
  },
  grade2: {
    key: 'grade2',
    titleTh: 'ความดันสูงระดับที่ 2',
    titleEn: 'Grade 2 Hypertension',
    badgeBg: 'bg-rose-50 border-rose-200',
    badgeText: 'text-rose-800',
    accentColor: '#dc2626',
    gradientClass: 'from-rose-500 to-red-600',
    severityIndex: 5,
    emoji: '😨',
    heartEmoji: '🔴',
    sysRange: '160 - 179',
    diaRange: '100 - 109',
    clinicalSummary: 'ระดับความดันโลหิตสูงอย่างมีนัยสำคัญ (Moderate-Severe Hypertension) มีความเสี่ยงต่ออวัยวะเป้าหมายสูง',
    actionGuidelineTh: 'ต้องได้รับการดูแลโดยแพทย์อย่างใกล้ชิดและมักจำเป็นต้องใช้ยาควบคุมความดันโลหิต บันทึกค่าความดันเช้าและเย็นนำไปให้แพทย์ดูทุกครั้ง',
    followUpAdviceTh: 'พบแพทย์ตามนัดหมายโดยเร็ว และตรวจประเมินอวัยวะเป้าหมาย (หัวใจ ไต จอประสาทตา)',
  },
  crisis: {
    key: 'crisis',
    titleTh: 'วิกฤตความดันโลหิตสูง (อันตราย)',
    titleEn: 'Hypertensive Crisis',
    badgeBg: 'bg-red-100 border-red-300',
    badgeText: 'text-red-950',
    accentColor: '#991b1b',
    gradientClass: 'from-red-600 to-rose-900',
    severityIndex: 6,
    emoji: '🚨',
    heartEmoji: '🆘',
    sysRange: '≥ 180',
    diaRange: '≥ 110',
    clinicalSummary: 'ระดับความดันโลหิตสูงขั้นวิกฤต เสี่ยงต่อภาวะฉุกเฉินทางสมอง หัวใจ และไตเฉียบพลัน',
    actionGuidelineTh: 'นั่งพักนิ่งๆ 5 นาทีแล้ววัดซ้ำ หากค่ายังคงสูงเกิน 180/110 mmHg หรือมีอาการเตือน (เจ็บแน่นหน้าอก เหนื่อยหอบ ปวดศีรษะรุนแรง ตาพร่ามัว ชาครึ่งซีก) ให้ไปโรงพยาบาลหรือติดต่อ 1669 ทันที',
    followUpAdviceTh: 'ต้องพบแพทย์ในห้องฉุกเฉินทันที ห้ามรอดูอาการที่บ้าน',
  },
};

/**
 * Classify BP values into standard clinical stages
 * According to ESC/ESH & AHA/ACC standard Home BP Monitoring cut-offs
 */
export function classifyBP(sys: number, dia: number): BPStageInfo {
  // Crisis: SYS >= 180 OR DIA >= 110 (or 120 per AHA)
  if (sys >= 180 || dia >= 110) {
    return BP_STAGES.crisis;
  }
  // Grade 2: SYS 160-179 OR DIA 100-109
  if (sys >= 160 || dia >= 100) {
    return BP_STAGES.grade2;
  }
  // Grade 1: SYS 140-159 OR DIA 90-99
  if (sys >= 140 || dia >= 90) {
    return BP_STAGES.grade1;
  }
  // High-Normal (Elevated / Prehypertension): SYS 130-139 OR DIA 80-89
  if (sys >= 130 || dia >= 80) {
    return BP_STAGES.high_normal;
  }
  // Hypotension: SYS < 90 OR DIA < 60
  if (sys < 90 || dia < 60) {
    return BP_STAGES.hypotension;
  }
  // Normal: SYS 120-129 AND DIA < 80
  if (sys >= 120 && dia < 80) {
    return BP_STAGES.normal;
  }
  // Optimal: SYS < 120 AND DIA < 80
  return BP_STAGES.optimal;
}

/**
 * Compute average of readings in a period (Morning or Evening)
 */
export function computePeriodAverage(period: PeriodReadings): AverageResult | null {
  const readings = [period.reading1, period.reading2].filter(
    (r): r is NonNullable<typeof r> => r !== null && r.sys > 0 && r.dia > 0
  );

  if (readings.length === 0) return null;

  const totalSys = readings.reduce((acc, r) => acc + r.sys, 0);
  const totalDia = readings.reduce((acc, r) => acc + r.dia, 0);
  const totalPul = readings.reduce((acc, r) => acc + r.pul, 0);

  return {
    sys: Math.round(totalSys / readings.length),
    dia: Math.round(totalDia / readings.length),
    pul: Math.round(totalPul / readings.length),
    count: readings.length,
  };
}

/**
 * Compute daily combined metrics for a record
 */
export function computeDailyMetrics(record: DailyBPRecord): DailyCalculatedMetrics {
  const morningAvg = computePeriodAverage(record.morning);
  const eveningAvg = computePeriodAverage(record.evening);

  let dailyAvg: AverageResult | null = null;
  const allReadings = [
    record.morning.reading1,
    record.morning.reading2,
    record.evening.reading1,
    record.evening.reading2,
  ].filter((r): r is NonNullable<typeof r> => r !== null && r.sys > 0 && r.dia > 0);

  if (allReadings.length > 0) {
    const totalSys = allReadings.reduce((acc, r) => acc + r.sys, 0);
    const totalDia = allReadings.reduce((acc, r) => acc + r.dia, 0);
    const totalPul = allReadings.reduce((acc, r) => acc + r.pul, 0);

    dailyAvg = {
      sys: Math.round(totalSys / allReadings.length),
      dia: Math.round(totalDia / allReadings.length),
      pul: Math.round(totalPul / allReadings.length),
      count: allReadings.length,
    };
  }

  const stage = dailyAvg ? classifyBP(dailyAvg.sys, dailyAvg.dia) : null;

  const morningSurge =
    morningAvg && eveningAvg ? morningAvg.sys - eveningAvg.sys : null;

  const pulsePressure = dailyAvg ? dailyAvg.sys - dailyAvg.dia : null;
  const meanArterialPressure = dailyAvg
    ? Math.round(dailyAvg.dia + (dailyAvg.sys - dailyAvg.dia) / 3)
    : null;

  return {
    morningAvg,
    eveningAvg,
    dailyAvg,
    stage,
    morningSurge,
    pulsePressure,
    meanArterialPressure,
  };
}

/**
 * Evaluate Pulse Status
 */
export function evaluatePulse(pul: number): {
  status: 'normal' | 'bradycardia' | 'tachycardia';
  labelTh: string;
  badgeClass: string;
} {
  if (pul < 60) {
    return {
      status: 'bradycardia',
      labelTh: 'ชีพจรช้า (<60 bpm)',
      badgeClass: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    };
  }
  if (pul > 100) {
    return {
      status: 'tachycardia',
      labelTh: 'ชีพจรเร็ว (>100 bpm)',
      badgeClass: 'text-rose-700 bg-rose-50 border-rose-200',
    };
  }
  return {
    status: 'normal',
    labelTh: 'ชีพจรปกติ (60-100 bpm)',
    badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  };
}

/**
 * Format Thai Date
 */
export function formatThaiDate(dateStr: string, options?: { showDayOfWeek?: boolean; shortMonth?: boolean }): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const monthIndex = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const thaiMonthsShort = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const thaiMonthsFull = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const thaiDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

  const dateObj = new Date(year, monthIndex, day);
  const thaiYear = year + 543;
  const monthName = options?.shortMonth ? thaiMonthsShort[monthIndex] : thaiMonthsFull[monthIndex];

  let result = `${day} ${monthName} ${thaiYear}`;
  if (options?.showDayOfWeek) {
    const dayOfWeek = thaiDays[dateObj.getDay()];
    result = `วัน${dayOfWeek}ที่ ${result}`;
  }
  return result;
}

/**
 * Get comprehensive health status emojis based on BP stage
 */
export function getBPEmoji(stageKey?: BPStageKey | null): {
  face: string;
  heart: string;
  combined: string;
  healthStatusText: string;
} {
  if (!stageKey || !BP_STAGES[stageKey]) {
    return { face: '⚪', heart: '🤍', combined: '⚪ 🤍', healthStatusText: 'ยังไม่มีข้อมูล' };
  }
  const stage = BP_STAGES[stageKey];
  return {
    face: stage.emoji,
    heart: stage.heartEmoji,
    combined: `${stage.heartEmoji} ${stage.emoji}`,
    healthStatusText: `${stage.heartEmoji} ${stage.titleTh}`,
  };
}

/**
 * Get pulse / heart rate emoji and Thai description
 */
export function getPulseEmoji(pul: number): {
  emoji: string;
  badgeEmoji: string;
  label: string;
} {
  if (pul < 60) {
    return {
      emoji: '🐢',
      badgeEmoji: '🐢 💙',
      label: 'ชีพจรช้า (<60 bpm)',
    };
  }
  if (pul > 100) {
    return {
      emoji: '⚡',
      badgeEmoji: '⚡ ❤️‍🔥',
      label: 'ชีพจรเร็ว (>100 bpm)',
    };
  }
  return {
    emoji: '💓',
    badgeEmoji: '💓 ❤️',
    label: 'ชีพจรปกติ (60-100 bpm)',
  };
}

