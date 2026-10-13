import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Sun,
  Moon,
  Timer,
  Clock,
  ArrowRight,
  X,
  Volume2,
  CheckCircle2,
  Settings,
} from 'lucide-react';
import {
  TimeSlotStatus,
  getScheduleStatus,
  isSnoozed,
  snoozeNotifications,
  getNotificationPermission,
  requestNotificationPermission,
  playChimeSound,
} from '../services/notificationService';
import { DailyBPRecord } from '../types/bp';
import { Member } from '../types/member';

interface NotificationSlotBannerProps {
  todayRecord: DailyBPRecord | null | undefined;
  activeMember: Member | null;
  onNavigateToEntry: () => void;
  onOpenSettings: () => void;
}

export const NotificationSlotBanner: React.FC<NotificationSlotBannerProps> = ({
  todayRecord,
  activeMember,
  onNavigateToEntry,
  onOpenSettings,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [schedule, setSchedule] = useState<TimeSlotStatus>(() => getScheduleStatus(todayRecord));
  const [snoozed, setSnoozed] = useState(isSnoozed);
  const [permission, setPermission] = useState(getNotificationPermission);

  // Re-check periodically
  useEffect(() => {
    const checkStatus = () => {
      setSchedule(getScheduleStatus(todayRecord));
      setSnoozed(isSnoozed());
      setPermission(getNotificationPermission());
    };
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, [todayRecord]);

  // If snoozed, dismissed, or NOT due, do not render
  if (isDismissed || snoozed || !schedule.isOptimalSlot || !schedule.isCurrentSlotDue) {
    return null;
  }

  const handleSnooze = () => {
    snoozeNotifications(30);
    setSnoozed(true);
  };

  const handleEnablePush = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      playChimeSound();
    }
  };

  const memberName = activeMember ? activeMember.firstName : 'ท่าน';
  const isMorning = schedule.currentSlot === 'morning';

  return (
    <div className="mb-4 relative overflow-hidden rounded-2xl border border-teal-200/90 bg-gradient-to-r from-teal-50 via-teal-100/50 to-emerald-50 p-3 sm:p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Side: Icon & Context */}
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              isMorning
                ? 'bg-amber-500 text-white shadow-amber-500/20'
                : 'bg-indigo-600 text-white shadow-indigo-600/20'
            }`}
          >
            {isMorning ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                🔔 ถึงช่วงเวลาวัดความดันโลหิต{isMorning ? 'รอบเช้า' : 'รอบเย็น'} ({schedule.timeRangeLabel})
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                ยังไม่ได้บันทึกผลวันนี้
              </span>
            </div>
            <p className="text-xs text-slate-600">
              สวัสดีคุณ {memberName} เพื่อการดูแลสุขภาพที่ถูกต้องตามเกณฑ์แพทย์ กรุณานั่งพัก 5 นาทีแล้วบันทึกค่าความดัน
            </p>
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap">
          {permission !== 'granted' && (
            <button
              onClick={handleEnablePush}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-teal-200 text-teal-800 hover:bg-teal-50 text-xs font-semibold transition cursor-pointer shadow-2xs whitespace-nowrap"
              title="เปิดการแจ้งเตือนบนเบราว์เซอร์เพื่อให้เตือนแม้ไม่ได้เปิดหน้านี้"
            >
              เปิดแจ้งเตือนบนเบราว์เซอร์
            </button>
          )}

          <button
            onClick={handleSnooze}
            className="px-2.5 py-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-700 text-xs font-medium border border-slate-200 transition cursor-pointer shadow-2xs whitespace-nowrap"
            title="เตือนอีกครั้งในอีก 30 นาที"
          >
            เลื่อน 30 นาที
          </button>

          <button
            onClick={onNavigateToEntry}
            className="px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 active:scale-[0.98] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Timer className="w-3.5 h-3.5" />
            <span>บันทึกตอนนี้ (พัก 5 นาที)</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            onClick={onOpenSettings}
            className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-white/80 transition cursor-pointer"
            title="ตั้งค่าการแจ้งเตือน"
            aria-label="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-white/80 transition cursor-pointer"
            title="ปิดแบนเนอร์ชั่วคราว"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
