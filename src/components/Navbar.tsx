import React from 'react';
import {
  Home,
  Activity,
  Plus,
  FileSpreadsheet,
  Calendar,
  BookOpen,
  BarChart3,
  Download,
  Users,
  Clock,
  ChevronDown,
  Bell,
  BellRing,
  LogOut,
} from 'lucide-react';
import { Member } from '../types/member';
import { AriyawarinLogo } from './AriyawarinLogo';
import { User } from 'firebase/auth';

export type ActiveTab = 'home' | 'dashboard' | 'realtime' | 'calendar' | 'members' | 'guidelines' | 'report';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenLogModal: () => void;
  onOpenCsvExport?: () => void;
  todayLogged: boolean;
  members: Member[];
  activeMemberId: string;
  onSelectMember: (id: string) => void;
  isGoogleConnected?: boolean;
  googleUser?: User | null;
  onGoogleLogout?: () => void;
  onOpenBrandLogoModal?: () => void;
  onOpenNotificationModal?: () => void;
  isNotificationDue?: boolean;
  notificationPermission?: NotificationPermission | 'unsupported';
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenLogModal,
  onOpenCsvExport,
  todayLogged,
  members,
  activeMemberId,
  onSelectMember,
  isGoogleConnected,
  googleUser,
  onGoogleLogout,
  onOpenBrandLogoModal,
  onOpenNotificationModal,
  isNotificationDue = false,
  notificationPermission = 'default',
}) => {
  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs overflow-x-clip">
        <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-3 h-16 w-full min-w-0">
            {/* Zone 1: Brand title with Authentic AriyawarinLogo */}
            <div
              onClick={() => onSelectTab('home')}
              title="กลับสู่หน้าแรก (Home) · ARIYAWARIN BP Monitor"
              className="flex items-center gap-2 sm:gap-2.5 shrink-0 cursor-pointer group select-none"
            >
              {/* Interactive SVG Logo with soft resting pulse and subtle hover scale elevation */}
              <div className="relative transition-all duration-300 ease-out transform group-hover:scale-105 group-hover:drop-shadow-[0_4px_16px_rgba(20,184,166,0.42)] group-active:scale-95 animate-soft-pulse shrink-0">
                <AriyawarinLogo variant="icon" size={36} animated={true} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 leading-tight">
                  <span className="text-sm sm:text-base font-serif font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
                    ARIYAWARIN <span className="text-teal-700 font-sans font-bold text-xs sm:text-sm">BP Monitor</span>
                  </span>
                </div>
                <span className="hidden sm:block text-[9px] text-slate-500 tracking-wide font-medium whitespace-nowrap">
                  Business & Learning Solutions
                </span>
              </div>
            </div>

            {/* Zone 2: Desktop nav links */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 shrink-0">
              <button
                onClick={() => onSelectTab('home')}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'home'
                    ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Home className="w-3.5 h-3.5 text-teal-700" />
                <span>หน้าแรก</span>
              </button>

              <button
                onClick={() => onSelectTab('dashboard')}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
                <span>แดชบอร์ด</span>
              </button>

              <button
                onClick={() => onSelectTab('realtime')}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'realtime'
                    ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>บันทึก<span className="hidden xl:inline">เรียลไทม์</span></span>
              </button>

              <button
                onClick={() => onSelectTab('members')}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'members'
                    ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-teal-600" />
                <span>สมาชิก<span className="hidden xl:inline"> & BMI</span></span>
              </button>

              <button
                onClick={() => onSelectTab('calendar')}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'calendar'
                    ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>ปฏิทิน</span>
              </button>

              <button
                onClick={() => onSelectTab('report')}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'report'
                    ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
                <span>รายงาน<span className="hidden xl:inline">แพทย์</span></span>
              </button>

              <button
                onClick={() => onSelectTab('guidelines')}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'guidelines'
                    ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                <span>เกณฑ์<span className="hidden xl:inline">การแพทย์</span></span>
              </button>
            </nav>
          </div>

          {/* Row 2: Selected Actions Bar (Down to new line, right-aligned, strictly within max-w-7xl) */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 py-1.5 sm:py-2 border-t border-slate-100/90 w-full min-w-0">
            {/* 1. Push Notification System Bell */}
            {onOpenNotificationModal && (
              <button
                onClick={onOpenNotificationModal}
                className={`relative p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                  isNotificationDue
                    ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100 ring-2 ring-amber-400/30'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title={
                  isNotificationDue
                    ? '🔔 ถึงช่วงเวลาวัดความดันโลหิต! (คลิกเพื่อดูการแจ้งเตือน)'
                    : 'ระบบแจ้งเตือนการวัดความดัน (Push Notifications)'
                }
                aria-label="Notification Settings"
              >
                {isNotificationDue ? (
                  <BellRing className="w-4 h-4 text-amber-600 animate-bounce" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}

                {/* Pulsing Alert Indicator Dot */}
                {isNotificationDue && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border border-white"></span>
                  </span>
                )}

                {/* Granted Green Dot if not due but active */}
                {!isNotificationDue && notificationPermission === 'granted' && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                )}
              </button>
            )}

            {onOpenCsvExport && (
              <button
                onClick={onOpenCsvExport}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer shrink-0"
                title="ส่งออกไฟล์ CSV สำหรับแพทย์"
              >
                <Download className="w-3.5 h-3.5 text-teal-700" />
                <span>CSV</span>
              </button>
            )}

            {/* 2. Quick Action / Record Button */}
            <button
              onClick={() => onSelectTab('realtime')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 active:scale-[0.98] rounded-xl transition-all shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">
                {todayLogged ? 'อัปเดตวันนี้' : '+ บันทึกวันนี้'}
              </span>
              <span className="sm:hidden">บันทึก</span>
            </button>

            {/* 3 & 4. Authenticated User Status Pill + Logout Button */}
            {googleUser && (
              <div className="flex items-center gap-1 pl-1 sm:pl-1.5 border-l border-slate-200 shrink-0">
                {/* 3. User Pill */}
                <div
                  className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-colors shrink-0"
                  title="ยืนยันตัวตนสำเร็จแล้ว (Google Authorized)"
                >
                  {googleUser.photoURL ? (
                    <img
                      src={googleUser.photoURL}
                      alt={googleUser.displayName || 'Google'}
                      className="w-5 h-5 rounded-full border border-teal-500/40 object-cover shrink-0"
                    />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-teal-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {googleUser.displayName?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  )}
                  <span className="hidden sm:inline text-[11px] font-semibold text-slate-700 max-w-[120px] truncate">
                    {googleUser.displayName || 'ผู้ดูแลระบบ'}
                  </span>
                </div>

                {/* 4. Logout Button */}
                {onGoogleLogout && (
                  <button
                    onClick={onGoogleLogout}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="ออกจากระบบ Google (Sign Out)"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (5 tabs) */}
      <nav
        aria-label="Mobile Navigation"
        className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg"
      >
        <div className="grid grid-cols-5 gap-1 items-center max-w-lg mx-auto">
          <button
            onClick={() => onSelectTab('home')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors min-h-[44px] cursor-pointer ${
              activeTab === 'home'
                ? 'text-teal-700 font-bold bg-teal-50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className="w-4 h-4 mb-0.5 text-teal-700" />
            <span className="text-[10px] leading-tight font-medium">หน้าแรก</span>
          </button>

          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors min-h-[44px] cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-teal-700 font-bold bg-teal-50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] leading-tight">แดชบอร์ด</span>
          </button>

          <button
            onClick={() => onSelectTab('realtime')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors min-h-[44px] cursor-pointer ${
              activeTab === 'realtime'
                ? 'text-teal-700 font-bold bg-teal-50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4 mb-0.5 text-teal-600" />
            <span className="text-[10px] leading-tight">บันทึก</span>
          </button>

          <button
            onClick={() => onSelectTab('members')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors min-h-[44px] cursor-pointer ${
              activeTab === 'members'
                ? 'text-teal-700 font-bold bg-teal-50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] leading-tight">สมาชิก</span>
          </button>

          <button
            onClick={() => onSelectTab('report')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors min-h-[44px] cursor-pointer ${
              activeTab === 'report'
                ? 'text-teal-700 font-bold bg-teal-50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] leading-tight">รายงาน</span>
          </button>
        </div>
      </nav>
    </>
  );
};
