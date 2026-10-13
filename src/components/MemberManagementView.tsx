import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Trash2,
  Edit2,
  Check,
  Scale,
  HeartPulse,
  Info,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  X,
} from 'lucide-react';
import { Member } from '../types/member';
import { calculateBMI, BMI_CATEGORIES } from '../utils/bmi';
import { BackToHomeButton } from './BackToHomeButton';

interface MemberManagementViewProps {
  members: Member[];
  activeMemberId: string;
  onSelectActiveMember: (id: string) => void;
  onAddMember: (member: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateMember: (id: string, updates: Partial<Member>) => void;
  onDeleteMember: (id: string) => void;
  onSyncToSheets?: () => void;
  isSyncing?: boolean;
  onNavigateHome?: () => void;
}

const AVATAR_COLORS = [
  '#0d9488', // teal
  '#2563eb', // blue
  '#7c3aed', // purple
  '#db2777', // pink
  '#d97706', // amber
  '#059669', // emerald
  '#dc2626', // rose
];

export const MemberManagementView: React.FC<MemberManagementViewProps> = ({
  members,
  activeMemberId,
  onSelectActiveMember,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onSyncToSheets,
  isSyncing,
  onNavigateHome,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [formError, setFormError] = useState('');

  // Live BMI calculation preview inside the form
  const previewWeight = typeof weight === 'number' ? weight : 0;
  const previewHeight = typeof height === 'number' ? height : 0;
  const liveBMIAnalysis = previewWeight > 0 && previewHeight > 0 ? calculateBMI(previewWeight, previewHeight) : null;

  const openAddModal = () => {
    setEditingMember(null);
    setFirstName('');
    setLastName('');
    setAge('');
    setGender('male');
    setHeight(170);
    setWeight(65);
    setNotes('');
    setAvatarColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setFirstName(member.firstName);
    setLastName(member.lastName);
    setAge(member.age);
    setGender(member.gender);
    setHeight(member.height);
    setWeight(member.weight);
    setNotes(member.notes || '');
    setAvatarColor(member.avatarColor || AVATAR_COLORS[0]);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setFormError('กรุณากรอกชื่อและนามสกุลให้ครบถ้วน');
      return;
    }
    if (!age || Number(age) < 1 || Number(age) > 130) {
      setFormError('กรุณากรอกอายุที่ถูกต้อง (1 - 130 ปี)');
      return;
    }
    if (!height || Number(height) < 50 || Number(height) > 250) {
      setFormError('กรุณากรอกส่วนสูงที่ถูกต้อง (50 - 250 ซม.)');
      return;
    }
    if (!weight || Number(weight) < 20 || Number(weight) > 300) {
      setFormError('กรุณากรอกน้ำหนักที่ถูกต้อง (20 - 300 กก.)');
      return;
    }

    if (editingMember) {
      onUpdateMember(editingMember.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        age: Number(age),
        gender,
        height: Number(height),
        weight: Number(weight),
        notes: notes.trim(),
        avatarColor,
        updatedAt: Date.now(),
      });
    } else {
      onAddMember({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        age: Number(age),
        gender,
        height: Number(height),
        weight: Number(weight),
        notes: notes.trim(),
        avatarColor,
      });
    }

    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (deletingMember) {
      onDeleteMember(deletingMember.id);
      setDeletingMember(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {onNavigateHome && (
            <div className="mb-2">
              <BackToHomeButton onNavigateHome={onNavigateHome} />
            </div>
          )}
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl text-teal-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                ทะเบียนบุคคลและประเมินดัชนีมวลกาย (BMI)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                บันทึกประวัติสมาชิกเพื่อคำนวณ BMI อัตโนมัติตามเกณฑ์เอเชีย (WHO-WPRO) และแยกสถิติความดันโลหิตรายบุคคล
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-sm transition active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>เพิ่มสมาชิกใหม่</span>
          </button>
        </div>
      </div>

      {/* Asian BMI Standards Quick Guide Banner */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-xs">
        <div className="flex items-center gap-2 font-semibold text-slate-700 mb-2">
          <Info className="w-4 h-4 text-teal-600" />
          <span>เกณฑ์ดัชนีมวลกายมาตรฐานสำหรับประชากรเอเชียและคนไทย (กระทรวงสาธารณสุข):</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Object.values(BMI_CATEGORIES).map((cat) => (
            <div
              key={cat.key}
              className={`p-2 rounded-lg border ${cat.badgeBg} flex flex-col justify-between`}
            >
              <div className="font-semibold text-slate-800 text-[11px] sm:text-xs">
                {cat.labelTh}
              </div>
              <div className="text-[10px] text-slate-600 font-mono-numbers mt-0.5">
                BMI {cat.rangeTh}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Members Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {members.map((member) => {
          const bmiAnalysis = calculateBMI(member.weight, member.height);
          const isActive = member.id === activeMemberId;

          return (
            <div
              key={member.id}
              className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-teal-100/50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0"
                      style={{ backgroundColor: member.avatarColor || '#0d9488' }}
                    >
                      {member.firstName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-base">
                          {member.firstName} {member.lastName}
                        </h3>
                        {isActive && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                            <Check className="w-3 h-3 text-teal-700" />
                            ใช้งานอยู่
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>
                          {member.gender === 'male' ? 'ชาย' : member.gender === 'female' ? 'หญิง' : 'อื่นๆ'}
                        </span>
                        <span>•</span>
                        <span>อายุ {member.age} ปี</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Dropdown / Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(member)}
                      title="แก้ไขข้อมูลสมาชิก"
                      className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {members.length > 1 && (
                      <button
                        onClick={() => setDeletingMember(member)}
                        title="ลบสมาชิก"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Physical Body Metrics & BMI Status */}
                <div className="mt-4 pt-3.5 border-t border-slate-100">
                  <div className="grid grid-cols-3 gap-2 text-center py-2 bg-slate-50 rounded-xl mb-3">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">ส่วนสูง</div>
                      <div className="text-sm font-bold text-slate-800 font-mono-numbers">
                        {member.height} <span className="text-[10px] font-normal text-slate-500">ซม.</span>
                      </div>
                    </div>
                    <div className="border-x border-slate-200">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">น้ำหนัก</div>
                      <div className="text-sm font-bold text-slate-800 font-mono-numbers">
                        {member.weight} <span className="text-[10px] font-normal text-slate-500">กก.</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">ดัชนี BMI</div>
                      <div className="text-sm font-extrabold text-teal-700 font-mono-numbers">
                        {bmiAnalysis.bmi.toFixed(1)}
                      </div>
                    </div>
                  </div>

                  {/* BMI Classification Badge & Evaluation */}
                  <div
                    className={`p-3 rounded-xl border ${bmiAnalysis.category.badgeBg} flex flex-col gap-1.5`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {bmiAnalysis.category.labelTh}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-600">
                        เกณฑ์ {bmiAnalysis.category.rangeTh}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-700 leading-relaxed">
                      {bmiAnalysis.category.riskDescriptionTh}
                    </div>

                    <div className="mt-1 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                      <span>น้ำหนักเหมาะสม:</span>
                      <span className="font-semibold text-slate-800 font-mono-numbers">
                        {bmiAnalysis.idealWeightRange.min} - {bmiAnalysis.idealWeightRange.max} กก.
                      </span>
                    </div>

                    {bmiAnalysis.weightDifference !== 0 && (
                      <div className="text-[10px] text-slate-500 flex items-center justify-between">
                        <span>ผลต่างน้ำหนัก:</span>
                        <span
                          className={`font-semibold ${
                            bmiAnalysis.weightDifference > 0 ? 'text-amber-700' : 'text-blue-700'
                          }`}
                        >
                          {bmiAnalysis.weightDifference > 0
                            ? `เกินเกณฑ์ +${bmiAnalysis.weightDifference} กก.`
                            : `ต่ำกว่าเกณฑ์ -${Math.abs(bmiAnalysis.weightDifference)} กก.`}
                        </span>
                      </div>
                    )}
                  </div>

                  {member.notes && (
                    <div className="mt-3 text-xs text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100">
                      "{member.notes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Activation Button */}
              <div className="p-3 bg-slate-50 border-t border-slate-100">
                {isActive ? (
                  <div className="w-full py-2 px-3 text-xs font-semibold text-teal-800 bg-teal-100/70 rounded-xl text-center flex items-center justify-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-teal-700" />
                    <span>กำลังบันทึกข้อมูลให้สมาชิกท่านนี้</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onSelectActiveMember(member.id)}
                    className="w-full py-2 px-3 text-xs font-semibold text-slate-700 hover:text-teal-700 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <span>เลือกบันทึกข้อมูลสำหรับ {member.firstName}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-100 text-teal-800 rounded-xl">
                  {editingMember ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                    {editingMember ? 'แก้ไขข้อมูลสมาชิก' : 'เพิ่มสมาชิกใหม่ในทะเบียน'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    ข้อมูลส่วนสูงและน้ำหนักจะใช้คำนวณดัชนีมวลกาย (BMI) อัตโนมัติ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-5 sm:p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อ *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="เช่น กฤตนัฐ"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">นามสกุล *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="เช่น เดชศาสตร์"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Age and Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">อายุ (ปี) *</label>
                  <input
                    type="number"
                    min="1"
                    max="130"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="เช่น 42"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono-numbers"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">เพศกำเนิด</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="male">ชาย</option>
                    <option value="female">หญิง</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                </div>
              </div>

              {/* Height and Weight */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ส่วนสูง (ซม.) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="50"
                    max="250"
                    required
                    value={height}
                    onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="เช่น 175"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono-numbers"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">น้ำหนัก (กก.) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    max="300"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="เช่น 68.5"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono-numbers"
                  />
                </div>
              </div>

              {/* Live Real-time BMI Analysis Preview */}
              {liveBMIAnalysis && (
                <div
                  className={`p-3 rounded-xl border ${liveBMIAnalysis.category.badgeBg} transition-all`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-teal-600" />
                      ผลคำนวณ BMI อัตโนมัติ:
                    </span>
                    <span className="font-extrabold text-teal-800 text-sm font-mono-numbers">
                      {liveBMIAnalysis.bmi} kg/m² ({liveBMIAnalysis.category.labelTh})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 flex justify-between">
                    <span>น้ำหนักที่เหมาะสม: {liveBMIAnalysis.idealWeightRange.min} - {liveBMIAnalysis.idealWeightRange.max} กก.</span>
                    <span>{liveBMIAnalysis.category.rangeTh}</span>
                  </div>
                </div>
              )}

              {/* Avatar Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">สีสัญลักษณ์ประจำตัว</label>
                <div className="flex items-center gap-2">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatarColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                        avatarColor === c ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  หมายเหตุ / ประวัติสุขภาพเบื้องต้น (ถ้ามี)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="เช่น ทานยาความดันช่วงเช้า, ออกกำลังกายสม่ำเสมอ"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-sm transition active:scale-95 cursor-pointer"
                >
                  {editingMember ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูลสมาชิก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (User Confirmation for Destructive Operations requirement) */}
      {deletingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">ยืนยันการลบข้อมูลสมาชิก?</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              คุณกำลังจะลบข้อมูลของ <strong>"{deletingMember.firstName} {deletingMember.lastName}"</strong> ออกจากระบบ
              การดำเนินการนี้ไม่สามารถเรียกคืนได้
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingMember(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
