import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { AuthModal } from './components/AuthModal';
import { WhatsAppSupportWidget } from './components/WhatsAppSupportWidget';

import { HomePage } from './pages/public/HomePage';
import { JobsPage } from './pages/public/JobsPage';
import { ScholarshipsPage } from './pages/public/ScholarshipsPage';
import { ExamUpdatesPage } from './pages/public/ExamUpdatesPage';
import { AdmitCardsPage } from './pages/public/AdmitCardsPage';
import { ResultsPage } from './pages/public/ResultsPage';
import { AdmissionUpdatesPage } from './pages/public/AdmissionUpdatesPage';
import { StudyMaterialsPage } from './pages/public/StudyMaterialsPage';
import { DigitalServicesPage } from './pages/public/DigitalServicesPage';
import { BookAppointmentPage } from './pages/public/BookAppointmentPage';
import { AboutUsPage, ContactUsPage, PrivacyPolicyPage, TermsPage, DisclaimerPage, OtpConsentPolicyPage } from './pages/public/AboutContactLegal';
import { ContentDetailPage } from './pages/public/ContentDetailPage';
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

function MainApp() {
  const { currentUser, websiteSections } = useApp();
  const [activePage, setActivePage] = useState<string>('home');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false); // Automatically prompt first-visit registration if unauthenticated

  useEffect(() => {
    if (currentUser) {
      setAuthOpen(false);
    }
  }, [currentUser]);

  // Parse post identifier from URL (query string, pathname, or hash)
  const parsePostFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const queryPostId = params.get('postId') || params.get('id') || params.get('slug');
    if (queryPostId) return queryPostId;

    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);

    const staticRoutes = [
      'home', 'jobs', 'scholarships', 'exam-updates', 'admit-cards',
      'results', 'admissions', 'study-materials', 'digital-services',
      'book-appointment', 'about-us', 'contact-us', 'privacy-policy',
      'terms', 'disclaimer', 'otp-consent', 'customer-dashboard',
      'admin-dashboard', 'super-admin-dashboard'
    ];

    if (segments.length >= 2) {
      return segments[segments.length - 1];
    } else if (segments.length === 1 && !staticRoutes.includes(segments[0])) {
      return segments[0];
    }

    if (window.location.hash) {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const hashSegments = hash.split('?')[0].split('/').filter(Boolean);
      if (hashSegments.length >= 2) {
        return hashSegments[hashSegments.length - 1];
      }
    }

    return null;
  };

  useEffect(() => {
    const syncRouteFromUrl = () => {
      const extractedPostId = parsePostFromUrl();
      if (extractedPostId) {
        setSelectedPostId(extractedPostId);
        setActivePage('detail');
      } else {
        const path = window.location.pathname.replace(/^\//, '').split('/')[0];
        if (path && [
          'jobs', 'scholarships', 'exam-updates', 'admit-cards', 
          'results', 'admissions', 'study-materials', 'digital-services', 
          'book-appointment', 'about-us', 'contact-us', 'privacy-policy', 
          'terms', 'disclaimer', 'otp-consent', 'customer-dashboard', 
          'admin-dashboard'
        ].includes(path)) {
          setActivePage(path);
        }
      }
    };

    syncRouteFromUrl();
    window.addEventListener('popstate', syncRouteFromUrl);
    return () => window.removeEventListener('popstate', syncRouteFromUrl);
  }, []);

  const handleSelectPost = (postId: string) => {
    setSelectedPostId(postId);
    setActivePage('detail');
    window.history.pushState({ postId }, '', `/?postId=${postId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    // Check if activePage matches any published custom section slug
    const matchedSection = (websiteSections || []).find(s => s.slug === activePage && s.status === 'published');
    if (matchedSection) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {matchedSection.bannerImage && typeof matchedSection.bannerImage === 'string' && (
            <div className="w-full h-64 rounded-3xl overflow-hidden shadow-xl bg-slate-200 dark:bg-slate-800">
              <img 
                src={matchedSection.bannerImage} 
                alt={matchedSection.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-md border border-slate-200 dark:border-slate-800 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
              Dynamic Section
            </span>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">{matchedSection.title}</h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{matchedSection.description}</p>
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Layout Preset: <strong className="uppercase text-indigo-600">{matchedSection.layout}</strong></span>
              <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">Published & Active</span>
            </div>
          </div>
        </div>
      );
    }

    // Protected routes check for unauthenticated visitors
    if ((activePage === 'customer-dashboard' || activePage === 'admin-dashboard' || activePage === 'super-admin-dashboard' || activePage === 'book-appointment') && !currentUser) {
      return (
        <div className="max-w-md mx-auto my-20 bg-[#0F172A] border border-[#263B5A] p-8 rounded-3xl text-center text-white space-y-4 shadow-2xl">
          <h2 className="text-xl font-black text-[#00D4FF]">Registration Required</h2>
          <p className="text-xs text-[#94A3B8]">
            You must register or sign in to access protected portal services, bookings, and dashboards.
          </p>
          <button
            onClick={() => setAuthOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white font-bold rounded-xl text-sm shadow-lg shadow-[#2563EB]/30 border border-[#00D4FF]/40 cursor-pointer"
          >
            Sign Up / Sign In Now
          </button>
        </div>
      );
    }

    // Role-based access control
    if ((activePage === 'admin-dashboard' || activePage === 'super-admin-dashboard')) {
      const isSuperAdmin = currentUser?.role === 'super_admin';
      const isAdmin = currentUser?.role === 'admin' || isSuperAdmin;
      
      if (activePage === 'super-admin-dashboard' && !isSuperAdmin) {
        return (
          <div className="max-w-md mx-auto my-20 bg-rose-950/40 border border-rose-500/40 p-8 rounded-3xl text-center text-white space-y-4 shadow-2xl">
            <h2 className="text-xl font-black text-rose-400">Access Denied</h2>
            <p className="text-xs text-rose-200">
              Super Administrator permissions are required to view this dashboard.
            </p>
            <button
              onClick={() => setActivePage('home')}
              className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Return to Homepage
            </button>
          </div>
        );
      }
      
      if (activePage === 'admin-dashboard' && !isAdmin) {
        return (
          <div className="max-w-md mx-auto my-20 bg-rose-950/40 border border-rose-500/40 p-8 rounded-3xl text-center text-white space-y-4 shadow-2xl">
            <h2 className="text-xl font-black text-rose-400">Access Denied</h2>
            <p className="text-xs text-rose-200">
              Administrator permissions are required to view the Admin Dashboard.
            </p>
            <button
              onClick={() => setActivePage('home')}
              className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Return to Homepage
            </button>
          </div>
        );
      }
    }


    switch (activePage) {
      case 'home':
        return <HomePage setActivePage={setActivePage} onSelectPost={handleSelectPost} />;
      case 'jobs':
        return <JobsPage onSelectPost={handleSelectPost} />;
      case 'scholarships':
        return <ScholarshipsPage onSelectPost={handleSelectPost} />;
      case 'exam-updates':
        return <ExamUpdatesPage onSelectPost={handleSelectPost} />;
      case 'admit-cards':
        return <AdmitCardsPage onSelectPost={handleSelectPost} />;
      case 'results':
        return <ResultsPage onSelectPost={handleSelectPost} />;
      case 'admissions':
        return <AdmissionUpdatesPage onSelectPost={handleSelectPost} />;
      case 'study-materials':
        return <StudyMaterialsPage />;
      case 'digital-services':
        return <DigitalServicesPage setActivePage={setActivePage} />;
      case 'book-appointment':
        return <BookAppointmentPage />;
      case 'about-us':
        return <AboutUsPage />;
      case 'contact-us':
        return <ContactUsPage />;
      case 'privacy-policy':
        return <PrivacyPolicyPage />;
      case 'terms':
        return <TermsPage />;
      case 'disclaimer':
        return <DisclaimerPage />;
      case 'otp-consent':
        return <OtpConsentPolicyPage />;
      case 'customer-dashboard':
        return <CustomerDashboard />;
      case 'admin-dashboard':
        return <AdminDashboard setActivePage={setActivePage} />;
      case 'detail':
        return <ContentDetailPage postId={selectedPostId || ''} onBack={() => setActivePage('home')} />;
      default:
        return <HomePage setActivePage={setActivePage} onSelectPost={handleSelectPost} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-indigo-600 selection:text-white transition-colors duration-300">
      <Navbar 
        activePage={activePage} 
        setActivePage={(page) => { setActivePage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAuth={() => setAuthOpen(true)}
      />

      <main className="flex-grow">
        {renderPage()}
      </main>

      <Footer setActivePage={(page) => { setActivePage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />

      <SearchModal 
        isOpen={searchOpen} 
        onClose={() => setSearchOpen(false)} 
        onSelectPost={handleSelectPost} 
      />

      <AuthModal 
        isOpen={authOpen} 
        onClose={() => setAuthOpen(false)} 
      />

      <WhatsAppSupportWidget activePage={activePage} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
