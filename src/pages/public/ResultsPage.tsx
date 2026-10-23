import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../i18n/translations';
import { Award, Search, ChevronRight } from 'lucide-react';

interface ResultsPageProps {
  onSelectPost: (postId: string) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ onSelectPost }) => {
  const { posts, language } = useApp();
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');

  const results = posts.filter(p => p.contentType === 'result' && (
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  ));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-gradient-to-r from-teal-900 to-emerald-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span className="bg-teal-500/20 text-teal-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {language === 'bn' ? 'ফলাফল' : 'Exam Results'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mt-2">
            {t.results}
          </h1>
          <p className="text-teal-100 text-sm mt-2 max-w-xl">
            {language === 'bn' ? 'বোর্ড ও প্রতিযোগিতামূলক পরীক্ষার ফলাফল এবং মেধাতালিকা।' : 'Check examination results, merit lists, and cut-off marks.'}
          </p>
        </div>
        <div className="w-full md:w-80">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search results..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-teal-600/40 rounded-xl text-sm text-white placeholder-teal-200 outline-none focus:bg-white focus:text-slate-900 transition"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-500">
            No examination results found.
          </div>
        ) : (
          results.map(res => (
            <div
              key={res.id}
              onClick={() => onSelectPost(res.id)}
              className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:shadow-xl transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-teal-800 mb-3">
                  <span className="bg-teal-100 px-3 py-1 rounded-full">{res.organization || 'Board'}</span>
                  <span className="text-emerald-600">Published</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition mb-2">
                  {language === 'bn' && res.bengaliTitle ? res.bengaliTitle : res.title}
                </h3>
                <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                  {language === 'bn' && res.bengaliSummary ? res.bengaliSummary : res.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Result: <strong className="text-emerald-600">Declared</strong></span>
                <span className="text-teal-700 group-hover:underline flex items-center gap-1 font-bold">
                  Check Result <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
