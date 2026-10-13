/**
 * Member Registry & BMI Interface Definitions
 */

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // in cm
  weight: number; // in kg
  notes?: string;
  avatarColor?: string;
  createdAt: number;
  updatedAt: number;
}

export type BMICategoryKey =
  | 'underweight'
  | 'normal'
  | 'overweight'
  | 'obese1'
  | 'obese2';

export interface BMICategoryInfo {
  key: BMICategoryKey;
  labelTh: string;
  labelEn: string;
  rangeTh: string;
  colorHex: string;
  badgeBg: string;
  badgeText: string;
  riskDescriptionTh: string;
  recommendationTh: string;
}

export interface MemberBMIAnalysis {
  bmi: number;
  category: BMICategoryInfo;
  idealWeightRange: { min: number; max: number }; // based on BMI 18.5 - 22.9
  weightDifference: number; // positive = excess, negative = deficit
}
