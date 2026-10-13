import React from 'react';
import { Home, ArrowLeft } from 'lucide-react';

interface BackToHomeButtonProps {
  onNavigateHome: () => void;
  label?: string;
  className?: string;
}

export const BackToHomeButton: React.FC<BackToHomeButtonProps> = ({
  onNavigateHome,
  label = 'กลับหน้า Home',
  className = '',
}) => {
  return (
    <button
      onClick={onNavigateHome}
      type="button"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 hover:text-teal-900 border border-teal-200/90 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0 ${className}`}
      title="กลับสู่หน้าแรก (Home)"
    >
      <ArrowLeft className="w-3.5 h-3.5 text-teal-700" />
      <Home className="w-3.5 h-3.5 text-teal-700" />
      <span>{label}</span>
    </button>
  );
};
