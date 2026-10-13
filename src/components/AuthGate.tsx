import React from 'react';
import { User } from 'firebase/auth';
import { AriyawarinLogo } from './AriyawarinLogo';
import {
  ShieldCheck,
  ShieldAlert,
  LogOut,
  RefreshCw,
  Lock,
  Mail,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { isEmailAuthorized } from '../services/googleAuth';

interface AuthGateProps {
  user: User | null;
  isCheckingAuth: boolean;
  isConnecting: boolean;
  onLogin: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({
  user,
  isCheckingAuth,
  isConnecting,
  onLogin,
  onLogout,
  children,
}) => {
  // 1. Initial Auth Checking State
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="inline-block p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl animate-pulse">
            <AriyawarinLogo variant="icon" size={64} animated={false} />
          </div>
          <div className="flex items-center justify-center gap-2 text-teal-300 font-medium text-sm">
            <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
            <span>กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...</span>
          </div>
          <p className="text-xs text-slate-400">ARIYAWARIN Medical Security Gate</p>
        </div>
      </div>
    );
  }

  // 2. Not Logged In State: Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full mx-auto my-auto pt-6 pb-12">
          {/* Card Container */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Logo & Brand */}
            <div className="relative z-10 flex flex-col items-center space-y-3">
              <div className="p-3.5 rounded-2xl bg-white/15 border border-white/25 shadow-xl">
                <AriyawarinLogo variant="icon" size={56} animated={true} />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  ระบบรักษาความปลอดภัยและการยืนยันตัวตน
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-2">
                  ARIYAWARIN BP Monitor
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  ระบบติดตามและประเมินผลความดันโลหิตส่วนบุคคล
                </p>
              </div>
            </div>

            {/* Authorization Policy Notice - Secure & Private */}
            <div className="relative z-10 bg-slate-900/60 border border-teal-500/30 rounded-2xl p-4 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>จำกัดสิทธิ์เฉพาะบัญชีที่ได้รับอนุญาต (Private Access)</span>
              </div>
              <p className="text-[12px] text-slate-300 leading-relaxed">
                เข้าใช้งานได้เฉพาะบัญชี Google ของผู้ดูแลระบบที่ได้รับอนุญาตล่วงหน้าเท่านั้น กรุณากดปุ่มด้านล่างเพื่อยืนยันตัวตนเข้าสู่ระบบ
              </p>
            </div>

            {/* Sign in with Google Button */}
            <div className="relative z-10 space-y-3">
              <button
                onClick={onLogin}
                disabled={isConnecting}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-teal-700" />
                    <span>กำลังเชื่อมต่อ Google...</span>
                  </>
                ) : (
                  <>
                    {/* Google G Logo SVG */}
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>เข้าสู่ระบบด้วย Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Privacy & Medical Standards Footnote */}
            <div className="relative z-10 pt-2 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>มาตรฐานความปลอดภัยและการปกป้องข้อมูลสุขภาพสากล</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400 pb-4">
          © 2026 ARIYAWARIN Co., Ltd. • พัฒนาโดย กฤชณัท เดชศาสตร์ (เต้นท์)
        </div>
      </div>
    );
  }

  // 3. User is Logged In, but NOT Whitelisted: Show "ไม่ได้รับอนุญาติ"
  if (!isEmailAuthorized(user.email)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-950 via-slate-950 to-slate-900 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full mx-auto my-auto pt-6 pb-12">
          <div className="bg-white/10 backdrop-blur-xl border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
            {/* Ambient Red Glow */}
            <div className="absolute -top-24 -right-24 w-52 h-52 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Warning Shield */}
            <div className="relative z-10 flex flex-col items-center space-y-3">
              <div className="w-18 h-18 rounded-3xl bg-rose-500/20 border-2 border-rose-400/40 flex items-center justify-center shadow-lg animate-pulse">
                <ShieldAlert className="w-10 h-10 text-rose-400" />
              </div>

              {/* Exact wording requested: "ไม่ได้รับอนุญาติ" */}
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/25 text-rose-300 border border-rose-400/40">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  การเข้าถึงถูกปฏิเสธ (Access Denied)
                </span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white pt-2">
                  ไม่ได้รับอนุญาติ
                </h1>
                <p className="text-xs sm:text-sm text-rose-200/90 leading-relaxed pt-1">
                  บัญชี Google นี้ไม่มีสิทธิ์เข้าถึงระบบ ARIYAWARIN BP Monitor
                </p>
              </div>
            </div>

            {/* Signed-in Email Display Box */}
            <div className="relative z-10 bg-slate-900/80 border border-rose-500/30 rounded-2xl p-4 text-left space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>บัญชีที่เข้าสู่ระบบ:</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  ไม่อยู่ในรายชื่อที่อนุญาต
                </span>
              </div>
              <div className="flex items-center gap-2.5 bg-rose-950/40 border border-rose-500/20 px-3 py-2 rounded-xl">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full border border-rose-400/50"
                  />
                ) : (
                  <Mail className="w-4 h-4 text-rose-400" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">
                    {user.displayName || 'Google Account'}
                  </div>
                  <div className="text-xs font-mono text-rose-200 truncate">
                    {user.email || 'ไม่มีอีเมล'}
                  </div>
                </div>
              </div>
            </div>

            {/* Access Notice */}
            <div className="relative z-10 bg-slate-900/60 border border-white/10 rounded-2xl p-4 text-left space-y-1.5">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>คำแนะนำการเข้าใช้งาน:</span>
              </div>
              <p className="text-[12px] text-slate-300 leading-relaxed">
                ระบบจำกัดสิทธิ์เฉพาะบัญชีผู้ดูแลระบบที่ลงทะเบียนไว้ล่วงหน้าเท่านั้น หากต้องการเข้าใช้งาน กรุณากดปุ่มสลับบัญชีเพื่อเข้าสู่ระบบด้วยบัญชี Google ที่ได้รับสิทธิ์
              </p>
            </div>

            {/* Switch Account / Sign Out Actions */}
            <div className="relative z-10 space-y-2.5 pt-1">
              <button
                onClick={async () => {
                  await onLogout();
                  onLogin();
                }}
                disabled={isConnecting}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-teal-700" />
                <span>สลับบัญชี Google อื่น</span>
              </button>

              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 font-semibold text-xs border border-white/15 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ออกจากระบบ (Sign Out)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400 pb-4">
          หากท่านคือบุคลากรที่เกี่ยวข้อง กรุณาติดต่อผู้ดูแลระบบเพื่อเปิดสิทธิ์การใช้งาน
        </div>
      </div>
    );
  }

  // 4. Authorized User: Grant Access to Children Views!
  return <>{children}</>;
};
