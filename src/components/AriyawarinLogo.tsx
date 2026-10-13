import React from 'react';

export interface AriyawarinLogoProps {
  variant?: 'icon' | 'compact' | 'full' | 'horizontal' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  theme?: 'dark' | 'light' | 'color';
  animated?: boolean;
}

/**
 * Authentic ARIYAWARIN BP Monitor Vector Logo
 * Faithfully aligned with the Compact Logo 2 brand identity:
 * - Roman Serif 'A' Monogram: Precision, excellence and stability
 * - Fluid Cardiovascular Wave Ribbons: Dynamic blood flow through crossbar
 * - Vital Pulse ECG Node: Active heartbeat and blood pressure bio-monitoring
 * - Deep Medical Obsidian Teal & Emerald Squircle Shield Container
 */
export const AriyawarinLogo: React.FC<AriyawarinLogoProps> = ({
  variant = 'icon',
  size = 'md',
  className = '',
  theme = 'color',
  animated = true,
}) => {
  // Resolve numeric dimensions
  const getDimension = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'sm':
        return 28;
      case 'md':
        return 38;
      case 'lg':
        return 56;
      case 'xl':
        return 96;
      default:
        return 38;
    }
  };

  const dim = getDimension();

  // SVG Monogram Icon (The core App Icon & compact symbol mark)
  const renderSymbol = (symbolSize: number) => (
    <svg
      width={symbolSize}
      height={symbolSize}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-all duration-300 ease-out select-none ${
        animated ? 'hover:scale-105' : ''
      }`}
      aria-label="ARIYAWARIN Official App Icon"
    >
      <defs>
        {/* Background Shield Gradient: Deep Medical Teal & Obsidian Emerald */}
        <linearGradient id="ariShieldGradComp" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#134e4a" />
          <stop offset="45%" stopColor="#0f766e" />
          <stop offset="85%" stopColor="#042f2e" />
          <stop offset="100%" stopColor="#021d1c" />
        </linearGradient>

        {/* Radial Ambient Core Glow */}
        <radialGradient id="ariRadialGlowComp" cx="100" cy="100" r="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#0d9488" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#042f2e" stopOpacity="0" />
        </radialGradient>

        {/* Cardiovascular Pulse Waveform Gradient */}
        <linearGradient id="ariPulseGradComp" x1="10" y1="100" x2="190" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="30%" stopColor="#38bdf8" />
          <stop offset="65%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>

        {/* Monogram Serif Stem Light Gradient */}
        <linearGradient id="ariGoldLightComp" x1="40" y1="30" x2="160" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="60%" stopColor="#f0fdfa" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ccfbf1" stopOpacity="0.6" />
        </linearGradient>

        {/* Soft Glow Filter for Vital Node and Wave Ribbons */}
        <filter id="ariGlowComp" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Subtle Drop Shadow for Bold Monogram Stem */}
        <filter id="ariShadowComp" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#021d1c" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* Squircle App Icon Base Container */}
      <rect
        x="5"
        y="5"
        width="190"
        height="190"
        rx="48"
        fill="url(#ariShieldGradComp)"
        stroke="#14b8a6"
        strokeWidth="2.5"
        strokeOpacity="0.5"
      />

      {/* Radial Ambient Core Glow with soft biometric pulse */}
      <rect
        x="6"
        y="6"
        width="188"
        height="188"
        rx="46"
        fill="url(#ariRadialGlowComp)"
        className={animated ? 'transition-opacity duration-700' : ''}
      >
        {animated && (
          <animate
            attributeName="opacity"
            values="0.55;1;0.55"
            dur="3.2s"
            repeatCount="indefinite"
          />
        )}
      </rect>

      {/* Inner Accent Inset Ring */}
      <rect
        x="12"
        y="12"
        width="176"
        height="176"
        rx="40"
        stroke="#2dd4bf"
        strokeWidth="1"
        strokeOpacity="0.25"
        fill="none"
      />

      {/* Background Cardiovascular ECG Pulse Wave (Rhythm Line) */}
      <path
        d="M22 122 L52 122 L64 104 L74 140 L86 86 L98 128 L110 114 L120 122 L178 122"
        stroke="url(#ariPulseGradComp)"
        strokeWidth="2.2"
        strokeOpacity="0.32"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* === The Signature ARIYAWARIN 'A' Monogram === */}
      {/* 1. Left Serif Foot & Upward Slender Leg */}
      <path
        d="M38 152 C45 152 50 148 55 140 L94 48 C97 42 100 38 105 38 C110 38 113 42 116 48 L155 140 C160 148 165 152 172 152"
        stroke="url(#ariGoldLightComp)"
        strokeWidth="3.6"
        strokeLinecap="round"
        filter="url(#ariShadowComp)"
      />

      {/* 2. Left Stem Inner Decorative Pinstripe */}
      <path
        d="M58 135 L96 46"
        stroke="#2dd4bf"
        strokeWidth="1.8"
        strokeOpacity="0.8"
        strokeLinecap="round"
      />

      {/* 3. Bold Right Diagonal Structural Stem */}
      <path
        d="M102 42 L148 148 C150 152 154 153 162 153 L164 153"
        stroke="#ffffff"
        strokeWidth="7.2"
        strokeLinecap="round"
        filter="url(#ariShadowComp)"
      />

      {/* 4. Top Serif Crown of 'A' Monogram */}
      <path
        d="M92 40 C98 37 112 37 118 40"
        stroke="#ffffff"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* 5. Fluid Cardiovascular Wave Ribbons across Crossbar */}
      {/* Upper fluid wave */}
      <path
        d="M24 128 C54 132 80 101 118 95 C148 90 168 99 184 107"
        stroke="url(#ariPulseGradComp)"
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
        filter="url(#ariGlowComp)"
      />

      {/* Middle crisp white pulse wave ribbon */}
      <path
        d="M34 138 C64 140 92 113 124 107 C152 102 166 111 178 117"
        stroke="#ffffff"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Lower cyan arterial flow wave */}
      <path
        d="M46 147 C70 148 98 125 130 119 C154 115 166 121 174 125"
        stroke="#2dd4bf"
        strokeWidth="2.2"
        strokeOpacity="0.88"
        strokeLinecap="round"
        fill="none"
      />

      {/* 6. Cardiovascular Vital Pulse Node */}
      <circle cx="118" cy="95" r="5" fill="#38bdf8" filter="url(#ariGlowComp)">
        {animated && (
          <animate
            attributeName="r"
            values="4.5;6.2;4.5"
            dur="2.4s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      <circle cx="118" cy="95" r="2.5" fill="#ffffff">
        {animated && (
          <animate
            attributeName="opacity"
            values="0.8;1;0.8"
            dur="2.4s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      <circle cx="118" cy="95" r="1" fill="#ecfeff" />
    </svg>
  );

  // Variant 1: Icon only (The standard App Icon)
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {renderSymbol(dim)}
      </div>
    );
  }

  // Variant 2: Compact Brand Lockup (Icon + Centered Stacked Typography)
  if (variant === 'compact') {
    return (
      <div className={`inline-flex flex-col items-center justify-center text-center ${className}`}>
        {renderSymbol(dim)}
        <div className="mt-2 flex flex-col items-center">
          <span
            className={`font-serif tracking-[0.16em] font-extrabold ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}
            style={{ fontSize: Math.max(13, dim * 0.28) }}
          >
            ARIYAWARIN
          </span>
          <span
            className="font-sans font-bold text-[9px] uppercase tracking-wider text-teal-400 mt-0.5"
            style={{ fontSize: Math.max(8, dim * 0.16) }}
          >
            BP MONITOR
          </span>
        </div>
      </div>
    );
  }

  // Variant 3: Horizontal Logo with Typography (Wordmark)
  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-3 ${className}`}>
        {renderSymbol(dim)}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 leading-none">
            <span
              className={`font-serif tracking-[0.12em] font-extrabold ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}
              style={{ fontSize: Math.max(15, dim * 0.42) }}
            >
              ARIYAWARIN
            </span>
            <span
              className="font-sans font-bold px-1.5 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-400/30"
              style={{ fontSize: Math.max(9, dim * 0.24) }}
            >
              BP MONITOR
            </span>
          </div>
          <span
            className={`font-sans tracking-wide uppercase mt-1 ${
              theme === 'light' ? 'text-slate-500' : 'text-teal-200/80'
            }`}
            style={{ fontSize: Math.max(8, dim * 0.22), letterSpacing: '0.06em' }}
          >
            Business & Learning Solutions
          </span>
        </div>
      </div>
    );
  }

  // Variant 4: Full stacked medical badge
  if (variant === 'badge') {
    return (
      <div
        className={`p-6 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 rounded-3xl border border-teal-500/30 shadow-2xl flex flex-col items-center text-center ${className}`}
      >
        {renderSymbol(dim || 80)}
        <h2 className="mt-4 font-serif text-xl sm:text-2xl font-extrabold text-white tracking-[0.18em]">
          ARIYAWARIN
        </h2>
        <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/40 text-xs font-bold tracking-wider uppercase">
          Blood Pressure Monitor
        </div>
        <p className="mt-2 text-xs text-teal-100/75 max-w-xs leading-relaxed">
          ระบบบันทึกและประเมินผลสุขภาพความดันโลหิตตามเกณฑ์มาตรฐานสากล AHA/ACC และ ESC/ESH 2024
        </p>
        <div className="mt-4 pt-3 border-t border-teal-800/60 text-[10px] text-teal-300/60 uppercase tracking-widest">
          ARIYAWARIN Co., Ltd. · Licensed System
        </div>
      </div>
    );
  }

  // Default: Responsive Full Display
  return (
    <div className={`inline-flex items-center gap-3.5 ${className}`}>
      {renderSymbol(dim)}
      <div className="flex flex-col">
        <span
          className={`font-serif tracking-[0.14em] font-extrabold ${
            theme === 'light' ? 'text-slate-900' : 'text-slate-900'
          }`}
          style={{ fontSize: Math.max(15, dim * 0.44) }}
        >
          ARIYAWARIN
        </span>
        <span
          className="text-teal-700 font-sans font-bold tracking-tight"
          style={{ fontSize: Math.max(10, dim * 0.28) }}
        >
          BP Monitor
        </span>
      </div>
    </div>
  );
};
