import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../i18n/translations';
import { FileText, Search, ChevronRight } from 'lucide-react';

interface AdmitCardsPageProps {
  onSelectPost: (postId: string) => void;
}

export const AdmitCardsPage: React.FC<AdmitCardsPageProps> = ({ onSelectPost }) => {
  const { posts, language } = useApp();
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');

  const admits = posts.filter(p => p.contentType === 'admit' && (
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  ));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {language === 'bn' ? 'এডমিট কার্ড' : 'Hall Tickets'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mt-2">
            {t.admitCards}
          </h1>
          <p className="text-purple-100 text-sm mt-2 max-w-xl">
            {language === 'bn' ? 'পরীক্ষার এডমিট কার্ড ডাউনলোড লিঙ্ক এবং গুরুত্বপূর্ণ নির্দেশিকা।' : 'Download your exam admit cards and hall tickets safely.'}
          </p>
        </div>
        <div className="w-full md:w-80">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search admit cards..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-purple-600/40 rounded-xl text-sm text-white placeholder-purple-200 outline-none focus:bg-white focus:text-slate-900 transition"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {admits.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-500">
            No admit cards available right now.
          </div>
        ) : (
          admits.map(ad => (
            <div
              key={ad.id}
              onClick={() => onSelectPost(ad.id)}
              className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:shadow-xl transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-purple-700 mb-3">
                  <span className="bg-purple-100 px-3 py-1 rounded-full">{ad.organization || 'Board'}</span>
                  <span className="text-emerald-600">Released</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition mb-2">
                  {language === 'bn' && ad.bengaliTitle ? ad.bengaliTitle : ad.title}
                </h3>
                <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                  {language === 'bn' && ad.bengaliSummary ? ad.bengaliSummary : ad.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Status: <strong className="text-emerald-600">Available</strong></span>
                <span className="text-purple-600 group-hover:underline flex items-center gap-1 font-bold">
                  Download Admit <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
