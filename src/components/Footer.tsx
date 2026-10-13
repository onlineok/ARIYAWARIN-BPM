import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { AriyawarinLogo } from './AriyawarinLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="no-print mt-12 sm:mt-16 mb-16 md:mb-0 border-t border-slate-200 bg-white py-8 sm:py-10 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Brand & Organization */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm tracking-tight">
              <AriyawarinLogo variant="icon" size={26} />
              <span className="font-serif tracking-wider">ARIYAWARIN</span>
            </div>
            <p className="text-slate-600 font-medium">Business & Learning Solutions</p>
            <p className="text-slate-400 text-[11px] pt-1">
              (c) 2026 Kritchanat Dechsart (Tent). All Rights Reserved.
            </p>
            <p className="text-slate-400 text-[11px]">
              Licensed to Ariyawarin Co., Ltd.
            </p>
          </div>

          {/* Clinical Disclaimer & Guidelines Reference */}
          <div className="max-w-md space-y-1 text-[11px] text-slate-500 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>ข้อกำหนดทางการแพทย์ (Medical Disclaimer)</span>
            </div>
            <p className="leading-relaxed">
              เกณฑ์การประเมินอ้างอิงตามมาตรฐานสากล AHA/ACC และ ESC/ESH สำหรับการเฝ้าระวังที่บ้าน (Home BP Monitoring) ข้อมูลในแอปพลิเคชันนี้ใช้เพื่อประกอบการดูแลสุขภาพตนเองและปรึกษาแพทย์เท่านั้น มิใช่การวินิจฉัยโรคเพื่อสั่งการรักษาโดยตรง
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
