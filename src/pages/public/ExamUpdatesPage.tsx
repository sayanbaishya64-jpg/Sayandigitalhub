import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../i18n/translations';
import { CalendarCheck, Search, ChevronRight } from 'lucide-react';
import { ShareLinkButton } from '../../components/ShareLinkButton';

interface ExamUpdatesPageProps {
  onSelectPost: (postId: string) => void;
}

export const ExamUpdatesPage: React.FC<ExamUpdatesPageProps> = ({ onSelectPost }) => {
  const { posts, language } = useApp();
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');

  const exams = posts.filter(p => p.contentType === 'exam' && (
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.organization && p.organization.toLowerCase().includes(searchQuery.toLowerCase()))
  ));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-gradient-to-r from-amber-950 to-amber-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {language === 'bn' ? 'পরীক্ষার আপডেট' : 'Examinations'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mt-2">
            {t.latestExamUpdates}
          </h1>
          <p className="text-amber-100 text-sm mt-2 max-w-xl">
            {language === 'bn' ? 'বোর্ড ও প্রতিযোগিতামূলক পরীক্ষার রুটিন, নোটিশ ও সময়সূচি।' : 'Stay informed about examination notifications, schedules, and important dates.'}
          </p>
        </div>
        <div className="w-full md:w-80">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search exam updates..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-amber-600/40 rounded-xl text-sm text-white placeholder-amber-200 outline-none focus:bg-white focus:text-slate-900 transition"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-500">
            No examination updates found.
          </div>
        ) : (
          exams.map(ex => (
            <div
              key={ex.id}
              onClick={() => onSelectPost(ex.id)}
              className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:shadow-xl transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-amber-800 mb-3">
                  <span className="bg-amber-100 px-3 py-1 rounded-full">{ex.organization}</span>
                  <span>Exam Date: {ex.examDate || 'TBA'}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition mb-2">
                  {language === 'bn' && ex.bengaliTitle ? ex.bengaliTitle : ex.title}
                </h3>
                <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                  {language === 'bn' && ex.bengaliSummary ? ex.bengaliSummary : ex.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <ShareLinkButton post={ex} />
                <span>Status: <strong className="text-slate-900">Active Notice</strong></span>
                <span className="text-amber-700 group-hover:underline flex items-center gap-1 font-bold">
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
