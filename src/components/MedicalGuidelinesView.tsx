import React from 'react';
import { BP_STAGES } from '../utils/bpClassification';
import {
  ShieldAlert,
  CheckCircle2,
  HeartPulse,
  Info,
  Clock,
  Coffee,
  AlertTriangle,
  FileCheck,
  Stethoscope,
  PhoneCall,
} from 'lucide-react';

import { BackToHomeButton } from './BackToHomeButton';

interface MedicalGuidelinesViewProps {
  onNavigateHome?: () => void;
}

export const MedicalGuidelinesView: React.FC<MedicalGuidelinesViewProps> = ({ onNavigateHome }) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="pb-3 border-b border-slate-200">
        {onNavigateHome && (
          <div className="mb-2">
            <BackToHomeButton onNavigateHome={onNavigateHome} />
          </div>
        )}
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          เกณฑ์มาตรฐานสากลและคู่มือทางการแพทย์
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          อ้างอิงตามแนวทางสากล AHA/ACC, ESC/ESH และสมาคมความดันโลหิตสูงแห่งประเทศไทย เพื่อความปลอดภัยและความแม่นยำสูงสุด
        </p>
      </div>

      {/* Emergency Red Flags Callout */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
          <ShieldAlert className="w-5 h-5 text-red-700 shrink-0" />
          <span>สัญญาณอันตรายที่ต้องพบแพทย์ฉุกเฉินทันที (Emergency Red Flags)</span>
        </div>

        <p className="text-xs text-red-800 leading-relaxed">
          หากวัดค่าความดันได้ <strong>SYS ≥ 180 mmHg</strong> หรือ <strong>DIA ≥ 110-120 mmHg</strong> ร่วมกับมีอาการดังต่อไปนี้ข้อใดข้อหนึ่ง อย่ารอดูอาการที่บ้าน ให้ติดต่อสายด่วนการแพทย์ฉุกเฉิน <strong>1669</strong> หรือไปห้องฉุกเฉินโรงพยาบาลทันที:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs text-red-950 font-medium pt-1">
          <div className="p-2.5 bg-white/80 rounded-lg border border-red-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span>เจ็บแน่นหน้าอก หรือร้าวไปกราม/แขน</span>
          </div>
          <div className="p-2.5 bg-white/80 rounded-lg border border-red-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span>หายใจลำบาก หายใจเหนื่อยหอบฉับพลัน</span>
          </div>
          <div className="p-2.5 bg-white/80 rounded-lg border border-red-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span>ปวดศีรษะรุนแรงเฉียบพลัน ตาพร่ามัว</span>
          </div>
          <div className="p-2.5 bg-white/80 rounded-lg border border-red-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span>แขนขาอ่อนแรงหรือชาครึ่งซีก ปากเบี้ยว</span>
          </div>
          <div className="p-2.5 bg-white/80 rounded-lg border border-red-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span>พูดไม่ชัด ลิ้นแข็ง สับสนฉับพลัน</span>
          </div>
          <div className="p-2.5 bg-white/80 rounded-lg border border-red-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span>คลื่นไส้ อาเจียนรุนแรง หรือชักเกร็ง</span>
          </div>
        </div>
      </div>

      {/* Official Classification Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-4 sm:p-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            ตารางจัดระดับความดันโลหิตตามเกณฑ์สากล (AHA / ESC Classification)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            เกณฑ์การวัดที่บ้าน (Home Blood Pressure Monitoring - HBPM)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <th className="py-3 px-4">ระดับความดันโลหิต</th>
                <th className="py-3 px-3">SYS (ตัวบน) mmHg</th>
                <th className="py-3 px-3">DIA (ตัวล่าง) mmHg</th>
                <th className="py-3 px-4">ความหมายทางคลินิก</th>
                <th className="py-3 px-4">แนวทางปฏิบัติ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {Object.values(BP_STAGES).map((stage) => (
                <tr key={stage.key} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-medium">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: stage.accentColor }}
                      ></span>
                      <div>
                        <div className="text-slate-900 font-semibold">{stage.titleTh}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{stage.titleEn}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono-numbers font-medium text-slate-900">
                    {stage.sysRange}
                  </td>
                  <td className="py-3 px-3 font-mono-numbers font-medium text-slate-900">
                    {stage.diaRange}
                  </td>
                  <td className="py-3 px-4 text-slate-600 leading-relaxed max-w-xs">
                    {stage.clinicalSummary}
                  </td>
                  <td className="py-3 px-4 text-slate-600 leading-relaxed max-w-xs">
                    {stage.actionGuidelineTh}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7 Golden Rules of Home BP Measurement */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            กฎเหล็ก 7 ข้อในการวัดความดันโลหิตที่บ้านให้แม่นยำ (HBPM Best Practices)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            วิธีปฏิบัติที่ถูกต้องเพื่อป้องกันค่าคลาดเคลื่อน (White Coat Effect หรือ Masked Hypertension)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <h4 className="font-bold text-slate-900 mb-0.5">นั่งพักนิ่งๆ อย่างน้อย 5 นาที</h4>
              <p className="text-slate-600 leading-relaxed">
                นั่งในห้องที่เงียบ อุณหภูมิสบาย ผ่อนคลายกล้ามเนื้อ ไม่เล่นโทรศัพท์หรือพูดคุยก่อนวัด
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <h4 className="font-bold text-slate-900 mb-0.5">วัดวันละ 2 ช่วงเวลา (เช้าและเย็น)</h4>
              <p className="text-slate-600 leading-relaxed">
                เช้า: ภายใน 1 ชม. หลังตื่นนอน ก่อนทานอาหารเช้าและยากดความดัน · เย็น: ก่อนเข้านอน
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <h4 className="font-bold text-slate-900 mb-0.5">วัดช่วงละ 2 ครั้ง ห่างกัน 1-2 นาที</h4>
              <p className="text-slate-600 leading-relaxed">
                ในแต่ละช่วง ให้วัด 2 ครั้งต่อเนื่อง เว้นระยะ 1-2 นาที แล้วระบบจะคำนวณค่าเฉลี่ยให้อัตโนมัติ
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">
              4
            </span>
            <div>
              <h4 className="font-bold text-slate-900 mb-0.5">จัดท่าทางให้ถูกต้อง แขนอยู่ระดับหัวใจ</h4>
              <p className="text-slate-600 leading-relaxed">
                นั่งเก้าอี้มีพนักพิง เท้าวางราบกับพื้น ไม่ไขว่ห้าง วางแขนบนโต๊ะให้ผ้าพันแขน (Cuff) อยู่ระดับเดียวกับหัวใจ
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">
              5
            </span>
            <div>
              <h4 className="font-bold text-slate-900 mb-0.5">งดชา กาแฟ บุหรี่ แอลกอฮอล์ 30 นาที</h4>
              <p className="text-slate-600 leading-relaxed">
                สารกระตุ้นเหล่านี้ส่งผลให้หลอดเลือดหดตัวและค่าความดันสูงกว่าความเป็นจริงชั่วคราว
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">
              6
            </span>
            <div>
              <h4 className="font-bold text-slate-900 mb-0.5">ปัสสาวะให้เรียบร้อยก่อนวัด</h4>
              <p className="text-slate-600 leading-relaxed">
                การกลั้นปัสสาวะทำให้กระเพาะปัสสาวะตึงตัว อาจทำให้ค่าความดันตัวบนสูงขึ้นได้ถึง 10-15 mmHg
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Morning Blood Pressure Surge Medical Significance */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <HeartPulse className="w-4 h-4 text-teal-700" />
          <span>ทำไมต้องวัด 2 ช่วงเวลา และ "ความดันพุ่งช่วงเช้า (Morning Surge)" คืออะไร?</span>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed">
          ตามจังหวะชีวภาพ (Circadian Rhythm) ความดันโลหิตจะเริ่มสูงขึ้นตามธรรมชาติในช่วงเวลาเช้ามืดและหลังตื่นนอน หากความดันโลหิตช่วงเช้าพุ่งสูงผิดปกติเมื่อเทียบกับช่วงเย็น (Morning BP Surge &gt; 20 mmHg) จะเพิ่มความเสี่ยงต่อภาวะ<strong>หลอดเลือดสมองแตก/ตีบ (Stroke)</strong> และ<strong>กล้ามเนื้อหัวใจขาดเลือดเฉียบพลัน (Myocardial Infarction)</strong> สูงขึ้นอย่างมีนัยสำคัญ
        </p>

        <p className="text-xs text-slate-600 leading-relaxed">
          การบันทึกวันละ 2 ช่วงเวลา (เช้าและเย็น) ช่วงละ 2 ครั้ง จึงเป็นมาตรฐานสากลที่แพทย์โรคหัวใจแนะนำ เพื่อให้ได้ข้อมูลที่แม่นยำที่สุดสำหรับปรับขนาดยาและการดูแลสุขภาพ
        </p>
      </div>
    </div>
  );
};
