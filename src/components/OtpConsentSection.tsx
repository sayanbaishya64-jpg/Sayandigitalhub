import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface OtpConsentSectionProps {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
  error?: string | null;
  language?: 'en' | 'bn';
}

export const OtpConsentSection: React.FC<OtpConsentSectionProps> = ({
  accepted,
  onChange,
  error,
  language = 'en'
}) => {
  const [showFullNotice, setShowFullNotice] = useState(true);

  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
      error ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/20' : accepted ? 'border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20' : 'border-indigo-200 bg-slate-50/80 dark:bg-slate-900/40'
    }`}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 text-white p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm sm:text-base tracking-tight flex items-center gap-2">
              <span>OTP Consent & Authorization</span>
              <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                Mandatory Policy
              </span>
            </h4>
            <p className="text-xs text-indigo-200 font-medium">
              {language === 'bn' 
                ? 'পরিষেবা এবং অ্যাপয়েন্টমেন্ট যাচাইকরণের সময় ওটিপি সম্মতি' 
                : 'Authorization policy for service & appointment OTP verification'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowFullNotice(!showFullNotice)}
          className="text-xs text-indigo-200 hover:text-white flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{showFullNotice ? 'Collapse Details' : 'Read Policy'}</span>
          {showFullNotice ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
        {/* Main Agreement Checkbox */}
        <label className="flex items-start gap-3.5 cursor-pointer group p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-400 transition">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => onChange(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0 cursor-pointer"
          />
          <div className="space-y-1">
            <span className="font-bold text-slate-900 dark:text-white leading-relaxed block group-hover:text-indigo-600 transition">
              I agree to provide the required OTP (One-Time Password) when necessary to complete my requested service or appointment-related work. I authorize SAYAN DIGITAL HUB to use the OTP solely for the specific service I have requested.
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
              I understand that OTP verification may be required for identity verification, application submission, authentication, or other authorized service-related activities.
            </p>
          </div>
        </label>

        {/* Security Notice Collapsible Content */}
        {showFullNotice && (
          <div className="space-y-3 pt-2 border-t border-slate-200/80 dark:border-slate-700/80 animate-fadeIn">
            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100">
              <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Important Security Notice:</span>
            </div>

            <ul className="space-y-2 pl-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">•</span>
                <span>I will provide an OTP only when necessary for my requested service.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">•</span>
                <span>I understand that OTPs must be used only for their intended purpose.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">•</span>
                <span>I will not share OTPs for unrelated activities or unauthorized transactions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">•</span>
                <span>SAYAN DIGITAL HUB must not use my OTP for any purpose beyond the service I have authorized.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">•</span>
                <span>I understand that I should review the details of any transaction or application before confirming it.</span>
              </li>
            </ul>

            <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200 font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>By checking this box, I confirm that I have read and agree to this OTP Consent Policy.</span>
            </div>
          </div>
        )}

        {/* Error state alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2 border border-rose-300 dark:border-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
