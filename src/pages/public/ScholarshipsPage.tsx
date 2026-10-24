import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../i18n/translations';
import { GraduationCap, Search, ChevronRight } from 'lucide-react';
import { ShareLinkButton } from '../../components/ShareLinkButton';

interface ScholarshipsPageProps {
  onSelectPost: (postId: string) => void;
}

export const ScholarshipsPage: React.FC<ScholarshipsPageProps> = ({ onSelectPost }) => {
  const { posts, language } = useApp();
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');

  const scholarships = posts.filter(p => p.contentType === 'scholarship' && (
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.organization && p.organization.toLowerCase().includes(searchQuery.toLowerCase()))
  ));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {language === 'bn' ? 'শিক্ষাবৃত্তি' : 'Scholarship Portal'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mt-2">
            {t.latestScholarships}
          </h1>
          <p className="text-blue-100 text-sm mt-2 max-w-xl">
            {language === 'bn' ? 'স্বামী বিবেকানন্দ, ঐক্যশ্রী ও ন্যাশনাল স্কলারশিপ পোর্টালের সমস্ত বৃত্তির তথ্য।' : 'Discover financial assistance, eligibility criteria, and application procedures for students.'}
          </p>
        </div>
        <div className="w-full md:w-80">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search scholarships..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-blue-600/40 rounded-xl text-sm text-white placeholder-blue-200 outline-none focus:bg-white focus:text-slate-900 transition"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scholarships.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-500">
            No scholarships found matching your criteria.
          </div>
        ) : (
          scholarships.map(sch => (
            <div
              key={sch.id}
              onClick={() => onSelectPost(sch.id)}
              className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:shadow-xl transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {sch.featuredImage && (
                  <div className="w-full h-36 rounded-xl overflow-hidden mb-3 border border-slate-100 bg-slate-50">
                    <img src={sch.featuredImage} alt={sch.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </div>
                )}
                <div className="flex items-center justify-between text-xs font-bold text-blue-700 mb-3">
                  <span className="bg-blue-100 px-3 py-1 rounded-full">{sch.organization}</span>
                  <span>Amount: {sch.amount || 'Varies'}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition mb-2">
                  {language === 'bn' && sch.bengaliTitle ? sch.bengaliTitle : sch.title}
                </h3>
                <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                  {language === 'bn' && sch.bengaliSummary ? sch.bengaliSummary : sch.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <ShareLinkButton post={sch} />
                <span>Last Date: <strong className="text-slate-900">{sch.lastDate || 'Open'}</strong></span>
                <span className="text-blue-600 group-hover:underline flex items-center gap-1 font-bold">
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
