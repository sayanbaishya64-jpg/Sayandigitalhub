import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../i18n/translations';
import { 
  Briefcase, GraduationCap, CalendarCheck, BookOpen, MonitorSmartphone, 
  CalendarClock, Search, ArrowRight, Shield, ChevronRight, CheckCircle2, Sparkles
} from 'lucide-react';

interface HomePageProps {
  setActivePage: (page: string) => void;
  onSelectPost: (postId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setActivePage, onSelectPost }) => {
  const { posts, digitalServices, language, settings } = useApp();
  const t = translations[language];
  const [heroSearchQuery, setHeroSearchQuery] = useState('');

  const quickCards = [
    {
      id: 'jobs',
      title: language === 'bn' ? 'সর্বশেষ সরকারি চাকরি' : 'Latest Government Jobs',
      description: language === 'bn' ? 'পশ্চিমবঙ্গ ও কেন্দ্রীয় সরকারের নতুন চাকরির বিজ্ঞপ্তি, শূন্যপদ এবং যোগ্যতা।' : 'Explore government recruitment notifications, vacancies, eligibility criteria.',
      icon: Briefcase,
      route: 'jobs',
      categoryLabel: language === 'bn' ? 'নিয়োগ পোর্টাল' : 'Recruitment Portal',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-[#059669] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40',
      accentColor: 'emerald',
      buttonText: language === 'bn' ? 'চাকরি দেখুন' : 'Explore Jobs'
    },
    {
      id: 'scholarships',
      title: language === 'bn' ? 'স্কলারশিপ ও বৃত্তি' : 'Scholarships & Aid',
      description: language === 'bn' ? 'স্বামী বিবেকানন্দ, ঐক্যশ্রী ও জাতীয় বৃত্তির সুযোগ ও আবেদন পদ্ধতি।' : 'Discover scholarship opportunities, financial assistance, and application procedures.',
      icon: GraduationCap,
      route: 'scholarships',
      categoryLabel: language === 'bn' ? 'অর্থনৈতিক সহায়তা' : 'Financial Aid',
      iconBg: 'bg-purple-50 dark:bg-purple-950/40 text-[#7C3AED] dark:text-purple-400 border border-purple-200 dark:border-purple-800/40',
      accentColor: 'purple',
      buttonText: language === 'bn' ? 'বৃত্তি খুঁজুন' : 'Find Scholarships'
    },
    {
      id: 'exam-updates',
      title: language === 'bn' ? 'পরীক্ষার আপডেট' : 'Exam Updates',
      description: language === 'bn' ? 'পরীক্ষার তারিখ, রুটিন, নোটিশ, এডমিট কার্ড ও ফলাফল ঘোষণা।' : 'Stay informed about examination notifications, schedules, and admit cards.',
      icon: CalendarCheck,
      route: 'exam-updates',
      categoryLabel: language === 'bn' ? 'অফিসিয়াল নোটিশ' : 'Official Notices',
      iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-[#D97706] dark:text-amber-400 border border-amber-200 dark:border-amber-800/40',
      accentColor: 'amber',
      buttonText: language === 'bn' ? 'আপডেট দেখুন' : 'View Exam Updates'
    },
    {
      id: 'book-appointment',
      title: language === 'bn' ? 'অ্যাপয়েন্টমেন্ট বুকিং' : 'Book Appointment',
      description: language === 'bn' ? 'অনলাইন ফর্ম ফিলাপ, স্কলারশিপ ও ডিজিটাল পরিষেবার জন্য সময় বুক করুন।' : 'Schedule an appointment for available digital services and application assistance.',
      icon: CalendarClock,
      route: 'book-appointment',
      categoryLabel: language === 'bn' ? 'অনলাইন বুকিং' : 'Online Booking',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-[#4338CA] dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40',
      accentColor: 'indigo',
      buttonText: language === 'bn' ? 'বুক করুন' : 'Book Now'
    },
    {
      id: 'study-materials',
      title: language === 'bn' ? 'স্টাডি মেটেরিয়াল' : 'Study Materials',
      description: language === 'bn' ? 'ডব্লিউবিসিএস, মাধ্যমিক, উচ্চমাধ্যমিক ও কলেজের ফ্রি পিডিএফ নোটস।' : 'Access educational notes, PDFs, semester resources, and competitive exam guides.',
      icon: BookOpen,
      route: 'study-materials',
      categoryLabel: language === 'bn' ? 'ফ্রি নোটস ও পিডিএফ' : 'Free Notes & PDFs',
      iconBg: 'bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 border border-blue-200 dark:border-blue-800/40',
      accentColor: 'blue',
      buttonText: language === 'bn' ? 'নোটস দেখুন' : 'Explore Materials'
    },
    {
      id: 'digital-services',
      title: language === 'bn' ? 'ডিজিটাল পরিষেবা' : 'Digital Services',
      description: language === 'bn' ? 'প্যান কার্ড, আধার সংশোধন ও অনলাইন সার্ভিসের বিশ্বস্ত সহায়তা।' : 'Explore online services and request assistance with digital applications.',
      icon: MonitorSmartphone,
      route: 'digital-services',
      categoryLabel: language === 'bn' ? 'বিশেষজ্ঞ সহায়তা' : 'Expert Services',
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/40 text-[#0891B2] dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/40',
      accentColor: 'cyan',
      buttonText: language === 'bn' ? 'পরিষেবা দেখুন' : 'Explore Services'
    }
  ];

  const jobsList = posts.filter(p => p.contentType === 'job');
  const scholarshipsList = posts.filter(p => p.contentType === 'scholarship');

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (heroSearchQuery.trim()) {
      setActivePage('jobs');
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-b from-[#0B1220] via-[#111C35] to-[#0B1220] text-white py-20 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-[#263449]">
        {/* Ambient Radial Blue Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#2563EB]/15 blur-[120px] rounded-full pointer-events-none"></div>
        {/* Faint Dot Grid Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          {/* Brand Badge */}
          <div className="inline-flex items-center gap-2 bg-[#172033]/90 border border-[#263449] px-4 py-1.5 rounded-full text-xs font-semibold text-slate-200 shadow-sm">
            <Shield className="w-4 h-4 text-[#F5B942]" />
            <span>{settings.siteName}</span>
            <span className="text-[#A7B2C5]">·</span>
            <span className="text-[#00D4FF] font-bold">{language === 'bn' ? 'অফিসিয়াল ডিজিটাল পোর্টাল' : 'Official Digital Portal'}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white max-w-4xl mx-auto">
            {settings.siteName}
            <span className="block bg-gradient-to-r from-[#00D4FF] via-indigo-300 to-[#2563EB] bg-clip-text text-transparent font-extrabold text-xl sm:text-3xl lg:text-4xl mt-3">
              {language === 'bn' ? settings.bengaliTagline : settings.tagline}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#A7B2C5] max-w-2xl mx-auto font-medium leading-relaxed">
            {settings.subTagline}
          </p>

          {/* Hero Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto bg-white dark:bg-[#111827] p-2 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-200 dark:border-[#263449]">
            <Search className="w-5 h-5 text-[#2563EB] ml-3 shrink-0" />
            <input
              type="text"
              value={heroSearchQuery}
              onChange={(e) => setHeroSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm sm:text-base outline-none font-medium px-2 bg-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit();
                }
              }}
            />
            <button
              type="submit"
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-6 py-3 rounded-xl transition shadow-md shrink-0 flex items-center gap-2 text-sm cursor-pointer"
            >
              <span>{t.searchButton}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Keyword Suggestions */}
          <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs font-semibold text-[#A7B2C5]">
            <span className="text-slate-400 self-center mr-1">Popular:</span>
            <button 
              onClick={() => { setHeroSearchQuery('West Bengal Jobs'); setActivePage('jobs'); }}
              className="bg-[#172033] hover:bg-[#2563EB]/20 hover:text-white px-3 py-1.5 rounded-lg border border-[#263449] transition cursor-pointer"
            >
              # West Bengal Jobs
            </button>
            <button 
              onClick={() => { setHeroSearchQuery('SVMCM Scholarship'); setActivePage('scholarships'); }}
              className="bg-[#172033] hover:bg-[#2563EB]/20 hover:text-white px-3 py-1.5 rounded-lg border border-[#263449] transition cursor-pointer"
            >
              # SVMCM Scholarship
            </button>
            <button 
              onClick={() => { setHeroSearchQuery('Admit Card'); setActivePage('admit-cards'); }}
              className="bg-[#172033] hover:bg-[#2563EB]/20 hover:text-white px-3 py-1.5 rounded-lg border border-[#263449] transition cursor-pointer"
            >
              # Admit Card 2026
            </button>
            <button 
              onClick={() => { setHeroSearchQuery('Study Notes'); setActivePage('study-materials'); }}
              className="bg-[#172033] hover:bg-[#2563EB]/20 hover:text-white px-3 py-1.5 rounded-lg border border-[#263449] transition cursor-pointer"
            >
              # Study Notes PDFs
            </button>
          </div>
        </div>
      </section>

      {/* QUICK ACCESS CATEGORY CARDS (6 Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickCards.map((card) => {
            const Icon = card.icon;
            return (
              <div 
                key={card.id}
                onClick={() => setActivePage(card.route)}
                className="bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-md dark:shadow-none border border-slate-200 dark:border-[#263449] hover:shadow-xl dark:hover:border-[#2563EB]/50 hover:-translate-y-1 transition duration-300 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.iconBg} shadow-sm group-hover:scale-105 transition duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-[#A7B2C5]">
                      {card.categoryLabel}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-[#00D4FF] transition mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-[#A7B2C5] leading-relaxed mb-6">
                    {card.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-[#263449]">
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-[#00D4FF] transition flex items-center gap-1">
                    {card.buttonText}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#172033] group-hover:bg-[#2563EB] group-hover:text-white flex items-center justify-center transition">
                    <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* LATEST GOVERNMENT JOBS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8 border-b border-slate-200 dark:border-[#263449] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#059669] dark:text-emerald-400 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
              <span>{language === 'bn' ? 'নিয়োগ পোর্টাল' : 'Recruitment Portal'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {t.latestGovtJobs}
            </h2>
          </div>
          <button
            onClick={() => setActivePage('jobs')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#2563EB] dark:text-[#00D4FF] hover:underline transition cursor-pointer"
          >
            <span>{language === 'bn' ? 'সব নোটিশ দেখুন' : 'View All Jobs'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {jobsList.length === 0 ? (
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-10 border border-slate-200 dark:border-[#263449] text-center space-y-3">
            <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No active job notices at the moment</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Check back soon for new government recruitment notifications.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobsList.slice(0, 3).map(job => (
              <div 
                key={job.id}
                onClick={() => onSelectPost(job.id)}
                className="bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-[#263449] hover:shadow-md dark:hover:border-emerald-500/40 transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {job.featuredImage && (
                    <div className="w-full h-36 rounded-xl overflow-hidden mb-4 border border-slate-100 dark:border-[#263449] bg-slate-50 dark:bg-[#080D18]">
                      <img src={job.featuredImage} alt={job.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#A7B2C5] mb-3">
                    <span className="font-semibold text-[#059669] dark:text-emerald-400">
                      {job.organization || 'Govt Department'}
                    </span>
                    <span>Deadline: {job.lastDate || 'Open'}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-[#00D4FF] transition mb-2">
                    {language === 'bn' && job.bengaliTitle ? job.bengaliTitle : job.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-[#A7B2C5] line-clamp-2 mb-4 leading-relaxed">
                    {language === 'bn' && job.bengaliSummary ? job.bengaliSummary : job.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-[#263449] flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-[#A7B2C5]">
                    Vacancies: <strong className="text-slate-800 dark:text-slate-200">{job.totalVacancies || 'Multiple'}</strong>
                  </span>
                  <span className="font-bold text-[#2563EB] dark:text-[#00D4FF] group-hover:underline flex items-center gap-1">
                    {t.viewDetails} <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* LATEST SCHOLARSHIPS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8 border-b border-slate-200 dark:border-[#263449] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              <span>{language === 'bn' ? 'শিক্ষাবৃত্তি' : 'Financial Aid'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {t.latestScholarships}
            </h2>
          </div>
          <button
            onClick={() => setActivePage('scholarships')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#2563EB] dark:text-[#00D4FF] hover:underline transition cursor-pointer"
          >
            <span>{language === 'bn' ? 'সব বৃত্তি দেখুন' : 'View All Scholarships'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {scholarshipsList.length === 0 ? (
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-10 border border-slate-200 dark:border-[#263449] text-center space-y-3">
            <GraduationCap className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No active scholarship notices</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Check back soon for new scholarship & grant opportunities.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scholarshipsList.map(sch => (
              <div 
                key={sch.id}
                onClick={() => onSelectPost(sch.id)}
                className="bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-[#263449] hover:shadow-md dark:hover:border-purple-500/40 transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {sch.featuredImage && (
                    <div className="w-full h-36 rounded-xl overflow-hidden mb-4 border border-slate-100 dark:border-[#263449] bg-slate-50 dark:bg-[#080D18]">
                      <img src={sch.featuredImage} alt={sch.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-purple-700 dark:text-purple-300 font-semibold mb-3">
                    <span>{sch.organization || 'Educational Trust'}</span>
                    <span className="bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-md border border-purple-200 dark:border-purple-800/40 text-[#7C3AED] dark:text-purple-400">
                      Amount: {sch.amount || 'Varies'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-[#00D4FF] transition mb-2">
                    {language === 'bn' && sch.bengaliTitle ? sch.bengaliTitle : sch.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-[#A7B2C5] line-clamp-2 mb-4 leading-relaxed">
                    {language === 'bn' && sch.bengaliSummary ? sch.bengaliSummary : sch.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-[#263449] flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-[#A7B2C5]">Last Date: {sch.lastDate || 'Open'}</span>
                  <span className="font-bold text-[#2563EB] dark:text-[#00D4FF] group-hover:underline flex items-center gap-1">
                    {t.viewDetails} <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* DIGITAL SERVICES FEATURE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-[#0B1220] via-[#111C35] to-[#0B1220] text-white rounded-3xl p-8 sm:p-12 border border-[#263449] shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Lighting */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#06B6D4]/10 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="max-w-3xl mb-10 relative z-10">
            <span className="text-xs font-bold text-[#06B6D4] tracking-wider uppercase bg-[#06B6D4]/10 px-3 py-1 rounded-full border border-[#06B6D4]/30">
              {language === 'bn' ? 'বিশেষজ্ঞ সেবা' : 'Expert Assistance'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black mt-3 text-white">
              {t.availableDigitalServices}
            </h2>
            <p className="text-[#A7B2C5] text-sm mt-2 leading-relaxed">
              {language === 'bn' ? 'অনলাইন ফর্ম ফিলাপ, সার্টিফিকেটের আবেদন ও স্কলারশিপ জমা দেওয়ার জন্য আমাদের পোর্টাল বিশেষজ্ঞদের সময় বুক করুন।' : 'Get dedicated assistance for online form submission, document correction, scholarship applications, and digital certificates.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {digitalServices.slice(0, 3).map(srv => (
              <div key={srv.id} className="bg-[#172033] rounded-2xl p-6 border border-[#263449] flex flex-col justify-between hover:border-[#06B6D4]/50 transition duration-300">
                <div>
                  <span className="text-[10px] font-bold text-[#00D4FF] uppercase tracking-wider">
                    {srv.category}
                  </span>
                  <h3 className="text-base font-bold text-white mt-2 mb-2">
                    {language === 'bn' && srv.bengaliName ? srv.bengaliName : srv.name}
                  </h3>
                  <p className="text-xs text-[#A7B2C5] line-clamp-2 mb-4 leading-relaxed">
                    {language === 'bn' && srv.bengaliDescription ? srv.bengaliDescription : srv.shortDescription}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-[#263449]">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-[#A7B2C5]">Service Fee:</span>
                    <span className="text-[#F5B942] font-bold">{srv.charges}</span>
                  </div>
                  <button
                    onClick={() => setActivePage('book-appointment')}
                    className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl transition shadow cursor-pointer"
                  >
                    {t.bookNow}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
