import React, { useState } from 'react';
import {
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { SpreadsheetConfig } from '../services/googleSheets';

interface GoogleSheetsBarProps {
  user: User | null;
  spreadsheetConfig: SpreadsheetConfig | null;
  isConnecting: boolean;
  isSyncing: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onCreateSpreadsheet: () => void;
  onSyncAll: () => void;
}

export const GoogleSheetsBar: React.FC<GoogleSheetsBarProps> = ({
  user,
  spreadsheetConfig,
  isConnecting,
  isSyncing,
  onLogin,
  onLogout,
  onCreateSpreadsheet,
  onSyncAll,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-emerald-700/40 mb-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left Side: Service Identity & Status */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 shadow-inner">
            <FileSpreadsheet className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white tracking-wide text-sm sm:text-base">
                ระบบเชื่อมต่อ Google Sheets & Drive
              </span>
              {user && spreadsheetConfig ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ซิงค์อัตโนมัติแบบเรียลไทม์
                </span>
              ) : user ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  เข้าสู่ระบบแล้ว (ยังไม่ได้สร้างชีต)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  ยังไม่ได้เชื่อมต่อ
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-100/80 mt-0.5 leading-relaxed">
              {spreadsheetConfig
                ? `ชีตปัจจุบัน: "${spreadsheetConfig.title}" • บันทึกเช้า/เย็นจะถูกส่งเข้า Google ชีตทันที`
                : 'บันทึกข้อมูลความดันโลหิตและทะเบียนสมาชิกส่งตรงไปยัง Google Sheets ส่วนตัวของคุณอัตโนมัติ'}
            </p>
          </div>
        </div>

        {/* Right Side: Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5 w-full lg:w-auto justify-start lg:justify-end pt-2 lg:pt-0 border-t border-emerald-800/60 lg:border-t-0">
          {!user ? (
            <button
              onClick={onLogin}
              disabled={isConnecting}
              className="gsi-material-button group inline-flex items-center gap-2.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-xl shadow-sm transition-all duration-150 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>{isConnecting ? 'กำลังเชื่อมต่อ Google...' : 'เข้าสู่ระบบด้วย Google'}</span>
            </button>
          ) : (
            <>
              {/* If spreadsheet exists */}
              {spreadsheetConfig ? (
                <>
                  <a
                    href={spreadsheetConfig.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 hover:text-white border border-emerald-400/40 rounded-xl text-xs font-medium transition cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>เปิดดูใน Google Sheets</span>
                  </a>

                  <button
                    onClick={onSyncAll}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-medium shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ข้อมูลทั้งหมด'}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={onCreateSpreadsheet}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-xl text-xs font-semibold shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-900" />
                  <span>{isSyncing ? 'กำลังสร้าง Google Sheets...' : 'สร้าง Google Sheets สำหรับบันทึก'}</span>
                </button>
              )}

              {/* User Account Capsule */}
              <div className="flex items-center gap-2 pl-2 border-l border-emerald-800">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google User'}
                    className="w-7 h-7 rounded-full border border-emerald-400/50"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold text-white">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'G'}
                  </div>
                )}
                <button
                  onClick={onLogout}
                  title="ออกจากระบบ Google"
                  className="p-1.5 text-emerald-200/70 hover:text-rose-300 hover:bg-white/10 rounded-lg transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
