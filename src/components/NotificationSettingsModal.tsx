import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  BellOff,
  Clock,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  X,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  Timer,
  Info,
} from 'lucide-react';
import {
  NotificationSettings,
  loadNotificationSettings,
  saveNotificationSettings,
  getNotificationPermission,
  requestNotificationPermission,
  checkAndDispatchBPAlert,
  playChimeSound,
  snoozeNotifications,
  isSnoozed,
  getScheduleStatus,
  TimeSlotStatus,
} from '../services/notificationService';
import { DailyBPRecord } from '../types/bp';
import { Member } from '../types/member';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  todayRecord: DailyBPRecord | null | undefined;
  activeMember: Member | null;
  onNavigateToEntry?: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  todayRecord,
  activeMember,
  onNavigateToEntry,
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(loadNotificationSettings);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(getNotificationPermission);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSnoozedActive, setIsSnoozedActive] = useState(isSnoozed);
  const [schedule, setSchedule] = useState<TimeSlotStatus>(() => getScheduleStatus(todayRecord));

  // Sync state on open
  useEffect(() => {
    if (isOpen) {
      setSettings(loadNotificationSettings());
      setPermission(getNotificationPermission());
      setIsSnoozedActive(isSnoozed());
      setSchedule(getScheduleStatus(todayRecord));
      setTestResult(null);
    }
  }, [isOpen, todayRecord]);

  // Update schedule periodically while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSchedule(getScheduleStatus(todayRecord));
      setIsSnoozedActive(isSnoozed());
    }, 5000);
    return () => clearInterval(interval);
  }, [isOpen, todayRecord]);

  if (!isOpen) return null;

  const handleToggleMaster = () => {
    const updated = { ...settings, enabled: !settings.enabled };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleUpdateSetting = <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      const updated = { ...settings, enabled: true };
      setSettings(updated);
      saveNotificationSettings(updated);
      playChimeSound();
    }
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    setTestResult(null);

    const memberName = activeMember ? `${activeMember.firstName} ${activeMember.lastName}` : 'ผู้ใช้งาน';

    // If permission not granted, request first
    if (permission !== 'granted') {
      const reqRes = await requestNotificationPermission();
      setPermission(reqRes);
      if (reqRes !== 'granted') {
        setIsTesting(false);
        setTestResult('กรุณากด "อนุญาตการแจ้งเตือน" ในหน้าต่างเบราว์เซอร์เพื่อรับการแจ้งเตือน');
        return;
      }
    }

    try {
      const result = await checkAndDispatchBPAlert(todayRecord, memberName, {
        forceTest: true,
      });

      if (result.triggered) {
        setTestResult('ส่งการแจ้งเตือนและสัญญาณเสียงทดสอบสำเร็จแล้ว! กรุณาตรวจดูที่หน้าจอหรือศูนย์การแจ้งเตือนของเครื่อง');
      } else {
        setTestResult('ไม่สามารถส่งการแจ้งเตือนได้ กรุณาตรวจสอบการตั้งค่าเบราว์เซอร์');
      }
    } catch (e: any) {
      setTestResult(`เกิดข้อผิดพลาด: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSnooze = (minutes: number) => {
    snoozeNotifications(minutes);
    setIsSnoozedActive(true);
    setTestResult(`เลื่อนการแจ้งเตือนชั่วคราวเป็นเวลา ${minutes} นาที`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/70 via-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                ระบบแจ้งเตือนการวัดความดันโลหิต
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Push Notifications ตามช่วงเวลามาตรฐาน (05:00-11:30 และ 15:00 เป็นต้นไป)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Section 1: Browser Permission Banner */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              permission === 'granted'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : permission === 'denied'
                ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                {permission === 'granted' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : permission === 'denied' ? (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <Bell className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">
                      {permission === 'granted'
                        ? 'สิทธิ์การแจ้งเตือนบนเบราว์เซอร์: เปิดใช้งานแล้ว (Granted)'
                        : permission === 'denied'
                        ? 'สิทธิ์การแจ้งเตือนถูกปิดกั้นในเบราว์เซอร์ (Denied)'
                        : 'ยังไม่ได้เปิดสิทธิ์แจ้งเตือนบนเบราว์เซอร์'}
                    </span>
                  </div>
                  <p className="text-xs opacity-90 leading-relaxed">
                    {permission === 'granted'
                      ? 'เบราว์เซอร์พร้อมส่งข้อความแจ้งเตือนเมื่อถึงช่วงเวลาที่กำหนดหากยังไม่ได้บันทึกข้อมูล'
                      : permission === 'denied'
                      ? 'หากต้องการรับการแจ้งเตือน กรุณากดไอคอนแม่กุญแจ 🔒 ที่แถบที่อยู่เว็บ (URL bar) แล้วเปลี่ยนสิทธิ์การแจ้งเตือนเป็น "อนุญาต"'
                      : 'กดปุ่มด้านขวาเพื่อให้เบราว์เซอร์ส่งข้อความเตือนไปยังหน้าจอของคุณเมื่อถึงรอบวัด'}
                  </p>
                </div>
              </div>

              {permission !== 'granted' && (
                <button
                  onClick={handleRequestPermission}
                  className="shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs shadow-sm transition active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  เปิดสิทธิ์แจ้งเตือน
                </button>
              )}
            </div>
          </div>

          {/* Section 2: Today's Clinical Schedule Status */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-700" />
                สถานะการบันทึกข้อมูลวันนี้ ({activeMember ? `${activeMember.firstName} ${activeMember.lastName}` : 'ผู้ใช้งาน'})
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-100/80 text-teal-800">
                ช่วงเวลาปัจจุบัน: {schedule.slotName}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* Morning Slot Box */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  schedule.isMorningCompleted
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : schedule.currentSlot === 'morning'
                    ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/30'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      schedule.isMorningCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-xs">รอบเช้า (05:00 - 11:30 น.)</div>
                    <div className="text-[11px] text-slate-500">
                      {schedule.isMorningCompleted ? 'บันทึกเรียบร้อย' : 'ยังไม่ได้บันทึกผล'}
                    </div>
                  </div>
                </div>
                {schedule.isMorningCompleted ? (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-md">
                    ครบแล้ว
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold text-[10px] rounded-md">
                    รอการบันทึก
                  </span>
                )}
              </div>

              {/* Evening Slot Box */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  schedule.isEveningCompleted
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : schedule.currentSlot === 'evening'
                    ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-400/30'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      schedule.isEveningCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-xs">รอบเย็น (15:00 เป็นต้นไป)</div>
                    <div className="text-[11px] text-slate-500">
                      {schedule.isEveningCompleted ? 'บันทึกเรียบร้อย' : 'ยังไม่ได้บันทึกผล'}
                    </div>
                  </div>
                </div>
                {schedule.isEveningCompleted ? (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-md">
                    ครบแล้ว
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold text-[10px] rounded-md">
                    รอการบันทึก
                  </span>
                )}
              </div>
            </div>

            {/* In-slot CTA if currently due */}
            {schedule.isCurrentSlotDue && onNavigateToEntry && (
              <div className="pt-1">
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToEntry();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                >
                  <Timer className="w-4 h-4" />
                  <span>บันทึกความดันรอบปัจจุบันทันที (พร้อมจับเวลานั่งพัก 5 นาที)</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 3: Notification Options & Toggles */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
              การตั้งค่าแจ้งเตือน
            </h3>

            {/* Master Switch */}
            <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">เปิดระบบแจ้งเตือนหลัก</div>
                  <div className="text-[11px] text-slate-500">เตือนอัตโนมัติเมื่อถึงช่วงเวลาวัดความดันและยังไม่บันทึก</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={handleToggleMaster}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-700"></div>
              </label>
            </div>

            {/* Morning Slot Switch */}
            <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-xs">แจ้งเตือนรอบเช้า (05:00 - 11:30 น.)</div>
                  <div className="text-[11px] text-slate-500">เน้นตรวจจับภาวะ Morning BP Surge ก่อนเริ่มกิจกรรมวันใหม่</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.morningSlotEnabled}
                  disabled={!settings.enabled}
                  onChange={(e) => handleUpdateSetting('morningSlotEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-700 peer-disabled:opacity-50"></div>
              </label>
            </div>

            {/* Evening Slot Switch */}
            <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-xs">แจ้งเตือนรอบเย็น (15:00 น. เป็นต้นไป)</div>
                  <div className="text-[11px] text-slate-500">ประเมินค่าความดันช่วงเย็นหรือก่อนเข้านอนขณะพักผ่อน</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.eveningSlotEnabled}
                  disabled={!settings.enabled}
                  onChange={(e) => handleUpdateSetting('eveningSlotEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-700 peer-disabled:opacity-50"></div>
              </label>
            </div>

            {/* Medical Sound Chime Switch */}
            <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-xs">เสียงสัญญาณเตือนทางการแพทย์ (Gentle Chime)</div>
                  <div className="text-[11px] text-slate-500">เล่นสัญญาณเสียงนุ่มนวลเพื่อเตือนให้เตรียมตัวนั่งพัก</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={playChimeSound}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition cursor-pointer"
                  title="ฟังตัวอย่างเสียงเตือน"
                >
                  ฟังเสียง
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    disabled={!settings.enabled}
                    onChange={(e) => handleUpdateSetting('soundEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-700 peer-disabled:opacity-50"></div>
                </label>
              </div>
            </div>

            {/* Repeat Interval Selection */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 text-xs">ความถี่เตือนซ้ำหากยังไม่ได้บันทึก</div>
                  <div className="text-[11px] text-slate-500">ป้องกันการแจ้งเตือนรบกวนบ่อยเกินไป</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { value: 0, label: 'ครั้งเดียวต่อรอบ' },
                  { value: 30, label: 'เตือนทุก 30 นาที' },
                  { value: 60, label: 'เตือนทุก 60 นาที' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleUpdateSetting('repeatIntervalMinutes', opt.value)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition cursor-pointer text-center ${
                      settings.repeatIntervalMinutes === opt.value
                        ? 'bg-teal-50 border-teal-600 text-teal-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Test & Snooze Controls */}
          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={handleTestNotification}
                disabled={isTesting}
                className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isTesting ? 'กำลังส่งการแจ้งเตือน...' : '🔔 ทดสอบการแจ้งเตือนทันที'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSnooze(30)}
                className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isSnoozedActive ? 'เลื่อนเตือนแล้ว (30 นาที)' : 'เลื่อนเตือน 30 นาที'}</span>
              </button>
            </div>

            {testResult && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-start gap-2 animate-in fade-in">
                <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>{testResult}</span>
              </div>
            )}
          </div>

          {/* Clinical Rationale Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>ทำไมต้องวัด 2 ช่วงเวลานี้ตามเกณฑ์สากล (AHA/ACC & ESC/ESH)?</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 leading-relaxed">
              <li>
                <strong>ช่วงเช้า (05:00 - 11:30 น.)</strong>: สำคัญที่สุดในการตรวจจับภาวะ <em>Morning Blood Pressure Surge</em> ซึ่งเป็นช่วงที่อุบัติการณ์ของโรคหลอดเลือดสมองและหัวใจวายเฉียบพลันเกิดขึ้นสูงสุด
              </li>
              <li>
                <strong>ช่วงเย็น (15:00 เป็นต้นไป)</strong>: ประเมินค่าความดันโลหิตหลังผ่านกิจกรรมระหว่างวัน เพื่อดูผลของยาลดความดันและการฟื้นตัวของร่างกาย
              </li>
              <li>
                <strong>ข้อปฏิบัติสำคัญ</strong>: ก่อนวัดความดันทุกครั้ง ควร <strong>นั่งพักผ่อนนิ่งๆ 5:00 นาที</strong> โดยไม่พูดคุยหรือเล่นโทรศัพท์เพื่อผลลัพธ์ที่แม่นยำ
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            ARIYAWARIN Push Notification Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            เรียบร้อย
          </button>
        </div>
      </div>
    </div>
  );
};
