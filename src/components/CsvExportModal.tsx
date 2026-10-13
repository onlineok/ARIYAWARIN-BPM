import React, { useState, useMemo } from 'react';
import { DailyBPRecord } from '../types/bp';
import {
  CsvExportOptions,
  generateBloodPressureCsv,
  triggerCsvDownload,
  filterRecordsForExport,
} from '../utils/csvExport';
import {
  X,
  Download,
  Copy,
  Check,
  FileSpreadsheet,
  Calendar,
  User,
  ShieldCheck,
  Table,
  Sliders,
  Info,
} from 'lucide-react';
import { Member } from '../types/member';
import { computeDailyMetrics, formatThaiDate } from '../utils/bpClassification';

interface CsvExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: DailyBPRecord[];
  activeMember?: Member | null;
}

export const CsvExportModal: React.FC<CsvExportModalProps> = ({
  isOpen,
  onClose,
  records,
  activeMember,
}) => {
  const [dateRange, setDateRange] = useState<CsvExportOptions['dateRange']>('30d');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-09-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-10-12');
  const [language, setLanguage] = useState<CsvExportOptions['language']>('bilingual');
  const [includeSummary, setIncludeSummary] = useState<boolean>(true);
  const [patientName, setPatientName] = useState<string>(
    activeMember ? `${activeMember.firstName} ${activeMember.lastName}` : ''
  );
  const [patientId, setPatientId] = useState<string>(activeMember?.id || '');

  const [copied, setCopied] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Generate options object
  const exportOptions: CsvExportOptions = useMemo(() => {
    return {
      dateRange,
      customStartDate: dateRange === 'custom' ? customStartDate : undefined,
      customEndDate: dateRange === 'custom' ? customEndDate : undefined,
      language,
      includeClinicalSummary: includeSummary,
      patientName: patientName.trim() || undefined,
      patientId: patientId.trim() || undefined,
    };
  }, [dateRange, customStartDate, customEndDate, language, includeSummary, patientName, patientId]);

  // Filtered records for preview
  const filteredRecords = useMemo(() => {
    return filterRecordsForExport(records, exportOptions);
  }, [records, exportOptions]);

  // Generate the actual CSV string
  const csvString = useMemo(() => {
    return generateBloodPressureCsv(records, exportOptions);
  }, [records, exportOptions]);

  if (!isOpen) return null;

  // Handle Download CSV
  const handleDownload = () => {
    const filename = `blood_pressure_report_${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`;
    triggerCsvDownload(csvString, filename);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  // Handle Copy to Clipboard
  const handleCopy = async () => {
    try {
      // Remove BOM for clipboard paste
      const cleanText = csvString.replace(/^\uFEFF/, '');
      await navigator.clipboard.writeText(cleanText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy CSV content', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                ส่งออกไฟล์ CSV สำหรับแพทย์ (Export for Healthcare Provider)
              </h2>
              <p className="text-xs text-slate-500">
                รองรับโปรแกรม Microsoft Excel, Google Sheets และระบบเวชระเบียนคลินิก
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Date Range Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-700" />
              <span>เลือกช่วงเวลาที่ต้องการส่งออก:</span>
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-xs">
              {[
                { key: '7d', label: '7 วัน' },
                { key: '14d', label: '14 วัน' },
                { key: '30d', label: '30 วัน' },
                { key: '90d', label: '90 วัน' },
                { key: 'all', label: 'ทั้งหมด' },
                { key: 'custom', label: 'กำหนดเอง' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setDateRange(item.key as any)}
                  className={`py-2 px-2 rounded-lg font-medium border text-center transition-all ${
                    dateRange === item.key
                      ? 'bg-teal-700 text-white border-teal-700 font-semibold shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {dateRange === 'custom' && (
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-slate-500 text-[11px] shrink-0">ตั้งแต่วันที่:</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 w-full"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-slate-500 text-[11px] shrink-0">ถึงวันที่:</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Patient Metadata (Optional) */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <span className="font-bold text-slate-800 block flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-700" />
              <span>ข้อมูลผู้ป่วยสำหรับแนบในหัวรายงาน (ไม่บังคับ):</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">
                  ชื่อ-นามสกุล ผู้รับบริการ (Patient Name)
                </label>
                <input
                  type="text"
                  placeholder="เช่น นายรักสุขภาพ มั่นคง"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">
                  รหัสประจำตัวผู้ป่วย / เลข HN (Hospital Number)
                </label>
                <input
                  type="text"
                  placeholder="เช่น HN 690123 หรือ เลขบัตร"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Header Language & Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">
                รูปแบบภาษาหัวตาราง (Header Language):
              </label>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setLanguage('bilingual')}
                  className={`flex-1 py-1.5 px-2 rounded-md font-medium transition-all text-center ${
                    language === 'bilingual'
                      ? 'bg-white text-teal-800 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  สองภาษา (TH-EN)
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('th')}
                  className={`flex-1 py-1.5 px-2 rounded-md font-medium transition-all text-center ${
                    language === 'th'
                      ? 'bg-white text-teal-800 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ภาษาไทย
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-1.5 px-2 rounded-md font-medium transition-all text-center ${
                    language === 'en'
                      ? 'bg-white text-teal-800 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSummary}
                  onChange={(e) => setIncludeSummary(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span className="text-[11px] text-slate-700">
                  รวมสรุปค่าเฉลี่ยทางคลินิก (Overall Summary Statistics)
                </span>
              </label>
            </div>
          </div>

          {/* Section 4: Live Export Data Preview */}
          <div className="border border-slate-200 rounded-xl overflow-hidden space-y-2">
            <div className="bg-slate-50 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Table className="w-3.5 h-3.5 text-teal-700" />
                <span>ตัวอย่างข้อมูลที่จะส่งออก ({filteredRecords.length} วัน)</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                UTF-8 BOM พร้อมเปิดใน Excel
              </span>
            </div>

            {filteredRecords.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                ไม่พบข้อมูลในช่วงเวลาที่เลือก
              </div>
            ) : (
              <div className="overflow-x-auto max-h-40 p-2 text-xs">
                <table className="w-full text-left text-[11px] border-collapse font-mono-numbers">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-sans">
                      <th className="py-1 px-2">วันที่</th>
                      <th className="py-1 px-2 text-center">เช้า 1</th>
                      <th className="py-1 px-2 text-center">เช้า 2</th>
                      <th className="py-1 px-2 text-center">เฉลี่ยเช้า</th>
                      <th className="py-1 px-2 text-center">เย็น 1</th>
                      <th className="py-1 px-2 text-center">เย็น 2</th>
                      <th className="py-1 px-2 text-center">เฉลี่ยเย็น</th>
                      <th className="py-1 px-2 text-center">เฉลี่ยวัน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredRecords.slice(0, 4).map((r) => {
                      const m = computeDailyMetrics(r);
                      return (
                        <tr key={r.id}>
                          <td className="py-1 px-2 font-medium font-sans whitespace-nowrap">
                            {r.date}
                          </td>
                          <td className="py-1 px-2 text-center">
                            {r.morning.reading1 ? `${r.morning.reading1.sys}/${r.morning.reading1.dia}` : '-'}
                          </td>
                          <td className="py-1 px-2 text-center">
                            {r.morning.reading2 ? `${r.morning.reading2.sys}/${r.morning.reading2.dia}` : '-'}
                          </td>
                          <td className="py-1 px-2 text-center font-bold text-teal-800">
                            {m.morningAvg ? `${m.morningAvg.sys}/${m.morningAvg.dia}` : '-'}
                          </td>
                          <td className="py-1 px-2 text-center">
                            {r.evening.reading1 ? `${r.evening.reading1.sys}/${r.evening.reading1.dia}` : '-'}
                          </td>
                          <td className="py-1 px-2 text-center">
                            {r.evening.reading2 ? `${r.evening.reading2.sys}/${r.evening.reading2.dia}` : '-'}
                          </td>
                          <td className="py-1 px-2 text-center font-bold text-teal-800">
                            {m.eveningAvg ? `${m.eveningAvg.sys}/${m.eveningAvg.dia}` : '-'}
                          </td>
                          <td className="py-1 px-2 text-center font-bold text-slate-900">
                            {m.dailyAvg ? `${m.dailyAvg.sys}/${m.dailyAvg.dia}` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredRecords.length > 4 && (
                  <div className="text-[10px] text-slate-400 text-center pt-2 italic">
                    ... และอีก {filteredRecords.length - 4} วันที่จะถูกรวมในไฟล์ CSV
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Modal Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            {downloadSuccess && (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                ดาวน์โหลดไฟล์สำเร็จเรียบร้อย
              </span>
            )}
            {copied && (
              <span className="text-teal-700 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                คัดลอกข้อมูล CSV ลงใน Clipboard แล้ว
              </span>
            )}
            {!downloadSuccess && !copied && (
              <span>สามารถส่งไฟล์ CSV หรือคัดลอกส่งผ่าน LINE/Email ให้แพทย์ได้ทันที</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors min-h-[40px]"
              title="คัดลอกข้อความ CSV ทั้งหมด"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกข้อความ'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 active:scale-[0.98] rounded-lg shadow-sm transition-all min-h-[40px]"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>ดาวน์โหลดไฟล์ CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
