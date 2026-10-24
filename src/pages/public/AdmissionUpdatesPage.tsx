import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../i18n/translations';
import { GraduationCap, Search, ChevronRight } from 'lucide-react';
import { ShareLinkButton } from '../../components/ShareLinkButton';

interface AdmissionUpdatesPageProps {
  onSelectPost: (postId: string) => void;
}

export const AdmissionUpdatesPage: React.FC<AdmissionUpdatesPageProps> = ({ onSelectPost }) => {
  const { posts, language } = useApp();
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');

  const admissions = posts.filter(p => p.contentType === 'admission' && (
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  ));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-gradient-to-r from-indigo-900 to-blue-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {language === 'bn' ? 'ভর্তি আপডেট' : 'Admissions'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mt-2">
            {t.admissions}
          </h1>
          <p className="text-indigo-100 text-sm mt-2 max-w-xl">
            {language === 'bn' ? 'কলেজ ও বিশ্ববিদ্যালয়ে ভর্তি, যোগ্যতা এবং আসন সংক্রান্ত বিজ্ঞপ্তি।' : 'College and university admission notifications, eligibility, and application deadlines.'}
          </p>
        </div>
        <div className="w-full md:w-80">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search admissions..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-indigo-600/40 rounded-xl text-sm text-white placeholder-indigo-200 outline-none focus:bg-white focus:text-slate-900 transition"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {admissions.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-500">
            No admission updates currently available. Check back soon.
          </div>
        ) : (
          admissions.map(adm => (
            <div
              key={adm.id}
              onClick={() => onSelectPost(adm.id)}
              className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:shadow-xl transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-indigo-700 mb-3">
                  <span className="bg-indigo-100 px-3 py-1 rounded-full">{adm.organization || 'University'}</span>
                  <span>Open</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition mb-2">
                  {language === 'bn' && adm.bengaliTitle ? adm.bengaliTitle : adm.title}
                </h3>
                <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                  {language === 'bn' && adm.bengaliSummary ? adm.bengaliSummary : adm.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <ShareLinkButton post={adm} />
                <span>Deadline: <strong className="text-slate-900">{adm.lastDate || 'Open'}</strong></span>
                <span className="text-indigo-600 group-hover:underline flex items-center gap-1 font-bold">
                  {t.viewDetails} <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
