import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../i18n/translations';
import { Briefcase, Search, Calendar, Building, ChevronRight, ExternalLink } from 'lucide-react';

interface JobsPageProps {
  onSelectPost: (postId: string) => void;
}

export const JobsPage: React.FC<JobsPageProps> = ({ onSelectPost }) => {
  const { posts, language, isPostsLoaded } = useApp();
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');

  const jobs = posts.filter(p => p.contentType === 'job' && (
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.organization && p.organization.toLowerCase().includes(searchQuery.toLowerCase()))
  ));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-800 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {language === 'bn' ? 'সরকারি চাকরি' : 'Recruitment Portal'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mt-2">
            {t.latestGovtJobs}
          </h1>
          <p className="text-emerald-100 text-sm mt-2 max-w-xl">
            {language === 'bn' ? 'পশ্চিমবঙ্গ এবং সমস্ত কেন্দ্রীয় সরকারি চাকরির বিজ্ঞপ্তি, যোগ্যতা এবং শেষ তারিখ।' : 'Explore verified government job notifications, eligibility criteria, and application links.'}
          </p>
        </div>
        <div className="w-full md:w-80">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search jobs by title or organization..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-emerald-600/40 rounded-xl text-sm text-white placeholder-emerald-200 outline-none focus:bg-white focus:text-slate-900 transition"
            />
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!isPostsLoaded ? (
          <div className="col-span-full flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-500">
            No government jobs found matching your criteria.
          </div>
        ) : (
          jobs.map(job => (
            <div
              key={job.id}
              onClick={() => onSelectPost(job.id)}
              className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:shadow-xl transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {job.featuredImage && (
                  <div className="w-full h-36 rounded-xl overflow-hidden mb-3 border border-slate-100 bg-slate-50">
                    <img src={job.featuredImage} alt={job.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </div>
                )}
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-3">
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                    {job.organization || 'Govt'}
                  </span>
                  <span className="text-rose-600 font-semibold">Deadline: {job.lastDate || 'N/A'}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition mb-2">
                  {language === 'bn' && job.bengaliTitle ? job.bengaliTitle : job.title}
                </h3>
                <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                  {language === 'bn' && job.bengaliSummary ? job.bengaliSummary : job.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(`${window.location.origin}/?postId=${job.id}`);
                    alert('Link copied successfully!');
                  }}
                  className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-bold hover:bg-indigo-100 transition"
                >
                  Share Link
                </button>
                <span>Vacancies: <strong className="text-slate-900">{job.totalVacancies || 'Multiple'}</strong></span>
                <span className="text-emerald-600 group-hover:underline flex items-center gap-1 font-bold">
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
