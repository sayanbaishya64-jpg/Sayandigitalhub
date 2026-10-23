import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { 
  Briefcase, GraduationCap, CalendarCheck, BookOpen, MonitorSmartphone, 
  CalendarClock, Globe, Search, User as UserIcon, Menu, X, Shield, LogOut, Award, FileText, Bell, Sun, Moon, Sparkles, Radio
} from 'lucide-react';

interface NavbarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, setActivePage, onOpenSearch, onOpenAuth }) => {
  const { language, setLanguage, currentUser, logout, announcements, isDarkMode, toggleDarkMode, settings, websiteSections } = useApp();
  const t = translations[language];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const baseNavItems = [
    { id: 'home', label: language === 'bn' ? 'হোম' : 'Home', icon: Briefcase },
    { id: 'jobs', label: language === 'bn' ? 'সরকারি চাকরি' : 'Govt Jobs', icon: Briefcase },
    { id: 'scholarships', label: language === 'bn' ? 'বৃত্তি' : 'Scholarships', icon: GraduationCap },
    { id: 'exam-updates', label: language === 'bn' ? 'পরীক্ষা' : 'Exam Updates', icon: CalendarCheck },
    { id: 'admit-cards', label: language === 'bn' ? 'এডমিট কার্ড' : 'Admit Cards', icon: FileText },
    { id: 'results', label: language === 'bn' ? 'ফলাফল' : 'Results', icon: Award },
    { id: 'admissions', label: language === 'bn' ? 'ভর্তি' : 'Admissions', icon: GraduationCap },
    { id: 'study-materials', label: language === 'bn' ? 'স্টাডি মেটেরিয়াল' : 'Study Materials', icon: BookOpen },
    { id: 'digital-services', label: language === 'bn' ? 'ডিজিটাল পরিষেবা' : 'Digital Services', icon: MonitorSmartphone },
    { id: 'book-appointment', label: language === 'bn' ? 'অ্যাপয়েন্টমেন্ট' : 'Book Appointment', icon: CalendarClock },
  ];

  const dynamicNavItems = (websiteSections || [])
    .filter(s => s.status === 'published')
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map(s => ({
      id: s.slug,
      label: s.title || s.name,
      icon: Briefcase
    }));

  const navItemsMap = new Map();
  [...baseNavItems, ...dynamicNavItems].forEach(item => {
    if (!navItemsMap.has(item.id)) {
      navItemsMap.set(item.id, item);
    }
  });
  const navItems = Array.from(navItemsMap.values());

  return (
    <header className="sticky top-0 z-50 bg-[#0F172A] text-white border-b border-[#263B5A] shadow-2xl transition-colors duration-300">
      {/* Subtle blue illumination glow at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent opacity-70"></div>

      {/* MOBILE HEADER LAYOUT (Two Rows as requested) */}
      <div className="block md:hidden px-2.5 py-2 space-y-2 relative">
        {/* ROW 1: [ ☰ ] [ Circular SDH Logo ] SAYAN DIGITAL HUB [ Circular Sign In ] */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Hamburger Menu */}
            <button
              onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setUserMenuOpen(false); }}
              className="w-11 h-11 rounded-xl bg-[#080D1F] border border-[#263B5A] text-[#00D4FF] hover:border-[#00D4FF] focus:outline-none transition shrink-0 flex items-center justify-center shadow-sm"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Circular SDH Logo (44px x 44px) */}
            <div 
              onClick={() => { setActivePage('home'); setMobileMenuOpen(false); setUserMenuOpen(false); }}
              className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#7C3AED] via-[#2563EB] to-[#00D4FF] flex items-center justify-center text-white font-black text-xs shadow-md shadow-[#2563EB]/40 border border-[#00D4FF]/50 cursor-pointer shrink-0 transition hover:scale-105 overflow-hidden"
              title="Sayan Digital Hub Home"
              aria-label="Sayan Digital Hub Logo"
            >
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                'SDH'
              )}
            </div>

            {/* Website Title & Subtitle */}
            <div 
              onClick={() => { setActivePage('home'); setMobileMenuOpen(false); setUserMenuOpen(false); }}
              className="cursor-pointer min-w-0 flex-1 px-0.5"
            >
              <span className="text-xs font-black tracking-tight text-white block truncate">
                SAYAN DIGITAL HUB
              </span>
              <span className="text-[9px] font-medium text-[#00D4FF] block tracking-widest uppercase truncate">
                AI & Digital Portal
              </span>
            </div>
          </div>

          {/* Circular Sign In / User Button (44px x 44px) */}
          {currentUser ? (
            <div className="relative shrink-0">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-11 h-11 rounded-full bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-[#2563EB]/25 border border-[#00D4FF]/40 hover:brightness-110 transition overflow-hidden"
                title={currentUser.name}
                aria-label="User Account Menu"
              >
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  currentUser.name.charAt(0).toUpperCase()
                )}
              </button>

              {/* User Dropdown for Mobile */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#0F172A] rounded-2xl shadow-2xl border border-[#263B5A] py-2 z-50 text-white animate-fadeIn">
                  <div className="px-4 py-2 border-b border-[#263B5A]">
                    <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-[#94A3B8] truncate">{currentUser.email}</p>
                  </div>
                  {currentUser.role?.toLowerCase().includes('admin') && (
                    <button
                      onClick={() => { setActivePage('admin-dashboard'); setUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-[#00D4FF] font-semibold hover:bg-[#080D1F] flex items-center gap-2"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      {t.adminDashboard}
                    </button>
                  )}
                  <button
                    onClick={() => { setActivePage('customer-dashboard'); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-[#080D1F] flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#00D4FF]" />
                    {t.dashboard}
                  </button>
                  <div className="border-t border-[#263B5A] my-1"></div>
                  <button
                    onClick={() => { logout(); setUserMenuOpen(false); setActivePage('home'); }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {t.logout}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="w-11 h-11 rounded-full bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white flex items-center justify-center shadow-lg shadow-[#2563EB]/25 border border-[#00D4FF]/40 shrink-0 hover:brightness-110 transition"
              title="Sign In"
              aria-label="Sign In"
            >
              <UserIcon className="w-5 h-5 text-white" />
            </button>
          )}
        </div>


        {/* ROW 3: Active Page Indicator */}
        <div className="pt-1.5 border-t border-[#263B5A]/60 flex items-center justify-between text-xs px-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00D4FF] shadow-[0_0_8px_#00D4FF]"></span>
            <span className="text-white font-bold text-xs tracking-tight">
              {(() => {
                const allPages: Record<string, { en: string; bn: string }> = {
                  'home': { en: 'Home', bn: 'হোম' },
                  'jobs': { en: 'Job Updates', bn: 'সরকারি চাকরি' },
                  'scholarships': { en: 'Scholarship Updates', bn: 'বৃত্তি' },
                  'exam-updates': { en: 'Exam Updates', bn: 'পরীক্ষা আপডেট' },
                  'admit-cards': { en: 'Admit Cards', bn: 'এডমিট কার্ড' },
                  'results': { en: 'Results', bn: 'ফলাফল' },
                  'admissions': { en: 'Admissions', bn: 'ভর্তি' },
                  'study-materials': { en: 'Study Materials', bn: 'স্টাডি মেটেরিয়াল' },
                  'digital-services': { en: 'Digital Services', bn: 'ডিজিটাল পরিষেবা' },
                  'book-appointment': { en: 'Book Appointment', bn: 'অ্যাপয়েন্টমেন্ট' },
                  'about-us': { en: 'About Us', bn: 'আমাদের সম্পর্কে' },
                  'contact-us': { en: 'Contact Us', bn: 'যোগাযোগ করুন' },
                  'admin-dashboard': { en: 'Admin Dashboard', bn: 'অ্যাডমিন ড্যাশবোর্ড' },
                  'customer-dashboard': { en: 'Customer Dashboard', bn: 'গ্রাহক ড্যাশবোর্ড' }
                };
                if (allPages[activePage]) {
                  return language === 'bn' ? allPages[activePage].bn : allPages[activePage].en;
                }
                return activePage.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
              })()}
            </span>
          </div>
          <span className="text-[10px] text-[#00D4FF] font-semibold bg-[#080D1F] px-2 py-0.5 rounded border border-[#263B5A]">
            Active Page
          </span>
        </div>
      </div>

      {/* DESKTOP & TABLET NAVBAR LAYOUT (Single Unified Header) */}
      <div className="hidden md:block max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-20 py-2">
          {/* Left: Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setActivePage('home')}>
            <div className="w-11 h-11 bg-gradient-to-tr from-[#7C3AED] via-[#2563EB] to-[#00D4FF] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[#2563EB]/40 border border-[#00D4FF]/40 overflow-hidden shrink-0">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                'SDH'
              )}
            </div>
            <div>
              <span className="text-lg xl:text-xl font-black text-white tracking-tight block leading-tight">
                {t.brandName}
              </span>
              <span className="text-[10px] text-[#00D4FF] font-semibold tracking-wider uppercase block">
                Digital Services & Information Hub
              </span>
            </div>
          </div>

          {/* Center: Navigation Links in Single Header (No scroll panel) */}
          <nav className="hidden xl:flex items-center flex-wrap gap-1 xl:gap-1.5 justify-center flex-1 mx-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    isActive 
                      ? 'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/30 border border-[#00D4FF]/40' 
                      : 'text-[#94A3B8] hover:text-white hover:bg-[#080D1F]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#00D4FF]" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right: Actions & Tools */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-1.5 bg-[#080D1F] border border-[#263B5A] hover:border-[#00D4FF] px-2.5 py-2 rounded-xl text-[#00D4FF] transition text-xs font-semibold cursor-pointer"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#00D4FF]" />
              <span className="hidden sm:inline">{language === 'en' ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* Search Button */}
            <button
              onClick={onOpenSearch}
              className="p-2.5 rounded-xl bg-[#080D1F] border border-[#263B5A] hover:border-[#00D4FF] text-[#94A3B8] hover:text-white transition flex items-center gap-1.5 cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4 text-[#00D4FF]" />
              <span className="hidden 2xl:inline text-xs font-medium">Search...</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl bg-[#080D1F] border border-[#263B5A] hover:border-[#00D4FF] text-[#94A3B8] hover:text-white transition cursor-pointer"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#00D4FF]" />}
            </button>

            {/* Auth / Account */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2.5 pr-3 py-1.5 bg-[#080D1F] border border-[#263B5A] rounded-xl hover:border-[#00D4FF] transition cursor-pointer"
                >
                  {currentUser.avatarUrl ? (
                    <img 
                      src={currentUser.avatarUrl} 
                      alt={currentUser.name} 
                      className="w-7 h-7 rounded-full object-cover border-2 border-[#00D4FF] shadow-sm"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] text-white font-bold flex items-center justify-center text-xs shadow-sm">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-left hidden lg:block">
                    <span className="text-xs font-bold text-white block truncate max-w-[100px]">{currentUser.name}</span>
                    <span className="text-[9px] text-[#00D4FF] font-semibold uppercase">{currentUser.role.replace('_', ' ')}</span>
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#0F172A] rounded-2xl shadow-2xl border border-[#263B5A] py-2 z-50 text-white">
                    <div className="px-4 py-2 border-b border-[#263B5A]">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                        {currentUser.authProvider === 'google' && (
                          <span className="text-[9px] font-bold bg-[#2563EB]/30 text-[#00D4FF] px-1.5 py-0.5 rounded border border-[#00D4FF]/30">
                            Google
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#94A3B8] truncate">{currentUser.email}</p>
                    </div>

                    {(currentUser.role.toLowerCase().includes('admin')) && (
                      <button
                        onClick={() => { setActivePage('admin-dashboard'); setUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-xs text-[#00D4FF] font-semibold hover:bg-[#080D1F] flex items-center gap-2"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        {t.adminDashboard}
                      </button>
                    )}

                    <button
                      onClick={() => { setActivePage('customer-dashboard'); setUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:bg-[#080D1F] flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-[#00D4FF]" />
                      {t.dashboard}
                    </button>

                    <div className="border-t border-[#263B5A] my-1"></div>

                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); setActivePage('home'); }}
                      className="w-full text-left px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {t.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:brightness-110 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg shadow-[#2563EB]/30 border border-[#00D4FF]/40 transition cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#00D4FF]" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown Modal */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F172A] border-b border-[#263B5A] px-4 pt-3 pb-6 space-y-1.5 shadow-2xl animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActivePage(item.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive ? 'bg-[#2563EB] text-white shadow-md border border-[#00D4FF]/40' : 'text-slate-200 hover:bg-[#080D1F] hover:text-[#00D4FF]'
                }`}
              >
                <Icon className="w-5 h-5 text-[#00D4FF]" />
                {item.label}
              </button>
            );
          })}
          <div className="pt-3 border-t border-[#263B5A] flex gap-2">
            <button
              onClick={() => { setLanguage(language === 'en' ? 'bn' : 'en'); }}
              className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#00D4FF] bg-[#080D1F] border border-[#263B5A] rounded-xl hover:border-[#00D4FF]"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'বাংলা (Bengali)' : 'English'}</span>
            </button>
            <button
              onClick={() => { setActivePage('about-us'); setMobileMenuOpen(false); }}
              className="flex-1 py-2.5 text-center text-xs font-semibold text-[#94A3B8] bg-[#080D1F] border border-[#263B5A] rounded-xl hover:text-white"
            >
              {t.aboutUs}
            </button>
            <button
              onClick={() => { setActivePage('contact-us'); setMobileMenuOpen(false); }}
              className="flex-1 py-2.5 text-center text-xs font-semibold text-[#94A3B8] bg-[#080D1F] border border-[#263B5A] rounded-xl hover:text-white"
            >
              {t.contactUs}
            </button>
          </div>

        </div>
      )}
    </header>
  );
};
