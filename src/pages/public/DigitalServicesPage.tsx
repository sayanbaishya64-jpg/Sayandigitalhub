import React from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../i18n/translations';
import { MonitorSmartphone, CheckCircle2, Clock, IndianRupee, ArrowRight } from 'lucide-react';

interface DigitalServicesPageProps {
  setActivePage: (page: string) => void;
}

export const DigitalServicesPage: React.FC<DigitalServicesPageProps> = ({ setActivePage }) => {
  const { digitalServices, language } = useApp();
  const t = translations[language];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {language === 'bn' ? 'ডিজিটাল সহায়তা' : 'Online Digital Services'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mt-2">
            {t.digitalServices}
          </h1>
          <p className="text-slate-300 text-sm mt-2 max-w-xl">
            {language === 'bn' ? 'অনলাইন ফর্ম ফিলাপ, স্কলারশিপ ও পেমেন্ট সংক্রান্ত সমস্ত পরিষেবার জন্য আমাদের সাথে যোগাযোগ করুন।' : 'Explore online services and request professional assistance with digital applications and related tasks.'}
          </p>
        </div>
        <button
          onClick={() => setActivePage('book-appointment')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition flex items-center gap-2 shrink-0"
        >
          <span>{t.bookAppointment}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {digitalServices.map(srv => (
          <div key={srv.id} className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:shadow-xl transition flex flex-col justify-between">
            <div>
              {srv.imageUrl && (
                <div className="w-full h-36 rounded-xl overflow-hidden mb-3 border border-slate-100 bg-slate-50">
                  <img src={srv.imageUrl} alt={srv.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-center justify-between text-xs font-bold text-indigo-700 mb-3">
                <span className="bg-indigo-50 px-3 py-1 rounded-full">{srv.category}</span>
                <span className="text-emerald-600">Available</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {language === 'bn' && srv.bengaliName ? srv.bengaliName : srv.name}
              </h3>
              <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                {language === 'bn' && srv.bengaliDescription ? srv.bengaliDescription : srv.shortDescription}
              </p>

              <div className="space-y-2 mb-6 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Processing Time: <strong>{srv.processingTime}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Service Fee: <strong className="text-slate-900">{srv.charges}</strong></span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActivePage('book-appointment')}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow"
            >
              {t.bookNow}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
