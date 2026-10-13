/**
 * ARIYAWARIN Blood Pressure Monitoring App
 * (c) 2026 Kritchanat Dechsart (Tent). All Rights Reserved.
 * Licensed to Ariyawarin Co., Ltd.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { DailyBPRecord } from './types/bp';
import { Member } from './types/member';
import { INITIAL_BP_RECORDS } from './data/initialData';
import { INITIAL_MEMBERS } from './utils/bmi';
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
import { GoogleSheetsBar } from './components/GoogleSheetsBar';
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
  getAccessToken,
  isEmailAuthorized,
} from './services/googleAuth';
import {
  SpreadsheetConfig,
  SHEETS_STORAGE_KEY,
  SHEETS_URL_STORAGE_KEY,
  createGoogleHealthSpreadsheet,
  syncAllToGoogleSheet,
  appendOrUpdateBPRecordInSheet,
  syncMembersToGoogleSheet,
  getThaiTimestamp,
} from './services/googleSheets';
import { User } from 'firebase/auth';

const STORAGE_KEY = 'ariyawarin_bp_monitor_records';
const MEMBERS_STORAGE_KEY = 'ariyawarin_bp_members';
const ACTIVE_MEMBER_KEY = 'ariyawarin_active_member_id';
const TODAY_STR = '2026-10-12';

export default function App() {
  // Members State
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem(MEMBERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load members from localStorage', e);
    }
    return INITIAL_MEMBERS;
  });

  // Active Member ID
  const [activeMemberId, setActiveMemberId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_MEMBER_KEY);
      if (saved) return saved;
    } catch (e) {
      console.error(e);
    }
    return INITIAL_MEMBERS[0]?.id || 'mem-1';
  });

  // Blood Pressure Records State
  const [records, setRecords] = useState<DailyBPRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load records from localStorage', e);
    }
    return INITIAL_BP_RECORDS;
  });

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

  // Google Authentication & Sheets State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [spreadsheetConfig, setSpreadsheetConfig] = useState<SpreadsheetConfig | null>(() => {
    try {
      const id = localStorage.getItem(SHEETS_STORAGE_KEY);
      const url = localStorage.getItem(SHEETS_URL_STORAGE_KEY);
      if (id && url) {
        return {
          spreadsheetId: id,
          spreadsheetUrl: url,
          title: 'ARIYAWARIN - ทะเบียนสมาชิกและบันทึกความดันโลหิต',
        };
      }
    } catch (e) {
      console.error('Failed to read spreadsheet config', e);
    }
    return null;
  });

  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Init Auth on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setIsCheckingAuth(false);
      },
      () => {
        setGoogleUser(null);
        setIsCheckingAuth(false);
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

  // Sync records to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save records to localStorage', e);
    }
  }, [records]);

  // Sync members to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
    } catch (e) {
      console.error('Failed to save members to localStorage', e);
    }
  }, [members]);

  // Save active member ID
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_MEMBER_KEY, activeMemberId);
    } catch (e) {
      console.error(e);
    }
  }, [activeMemberId]);

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

  // Records for active member (with fallback to records without memberId)
  const recordsForActiveMember = useMemo(() => {
    const filtered = records.filter((r) => !r.memberId || r.memberId === activeMemberId);
    return filtered.length > 0 ? filtered : records;
  }, [records, activeMemberId]);

  // Check if today has a record for active member
  const todayRecord = useMemo(() => {
    return (
      records.find((r) => r.date === TODAY_STR && (r.memberId === activeMemberId || !r.memberId)) ||
      records.find((r) => r.date === TODAY_STR) ||
      null
    );
  }, [records, activeMemberId]);

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
        const authorized = isEmailAuthorized(result.user.email);
        if (authorized) {
          setToastMessage({
            text: `ยืนยันตัวตนสำเร็จ! ยินดีต้อนรับ ${result.user.displayName || 'ผู้ดูแลระบบ'}`,
            type: 'success',
          });

          // If no spreadsheet yet, prompt or create
          if (!spreadsheetConfig && result.accessToken) {
            try {
              const cfg = await createGoogleHealthSpreadsheet(result.accessToken);
              setSpreadsheetConfig(cfg);
              await syncAllToGoogleSheet(result.accessToken, cfg.spreadsheetId, records, members);
              setToastMessage({
                text: 'สร้าง Google Sheets สำหรับเก็บข้อมูลสุขภาพเรียบร้อยแล้ว!',
                type: 'success',
              });
            } catch (sheetErr) {
              console.error('Initial spreadsheet note:', sheetErr);
            }
          }
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
      setToastMessage({
        text: 'ออกจากระบบ Google เรียบร้อยแล้ว',
        type: 'info',
      });
    } catch (e: any) {
      console.error(e);
    }
  };

  // Create Google Spreadsheet
  const handleCreateSpreadsheet = async () => {
    setIsSyncingSheets(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        await handleGoogleLogin();
        return;
      }

      const cfg = await createGoogleHealthSpreadsheet(token);
      setSpreadsheetConfig(cfg);
      await syncAllToGoogleSheet(token, cfg.spreadsheetId, records, members);
      setToastMessage({
        text: 'สร้าง Google Sheets และซิงค์ข้อมูลทั้งหมดเรียบร้อยแล้ว!',
        type: 'success',
      });
    } catch (e: any) {
      console.error(e);
      setToastMessage({
        text: `สร้าง Google Sheets ไม่สำเร็จ: ${e.message}`,
        type: 'error',
      });
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Sync All Data to Google Sheets
  const handleSyncAllToSheets = async () => {
    setIsSyncingSheets(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        await handleGoogleLogin();
        return;
      }

      if (!spreadsheetConfig?.spreadsheetId) {
        await handleCreateSpreadsheet();
        return;
      }

      const res = await syncAllToGoogleSheet(token, spreadsheetConfig.spreadsheetId, records, members);
      if (res.success) {
        setToastMessage({
          text: res.message,
          type: 'success',
        });
      } else {
        setToastMessage({
          text: res.message,
          type: 'error',
        });
      }
    } catch (e: any) {
      console.error(e);
      setToastMessage({
        text: `ซิงค์ข้อมูลไม่สำเร็จ: ${e.message}`,
        type: 'error',
      });
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Member CRUD handlers
  const handleAddMember = async (newMemberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMember: Member = {
      ...newMemberData,
      id: `mem-${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updatedMembers = [newMember, ...members];
    setMembers(updatedMembers);
    setActiveMemberId(newMember.id);
    setToastMessage({
      text: `เพิ่มสมาชิก "${newMember.firstName} ${newMember.lastName}" เรียบร้อยแล้ว`,
      type: 'success',
    });

    // Background sync to Google Sheets if connected
    const token = await getAccessToken();
    if (token && spreadsheetConfig?.spreadsheetId) {
      syncMembersToGoogleSheet(token, spreadsheetConfig.spreadsheetId, updatedMembers).catch(console.error);
    }
  };

  const handleUpdateMember = async (id: string, updates: Partial<Member>) => {
    const updatedMembers = members.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: Date.now() } : m));
    setMembers(updatedMembers);
    setToastMessage({
      text: 'อัปเดตข้อมูลสมาชิกเรียบร้อยแล้ว',
      type: 'success',
    });

    const token = await getAccessToken();
    if (token && spreadsheetConfig?.spreadsheetId) {
      syncMembersToGoogleSheet(token, spreadsheetConfig.spreadsheetId, updatedMembers).catch(console.error);
    }
  };

  const handleDeleteMember = async (id: string) => {
    const updatedMembers = members.filter((m) => m.id !== id);
    setMembers(updatedMembers);
    if (activeMemberId === id && updatedMembers.length > 0) {
      setActiveMemberId(updatedMembers[0].id);
    }
    setToastMessage({
      text: 'ลบข้อมูลสมาชิกเรียบร้อยแล้ว',
      type: 'info',
    });

    const token = await getAccessToken();
    if (token && spreadsheetConfig?.spreadsheetId) {
      syncMembersToGoogleSheet(token, spreadsheetConfig.spreadsheetId, updatedMembers).catch(console.error);
    }
  };

  // Handle Save / Update Record
  const handleSaveRecord = async (newOrUpdatedRecord: DailyBPRecord) => {
    const now = Date.now();
    const saveTimestamp = newOrUpdatedRecord.timestamp || getThaiTimestamp(now);

    // Ensure member association, updated timestamps
    const recordWithMember: DailyBPRecord = {
      ...newOrUpdatedRecord,
      updatedAt: now,
      lastSavedAt: now,
      timestamp: saveTimestamp,
      memberId: newOrUpdatedRecord.memberId || activeMemberId,
      memberName:
        newOrUpdatedRecord.memberName ||
        (currentMember ? `${currentMember.firstName} ${currentMember.lastName}` : 'ทั่วไป'),
    };

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

    // Auto-sync to Google Sheets in background if connected
    const token = await getAccessToken();
    if (token && spreadsheetConfig?.spreadsheetId) {
      appendOrUpdateBPRecordInSheet(
        token,
        spreadsheetConfig.spreadsheetId,
        recordWithMember,
        recordWithMember.memberName || 'ทั่วไป',
        saveTimestamp
      ).catch(console.error);
    }
  };

  // Handle Delete Record
  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setToastMessage({
      text: 'ลบข้อมูลบันทึกความดันโลหิตเรียบร้อยแล้ว',
      type: 'info',
    });
  };

  const handleOpenLogModalForDate = (date: string) => {
    setEditingDate(date);
    setIsLogModalOpen(true);
  };

  const handleOpenTodayModal = () => {
    setEditingDate(TODAY_STR);
    setIsLogModalOpen(true);
  };

  const handleSelectDateFromDashboard = (date: string) => {
    setSelectedDate(date);
    setActiveTab('calendar');
  };

  const existingRecordForModal = records.find((r) => r.date === editingDate) || null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <AuthGate
        user={googleUser}
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

        {/* Google Sheets Connection Banner Bar (Shown on non-home tabs to avoid duplication) */}
        {activeTab !== 'home' && (
          <GoogleSheetsBar
            user={googleUser}
            spreadsheetConfig={spreadsheetConfig}
            isConnecting={isConnectingGoogle}
            isSyncing={isSyncingSheets}
            onLogin={handleGoogleLogin}
            onLogout={handleGoogleLogout}
            onCreateSpreadsheet={handleCreateSpreadsheet}
            onSyncAll={handleSyncAllToSheets}
          />
        )}

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
            spreadsheetConfig={spreadsheetConfig}
            isConnectingGoogle={isConnectingGoogle}
            isSyncingSheets={isSyncingSheets}
            onGoogleLogin={handleGoogleLogin}
            onGoogleLogout={handleGoogleLogout}
            onCreateSpreadsheet={handleCreateSpreadsheet}
            onSyncAllToSheets={handleSyncAllToSheets}
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
            spreadsheetConfig={spreadsheetConfig}
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
            onSyncToSheets={handleSyncAllToSheets}
            isSyncing={isSyncingSheets}
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
