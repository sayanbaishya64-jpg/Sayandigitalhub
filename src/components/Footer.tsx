import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { Briefcase, GraduationCap, CalendarCheck, BookOpen, MonitorSmartphone, Shield, Phone, Mail, MapPin, Facebook, Globe, Youtube } from 'lucide-react';

interface FooterProps {
  setActivePage: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActivePage }) => {
  const { language, settings } = useApp();
  const t = translations[language];

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActivePage('home')}>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow">
                SDH
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                {settings.siteName}
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {language === 'bn' ? settings.bengaliTagline : settings.tagline}
            </p>
            <div className="text-xs text-slate-500">
              {settings.subTagline || "Jobs. Education. News. Digital Services."}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4 border-b border-slate-800 pb-2">
              {language === 'bn' ? 'দ্রুত লিঙ্ক' : 'Quick Links'}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => setActivePage('jobs')} className="hover:text-amber-400 transition">
                  {t.jobs}
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('scholarships')} className="hover:text-amber-400 transition">
                  {t.scholarships}
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('exam-updates')} className="hover:text-amber-400 transition">
                  {t.examUpdates}
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('study-materials')} className="hover:text-amber-400 transition">
                  {t.studyMaterials}
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('digital-services')} className="hover:text-amber-400 transition">
                  {t.digitalServices}
                </button>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4 border-b border-slate-800 pb-2">
              {language === 'bn' ? 'নীতি ও সহায়তা' : 'Support & Legal'}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => setActivePage('about-us')} className="hover:text-amber-400 transition">
                  {t.aboutUs}
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('contact-us')} className="hover:text-amber-400 transition">
                  {t.contactUs}
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('privacy-policy')} className="hover:text-amber-400 transition">
                  {language === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('terms')} className="hover:text-amber-400 transition">
                  {language === 'bn' ? 'শর্তাবলী' : 'Terms & Conditions'}
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('disclaimer')} className="hover:text-amber-400 transition">
                  {language === 'bn' ? 'ডিসক্লেইমার' : 'Disclaimer'}
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('otp-consent')} className="hover:text-amber-400 transition flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{language === 'bn' ? 'ওটিপি সম্মতি নীতি' : 'OTP Consent Policy'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4 border-b border-slate-800 pb-2">
              {language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Info'}
            </h3>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="inline-block" style={{ width: '114.812px' }}>{settings.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{settings.contactEmail}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>{settings.copyrightText}</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 font-medium">
              {language === 'bn' ? 'সায়ন ডিজিটাল হাব - আপনার ডিজিটাল বন্ধু' : 'Sayan Digital Hub - Your Digital Partner'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
