import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Activity,
  Layers,
  Palette,
  Eye,
  Smartphone,
  LayoutDashboard,
  Settings,
  BarChart3,
  Clock,
  Calendar,
  Users,
  FileSpreadsheet,
  BookOpen,
  Bell,
  BellRing,
  Stethoscope,
  Droplet,
  Heart,
  Scale,
  Target,
  Printer,
  Plus,
  Sun,
  Moon,
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { AriyawarinLogo } from './AriyawarinLogo';
import { BP_STAGES } from '../utils/bpClassification';

interface BrandLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalTab = 'app_icon' | 'analysis' | 'dashboard' | 'system_icons';

export const BrandLogoModal: React.FC<BrandLogoModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('app_icon');
  const [copied, setCopied] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);

  if (!isOpen) return null;

  const rawSvgCode = `<svg width="512" height="512" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Shield Gradient: Deep Medical Teal & Obsidian Emerald -->
    <linearGradient id="ariShieldGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#134e4a"/>
      <stop offset="45%" stop-color="#0f766e"/>
      <stop offset="85%" stop-color="#042f2e"/>
      <stop offset="100%" stop-color="#021d1c"/>
    </linearGradient>

    <!-- Radial Ambient Inner Core Glow -->
    <radialGradient id="ariRadialGlow" cx="100" cy="100" r="90" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#14b8a6" stop-opacity="0.35"/>
      <stop offset="60%" stop-color="#0d9488" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#042f2e" stop-opacity="0"/>
    </radialGradient>

    <!-- Cardiovascular Pulse Waveform Gradient: Vibrant Cyan, Mint & Emerald -->
    <linearGradient id="ariPulseGrad" x1="10" y1="100" x2="190" y2="100" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#2dd4bf"/>
      <stop offset="30%" stop-color="#38bdf8"/>
      <stop offset="65%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#14b8a6"/>
    </linearGradient>

    <!-- Monogram Serif Stem Light Gradient -->
    <linearGradient id="ariGoldLight" x1="40" y1="30" x2="160" y2="170" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.98"/>
      <stop offset="60%" stop-color="#f0fdfa" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#ccfbf1" stop-opacity="0.6"/>
    </linearGradient>

    <!-- Soft Glow Filter for Vital Node and Wave Ribbons -->
    <filter id="ariGlow" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="3.5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>

    <!-- Deep Ambient Drop Shadow for Monogram Leg -->
    <filter id="ariShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#021d1c" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Squircle App Icon Base Container -->
  <rect x="5" y="5" width="190" height="190" rx="48" fill="url(#ariShieldGrad)" stroke="#14b8a6" stroke-width="2.5" stroke-opacity="0.5"/>
  <rect x="6" y="6" width="188" height="188" rx="46" fill="url(#ariRadialGlow)"/>
  <rect x="12" y="12" width="176" height="176" rx="40" stroke="#2dd4bf" stroke-width="1" stroke-opacity="0.25" fill="none"/>

  <!-- Background Cardiovascular ECG Pulse Wave -->
  <path d="M22 122 L52 122 L64 104 L74 140 L86 86 L98 128 L110 114 L120 122 L178 122" 
        stroke="url(#ariPulseGrad)" stroke-width="2.2" stroke-opacity="0.32" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Signature ARIYAWARIN 'A' Monogram Left Serif Foot -->
  <path d="M38 152 C45 152 50 148 55 140 L94 48 C97 42 100 38 105 38 C110 38 113 42 116 48 L155 140 C160 148 165 152 172 152" 
        stroke="url(#ariGoldLight)" stroke-width="3.6" stroke-linecap="round" filter="url(#ariShadow)"/>

  <!-- Left Stem Inner Decorative Pinstripe -->
  <path d="M58 135 L96 46" stroke="#2dd4bf" stroke-width="1.8" stroke-opacity="0.8" stroke-linecap="round"/>

  <!-- Bold Right Diagonal Structural Stem -->
  <path d="M102 42 L148 148 C150 152 154 153 162 153 L164 153" 
        stroke="#ffffff" stroke-width="7.2" stroke-linecap="round" filter="url(#ariShadow)"/>

  <!-- Top Serif Crown of 'A' Monogram -->
  <path d="M92 40 C98 37 112 37 118 40" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round"/>

  <!-- Fluid Cardiovascular Wave Ribbons across Crossbar -->
  <path d="M24 128 C54 132 80 101 118 95 C148 90 168 99 184 107" 
        stroke="url(#ariPulseGrad)" stroke-width="3.4" stroke-linecap="round" fill="none" filter="url(#ariGlow)"/>
  <path d="M34 138 C64 140 92 113 124 107 C152 102 166 111 178 117" 
        stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  <path d="M46 147 C70 148 98 125 130 119 C154 115 166 121 174 125" 
        stroke="#2dd4bf" stroke-width="2.2" stroke-opacity="0.88" stroke-linecap="round" fill="none"/>

  <!-- Cardiovascular Vital Pulse Node -->
  <circle cx="118" cy="95" r="5" fill="#38bdf8" filter="url(#ariGlow)"/>
  <circle cx="118" cy="95" r="2.5" fill="#ffffff"/>
  <circle cx="118" cy="95" r="1" fill="#ecfeff"/>
</svg>`;

  const handleCopySvg = () => {
    navigator.clipboard.writeText(rawSvgCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([rawSvgCode], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ariyawarin-compact-app-icon.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Convert SVG to PNG using HTML5 Canvas for real 512x512 download
  const handleExportPng = (size: 192 | 512) => {
    try {
      setIsExportingPng(true);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      const svgBlob = new Blob([rawSvgCode], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        URL.revokeObjectURL(url);

        canvas.toBlob((blob) => {
          if (!blob) return;
          const pngUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = `ariyawarin-compact-app-icon-${size}x${size}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(pngUrl);
          setIsExportingPng(false);
        }, 'image/png');
      };

      img.src = url;
    } catch (e) {
      console.error('PNG export failed', e);
      setIsExportingPng(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between border-b border-teal-800/40">
          <div className="flex items-center gap-3">
            <AriyawarinLogo variant="icon" size={40} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                  ARIYAWARIN System Assets
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                  Compact Logo 2 · Official App Icon
                </span>
              </div>
              <p className="text-xs text-teal-200/80 mt-0.5">
                ศูนย์รวมอัตลักษณ์ไอคอนแอปพลิเคชัน บทวิเคราะห์เชิงลึก แดชบอร์ด และชุดไอคอนระบบการแพทย์
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-5 sm:px-8 pt-4 pb-1 bg-slate-50 border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('app_icon')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'app_icon'
                ? 'bg-white text-teal-800 border-teal-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            <Smartphone className="w-4 h-4 text-teal-600" />
            <span>1. App Icon (ไอคอนแอปพลิเคชัน & PWA)</span>
          </button>

          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'analysis'
                ? 'bg-white text-teal-800 border-teal-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>2. บทวิเคราะห์โลโก้ใหม่ (Compact Logo 2 Analysis)</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-white text-teal-800 border-teal-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-teal-600" />
            <span>3. Dashboard Icons (ไอคอนแดชบอร์ด)</span>
          </button>

          <button
            onClick={() => setActiveTab('system_icons')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'system_icons'
                ? 'bg-white text-teal-800 border-teal-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4 text-teal-600" />
            <span>4. System Icons (ชุดไอคอนระบบทั้งหมด)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-8 space-y-6 max-h-[72vh] overflow-y-auto">
          {/* TAB 1: APP ICON */}
          {activeTab === 'app_icon' && (
            <div className="space-y-6 animate-in fade-in">
              {/* App Icon Showcase Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. iOS Homescreen Mockup */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-teal-950 text-white border border-teal-800/40 flex flex-col items-center justify-center text-center space-y-3 shadow-md">
                  <span className="text-[10px] text-teal-300 font-mono tracking-wider uppercase bg-white/10 px-2.5 py-0.5 rounded-full">
                    iOS / iPadOS Launcher
                  </span>
                  <div className="p-1.5 rounded-[26px] bg-gradient-to-br from-teal-400 via-emerald-500 to-teal-700 shadow-xl">
                    <AriyawarinLogo variant="icon" size={88} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">ARIYAWARIN</span>
                    <span className="text-[10px] text-teal-200/70">BP Monitor</span>
                  </div>
                </div>

                {/* 2. Android Adaptive Icon Mockup */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center space-y-3 shadow-xs">
                  <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase bg-slate-200 px-2.5 py-0.5 rounded-full">
                    Android Adaptive Squircle
                  </span>
                  <div className="p-1 rounded-3xl bg-teal-900 shadow-md">
                    <AriyawarinLogo variant="icon" size={88} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">ความดันโลหิต</span>
                    <span className="text-[10px] text-slate-500">Ariyawarin BP</span>
                  </div>
                </div>

                {/* 3. Browser Favicon / PWA Web App Mockup */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between space-y-3 shadow-xs">
                  <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase bg-slate-100 px-2.5 py-0.5 rounded-full text-center">
                    Desktop Browser Tab & Favicon
                  </span>
                  <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs flex items-center gap-2">
                    <AriyawarinLogo variant="icon" size={22} />
                    <span className="font-semibold text-slate-800 truncate">
                      ARIYAWARIN BP Monitor
                    </span>
                    <X className="w-3 h-3 text-slate-400 ml-auto" />
                  </div>
                  <div className="text-[11px] text-slate-500 space-y-1">
                    <div>
                      <strong>Theme Color:</strong>{' '}
                      <span className="font-mono text-teal-700">#0f766e</span>
                    </div>
                    <div>
                      <strong>Public File:</strong>{' '}
                      <span className="font-mono text-slate-600">/public/icon.svg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download & Code Actions */}
              <div className="p-5 bg-slate-900 text-white rounded-2xl border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <AriyawarinLogo variant="horizontal" size={44} theme="dark" />
                <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
                  <button
                    onClick={handleCopySvg}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'คัดลอก SVG แล้ว!' : 'คัดลอก SVG'}</span>
                  </button>

                  <button
                    onClick={handleDownloadSvg}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ดาวน์โหลด SVG</span>
                  </button>

                  <button
                    onClick={() => handleExportPng(512)}
                    disabled={isExportingPng}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isExportingPng ? 'กำลังส่งออก...' : 'ดาวน์โหลด PNG 512px'}</span>
                  </button>
                </div>
              </div>

              {/* Icon Variations Preview */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  รูปแบบการแสดงผลของโลโก้ในระบบ (Component Variants)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col items-center text-center space-y-2">
                    <AriyawarinLogo variant="icon" size={48} />
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">variant="icon"</span>
                      <span className="text-[10px] text-slate-500">ใช้ใน App Icon, ปุ่มเปิดแบรนด์, แถบนำทาง</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-teal-500/30 flex flex-col items-center text-center space-y-2">
                    <AriyawarinLogo variant="compact" size={48} theme="dark" />
                    <div>
                      <span className="font-bold text-xs text-white block">variant="compact"</span>
                      <span className="text-[10px] text-teal-200/70">ใช้ในหน้าต่างย่อ, กล่องสรุป Compact</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col items-center text-center space-y-2">
                    <AriyawarinLogo variant="horizontal" size={32} />
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">variant="horizontal"</span>
                      <span className="text-[10px] text-slate-500">ใช้ในหัวกระดาษรายงานแพทย์ และแบนเนอร์</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOGO ANALYSIS */}
          {activeTab === 'analysis' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Header Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="p-2 rounded-2xl bg-white/10 shrink-0">
                  <AriyawarinLogo variant="icon" size={64} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold">บทวิเคราะห์อัตลักษณ์โลโก้ใหม่: Compact Logo 2</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-400 text-teal-950">
                      Official Specification
                    </span>
                  </div>
                  <p className="text-xs text-teal-100/80 mt-1 leading-relaxed">
                    การตีความและถ่ายทอดอัตลักษณ์องค์กรของ ARIYAWARIN Co., Ltd. สู่สัญลักษณ์ App Icon ดิจิทัลทางการแพทย์ที่มีความแม่นยำทางวิทยาศาสตร์และสุนทรียภาพระดับพรีเมียม
                  </p>
                </div>
              </div>

              {/* 4 Pillars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Pillar 1 */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-xs">
                  <div className="flex items-center gap-2 text-teal-800 font-bold">
                    <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-serif text-sm">
                      A
                    </span>
                    <h4 className="text-sm">1. Roman Serif 'A' Monogram (สถาปัตยกรรมตัวอักษร A)</h4>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    ตัวอักษร A ตัวพิมพ์ใหญ่สไตล์คลาสสิกโรมัน พร้อมฐานเสาซ้าย (Left Serif Foot) และมงกุฎยอดเสา (Crown Serif) สื่อถึง <strong>ความเป็นเลิศ (Grade A / Apex)</strong>, ความมั่นคง และความน่าเชื่อถือทางวิชาการและการแพทย์ ก้านเฉียงขวาเน้นเส้นหนาหนักแน่น (Bold Structural Stem) เพื่อสร้างเสถียรภาพทางสายตา
                  </p>
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-teal-700 font-semibold">
                    ✨ สัญลักษณ์: ความแม่นยำสูง (Precision) & ความเป็นเลิศ (Excellence)
                  </div>
                </div>

                {/* Pillar 2 */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-xs">
                  <div className="flex items-center gap-2 text-teal-800 font-bold">
                    <span className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center font-sans text-xs">
                      🌊
                    </span>
                    <h4 className="text-sm">2. Fluid Cardiovascular Wave Ribbons (ริ้วคลื่นพลวัตการไหลเวียนโลหิต)</h4>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    ริ้วคลื่น 3 สายที่พาดผ่านแกนกลางของตัวอักษร A แทนคานขวางแบบเดิม สื่อถึง <strong>การไหลเวียนของโลหิตอย่างต่อเนื่อง (Hemodynamics & Blood Flow)</strong> ริ้วคลื่นแบ่งออกเป็น 3 เลเยอร์ สะท้อนถึงการไหลเวียนในหลอดเลือดแดงใหญ่ หลอดเลือดดำ และหลอดเลือดฝอย พร้อมความยืดหยุ่นของระบบหัวใจและหลอดเลือด
                  </p>
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-cyan-700 font-semibold">
                    ✨ สัญลักษณ์: การไหลเวียนของเลือด (Blood Flow) & สุขภาพที่ยืนยาว
                  </div>
                </div>

                {/* Pillar 3 */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-xs">
                  <div className="flex items-center gap-2 text-teal-800 font-bold">
                    <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-sans text-xs">
                      💓
                    </span>
                    <h4 className="text-sm">3. Vital Pulse ECG Node & Rhythm (จุดกำเนิดจังหวะชีพจร)</h4>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    เส้นกราฟจังหวะการเต้นของหัวใจ (ECG Rhythm) ในระนาบหลัง และจุดทรงกลมเรืองแสง (Vital Pulse Node) ที่จุดสูงสุดของคลื่น สื่อถึง <strong>การตรวจวัดความดันโลหิตและชีพจรแบบเรียลไทม์</strong> จุดเรืองแสงเปล่งประกายสีฟ้าไซอัน (#38bdf8) บ่งบอกถึงชีพจรแห่งชีวิต (Life Spark) และความตื่นตัวในการดูแลสุขภาพ
                  </p>
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-rose-700 font-semibold">
                    ✨ สัญลักษณ์: จุดตรวจวัดค่าความดัน (Systolic/Diastolic Sensing)
                  </div>
                </div>

                {/* Pillar 4 */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-xs">
                  <div className="flex items-center gap-2 text-teal-800 font-bold">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-sans text-xs">
                      🛡️
                    </span>
                    <h4 className="text-sm">4. Obsidian Emerald & Teal Squircle Shield (เกราะมรกตการแพทย์)</h4>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    กรอบทรง Squircle (สี่เหลี่ยมมนโค้งต่อเนื่องแบบ Apple/Android) ไล่เฉดสีจากเขียวมรกตเข้ม (#0f766e) ไปสู่สีเขียวออบซิเดียน (#042f2e) ให้ความรู้สึกสุขุม ลุ่มลึก ปลอดภัย สอดคล้องกับมาตรฐานความปลอดภัยของข้อมูลสุขภาพส่วนบุคคล (Health Data Privacy & HIPAA Standard)
                  </p>
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold">
                    ✨ สัญลักษณ์: การปกป้องคุ้มครองสุขภาพ & ข้อมูลความดันที่เป็นความลับ
                  </div>
                </div>
              </div>

              {/* Color Palette Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-teal-700" />
                  <span>ชุดเฉดสีประจำอัตลักษณ์องค์กร (Official Color Harmony)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#0f766e] border border-black/10 shrink-0" />
                    <div>
                      <strong className="block text-slate-800">Medical Teal</strong>
                      <span className="font-mono text-[10px] text-slate-500">#0f766e</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#2dd4bf] border border-black/10 shrink-0" />
                    <div>
                      <strong className="block text-slate-800">Vital Mint</strong>
                      <span className="font-mono text-[10px] text-slate-500">#2dd4bf</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#38bdf8] border border-black/10 shrink-0" />
                    <div>
                      <strong className="block text-slate-800">Pulse Cyan</strong>
                      <span className="font-mono text-[10px] text-slate-500">#38bdf8</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#042f2e] border border-black/10 shrink-0" />
                    <div>
                      <strong className="block text-slate-800">Obsidian Forest</strong>
                      <span className="font-mono text-[10px] text-slate-500">#042f2e</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DASHBOARD ICONS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-teal-700" />
                  <span>ไอคอนและสัญลักษณ์ที่ใช้ในแดชบอร์ดติดตามความดันโลหิต</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ระบบออกแบบให้ผู้ใช้งานและแพทย์แยกแยะค่าทางคลินิกได้อย่างรวดเร็วและแม่นยำ
                </p>
              </div>

              {/* Metric Cards Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* SYS Icon */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">SYS · ตัวบน</h4>
                    <span className="text-[10px] text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.5 rounded">
                      Systolic Pressure
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    ความดันขณะหัวใจบีบตัว เกณฑ์เป้าหมายตามมาตรฐานสากลคือ <strong>&lt; 120 mmHg</strong>
                  </p>
                </div>

                {/* DIA Icon */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                    <Droplet className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">DIA · ตัวล่าง</h4>
                    <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.5 rounded">
                      Diastolic Pressure
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    ความดันขณะหัวใจคลายตัว เกณฑ์เป้าหมายตามมาตรฐานสากลคือ <strong>&lt; 80 mmHg</strong>
                  </p>
                </div>

                {/* PUL Icon */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Heart className="w-5 h-5 stroke-[2.2] fill-amber-100" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">PUL · ชีพจร</h4>
                    <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                      Pulse Rate (bpm)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    อัตราการเต้นของหัวใจ ปกติ <strong>60-100 bpm</strong> พร้อมอิโมจิประเมิน 💓 / 🐢 / ⚡
                  </p>
                </div>

                {/* Morning Surge / Balance Icon */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Scale className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Surge · ความต่าง</h4>
                    <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">
                      Morning BP Surge
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    ความต่างค่าเฉลี่ยเช้า - เย็น เฝ้าระวังไม่ให้เกิน <strong>20 mmHg</strong> เพื่อลดความเสี่ยงเส้นเลือดสมอง
                  </p>
                </div>
              </div>

              {/* View Modes & Target Indicators */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  สัญลักษณ์โหมดการแสดงผลในกราฟแดชบอร์ด
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5">
                    <BarChart3 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block">มุมมองค่าเฉลี่ย (2 จุด/วัน)</strong>
                      <span className="text-slate-500">แสดงค่าเฉลี่ยรอบเช้าและรอบเย็น เหมาะสำหรับการดูแนวโน้มระยะยาว</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5">
                    <Activity className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block">แสดงทุกค่า (4 จุด/วัน)</strong>
                      <span className="text-slate-500">แสดงครบทั้ง 4 ครั้ง (เช้า 2 ครั้ง, เย็น 2 ครั้ง) ตรวจสอบความนิ่งของการวัด</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5">
                    <Target className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block">โซนเป้าหมายปลอดภัย (Safe Zone)</strong>
                      <span className="text-slate-500">แถบสีเขียวอ่อนในกราฟ บ่งชี้ระดับความดันปลอดภัย (&lt;120/80 mmHg)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SYSTEM ICONS SUITE */}
          {activeTab === 'system_icons' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Navigation System Icons */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-teal-700" />
                  <span>1. ชุดไอคอนนำทางหลัก (Main Navigation System Icons)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-xs text-center">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <BarChart3 className="w-5 h-5 mx-auto text-teal-700" />
                    <span className="font-bold text-slate-800 block">แดชบอร์ด</span>
                    <span className="text-[10px] text-slate-400">Dashboard</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <Clock className="w-5 h-5 mx-auto text-teal-700" />
                    <span className="font-bold text-slate-800 block">บันทึกเรียลไทม์</span>
                    <span className="text-[10px] text-slate-400">Real-time Entry</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <Users className="w-5 h-5 mx-auto text-teal-700" />
                    <span className="font-bold text-slate-800 block">สมาชิก & BMI</span>
                    <span className="text-[10px] text-slate-400">Members & BMI</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <Calendar className="w-5 h-5 mx-auto text-teal-700" />
                    <span className="font-bold text-slate-800 block">ปฏิทินย้อนหลัง</span>
                    <span className="text-[10px] text-slate-400">Calendar Logs</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <FileSpreadsheet className="w-5 h-5 mx-auto text-teal-700" />
                    <span className="font-bold text-slate-800 block">รายงานแพทย์</span>
                    <span className="text-[10px] text-slate-400">Doctor Report</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <BookOpen className="w-5 h-5 mx-auto text-teal-700" />
                    <span className="font-bold text-slate-800 block">เกณฑ์การแพทย์</span>
                    <span className="text-[10px] text-slate-400">Guidelines</span>
                  </div>
                </div>
              </div>

              {/* Action System Icons */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-700" />
                  <span>2. ชุดไอคอนการทำงานและเครื่องมือ (Action & Utility Icons)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                      <BellRing className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block text-slate-800">แจ้งเตือน Push</strong>
                      <span className="text-[10px] text-slate-500">05:00-11:30 & 15:00+</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block text-slate-800">Google Sheets</strong>
                      <span className="text-[10px] text-slate-500">บันทึกคลาวด์สด</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
                      <Printer className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block text-slate-800">พิมพ์รายงาน / PDF</strong>
                      <span className="text-[10px] text-slate-500">สำหรับส่งแพทย์</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block text-slate-800">ส่งออก CSV</strong>
                      <span className="text-[10px] text-slate-500">UTF-8 BOM สำหรับ Excel</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Health Stages Matrix & Emojis */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  <span>3. ตารางอิโมจิและระดับการประเมินสุขภาพ (Health Classification & Emojis)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                  {Object.values(BP_STAGES).map((st) => (
                    <div
                      key={st.key}
                      className={`p-3 rounded-xl border flex items-center justify-between ${st.badgeBg}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{st.emoji}</span>
                        <div>
                          <strong className={`block ${st.badgeText}`}>
                            {st.heartEmoji} {st.titleTh}
                          </strong>
                          <span className="text-[10px] text-slate-500">
                            SYS {st.sysRange} · DIA {st.diaRange}
                          </span>
                        </div>
                      </div>
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: st.accentColor }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <AriyawarinLogo variant="icon" size={20} />
            <span>© 2026 Kritchanat Dechsart (Tent). Licensed to Ariyawarin Co., Ltd.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
