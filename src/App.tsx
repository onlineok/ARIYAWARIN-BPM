/**
 * ARIYAWARIN Blood Pressure Monitoring App
 * (c) 2026 Kritchanat Dechsart (Tent). All Rights Reserved.
 * Licensed to Ariyawarin Co., Ltd.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { DailyBPRecord } from './types/bp';
import { Member } from './types/member';
import { Navbar, ActiveTab } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { DashboardView } from './components/DashboardView';
import { CalendarLogView } from './components/CalendarLogView';
import { MedicalGuidelinesView } from './components/MedicalGuidelinesView';
import { DoctorReportView } from './components/DoctorReportView';
import { LogEntryModal } from './components/LogEntryModal';
import { CsvExportModal } from './components/CsvExportModal';
import { MemberManagementView } from './components/MemberManagementView';
import { DailySmartEntryView } from './components/DailySmartEntryView';
import { BrandLogoModal } from './components/BrandLogoModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { NotificationSlotBanner } from './components/NotificationSlotBanner';
import { Footer } from './components/Footer';
import { AuthGate } from './components/AuthGate';
import {
  registerServiceWorker,
  getScheduleStatus,
  checkAndDispatchBPAlert,
  getNotificationPermission,
} from './services/notificationService';
import {
  initAuth,
  googleSignIn,
  googleSignOut,
  hasActiveAccessToken,
  isEmailAuthorized,
} from './services/googleAuth';
import {
  loadUserDatabase,
  saveUserBPRecord,
  deleteUserBPRecord,
  updateUserHealthProfile,
} from './services/appDatabase';
import { getThaiTimestamp } from './utils/bpClassification';
import { User } from 'firebase/auth';

export function getTodayDateString(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const TODAY_STR = getTodayDateString();

export default function App() {
  // Members State (strictly isolated to current authenticated user)
  const [members, setMembers] = useState<Member[]>([]);

  // Active Member ID
  const [activeMemberId, setActiveMemberId] = useState<string>('');

  // Blood Pressure Records State (strictly isolated to current authenticated user)
  const [records, setRecords] = useState<DailyBPRecord[]>([]);

  // Navigation & Modal State
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_STR);
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState<boolean>(false);
  const [isBrandLogoModalOpen, setIsBrandLogoModalOpen] = useState<boolean>(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    getNotificationPermission()
  );
  const [editingDate, setEditingDate] = useState<string>(TODAY_STR);

  // Google Authentication State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [hasGoogleToken, setHasGoogleToken] = useState<boolean>(() => hasActiveAccessToken());
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Init Auth on mount & load user-isolated database partition
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setHasGoogleToken(Boolean(token));
        setIsCheckingAuth(false);

        if (user?.email && isEmailAuthorized(user.email)) {
          const userDb = loadUserDatabase(user.email, user.displayName);
          setMembers([userDb.profile]);
          setActiveMemberId(userDb.profile.id);
          setRecords(userDb.records);
        } else {
          setMembers([]);
          setRecords([]);
          setActiveMemberId('');
        }
      },
      () => {
        setGoogleUser(null);
        setHasGoogleToken(false);
        setIsCheckingAuth(false);
        setMembers([]);
        setRecords([]);
        setActiveMemberId('');
      }
    );

    const safetyTimer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 2000);

    return () => {
      clearTimeout(safetyTimer);
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Toast Auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Current Active Member
  const currentMember = useMemo(() => {
    return members.find((m) => m.id === activeMemberId) || members[0] || null;
  }, [members, activeMemberId]);

  // Records for active member (strictly partitioned)
  const recordsForActiveMember = useMemo(() => {
    return records;
  }, [records]);

  // Check if today has a record for active member
  const todayRecord = useMemo(() => {
    const todayStr = getTodayDateString();
    return records.find((r) => r.date === todayStr) || null;
  }, [records]);

  // Compute schedule status for the optimal slots (05:00-11:30 and 15:00 onwards)
  const scheduleStatus = useMemo(() => {
    return getScheduleStatus(todayRecord);
  }, [todayRecord]);

  const isNotificationDue = scheduleStatus.isOptimalSlot && scheduleStatus.isCurrentSlotDue;

  // Register Service Worker on mount & listen to messages
  useEffect(() => {
    registerServiceWorker().catch(console.error);

    if (typeof window !== 'undefined' && 'navigator' in window && 'serviceWorker' in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'NAVIGATE_TO_TAB' && event.data?.tab) {
          setActiveTab(event.data.tab);
        }
      };
      navigator.serviceWorker.addEventListener('message', handleMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, []);

  // Periodic Push Notification Scheduler (evaluates every 30 seconds)
  useEffect(() => {
    setNotificationPermission(getNotificationPermission());

    const memberName = currentMember ? `${currentMember.firstName} ${currentMember.lastName}` : 'ผู้ใช้งาน';

    // Dispatch alert check
    checkAndDispatchBPAlert(todayRecord, memberName, {
      onInAppAlert: (title, body) => {
        setToastMessage({
          text: `${title} - ${body}`,
          type: 'info',
        });
      },
    });

    const interval = setInterval(() => {
      setNotificationPermission(getNotificationPermission());
      checkAndDispatchBPAlert(todayRecord, memberName, {
        onInAppAlert: (title, body) => {
          setToastMessage({
            text: `${title} - ${body}`,
            type: 'info',
          });
        },
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [todayRecord, currentMember]);

  // Google Login Handler
  const handleGoogleLogin = async () => {
    setIsConnectingGoogle(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setHasGoogleToken(Boolean(result.accessToken));
        const authorized = isEmailAuthorized(result.user.email);
        if (authorized && result.user.email) {
          const userDb = loadUserDatabase(result.user.email, result.user.displayName);
          setMembers([userDb.profile]);
          setActiveMemberId(userDb.profile.id);
          setRecords(userDb.records);
          setToastMessage({
            text: `ยินดีต้อนรับ ${userDb.profile.firstName} ${userDb.profile.lastName} เข้าสู่ฐานข้อมูลสุขภาพส่วนตัว`,
            type: 'success',
          });
        } else {
          setToastMessage({
            text: 'ไม่ได้รับอนุญาติ: บัญชี Google นี้ไม่มีสิทธิ์เข้าใช้งานระบบ',
            type: 'error',
          });
        }
      }
    } catch (e: any) {
      console.error(e);
      setToastMessage({
        text: `เข้าสู่ระบบ Google ไม่สำเร็จ: ${e.message || 'กรุณาลองใหม่อีกครั้ง'}`,
        type: 'error',
      });
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  // Google Logout Handler
  const handleGoogleLogout = async () => {
    try {
      await googleSignOut();
      setGoogleUser(null);
      setHasGoogleToken(false);
      setMembers([]);
      setRecords([]);
      setActiveMemberId('');
      setToastMessage({
        text: 'ออกจากระบบ Google เรียบร้อยแล้ว',
        type: 'info',
      });
    } catch (e: any) {
      console.error(e);
    }
  };

  // Member CRUD handlers (User profile update)
  const handleAddMember = async (newMemberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (googleUser?.email) {
      const updatedDb = updateUserHealthProfile(googleUser.email, newMemberData, googleUser.displayName);
      setMembers([updatedDb.profile]);
      setRecords(updatedDb.records);
      setToastMessage({
        text: `อัปเดตข้อมูลผู้ใช้งาน "${newMemberData.firstName} ${newMemberData.lastName}" เรียบร้อยแล้ว`,
        type: 'success',
      });
    }
  };

  const handleUpdateMember = async (_id: string, updates: Partial<Member>) => {
    if (googleUser?.email) {
      const updatedDb = updateUserHealthProfile(googleUser.email, updates, googleUser.displayName);
      setMembers([updatedDb.profile]);
      setRecords(updatedDb.records);
      setToastMessage({
        text: 'อัปเดตข้อมูลสุขภาพส่วนตัวเรียบร้อยแล้ว',
        type: 'success',
      });
    }
  };

  const handleDeleteMember = async (_id: string) => {
    setToastMessage({
      text: 'ข้อมูลโปรไฟล์ผูกกับบัญชีผู้ใช้ปัจจุบัน ไม่สามารถลบโปรไฟล์หลักได้ (คุณสามารถแก้ไขข้อมูลได้ตลอดเวลา)',
      type: 'info',
    });
  };

  // Handle Save / Update Record in User Isolated Database
  const handleSaveRecord = async (newOrUpdatedRecord: DailyBPRecord) => {
    const now = Date.now();
    const saveTimestamp = newOrUpdatedRecord.timestamp || getThaiTimestamp(now);
    const activeProf = members[0];
    const memberId = activeProf?.id || activeMemberId || 'usr-default';
    const memberName = activeProf
      ? `${activeProf.firstName} ${activeProf.lastName}`.trim()
      : 'ผู้ใช้งาน';

    const recordWithMember: DailyBPRecord = {
      ...newOrUpdatedRecord,
      updatedAt: now,
      lastSavedAt: now,
      timestamp: saveTimestamp,
      memberId,
      memberName,
    };

    if (googleUser?.email) {
      const updatedDb = saveUserBPRecord(googleUser.email, recordWithMember, googleUser.displayName);
      setRecords(updatedDb.records);
      setSelectedDate(recordWithMember.date);
      setToastMessage({
        text: `บันทึกข้อมูลวันที่ ${recordWithMember.date} ลงฐานข้อมูลส่วนตัวเรียบร้อยแล้ว`,
        type: 'success',
      });
    } else {
      setRecords((prev) => {
        const existingIndex = prev.findIndex((r) => r.date === recordWithMember.date);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = recordWithMember;
          return updated;
        } else {
          return [recordWithMember, ...prev];
        }
      });
      setSelectedDate(recordWithMember.date);
      setToastMessage({
        text: 'บันทึกข้อมูลเรียบร้อยแล้ว',
        type: 'success',
      });
    }
  };

  // Handle Delete Record from User Isolated Database
  const handleDeleteRecord = (id: string) => {
    if (googleUser?.email) {
      const updatedDb = deleteUserBPRecord(googleUser.email, id, googleUser.displayName);
      setRecords(updatedDb.records);
      setToastMessage({
        text: 'ลบข้อมูลบันทึกความดันโลหิตออกจากฐานข้อมูลเรียบร้อยแล้ว',
        type: 'info',
      });
    } else {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setToastMessage({
        text: 'ลบข้อมูลบันทึกความดันโลหิตเรียบร้อยแล้ว',
        type: 'info',
      });
    }
  };

  const handleOpenLogModalForDate = (date: string) => {
    setEditingDate(date);
    setIsLogModalOpen(true);
  };

  const handleOpenTodayModal = () => {
    setEditingDate(getTodayDateString());
    setIsLogModalOpen(true);
  };

  const handleSelectDateFromDashboard = (date: string) => {
    setSelectedDate(date);
    setActiveTab('calendar');
  };

  const existingRecordForModal =
    records.find((r) => r.date === editingDate) || null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <AuthGate
        user={googleUser}
        hasToken={hasGoogleToken}
        isCheckingAuth={isCheckingAuth}
        isConnecting={isConnectingGoogle}
        onLogin={handleGoogleLogin}
        onLogout={handleGoogleLogout}
      >
        {/* Top Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenLogModal={handleOpenTodayModal}
          onOpenCsvExport={() => setIsCsvModalOpen(true)}
          todayLogged={Boolean(todayRecord)}
          members={members}
          activeMemberId={activeMemberId}
          onSelectMember={setActiveMemberId}
          isGoogleConnected={Boolean(googleUser)}
          googleUser={googleUser}
          onGoogleLogout={handleGoogleLogout}
          onOpenBrandLogoModal={() => setIsBrandLogoModalOpen(true)}
          onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
          isNotificationDue={isNotificationDue}
          notificationPermission={notificationPermission}
        />

        {/* Main Viewport Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-12">
          {/* Browser Push Notification Slot Alert Banner (05:00-11:30 and 15:00+) */}
          <NotificationSlotBanner
            todayRecord={todayRecord}
            activeMember={currentMember}
            onNavigateToEntry={() => setActiveTab('realtime')}
            onOpenSettings={() => setIsNotificationModalOpen(true)}
          />

          {/* Global Toast Alert */}
          {toastMessage && (
            <div
              className={`mb-5 p-3.5 rounded-xl border text-xs sm:text-sm font-medium shadow-md transition-all animate-in fade-in flex items-center justify-between ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : toastMessage.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-teal-50 border-teal-200 text-teal-900'
              }`}
            >
              <span>{toastMessage.text}</span>
              <button
                onClick={() => setToastMessage(null)}
                className="text-xs font-bold underline ml-3 cursor-pointer opacity-75 hover:opacity-100"
              >
                ปิด
              </button>
            </div>
          )}

          {/* Tab 0: Pristine Modern Home Page */}
          {activeTab === 'home' && (
            <HomeView
              records={recordsForActiveMember}
              allRecords={records}
              members={members}
              activeMember={currentMember}
              onSelectMember={setActiveMemberId}
              onNavigateTab={setActiveTab}
              onOpenLogModal={handleOpenTodayModal}
              onOpenBrandModal={() => setIsBrandLogoModalOpen(true)}
              onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
              onOpenCsvExport={() => setIsCsvModalOpen(true)}
              googleUser={googleUser}
              onGoogleLogout={handleGoogleLogout}
            />
          )}

          {/* Tab 1: Dashboard & Trends */}
          {activeTab === 'dashboard' && (
            <DashboardView
              records={recordsForActiveMember}
              activeMember={currentMember}
              onSelectDate={handleSelectDateFromDashboard}
              onOpenLogModal={handleOpenTodayModal}
              onOpenCsvExport={() => setIsCsvModalOpen(true)}
              onNavigateTab={setActiveTab}
              onOpenBrandModal={() => setIsBrandLogoModalOpen(true)}
              onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
            />
          )}

          {/* Tab 2: Real-time Daily Smart Entry */}
          {activeTab === 'realtime' && (
            <DailySmartEntryView
              records={records}
              members={members}
              activeMemberId={activeMemberId}
              onSelectMember={setActiveMemberId}
              onSaveRecord={handleSaveRecord}
              onConnectGoogle={handleGoogleLogin}
              isGoogleConnected={Boolean(googleUser)}
              onOpenNotificationSettings={() => setIsNotificationModalOpen(true)}
              onNavigateHome={() => setActiveTab('home')}
            />
          )}

          {/* Tab 3: Member Registry & BMI Analysis */}
          {activeTab === 'members' && (
            <MemberManagementView
              members={members}
              activeMemberId={activeMemberId}
              onSelectActiveMember={setActiveMemberId}
              onAddMember={handleAddMember}
              onUpdateMember={handleUpdateMember}
              onDeleteMember={handleDeleteMember}
              onNavigateHome={() => setActiveTab('home')}
            />
          )}

          {/* Tab 4: Calendar Log View */}
          {activeTab === 'calendar' && (
            <CalendarLogView
              records={recordsForActiveMember}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onOpenLogModalForDate={handleOpenLogModalForDate}
              onDeleteRecord={handleDeleteRecord}
              onNavigateHome={() => setActiveTab('home')}
            />
          )}

          {/* Tab 5: Medical Guidelines (AHA/ACC & ESC/ESH) */}
          {activeTab === 'guidelines' && (
            <MedicalGuidelinesView onNavigateHome={() => setActiveTab('home')} />
          )}

          {/* Tab 6: Clinical Doctor Summary Report */}
          {activeTab === 'report' && (
            <DoctorReportView
              records={recordsForActiveMember}
              allRecords={records}
              activeMember={currentMember}
              members={members}
              onSelectMember={setActiveMemberId}
              onOpenCsvExport={() => setIsCsvModalOpen(true)}
              onNavigateHome={() => setActiveTab('home')}
            />
          )}
        </main>

        {/* Log Entry / Edit Modal */}
        <LogEntryModal
          isOpen={isLogModalOpen}
          onClose={() => setIsLogModalOpen(false)}
          onSaveRecord={handleSaveRecord}
          existingRecord={existingRecordForModal}
          targetDate={editingDate}
        />

        {/* Dedicated CSV Export for Healthcare Provider Modal */}
        <CsvExportModal
          isOpen={isCsvModalOpen}
          onClose={() => setIsCsvModalOpen(false)}
          records={recordsForActiveMember}
          activeMember={currentMember}
        />

        {/* Brand Identity & Logo Showcase Modal */}
        <BrandLogoModal
          isOpen={isBrandLogoModalOpen}
          onClose={() => setIsBrandLogoModalOpen(false)}
        />

        {/* Browser Push Notification System Settings & Test Modal */}
        <NotificationSettingsModal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
          todayRecord={todayRecord}
          activeMember={currentMember}
          onNavigateToEntry={() => {
            setActiveTab('realtime');
            setIsNotificationModalOpen(false);
          }}
        />

        {/* Organization and Copyright Footer */}
        <Footer />
      </AuthGate>
    </div>
  );
}
