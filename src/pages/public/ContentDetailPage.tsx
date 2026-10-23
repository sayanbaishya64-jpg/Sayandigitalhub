import React from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../i18n/translations';
import { 
  ArrowLeft, Building, ExternalLink, Globe, AlertCircle
} from 'lucide-react';

interface ContentDetailPageProps {
  postId: string;
  onBack: () => void;
}

export const ContentDetailPage: React.FC<ContentDetailPageProps> = ({ postId, onBack }) => {
  const { posts, language, setLanguage, currentUser } = useApp();
  const t = translations[language];

  const post = posts.find(p => p.id === postId || p.slug === postId);

  // Is post accessible?
  const isAdmin = ['super_admin', 'admin', 'web_manager', 'web_editor'].includes(currentUser?.role as string);
  const isAccessible = post && (post.status === 'published' || isAdmin);

  if (!post || !isAccessible) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Post Not Found</h2>
          <p className="text-sm text-slate-600 dark:text-[#A7B2C5] max-w-md mx-auto">
            The post you are looking for is not available or has been removed.
          </p>
        </div>
        <button 
          onClick={onBack} 
          className="px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl text-xs shadow-lg transition cursor-pointer"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const title = language === 'bn' && post.bengaliTitle ? post.bengaliTitle : post.title;
  const summary = language === 'bn' && post.bengaliSummary ? post.bengaliSummary : post.summary;
  const content = language === 'bn' && post.bengaliContent ? post.bengaliContent : post.content;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Navigation Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#2563EB] bg-white dark:bg-[#111827] px-4 py-2.5 rounded-xl shadow-sm border border-slate-200 dark:border-[#263449] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#2563EB]" />
          <button
            onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
            className="text-xs font-bold text-[#00D4FF] bg-[#172033] px-3 py-2 rounded-xl border border-[#263449] hover:border-[#00D4FF] transition cursor-pointer"
          >
            {language === 'en' ? 'বাংলা (Bengali)' : 'English'}
          </button>
        </div>
      </div>

      {/* Main Post Container */}
      <article className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 dark:border-[#263449] space-y-6">
        {/* Post Metadata Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-[#2563EB]/10 text-[#2563EB] dark:text-[#00D4FF] text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wider border border-[#2563EB]/20">
            {post.contentType}
          </span>
          {post.organization && (
            <span className="bg-slate-100 dark:bg-[#172033] text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-1.5 border border-slate-200 dark:border-[#263449]">
              <Building className="w-3.5 h-3.5 text-[#2563EB]" />
              {post.organization}
            </span>
          )}
          {post.status !== 'published' && (
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-md uppercase">
              Draft Mode
            </span>
          )}
          <span className="text-xs text-slate-400">Published on: {post.publishedAt || post.createdAt}</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          {title}
        </h1>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-[#263449] shadow-md max-h-[420px] bg-slate-100 dark:bg-[#080D18]">
            <img 
              src={post.featuredImage} 
              alt={title} 
              className="w-full h-full max-h-[420px] object-cover object-center" 
            />
          </div>
        )}

        {/* Executive Summary */}
        <p className="text-base font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-[#172033] p-5 rounded-2xl border border-slate-200 dark:border-[#263449] leading-relaxed">
          {summary}
        </p>

        {/* Highlights Table/Grid */}
        {(post.totalVacancies || post.qualification || post.ageLimit || post.applicationFee || post.lastDate || post.amount) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4 border-y border-slate-100 dark:border-[#263449]">
            {post.totalVacancies && (
              <div className="bg-slate-50 dark:bg-[#172033] p-4 rounded-xl border border-slate-200 dark:border-[#263449]">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Total Vacancies</span>
                <span className="text-base font-black text-slate-900 dark:text-white mt-1 block">{post.totalVacancies}</span>
              </div>
            )}
            {post.qualification && (
              <div className="bg-slate-50 dark:bg-[#172033] p-4 rounded-xl border border-slate-200 dark:border-[#263449]">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Qualification</span>
                <span className="text-base font-black text-slate-900 dark:text-white mt-1 block">{post.qualification}</span>
              </div>
            )}
            {post.ageLimit && (
              <div className="bg-slate-50 dark:bg-[#172033] p-4 rounded-xl border border-slate-200 dark:border-[#263449]">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Age Limit</span>
                <span className="text-base font-black text-slate-900 dark:text-white mt-1 block">{post.ageLimit}</span>
              </div>
            )}
            {post.applicationFee && (
              <div className="bg-slate-50 dark:bg-[#172033] p-4 rounded-xl border border-slate-200 dark:border-[#263449]">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Application Fee</span>
                <span className="text-base font-black text-slate-900 dark:text-white mt-1 block">{post.applicationFee}</span>
              </div>
            )}
            {post.amount && (
              <div className="bg-slate-50 dark:bg-[#172033] p-4 rounded-xl border border-slate-200 dark:border-[#263449]">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Scholarship Amount</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{post.amount}</span>
              </div>
            )}
            {post.lastDate && (
              <div className="bg-rose-50/70 dark:bg-rose-950/30 p-4 rounded-xl border border-rose-200 dark:border-rose-900/50">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide block">Application Deadline</span>
                <span className="text-base font-black text-rose-700 dark:text-rose-300 mt-1 block">{post.lastDate}</span>
              </div>
            )}
          </div>
        )}

        {/* Detailed Body Content */}
        <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm sm:text-base space-y-4 leading-relaxed whitespace-pre-line pt-2">
          {content}
        </div>

        {/* External Application Links */}
        <div className="pt-4 border-t border-slate-100 dark:border-[#263449] flex flex-wrap gap-4">
          {post.applyUrl && (
            <a
              href={post.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition text-xs sm:text-sm cursor-pointer"
            >
              <span>{t.applyNow}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {post.officialUrl && (
            <a
              href={post.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-slate-100 dark:bg-[#172033] hover:bg-slate-200 dark:hover:bg-[#263449] text-slate-800 dark:text-white font-bold px-6 py-3.5 rounded-xl transition text-xs sm:text-sm cursor-pointer border border-slate-200 dark:border-[#263449]"
            >
              <span>Official Notification / Website</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </article>
    </div>
  );
};
