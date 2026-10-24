import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Post, StudyMaterial, DigitalService, Appointment, Category, 
  WebsiteSettings, Announcement, User, AuditLog, ContentType, PostStatus, ContentTemplateDef, WebsiteSection,
  WhatsAppConfig, WhatsAppSectionPrefill, AvailabilityRule, AvailabilityRuleType, DEFAULT_HOURLY_TIME_SLOTS
} from '../types';
import { 
  db, 
  auth, 
  signInWithFirebaseGoogle, 
  registerWithEmailPassword,
  loginWithEmailPassword,
  sendPasswordReset,
  resendVerificationEmail,
  signOutFirebase, 
  cleanPayload,
  handleFirestoreError, 
  OperationType 
} from '../lib/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  deleteDoc, 
  updateDoc,
  onSnapshot,
  getDocs,
  query,
  where,
  limit,
  deleteField
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface AppContextType {
  language: 'en' | 'bn';
  setLanguage: (lang: 'en' | 'bn') => void;
  currentUser: User | null;
  sessionRevokedMessage: string | null;
  clearSessionRevokedMessage: () => void;
  login: (email: string, password: string) => Promise<{ error?: string; success?: boolean; message?: string }>;
  registerCustomer: (name: string, email: string, password: string, phone?: string) => Promise<{ error?: string; success?: boolean; message?: string }>;
  sendPasswordResetEmail: (email: string) => Promise<{ error?: string; success?: boolean; message?: string; note?: string }>;
  resendVerification: () => Promise<{ error?: string; success?: boolean }>;
  logout: () => void;
  signInWithGoogle: () => Promise<{ error?: string; user?: any }>;
  loginWithGoogleMock: (email?: string, name?: string) => void;
  isFirebaseReady: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void> | void;
  updatePost: (id: string, post: Partial<Post>) => Promise<void> | void;
  deletePost: (id: string) => Promise<void> | void;
  
  studyMaterials: StudyMaterial[];
  addStudyMaterial: (mat: Omit<StudyMaterial, 'id' | 'createdAt'>) => Promise<void> | void;
  deleteStudyMaterial: (id: string) => Promise<void> | void;
  
  digitalServices: DigitalService[];
  addDigitalService: (service: Omit<DigitalService, 'id'>) => Promise<void> | void;
  updateDigitalService: (id: string, service: Partial<DigitalService>) => Promise<void> | void;
  deleteDigitalService: (id: string) => Promise<void> | void;
  
  appointments: Appointment[];
  bookAppointment: (apt: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => Promise<void> | void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void> | void;
  
  categories: Category[];
  addCategory: (cat: Omit<Category, 'id'>) => Promise<void> | void;
  deleteCategory: (id: string) => Promise<void> | void;
  
  settings: WebsiteSettings;
  updateSettings: (newSettings: Partial<WebsiteSettings>) => Promise<void> | void;
  updateLogo: (logoUrl: string) => Promise<void> | void;
  
  announcements: Announcement[];
  addAnnouncement: (ann: Omit<Announcement, 'id'>) => Promise<void> | void;
  deleteAnnouncement: (id: string) => Promise<void> | void;
  
  users: User[];
  updateUserRole: (userId: string, role: User['role']) => void;
  toggleUserStatus: (userId: string) => void;
  
  auditLogs: AuditLog[];
  logAction: (action: string, details: string) => void;

  templates: ContentTemplateDef[];
  addTemplate: (tmpl: Omit<ContentTemplateDef, 'id'>) => Promise<void> | void;
  deleteTemplate: (id: string) => Promise<void> | void;

  websiteSections: WebsiteSection[];
  addSection: (section: Omit<WebsiteSection, 'id'>) => Promise<void> | void;
  updateSection: (id: string, section: Partial<WebsiteSection>) => Promise<void> | void;
  deleteSection: (id: string) => Promise<void> | void;

  whatsappConfig: WhatsAppConfig;
  updateWhatsAppConfig: (newConfig: Partial<WhatsAppConfig>, publish?: boolean) => Promise<{ success: boolean; error?: string }>;

  availabilityRules: AvailabilityRule[];
  addAvailabilityRule: (rule: Omit<AvailabilityRule, 'id' | 'createdAt'>) => Promise<{ success: boolean; conflictCount: number; conflictAppointments: Appointment[] }>;
  updateAvailabilityRule: (id: string, rule: Partial<AvailabilityRule>) => Promise<void>;
  deleteAvailabilityRule: (id: string) => Promise<void>;
  checkSlotAvailability: (date: string, timeSlot: string, serviceId?: string) => { 
    available: boolean; 
    reason?: string; 
    bookedCount: number; 
    maxCapacity: number; 
    remainingCapacity: number; 
  };
  checkDateAvailability: (date: string, serviceId?: string) => { 
    available: boolean; 
    reason?: string; 
    isFullyBooked?: boolean;
    totalSlots: number;
    availableSlotsCount: number;
    fullyBookedSlotsCount: number;
  };
}

export const defaultWhatsAppConfig: WhatsAppConfig = {
  phoneNumber: '8116957965',
  countryCode: '+91',
  enabled: true,
  showOnHomepage: true,
  position: 'bottom-right',
  buttonLabel: 'WhatsApp Help',
  tooltip: 'Need quick help? Chat with Sayan Digital Hub',
  heading: 'Sayan Digital Hub Support',
  description: 'Verified Business Support | Online Form Fillup, Scholarships & Cyber Cafe Services',
  defaultWelcomeMessage: 'Hello Sayan Digital Hub! I need assistance regarding online services and notifications.',
  businessHours: '9:00 AM – 9:00 PM (Monday to Saturday)',
  responseTimeNotice: 'Typically replies within 10 to 15 minutes',
  onlineStatus: 'auto',
  allowedPages: ['all'],
  status: 'published',
  sectionPrefills: [
    {
      sectionKey: 'general',
      sectionName: 'General Inquiries',
      prefillMessage: 'Hello Sayan Digital Hub, I have a general query regarding your digital portal and services.'
    },
    {
      sectionKey: 'jobs',
      sectionName: 'Government Job Form Fillup',
      prefillMessage: 'Hello Sayan Digital Hub, I need expert assistance for online government job application form fillup.'
    },
    {
      sectionKey: 'scholarships',
      sectionName: 'Scholarships (SVMCM / Oasis / NSP)',
      prefillMessage: 'Hello Sayan Digital Hub, I need guidance regarding SVMCM / Oasis scholarship application and documents.'
    },
    {
      sectionKey: 'digital-services',
      sectionName: 'Cyber Cafe & Online Services',
      prefillMessage: 'Hello Sayan Digital Hub, I want to inquire about PAN card / Aadhaar / Voter / Digital Cyber Cafe services.'
    },
    {
      sectionKey: 'study-materials',
      sectionName: 'Study Materials & Question Papers',
      prefillMessage: 'Hello Sayan Digital Hub, I am looking for competitive exam study notes and PDF materials.'
    },
    {
      sectionKey: 'book-appointment',
      sectionName: 'Appointment Verification',
      prefillMessage: 'Hello Sayan Digital Hub, I have an inquiry about scheduling or verifying my appointment slot.'
    }
  ]
};

const defaultSettings: WebsiteSettings = {
  siteName: "Sayan Digital Hub",
  tagline: "Your Gateway to Information and Digital Opportunities.",
  bengaliTagline: "তথ্য এবং ডিজিটাল সুযোগের আপনার বিশ্বস্ত প্রবেশদ্বার।",
  logoUrl: "",
  contactEmail: "support@sayandigitalhub.in",
  contactPhone: "8116957965",
  contactNumber: "8116957965",
  address: "Kolkata, West Bengal, India",
  location: "Kolkata, West Bengal, India",
  socialLinks: {
    facebook: "https://facebook.com/sayandigitalhub",
    telegram: "https://t.me/sayandigitalhub",
    whatsapp: "https://whatsapp.com/channel/sayandigitalhub",
    youtube: "https://youtube.com/@sayandigitalhub"
  },
  copyrightText: "© 2026 Sayan Digital Hub. All Rights Reserved.",
  defaultLanguage: "en",
  timezone: "Asia/Kolkata",
  primaryColor: "indigo",
  maxCapacityPerSlot: 5,
  officeStartTime: "09:00 AM",
  officeEndTime: "08:00 PM"
};

const initialUsers: User[] = [
  { id: 'usr-0', name: 'Sayan Baishya (Super Admin)', email: 'sayanbaishya64@gmail.com', password: 'Sayan8116@', role: 'super_admin', status: 'active', createdAt: '2026-01-01', phone: '9876543210' },
  { id: 'usr-1', name: 'Super Administrator', email: 'superadmin@sayandigitalhub.in', role: 'admin', status: 'active', createdAt: '2026-01-01' },
  { id: 'usr-2', name: 'Content Admin', email: 'admin@sayandigitalhub.in', role: 'admin', status: 'active', createdAt: '2026-01-10' },
  { id: 'usr-3', name: 'Rahul Student', email: 'rahul@gmail.com', role: 'customer', status: 'active', createdAt: '2026-02-15', phone: '9876543210' }
];

const initialCategories: Category[] = [
  { id: 'cat-1', name: 'West Bengal Govt Jobs', bengaliName: 'পশ্চিমবঙ্গ সরকারি চাকরি', slug: 'wb-govt-jobs', description: 'Latest recruitment notifications across WB departments.', icon: 'Briefcase', contentType: 'job' },
  { id: 'cat-2', name: 'Central Govt Jobs', bengaliName: 'কেন্দ্রীয় সরকারি চাকরি', slug: 'central-govt-jobs', description: 'UPSC, SSC, RRB, Banking and PSU recruitments.', icon: 'Building2', contentType: 'job' },
  { id: 'cat-3', name: 'Scholarships', bengaliName: 'স্কলারশিপ ও বৃত্তি', slug: 'scholarships', description: 'Swami Vivekananda, Oasis, National Scholarship Portal updates.', icon: 'GraduationCap', contentType: 'scholarship' },
  { id: 'cat-4', name: 'Exam Results', bengaliName: 'পরীক্ষার ফলাফল', slug: 'exam-results', description: 'WBCHSE, WBBSE, WBJEE, University results.', icon: 'Award', contentType: 'result' },
  { id: 'cat-5', name: 'Study Notes & PDFs', bengaliName: 'স্টাডি নোটস ও পিডিএফ', slug: 'study-notes', description: 'Semester notes, competitive exam guides.', icon: 'BookOpen', contentType: 'all' },
  { id: 'cat-6', name: 'Digital Services', bengaliName: 'ডিজিটাল পরিষেবা', slug: 'digital-services', description: 'Online form fillup, PAN, Aadhaar, Caste Certificate assistance.', icon: 'MonitorSmartphone', contentType: 'all' }
];

const initialPosts: Post[] = [
  {
    id: 'post-1',
    title: 'WB Police Constable Recruitment 2026: Apply Online for 12,500 Posts',
    bengaliTitle: 'পশ্চিমবঙ্গ পুলিশ কনস্টেবল নিয়োগ ২০২৬: ১২,৫০০ শূন্যপদে অনলাইন আবেদন',
    slug: 'wb-police-constable-recruitment-2026',
    contentType: 'job',
    summary: 'West Bengal Police Recruitment Board (WBPRB) has announced notification for Constable and Lady Constable positions. Eligibility, age limit, and application link inside.',
    bengaliSummary: 'পশ্চিমবঙ্গ পুলিশ রিক্রুটমেন্ট বোর্ডের পক্ষ থেকে কনস্টেবল ও লেডি কনস্টেবল পদের জন্য বিজ্ঞপ্তি প্রকাশিত হয়েছে।',
    content: 'The West Bengal Police Recruitment Board (WBPRB) invites online applications from eligible Indian citizens for recruitment to the post of Constables and Lady Constables in West Bengal Police 2026.\n\nTotal Vacancies: 12,500 posts.\nEducational Qualification: Madhyamik Examination (Class 10) passed from WBBSE or equivalent.\nAge Limit: 18 to 30 years as on 01/01/2026.\nApplication Fee: Rs. 170 for General/OBC, Rs. 20 for SC/ST.',
    bengaliContent: 'পশ্চিমবঙ্গ পুলিশ রিক্রুটমেন্ট বোর্ডের পক্ষ থেকে কনস্টেবল পদের জন্য অনলাইন আবেদন চাওয়া হয়েছে। মোট শূন্যপদ ১২,৫০০টি। শিক্ষাগত যোগ্যতা মাধ্যমিক পাশ। বয়স সীমা ১৮ থেকে ৩০ বছর।',
    categoryId: 'cat-1',
    organization: 'West Bengal Police Recruitment Board',
    totalVacancies: '12,500',
    qualification: 'Madhyamik (Class 10)',
    ageLimit: '18 - 30 Years',
    applicationFee: '₹170 (Gen/OBC), ₹20 (SC/ST)',
    lastDate: '2026-11-15',
    officialUrl: 'https://prb.wb.gov.in',
    applyUrl: 'https://wbpolice.gov.in',
    featuredImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    authorId: 'usr-1',
    status: 'published',
    createdAt: '2026-10-01',
    updatedAt: '2026-10-01',
    publishedAt: '2026-10-01'
  },
  {
    id: 'post-2',
    title: 'Swami Vivekananda Merit-cum-Means Scholarship (SVMCM) 2026-27',
    bengaliTitle: 'স্বামী বিবেকানন্দ মেরিট কাম মিন্স স্কলারশিপ (SVMCM) ২০২৬-২৭',
    slug: 'svmcm-scholarship-2026',
    contentType: 'scholarship',
    summary: 'Applications are invited for SVMCM Scholarship for Higher Secondary, undergraduate, postgraduate, and professional course students in West Bengal.',
    bengaliSummary: 'পশ্চিমবঙ্গের উচ্চ মাধ্যমিক, স্নাতক, স্নাতকোত্তর ও পেশাগত কোর্সের শিক্ষার্থীদের জন্য স্বামী বিবেকানন্দ স্কলারশিপের আবেদন শুরু হয়েছে।',
    content: 'Swami Vivekananda Merit-cum-Means Scholarship (Bikash Bhavan Scholarship) provides financial assistance to meritorious students belonging to economically weaker sections of West Bengal.\n\nScholarship Amount: Rs. 1,000 to Rs. 8,000 per month depending on the course.\nEligibility: Minimum 60% marks in H.S. or Graduation. Family income must be less than Rs. 2.5 Lakhs per annum.',
    bengaliContent: 'স্বামী বিবেকানন্দ মেরিট কাম মিন্স স্কলারশিপের মাধ্যমে পশ্চিমবঙ্গের মেধাবী ও আর্থিক দুর্বল শিক্ষার্থীদের প্রতি মাসে ১,০০০ থেকে ৮,০০০ টাকা পর্যন্ত আর্থিক সহায়তা প্রদান করা হয়।',
    categoryId: 'cat-3',
    organization: 'Higher Education Department, Govt of West Bengal',
    amount: '₹1,000 - ₹8,000 / month',
    qualification: 'Min 60% in Class 12 / Graduation',
    lastDate: '2026-12-31',
    officialUrl: 'https://svmcm.wbhed.gov.in',
    applyUrl: 'https://svmcm.wbhed.gov.in',
    featuredImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    authorId: 'usr-1',
    status: 'published',
    createdAt: '2026-10-05',
    updatedAt: '2026-10-05',
    publishedAt: '2026-10-05'
  },
  {
    id: 'post-3',
    title: 'WBCHSE Class 12 Higher Secondary Exam Routine 2027 Announced',
    bengaliTitle: 'উচ্চ মাধ্যমিক পরীক্ষা ২০২৭ এর রুটিন প্রকাশ করল সংসদ',
    slug: 'wbchse-hs-routine-2027',
    contentType: 'exam',
    summary: 'West Bengal Council of Higher Secondary Education (WBCHSE) has released the complete exam schedule for Class 12 board examinations 2027.',
    bengaliSummary: 'পশ্চিমবঙ্গ উচ্চ মাধ্যমিক শিক্ষা সংসদ ২০২৭ সালের উচ্চ মাধ্যমিক পরীক্ষার সম্পূর্ণ রুটিন প্রকাশ করেছে।',
    content: 'WBCHSE has announced that the Higher Secondary (Class 12) examinations for 2027 will commence from February 15, 2027. Exams will be held in a single shift from 10:00 AM to 1:15 PM.',
    categoryId: 'cat-4',
    organization: 'WBCHSE',
    examDate: '15 February 2027',
    officialUrl: 'https://wbchse.wb.gov.in',
    featuredImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    authorId: 'usr-2',
    status: 'published',
    createdAt: '2026-10-10',
    updatedAt: '2026-10-10',
    publishedAt: '2026-10-10'
  },
  {
    id: 'post-4',
    title: 'RRB NTPC Graduate & Undergraduate Recruitment 2026',
    bengaliTitle: 'আরআরবি এনটিপিসি স্নাতক ও উচ্চমাধ্যমিক স্তরের নিয়োগ ২০২৬',
    slug: 'rrb-ntpc-recruitment-2026',
    contentType: 'job',
    summary: 'Railway Recruitment Board (RRB) has released notification for NTPC posts including Station Master, Goods Train Manager, Junior Clerk, and Typist.',
    bengaliSummary: 'রেলওয়ে রিক্রুটমেন্ট বোর্ডের (RRB) পক্ষ থেকে NTPC পদের জন্য বিজ্ঞপ্তি প্রকাশিত হয়েছে।',
    content: 'Railway Recruitment Boards have invited online applications for Non-Technical Popular Categories (NTPC) posts. Total vacancies over 11,500 across India.',
    categoryId: 'cat-2',
    organization: 'Railway Recruitment Board (RRB)',
    totalVacancies: '11,558',
    qualification: 'Graduate / 12th Pass',
    lastDate: '2026-11-30',
    officialUrl: 'https://rrbapply.gov.in',
    featuredImage: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80',
    authorId: 'usr-1',
    status: 'published',
    createdAt: '2026-10-12',
    updatedAt: '2026-10-12',
    publishedAt: '2026-10-12'
  }
];

const initialStudyMaterials: StudyMaterial[] = [
  {
    id: 'mat-1',
    topicName: 'West Bengal Civil Service (WBCS) Complete General Studies Guide',
    bengaliTopicName: 'ডব্লিউবিসিএস সম্পূর্ণ সাধারণ জ্ঞান গাইড',
    subject: 'WBCS & Competitive Exams',
    shortDescription: 'Comprehensive study notes covering Indian History, Geography, Polity, Economy, and West Bengal GK.',
    detailedDescription: 'Curated PDF notes specifically designed for WBCS Preliminary and Main examinations.',
    classLevel: 'Competitive Exams',
    examination: 'WBCS / UPSC',
    author: 'Sayan Digital Hub Expert Panel',
    language: 'Both',
    fileUrl: 'https://drive.google.com/file/d/sample-wbcs-pdf/view',
    fileName: 'WBCS_Comprehensive_Guide_2026.pdf',
    fileType: 'drive',
    accessPermission: 'public',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-10-02'
  },
  {
    id: 'mat-2',
    topicName: 'Class 12 Physics Important Derivations & Formula Sheet',
    bengaliTopicName: 'দ্বাদশ শ্রেণির পদার্থবিদ্যা গুরুত্বপূর্ণ ডেরিভেশন ও ফর্মুলা',
    subject: 'Physics',
    shortDescription: 'Quick revision notes and formula collection for WBCHSE and CBSE Class 12 Physics Board Exams.',
    classLevel: 'Class 12',
    examination: 'WBCHSE Board Exam',
    author: 'Prof. A. Mukherjee',
    language: 'English',
    fileUrl: 'https://drive.google.com/file/d/sample-physics-pdf/view',
    fileName: 'Class12_Physics_Formulas.pdf',
    fileType: 'drive',
    accessPermission: 'public',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-10-04'
  }
];

const initialDigitalServices: DigitalService[] = [
  {
    id: 'srv-1',
    name: 'Government Job Online Form Fillup',
    bengaliName: 'সরকারি চাকরির অনলাইন ফর্ম ফিলাপ',
    category: 'Application Assistance',
    shortDescription: 'Expert assistance for filling up WBPSC, SSC, Railway, UPSC, and Police recruitment applications without errors.',
    detailedDescription: 'Our certified operators ensure accurate document upload, photo cropping, signature verification, and fee payment.',
    icon: 'Briefcase',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    eligibility: 'All Job Aspirants',
    requiredDocuments: ['Aadhaar Card', 'Educational Certificates', 'Passport Size Photo', 'Signature Specimen', 'Category Certificate (if applicable)'],
    process: '1. Submit your details & documents\n2. Document verification by our expert\n3. Form submission & fee payment\n4. Acknowledgement receipt sent via WhatsApp/Email',
    charges: '₹50 - ₹150 service charge + exam fee',
    processingTime: '30 - 45 Minutes',
    availability: true,
    bookingRequired: true
  },
  {
    id: 'srv-2',
    name: 'Scholarship Application Assistance (SVMCM / Oasis)',
    bengaliName: 'স্কলারশিপ আবেদন সহায়তা (SVMCM / Oasis)',
    category: 'Educational Services',
    shortDescription: 'Hassle-free online application support for Swami Vivekananda, Oasis, National Scholarship, and Minority scholarships.',
    icon: 'GraduationCap',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    eligibility: 'Students meeting scholarship criteria',
    requiredDocuments: ['Mark Sheet', 'Income Certificate', 'Bank Passbook', 'Admission Receipt', 'Aadhaar Card'],
    process: '1. Share academic & personal details\n2. Online form submission & document scanning\n3. Final printout and submission receipt provided',
    charges: '₹100 per application',
    processingTime: '1 Hour',
    availability: true,
    bookingRequired: true
  },
  {
    id: 'srv-3',
    name: 'PAN Card & Aadhaar Correction Assistance',
    bengaliName: 'প্যান কার্ড ও আধার সংশোধন সহায়তা',
    category: 'Identity Services',
    shortDescription: 'Fast and reliable assistance for new PAN card application, name/address correction, and Aadhaar linking.',
    icon: 'CreditCard',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    eligibility: 'Indian Citizens',
    requiredDocuments: ['Aadhaar Card', 'Mobile Number linked to Aadhaar', 'Supporting ID proof'],
    process: '1. Biometric verification or OTP authentication\n2. Data update application\n3. Tracking reference number provided',
    charges: '₹150 + Govt Fee',
    processingTime: '2 - 3 Working Days',
    availability: true,
    bookingRequired: false
  }
];

const initialAppointments: Appointment[] = [
  {
    id: 'apt-1',
    serviceId: 'srv-1',
    serviceName: 'Government Job Online Form Fillup',
    customerId: 'usr-3',
    customerName: 'Rahul Student',
    customerEmail: 'rahul@gmail.com',
    customerPhone: '9876543210',
    date: '2026-10-25',
    timeSlot: '11:00 AM - 12:00 PM',
    status: 'confirmed',
    notes: 'Need help for WB Police Constable application.',
    createdAt: '2026-10-15'
  }
];

const initialAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'WB Police Constable 2026 Application window is now open! Apply before 15 Nov.',
    bengaliTitle: 'পশ্চিমবঙ্গ পুলিশ কনস্টেবল ২০২৬ আবেদন শুরু হয়েছে! ১৫ নভেম্বরের মধ্যে আবেদন করুন।',
    text: 'Candidates are advised to read the official notification carefully before submitting online application.',
    bengaliText: 'অনলাইন আবেদন করার পূর্বে অফিসিয়াল বিজ্ঞপ্তি মনোযোগ সহকারে পড়ার পরামর্শ দেওয়া হচ্ছে।',
    startDate: '2026-10-01',
    endDate: '2026-11-15',
    linkUrl: '/jobs',
    active: true
  }
];

const initialTemplates: ContentTemplateDef[] = [
  {
    id: 'tmpl-1',
    name: 'Government Job Standard Template',
    contentType: 'job',
    description: 'Standard template for posting government job notifications, eligibility, vacancies, and application links.',
    fields: [
      { name: 'organization', label: 'Organization Name', type: 'text', required: true },
      { name: 'totalVacancies', label: 'Total Vacancies', type: 'text', required: true },
      { name: 'qualification', label: 'Educational Qualification', type: 'text', required: true },
      { name: 'ageLimit', label: 'Age Limit', type: 'text', required: false },
      { name: 'applicationFee', label: 'Application Fee', type: 'text', required: false },
      { name: 'lastDate', label: 'Application Deadline', type: 'date', required: true },
      { name: 'officialUrl', label: 'Official Website URL', type: 'url', required: false },
      { name: 'applyUrl', label: 'Online Application URL', type: 'url', required: false },
      { name: 'featuredImage', label: 'Featured Recruitment Banner / Poster Image', type: 'image', required: false }
    ]
  },
  {
    id: 'tmpl-2',
    name: 'Scholarship Announcement Template',
    contentType: 'scholarship',
    description: 'Template for publishing scholarship opportunities, eligibility criteria, and financial aid details.',
    fields: [
      { name: 'organization', label: 'Provider / Organization', type: 'text', required: true },
      { name: 'amount', label: 'Scholarship Amount / Benefit', type: 'text', required: true },
      { name: 'qualification', label: 'Eligibility / Min Marks', type: 'text', required: true },
      { name: 'lastDate', label: 'Application Deadline', type: 'date', required: true },
      { name: 'officialUrl', label: 'Official Website URL', type: 'url', required: false },
      { name: 'applyUrl', label: 'Application Portal URL', type: 'url', required: false },
      { name: 'featuredImage', label: 'Scholarship Banner / Poster Image', type: 'image', required: false }
    ]
  },
  {
    id: 'tmpl-3',
    name: 'Examination Update Template',
    contentType: 'exam',
    description: 'Template for examination notifications, routine schedules, and instructions.',
    fields: [
      { name: 'organization', label: 'Conducting Body / Board', type: 'text', required: true },
      { name: 'examDate', label: 'Examination Date', type: 'text', required: true },
      { name: 'officialUrl', label: 'Official Notice URL', type: 'url', required: false },
      { name: 'featuredImage', label: 'Examination Schedule / Routine Poster', type: 'image', required: false }
    ]
  },
  {
    id: 'tmpl-4',
    name: 'Study Materials & Drive PDF Template',
    contentType: 'material',
    description: 'Template for uploading or linking semester notes, competitive exam guides, and Google Drive PDFs.',
    fields: [
      { name: 'subject', label: 'Subject / Discipline', type: 'text', required: true },
      { name: 'classLevel', label: 'Class / Semester / Level', type: 'text', required: false },
      { name: 'university', label: 'University / Board / Exam', type: 'text', required: false },
      { name: 'author', label: 'Author / Faculty / Panel', type: 'text', required: false },
      { name: 'language', label: 'Material Language', type: 'text', required: true },
      { name: 'fileUrl', label: 'Google Drive File URL / PDF Link', type: 'url', required: true },
      { name: 'accessPermission', label: 'Access Level (public / registered / restricted)', type: 'text', required: true },
      { name: 'featuredImage', label: 'Study Material Cover / PDF Thumbnail', type: 'image', required: false }
    ]
  },
  {
    id: 'tmpl-5',
    name: 'Digital Services Listing Template',
    contentType: 'service',
    description: 'Template for adding public digital services, application assistance, and booking requirements.',
    fields: [
      { name: 'category', label: 'Service Category', type: 'text', required: true },
      { name: 'charges', label: 'Service Fee / Charges', type: 'text', required: true },
      { name: 'processingTime', label: 'Estimated Processing Time', type: 'text', required: true },
      { name: 'eligibility', label: 'Target Audience / Eligibility', type: 'text', required: false },
      { name: 'requiredDocuments', label: 'Required Documents List', type: 'textarea', required: false },
      { name: 'process', label: 'Step-by-step Process', type: 'textarea', required: false },
      { name: 'officialWebsite', label: 'Official Portal Website', type: 'url', required: false },
      { name: 'featuredImage', label: 'Digital Service Banner / Poster Image', type: 'image', required: false }
    ]
  },
  {
    id: 'tmpl-6',
    name: 'Admit Card & Hall Ticket Template',
    contentType: 'admit',
    description: 'Template for announcing admit card releases and hall ticket download links.',
    fields: [
      { name: 'organization', label: 'Exam Conducting Authority', type: 'text', required: true },
      { name: 'examDate', label: 'Exam Date / Period', type: 'text', required: false },
      { name: 'applyUrl', label: 'Admit Card Download URL', type: 'url', required: true },
      { name: 'featuredImage', label: 'Admit Card Release Notice Banner', type: 'image', required: false }
    ]
  },
  {
    id: 'tmpl-7',
    name: 'Examination Results Template',
    contentType: 'result',
    description: 'Template for publishing exam results, cut-off marks, and merit lists.',
    fields: [
      { name: 'organization', label: 'Exam Conducting Authority', type: 'text', required: true },
      { name: 'resultDate', label: 'Result Declaration Date', type: 'text', required: false },
      { name: 'officialUrl', label: 'Official Result Check URL', type: 'url', required: true },
      { name: 'featuredImage', label: 'Result Announcement Banner Image', type: 'image', required: false }
    ]
  },
  {
    id: 'tmpl-8',
    name: 'Admission Updates Template',
    contentType: 'admission',
    description: 'Template for college and university admission announcements, seat matrix, and deadlines.',
    fields: [
      { name: 'organization', label: 'College / University / Institute', type: 'text', required: true },
      { name: 'qualification', label: 'Eligible Courses / Criteria', type: 'text', required: true },
      { name: 'lastDate', label: 'Admission Application Deadline', type: 'date', required: true },
      { name: 'applyUrl', label: 'Admission Portal URL', type: 'url', required: false },
      { name: 'featuredImage', label: 'Admission Notification / Campus Banner', type: 'image', required: false }
    ]
  },
  {
    id: 'tmpl-9',
    name: 'Education News Article Template',
    contentType: 'news',
    description: 'Template for educational journalism, government orders, syllabus changes, and notifications.',
    fields: [
      { name: 'organization', label: 'Source / Author', type: 'text', required: false },
      { name: 'officialUrl', label: 'Reference / Source URL', type: 'url', required: false },
      { name: 'featuredImage', label: 'News Article Featured Banner / Photo', type: 'image', required: false }
    ]
  }
];

const initialWebsiteSections: WebsiteSection[] = [
  {
    id: 'sec-1',
    name: 'Job Updates',
    title: 'Government Job Notifications & Recruitment',
    slug: 'jobs',
    description: 'Latest West Bengal and Central government job openings, eligibility, and applications.',
    icon: 'Briefcase',
    layout: 'card-grid',
    showOnHomepage: true,
    showInDesktopNav: true,
    showInMobileNav: true,
    showInFooter: true,
    displayOrder: 1,
    colorTheme: 'indigo',
    status: 'published',
    seoTitle: 'Govt Job Updates 2026 - Sayan Digital Hub',
    seoDescription: 'Find latest West Bengal and Central government recruitment updates.'
  },
  {
    id: 'sec-2',
    name: 'Scholarships',
    title: 'Scholarship Schemes & Financial Aid',
    slug: 'scholarships',
    description: 'SVMCM, Oasis, and National Scholarship Portal updates for students.',
    icon: 'GraduationCap',
    layout: 'card-grid',
    showOnHomepage: true,
    showInDesktopNav: true,
    showInMobileNav: true,
    showInFooter: true,
    displayOrder: 2,
    colorTheme: 'blue',
    status: 'published',
    seoTitle: 'Scholarships 2026 - Sayan Digital Hub',
    seoDescription: 'Check Swami Vivekananda and Oasis scholarship details.'
  },
  {
    id: 'sec-3',
    name: 'Digital Services',
    title: 'Online Digital Services & Assistance',
    slug: 'digital-services',
    description: 'Form fillup, certificate assistance, and expert application support.',
    icon: 'MonitorSmartphone',
    layout: 'service-catalog',
    showOnHomepage: true,
    showInDesktopNav: true,
    showInMobileNav: true,
    showInFooter: true,
    displayOrder: 3,
    colorTheme: 'teal',
    status: 'published',
    seoTitle: 'Digital Services - Sayan Digital Hub',
    seoDescription: 'Online form fillup and digital assistance.'
  },
  {
    id: 'sec-4',
    name: 'Study Materials',
    title: 'Study Notes & Google Drive PDFs',
    slug: 'study-materials',
    description: 'Curated PDF notes, semester guides, and competitive exam preparation materials.',
    icon: 'BookOpen',
    layout: 'list',
    showOnHomepage: true,
    showInDesktopNav: true,
    showInMobileNav: true,
    showInFooter: true,
    displayOrder: 4,
    colorTheme: 'purple',
    status: 'published',
    seoTitle: 'Study Materials & PDFs - Sayan Digital Hub',
    seoDescription: 'Download free study notes and preparation guides.'
  }
];

const initialAvailabilityRules: AvailabilityRule[] = [
  {
    id: 'rule-1',
    title: 'Weekly Sunday Office Closure',
    type: 'recurring',
    recurringDays: [0], // Sunday
    serviceId: 'all',
    reason: 'Sayan Digital Hub physical office and direct booking services are closed on Sundays.',
    createdAt: '2026-01-01'
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'bn'>(() => {
    return (localStorage.getItem('sdh_language') as 'en' | 'bn') || 'en';
  });

  const [sessionRevokedMessage, setSessionRevokedMessage] = useState<string | null>(null);
  const clearSessionRevokedMessage = () => setSessionRevokedMessage(null);

  const establishActiveSession = async (userId: string) => {
    const newSessionId = 'sess-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('sdh_active_session_id', newSessionId);
    try {
      await setDoc(doc(db, 'activeSessions', userId), {
        sessionId: newSessionId,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Active session write error:', e);
    }
  };

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sdh_current_user');
    return saved ? JSON.parse(saved) : initialUsers[0]; // Default to Super Admin for immediate testing ease, or null
  });

  // Single-active-device session revocation watcher
  useEffect(() => {
    if (!currentUser) return;

    const userId = currentUser.id;
    const unsubscribeSession = onSnapshot(doc(db, 'activeSessions', userId), (snap) => {
      if (snap.exists()) {
        const remoteData = snap.data();
        const remoteSessionId = remoteData.sessionId;
        const localSessionId = localStorage.getItem('sdh_active_session_id');

        if (localSessionId && remoteSessionId && remoteSessionId !== localSessionId) {
          signOutFirebase();
          localStorage.removeItem('sdh_active_session_id');
          setCurrentUser(null);
          setSessionRevokedMessage('Your account was signed in on another device. Please sign in again if this was not you.');
        }
      }
    }, (err) => {
      console.warn('Active session listener warning:', err);
    });

    return () => unsubscribeSession();
  }, [currentUser?.id]);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('sdh_dark_mode') === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sdh_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sdh_dark_mode', 'false');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('sdh_posts');
    return saved ? JSON.parse(saved) : initialPosts;
  });

  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>(() => {
    const saved = localStorage.getItem('sdh_study_materials');
    return saved ? JSON.parse(saved) : initialStudyMaterials;
  });

  const [digitalServices, setDigitalServices] = useState<DigitalService[]>(() => {
    const saved = localStorage.getItem('sdh_digital_services');
    return saved ? JSON.parse(saved) : initialDigitalServices;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('sdh_appointments');
    return saved ? JSON.parse(saved) : initialAppointments;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('sdh_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [settings, setSettings] = useState<WebsiteSettings>(() => {
    const saved = localStorage.getItem('sdh_settings');
    const parsed = saved ? JSON.parse(saved) : {};
    return { ...defaultSettings, ...parsed };
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('sdh_announcements');
    return saved ? JSON.parse(saved) : initialAnnouncements;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('sdh_users');
    let list: User[] = saved ? JSON.parse(saved) : initialUsers;
    let foundSuperAdmin = false;
    list = list.map(u => {
      if (u.email.toLowerCase() === 'sayanbaishya64@gmail.com') {
        foundSuperAdmin = true;
        return {
          ...u,
          name: u.name || 'Sayan Baishya',
          role: 'super_admin' as const,
          password: 'Sayan8116@',
          status: 'active' as const
        };
      }
      if (u.role === 'super_admin') {
        return { ...u, role: 'admin' as const };
      }
      return u;
    });
    if (!foundSuperAdmin) {
      list.unshift({
        id: 'usr-0',
        name: 'Sayan Baishya',
        email: 'sayanbaishya64@gmail.com',
        password: 'Sayan8116@',
        role: 'super_admin',
        status: 'active',
        createdAt: '2026-01-01'
      });
    }
    return list;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('sdh_audit_logs');
    return saved ? JSON.parse(saved) : [
      { id: 'log-1', action: 'SYSTEM_INIT', userId: 'usr-1', userEmail: 'superadmin@sayandigitalhub.in', timestamp: '2026-10-01 10:00:00', details: 'System initialized successfully.' }
    ];
  });

  const [templates, setTemplates] = useState<ContentTemplateDef[]>(() => {
    const saved = localStorage.getItem('sdh_templates');
    if (saved) {
      try {
        const parsed: ContentTemplateDef[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map(t => t.id));
          const missingInitials = initialTemplates.filter(t => !existingIds.has(t.id));
          const combined = [...parsed, ...missingInitials];
          return combined.map(t => {
            const hasImageField = t.fields.some(f => f.type === 'image' || f.name === 'featuredImage');
            if (!hasImageField) {
              return {
                ...t,
                fields: [
                  ...t.fields,
                  { name: 'featuredImage', label: 'Featured Banner / Poster Image', type: 'image' as const, required: false }
                ]
              };
            }
            return t;
          });
        }
      } catch (e) {}
    }
    return initialTemplates;
  });

  const [websiteSections, setWebsiteSections] = useState<WebsiteSection[]>(() => {
    const saved = localStorage.getItem('sdh_website_sections');
    return saved ? JSON.parse(saved) : initialWebsiteSections;
  });

  useEffect(() => {
    localStorage.setItem('sdh_language', language);
  }, [language]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sdh_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sdh_current_user');
    }
  }, [currentUser]);

  useEffect(() => { localStorage.setItem('sdh_posts', JSON.stringify(posts)); }, [posts]);
  useEffect(() => { localStorage.setItem('sdh_study_materials', JSON.stringify(studyMaterials)); }, [studyMaterials]);
  useEffect(() => { localStorage.setItem('sdh_digital_services', JSON.stringify(digitalServices)); }, [digitalServices]);
  useEffect(() => { localStorage.setItem('sdh_appointments', JSON.stringify(appointments)); }, [appointments]);
  useEffect(() => { localStorage.setItem('sdh_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('sdh_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('sdh_announcements', JSON.stringify(announcements)); }, [announcements]);
  useEffect(() => { localStorage.setItem('sdh_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('sdh_audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem('sdh_templates', JSON.stringify(templates)); }, [templates]);
  useEffect(() => { localStorage.setItem('sdh_website_sections', JSON.stringify(websiteSections)); }, [websiteSections]);

  const [availabilityRules, setAvailabilityRules] = useState<AvailabilityRule[]>(() => {
    const saved = localStorage.getItem('sdh_availability_rules');
    return saved ? JSON.parse(saved) : initialAvailabilityRules;
  });

  useEffect(() => {
    try {
      localStorage.setItem('sdh_availability_rules', JSON.stringify(availabilityRules));
    } catch (e) {}
  }, [availabilityRules]);

  const [whatsappConfig, setWhatsAppConfig] = useState<WhatsAppConfig>(() => {
    const saved = localStorage.getItem('sdh_whatsapp_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaultWhatsAppConfig,
          ...parsed,
          sectionPrefills: parsed.sectionPrefills && parsed.sectionPrefills.length > 0 
            ? parsed.sectionPrefills 
            : defaultWhatsAppConfig.sectionPrefills
        };
      } catch (e) {}
    }
    return defaultWhatsAppConfig;
  });

  useEffect(() => {
    try {
      localStorage.setItem('sdh_whatsapp_config', JSON.stringify(whatsappConfig));
    } catch (e) {}
  }, [whatsappConfig]);

  const addSection = async (secData: Omit<WebsiteSection, 'id'>) => {
    const newId = 'sec-' + Date.now();
    const newSec: WebsiteSection = { ...secData, id: newId };
    setWebsiteSections(prev => {
      const updated = [...prev, newSec];
      try {
        localStorage.setItem('sdh_website_sections', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
    logAction('CREATE_SECTION', `Created website section: ${newSec.name} (${newSec.slug})`);
    try {
      await setDoc(doc(db, 'websiteSections', newId), cleanPayload(newSec));
    } catch (e) {
      console.warn('Firestore add section:', e);
    }
  };

  const updateSection = async (id: string, secData: Partial<WebsiteSection>) => {
    setWebsiteSections(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...secData } : s);
      try {
        localStorage.setItem('sdh_website_sections', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
    logAction('UPDATE_SECTION', `Updated website section ID: ${id}`);
    try {
      await setDoc(doc(db, 'websiteSections', id), cleanPayload(secData), { merge: true });
    } catch (e) {
      console.warn('Firestore update section:', e);
    }
  };

  const deleteSection = async (id: string) => {
    setWebsiteSections(prev => {
      const updated = prev.filter(s => s.id !== id);
      try {
        localStorage.setItem('sdh_website_sections', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
    logAction('DELETE_SECTION', `Deleted website section ID: ${id}`);
    try {
      await deleteDoc(doc(db, 'websiteSections', id));
    } catch (e) {
      console.warn('Firestore delete section:', e);
    }
  };

  // Sync Firebase Authentication Sessions and Firestore User Profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email || '';
        if (!email) return;

        const isSuperAdmin = email.toLowerCase() === 'sayanbaishya64@gmail.com';
        const fullName = firebaseUser.displayName || email.split('@')[0] || 'User';
        const avatarUrl = firebaseUser.photoURL || '';

        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data();
            const profile: User = {
              id: firebaseUser.uid,
              name: data.name || fullName,
              email: data.email || email,
              role: isSuperAdmin ? 'super_admin' : (data.role || 'customer'),
              status: data.status || 'active',
              createdAt: data.createdAt || new Date().toISOString().split('T')[0],
              phone: data.phone || '',
              avatarUrl: data.avatarUrl || avatarUrl,
              authProvider: 'google'
            };
            setCurrentUser(profile);
            setUsers(prev => {
              const exists = prev.some(u => u.id === profile.id || u.email.toLowerCase() === email.toLowerCase());
              if (exists) {
                return prev.map(u => (u.id === profile.id || u.email.toLowerCase() === email.toLowerCase()) ? profile : u);
              }
              return [...prev, profile];
            });
          } else {
            const newProfile: User = {
              id: firebaseUser.uid,
              name: fullName,
              email,
              role: isSuperAdmin ? 'super_admin' : 'customer',
              status: 'active',
              createdAt: new Date().toISOString().split('T')[0],
              avatarUrl,
              authProvider: 'google'
            };
            await setDoc(userDocRef, newProfile);
            setCurrentUser(newProfile);
            setUsers(prev => [...prev, newProfile]);
          }
        } catch (e) {
          console.warn('Firestore user profile sync fallback:', e);
          const fallbackProfile: User = {
            id: firebaseUser.uid,
            name: fullName,
            email,
            role: isSuperAdmin ? 'super_admin' : 'customer',
            status: 'active',
            createdAt: new Date().toISOString().split('T')[0],
            avatarUrl,
            authProvider: 'google'
          };
          setCurrentUser(fallbackProfile);
        }

        logAction('FIREBASE_LOGIN', `Authenticated ${email} via Google OAuth with Firebase`);
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time synchronization with Cloud Firestore
  useEffect(() => {
    // 1. Posts Collection Listener & Seeder
    const unsubPosts = onSnapshot(collection(db, 'posts'), (snapshot) => {
      if (!snapshot.empty) {
        const loaded: Post[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as Post);
        });
        loaded.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setPosts(loaded);
      } else {
        // First boot: seed initial demo posts to Firestore
        initialPosts.forEach((p) => {
          setDoc(doc(db, 'posts', p.id), cleanPayload(p)).catch(err => {
            console.warn('Seeding post error:', err);
          });
        });
      }
    }, (error) => {
      console.warn('Firestore posts snapshot warning:', error);
    });

    // 2. Study Materials Collection Listener & Seeder
    const unsubMaterials = onSnapshot(collection(db, 'studyMaterials'), (snapshot) => {
      if (!snapshot.empty) {
        const loaded: StudyMaterial[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as StudyMaterial);
        });
        setStudyMaterials(loaded);
      } else {
        initialStudyMaterials.forEach((m) => {
          setDoc(doc(db, 'studyMaterials', m.id), cleanPayload(m)).catch(err => {
            console.warn('Seeding study material error:', err);
          });
        });
      }
    }, (error) => {
      console.warn('Firestore study materials snapshot warning:', error);
    });

    // 3. Digital Services Collection Listener & Seeder
    const unsubServices = onSnapshot(collection(db, 'digitalServices'), (snapshot) => {
      if (!snapshot.empty) {
        const loaded: DigitalService[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as DigitalService);
        });
        setDigitalServices(loaded);
      } else {
        initialDigitalServices.forEach((s) => {
          setDoc(doc(db, 'digitalServices', s.id), cleanPayload(s)).catch(err => {
            console.warn('Seeding service error:', err);
          });
        });
      }
    }, (error) => {
      console.warn('Firestore services snapshot warning:', error);
    });

    // 4. Appointments Collection Listener & Seeder
    const unsubAppointments = onSnapshot(collection(db, 'appointments'), (snapshot) => {
      if (!snapshot.empty) {
        const loaded: Appointment[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as Appointment);
        });
        loaded.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setAppointments(loaded);
      } else {
        initialAppointments.forEach((a) => {
          setDoc(doc(db, 'appointments', a.id), cleanPayload(a)).catch(err => {
            console.warn('Seeding appointment error:', err);
          });
        });
      }
    }, (error) => {
      console.warn('Firestore appointments snapshot warning:', error);
    });

    // 5. Website Settings Document Listener & Seeder
    const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        const remoteSettings = docSnap.data() as Partial<WebsiteSettings>;
        setSettings(prev => ({ ...prev, ...remoteSettings }));
      } else {
        setDoc(doc(db, 'settings', 'general'), cleanPayload(defaultSettings)).catch(err => {
          console.warn('Seeding settings error:', err);
        });
      }
    }, (error) => {
      console.warn('Firestore settings snapshot warning:', error);
    });

    // 6. Categories Collection Listener & Seeder
    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      if (!snapshot.empty) {
        const loaded: Category[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as Category);
        });
        setCategories(loaded);
      } else {
        initialCategories.forEach((c) => {
          setDoc(doc(db, 'categories', c.id), cleanPayload(c)).catch(err => {
            console.warn('Seeding category error:', err);
          });
        });
      }
    }, (error) => {
      console.warn('Firestore categories snapshot warning:', error);
    });

    // 7. Announcements Collection Listener & Seeder
    const unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snapshot) => {
      if (!snapshot.empty) {
        const loaded: Announcement[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as Announcement);
        });
        setAnnouncements(loaded);
      } else {
        initialAnnouncements.forEach((an) => {
          setDoc(doc(db, 'announcements', an.id), cleanPayload(an)).catch(err => {
            console.warn('Seeding announcement error:', err);
          });
        });
      }
    }, (error) => {
      console.warn('Firestore announcements snapshot warning:', error);
    });

    // 8. Website Sections Collection Listener & Seeder
    const unsubSections = onSnapshot(collection(db, 'websiteSections'), (snapshot) => {
      if (!snapshot.empty) {
        const loaded: WebsiteSection[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as WebsiteSection;
          loaded.push({ ...data, id: data.id || docSnap.id });
        });
        loaded.sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
        setWebsiteSections(loaded);
      } else {
        initialWebsiteSections.forEach((s) => {
          setDoc(doc(db, 'websiteSections', s.id), cleanPayload(s)).catch(err => {
            console.warn('Seeding website section error:', err);
          });
        });
      }
    }, (error) => {
      console.warn('Firestore websiteSections snapshot warning:', error);
    });

    // 9. WhatsApp Support Configuration Document Listener & Seeder
    const unsubWhatsApp = onSnapshot(doc(db, 'settings', 'whatsapp'), (docSnap) => {
      if (docSnap.exists()) {
        const remoteData = docSnap.data() as Partial<WhatsAppConfig>;
        setWhatsAppConfig(prev => ({
          ...prev,
          ...remoteData,
          sectionPrefills: remoteData.sectionPrefills && remoteData.sectionPrefills.length > 0 
            ? remoteData.sectionPrefills 
            : prev.sectionPrefills
        }));
      } else {
        setDoc(doc(db, 'settings', 'whatsapp'), cleanPayload(defaultWhatsAppConfig)).catch(err => {
          console.warn('Seeding whatsapp settings error:', err);
        });
      }
    }, (error) => {
      console.warn('Firestore whatsapp settings snapshot warning:', error);
    });

    return () => {
      unsubPosts();
      unsubMaterials();
      unsubServices();
      unsubAppointments();
      unsubSettings();
      unsubCategories();
      unsubAnnouncements();
      unsubSections();
      unsubWhatsApp();
    };
  }, []);

  const signInWithGoogle = async () => {
    const res = await signInWithFirebaseGoogle();
    if (res.user) {
      await establishActiveSession(res.user.uid);
    }
    return res;
  };

  const loginWithGoogleMock = async (email?: string, name?: string) => {
    const targetEmail = (email || 'sayanbaishya64@gmail.com').trim().toLowerCase();
    const isSuperAdmin = targetEmail === 'sayanbaishya64@gmail.com';
    const targetName = name || (isSuperAdmin ? 'Sayan Baishya (Super Admin)' : targetEmail.split('@')[0]);
    const avatarUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
    
    let resolvedUserId = '';
    setUsers(prevUsers => {
      const existing = prevUsers.find(u => u.email.toLowerCase() === targetEmail);
      if (existing) {
        resolvedUserId = existing.id;
        const updated: User = {
          ...existing,
          name: existing.name || targetName,
          avatarUrl: avatarUrl || existing.avatarUrl,
          role: isSuperAdmin ? 'super_admin' : (existing.role === 'super_admin' ? 'customer' : existing.role),
          authProvider: 'google'
        };
        setCurrentUser(updated);
        return prevUsers.map(u => u.id === existing.id ? updated : u);
      } else {
        resolvedUserId = 'usr-google-' + Date.now();
        const newUser: User = {
          id: resolvedUserId,
          name: targetName,
          email: targetEmail,
          role: isSuperAdmin ? 'super_admin' : 'customer',
          status: 'active',
          createdAt: new Date().toISOString().split('T')[0],
          avatarUrl,
          authProvider: 'google'
        };
        setCurrentUser(newUser);
        return [...prevUsers, newUser];
      }
    });

    if (resolvedUserId) {
      await establishActiveSession(resolvedUserId);
    }

    logAction('GOOGLE_LOGIN_DIRECT', `Signed in ${targetEmail} via Google Authentication (Role: ${isSuperAdmin ? 'Super Admin' : 'Customer'})`);
  };

  const addTemplate = async (tmplData: Omit<ContentTemplateDef, 'id'>) => {
    const newId = 'tmpl-' + Date.now();
    const newTmpl: ContentTemplateDef = {
      ...tmplData,
      id: newId
    };
    setTemplates(prev => [...prev, newTmpl]);
    logAction('CREATE_TEMPLATE', `Created content template: ${newTmpl.name}`);
    try {
      await setDoc(doc(db, 'contentTemplates', newId), cleanPayload(newTmpl));
    } catch (e) {
      console.warn('Firestore add template:', e);
    }
  };

  const deleteTemplate = async (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    logAction('DELETE_TEMPLATE', `Deleted content template ID: ${id}`);
    try {
      await deleteDoc(doc(db, 'contentTemplates', id));
    } catch (e) {
      console.warn('Firestore delete template:', e);
    }
  };

  const logAction = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      action,
      userId: currentUser?.id || 'guest',
      userEmail: currentUser?.email || 'guest@sayandigitalhub.in',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
    // Also persist audit log to Firestore
    setDoc(doc(db, 'auditLogs', newLog.id), cleanPayload(newLog)).catch(err => {
      console.warn('Audit log write error:', err);
    });
  };

  const login = async (email: string, password: string) => {
    const normalized = email.trim().toLowerCase();
    if (normalized === 'sayanbaishya64@gmail.com') {
      if (password !== 'Sayan8116@') {
        return { error: 'Invalid password for Super Admin!' };
      }
      const found = users.find(u => u.email.toLowerCase() === normalized) || {
        id: 'usr-0',
        name: 'Sayan Baishya (Super Admin)',
        email: normalized,
        role: 'super_admin' as const,
        status: 'active' as const,
        createdAt: '2026-01-01'
      };
      setCurrentUser(found);
      await establishActiveSession(found.id);
      logAction('USER_LOGIN', `Super Admin logged in.`);
      return { success: true };
    }

    const res = await loginWithEmailPassword(email, password);
    if (res.error) {
      // 1. Check in loaded users list
      const found = users.find(u => u.email.toLowerCase() === normalized);
      if (found) {
        if (found.status === 'suspended') {
          return { error: 'Your account is suspended. Please contact support.' };
        }
        setCurrentUser(found);
        await establishActiveSession(found.id);
        logAction('USER_LOGIN', `User ${found.email} logged in with role ${found.role}`);
        return { success: true };
      }

      // 2. Fallback to Firestore users query if registered in another session
      try {
        const snap = await getDocs(query(collection(db, 'users'), where('email', '==', normalized), limit(1)));
        if (!snap.empty) {
          const docData = snap.docs[0].data();
          const profile: User = {
            id: snap.docs[0].id,
            name: docData.name || normalized.split('@')[0],
            email: docData.email || normalized,
            role: docData.role || 'customer',
            status: docData.status || 'active',
            createdAt: docData.createdAt || new Date().toISOString().split('T')[0],
            phone: docData.phone || '',
            authProvider: docData.authProvider || 'email'
          };
          if (profile.status === 'suspended') {
            return { error: 'Your account is suspended. Please contact support.' };
          }
          setUsers(prev => {
            const hasUser = prev.some(u => u.id === profile.id);
            return hasUser ? prev : [...prev, profile];
          });
          setCurrentUser(profile);
          await establishActiveSession(profile.id);
          logAction('USER_LOGIN', `User ${profile.email} logged in with role ${profile.role}`);
          return { success: true };
        }
      } catch (findErr) {
        console.warn('Firestore fallback user find:', findErr);
      }

      return { 
        error: (res as any).operationNotAllowed 
          ? 'Invalid email or password. You can also sign in instantly using Google.' 
          : res.error 
      };
    }

    const firebaseUser = res.user;
    if (firebaseUser) {
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          const data = snap.data();
          const profile: User = {
            id: firebaseUser.uid,
            name: data.name || firebaseUser.displayName || email.split('@')[0],
            email: firebaseUser.email || email,
            role: data.role || 'customer',
            status: data.status || 'active',
            createdAt: data.createdAt || new Date().toISOString().split('T')[0],
            phone: data.phone || '',
            authProvider: 'email'
          };
          setCurrentUser(profile);
        } else {
          const profile: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || email.split('@')[0],
            email: firebaseUser.email || email,
            role: 'customer',
            status: 'active',
            createdAt: new Date().toISOString().split('T')[0],
            authProvider: 'email'
          };
          await setDoc(userDocRef, profile);
          setCurrentUser(profile);
        }
      } catch (e) {
        console.warn('Login profile sync error:', e);
      }
      await establishActiveSession(firebaseUser.uid);
    }
    logAction('USER_LOGIN', `User logged in: ${email}`);
    return { success: true };
  };

  const registerCustomer = async (name: string, email: string, password: string, phone?: string) => {
    const normalized = email.trim().toLowerCase();
    
    // Check if user already exists
    const existing = users.find(u => u.email.toLowerCase() === normalized);
    if (existing) {
      return { error: 'An account with this email address already exists. Please sign in instead.' };
    }

    const res = await registerWithEmailPassword(email, password, name);
    if (res.error) {
      // If Firebase Auth Email/Password provider is not enabled, seamlessly register customer profile in Firestore
      if ((res as any).operationNotAllowed || (res as any).code === 'auth/operation-not-allowed' || res.error.includes('operation-not-allowed')) {
        const fallbackId = 'usr-c' + Date.now();
        const newUser: User = {
          id: fallbackId,
          name: name.trim(),
          email: normalized,
          role: 'customer',
          status: 'active',
          createdAt: new Date().toISOString().split('T')[0],
          phone: phone?.trim() || '',
          authProvider: 'email'
        };

        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser);
        await establishActiveSession(fallbackId);
        logAction('CUSTOMER_REGISTER', `Customer registered: ${normalized} (Firestore profile)`);

        try {
          await setDoc(doc(db, 'users', fallbackId), cleanPayload(newUser));
        } catch (e) {
          console.warn('Firestore register customer write error:', e);
        }

        return { 
          success: true, 
          message: 'Account registered successfully! Welcome to Sayan Digital Hub.' 
        };
      }
      return { error: res.error };
    }

    const firebaseUser = res.user;
    if (!firebaseUser) return { error: 'Registration failed' };

    const newUser: User = {
      id: firebaseUser.uid,
      name: name.trim(),
      email: firebaseUser.email || normalized,
      role: 'customer',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      phone: phone?.trim() || '',
      authProvider: 'email'
    };
    
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    await establishActiveSession(firebaseUser.uid);
    logAction('CUSTOMER_REGISTER', `Customer registered via email: ${normalized}`);
    try {
      await setDoc(doc(db, 'users', newUser.id), cleanPayload(newUser));
    } catch (e) {
      console.warn('Firestore register customer write error:', e);
    }
    return { success: true, message: 'Account registered successfully! Welcome to Sayan Digital Hub.' };
  };

  const sendPasswordResetEmail = async (email: string) => {
    return await sendPasswordReset(email);
  };

  const resendVerification = async () => {
    return await resendVerificationEmail();
  };

  const logout = async () => {
    logAction('USER_LOGOUT', `User ${currentUser?.email} logged out`);
    await signOutFirebase();
    setCurrentUser(null);
  };

  const addPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = 'post-' + Date.now();
    const newPost: Post = {
      ...postData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      publishedAt: postData.status === 'published' 
        ? new Date().toISOString().split('T')[0] 
        : (postData.publishedAt || undefined)
    };
    setPosts(prev => [newPost, ...prev]);
    logAction('CREATE_POST', `Created post: ${newPost.title} (${newPost.contentType})`);
    try {
      await setDoc(doc(db, 'posts', newId), cleanPayload(newPost));
      console.log('Firebase backend: Saved post successfully:', newId);
    } catch (e) {
      console.error('Firebase backend save post error:', e);
      handleFirestoreError(e, OperationType.CREATE, `posts/${newId}`);
    }
  };

  const updatePost = async (id: string, postData: Partial<Post>) => {
    const updatedData = { ...postData, updatedAt: new Date().toISOString().split('T')[0] };
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
    logAction('UPDATE_POST', `Updated post ID: ${id}`);
    try {
      await setDoc(doc(db, 'posts', id), cleanPayload(updatedData), { merge: true });
      console.log('Firebase backend: Updated post successfully:', id);
    } catch (e) {
      console.error('Firebase backend update post error:', e);
      handleFirestoreError(e, OperationType.UPDATE, `posts/${id}`);
    }
  };

  const deletePost = async (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    logAction('DELETE_POST', `Deleted post ID: ${id}`);
    try {
      await deleteDoc(doc(db, 'posts', id));
      console.log('Firebase backend: Deleted post successfully:', id);
    } catch (e) {
      console.error('Firebase backend delete post error:', e);
      handleFirestoreError(e, OperationType.DELETE, `posts/${id}`);
    }
  };

  const addStudyMaterial = async (matData: Omit<StudyMaterial, 'id' | 'createdAt'>) => {
    const newId = 'mat-' + Date.now();
    const newMat: StudyMaterial = {
      ...matData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setStudyMaterials(prev => [newMat, ...prev]);
    logAction('CREATE_STUDY_MATERIAL', `Added study material: ${newMat.topicName}`);
    try {
      await setDoc(doc(db, 'studyMaterials', newId), cleanPayload(newMat));
      console.log('Firebase backend: Saved study material successfully:', newId);
    } catch (e) {
      console.error('Firebase backend add study material error:', e);
      handleFirestoreError(e, OperationType.CREATE, `studyMaterials/${newId}`);
    }
  };

  const deleteStudyMaterial = async (id: string) => {
    setStudyMaterials(prev => prev.filter(m => m.id !== id));
    logAction('DELETE_STUDY_MATERIAL', `Deleted study material ID: ${id}`);
    try {
      await deleteDoc(doc(db, 'studyMaterials', id));
      console.log('Firebase backend: Deleted study material successfully:', id);
    } catch (e) {
      console.error('Firebase backend delete study material error:', e);
      handleFirestoreError(e, OperationType.DELETE, `studyMaterials/${id}`);
    }
  };

  const addDigitalService = async (srvData: Omit<DigitalService, 'id'>) => {
    const newId = 'srv-' + Date.now();
    const newSrv: DigitalService = {
      ...srvData,
      id: newId
    };
    setDigitalServices(prev => [...prev, newSrv]);
    logAction('CREATE_DIGITAL_SERVICE', `Added digital service: ${newSrv.name}`);
    try {
      await setDoc(doc(db, 'digitalServices', newId), cleanPayload(newSrv));
      console.log('Firebase backend: Saved digital service successfully:', newId);
    } catch (e) {
      console.error('Firebase backend add digital service error:', e);
      handleFirestoreError(e, OperationType.CREATE, `digitalServices/${newId}`);
    }
  };

  const updateDigitalService = async (id: string, srvData: Partial<DigitalService>) => {
    setDigitalServices(prev => prev.map(s => s.id === id ? { ...s, ...srvData } : s));
    logAction('UPDATE_DIGITAL_SERVICE', `Updated digital service ID: ${id}`);
    try {
      await setDoc(doc(db, 'digitalServices', id), cleanPayload(srvData), { merge: true });
      console.log('Firebase backend: Updated digital service successfully:', id);
    } catch (e) {
      console.error('Firebase backend update digital service error:', e);
      handleFirestoreError(e, OperationType.UPDATE, `digitalServices/${id}`);
    }
  };

  const deleteDigitalService = async (id: string) => {
    setDigitalServices(prev => prev.filter(s => s.id !== id));
    logAction('DELETE_DIGITAL_SERVICE', `Deleted digital service ID: ${id}`);
    try {
      await deleteDoc(doc(db, 'digitalServices', id));
      console.log('Firebase backend: Deleted digital service successfully:', id);
    } catch (e) {
      console.error('Firebase backend delete digital service error:', e);
      handleFirestoreError(e, OperationType.DELETE, `digitalServices/${id}`);
    }
  };

  const checkSlotAvailability = (
    dateStr: string, 
    timeSlot: string, 
    serviceId?: string
  ): { available: boolean; reason?: string; bookedCount: number; maxCapacity: number; remainingCapacity: number } => {
    const maxCapacity = settings.maxCapacityPerSlot || 5;

    if (!dateStr) {
      return { available: false, reason: 'Please select a date.', bookedCount: 0, maxCapacity, remainingCapacity: 0 };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr < todayStr) {
      return { available: false, reason: 'Past dates are unavailable for booking.', bookedCount: 0, maxCapacity, remainingCapacity: 0 };
    }

    // Count active appointments occupying capacity for this slot
    // Active statuses: pending, confirmed, rescheduled, completed
    // Inactive statuses: cancelled, rejected
    const activeBookings = appointments.filter(a => 
      a.date === dateStr && 
      a.timeSlot === timeSlot && 
      a.status !== 'cancelled' && 
      a.status !== 'rejected'
    );

    const bookedCount = activeBookings.length;
    const remainingCapacity = Math.max(0, maxCapacity - bookedCount);

    // Check availability rules (blocks)
    const targetDate = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = targetDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

    for (const rule of availabilityRules) {
      if (rule.serviceId && rule.serviceId !== 'all' && serviceId && rule.serviceId !== serviceId) {
        continue;
      }

      if (rule.type === 'single_date' && rule.startDate === dateStr) {
        if (!rule.timeSlot || rule.timeSlot === 'All Day' || rule.timeSlot === timeSlot) {
          return { 
            available: false, 
            reason: rule.reason || 'Selected date is marked as unavailable by admin.', 
            bookedCount, 
            maxCapacity, 
            remainingCapacity: 0 
          };
        }
      }

      if (rule.type === 'date_range' && rule.startDate && rule.endDate) {
        if (dateStr >= rule.startDate && dateStr <= rule.endDate) {
          if (!rule.timeSlot || rule.timeSlot === 'All Day' || rule.timeSlot === timeSlot) {
            return { 
              available: false, 
              reason: rule.reason || 'Selected date range is unavailable.', 
              bookedCount, 
              maxCapacity, 
              remainingCapacity: 0 
            };
          }
        }
      }

      if (rule.type === 'time_slot' && rule.startDate === dateStr) {
        if (rule.timeSlot === timeSlot) {
          return { 
            available: false, 
            reason: rule.reason || 'This specific time slot is blocked by admin.', 
            bookedCount, 
            maxCapacity, 
            remainingCapacity: 0 
          };
        }
      }

      if (rule.type === 'recurring' && rule.recurringDays && rule.recurringDays.includes(dayOfWeek)) {
        if (!rule.timeSlot || rule.timeSlot === 'All Day' || rule.timeSlot === timeSlot) {
          return { 
            available: false, 
            reason: rule.reason || 'Office is closed on this recurring day.', 
            bookedCount, 
            maxCapacity, 
            remainingCapacity: 0 
          };
        }
      }
    }

    if (remainingCapacity <= 0) {
      return { 
        available: false, 
        reason: `Fully booked — 0 of ${maxCapacity} slots available`, 
        bookedCount, 
        maxCapacity, 
        remainingCapacity: 0 
      };
    }

    return { 
      available: true, 
      bookedCount, 
      maxCapacity, 
      remainingCapacity 
    };
  };

  const checkDateAvailability = (
    dateStr: string, 
    serviceId?: string
  ): { available: boolean; reason?: string; isFullyBooked?: boolean; totalSlots: number; availableSlotsCount: number; fullyBookedSlotsCount: number } => {
    if (!dateStr) {
      return { available: false, reason: 'Select a valid date.', totalSlots: 0, availableSlotsCount: 0, fullyBookedSlotsCount: 0 };
    }

    const standardSlots = DEFAULT_HOURLY_TIME_SLOTS;

    let availableSlotsCount = 0;
    let fullyBookedSlotsCount = 0;
    let primaryReason = '';

    for (const slot of standardSlots) {
      const check = checkSlotAvailability(dateStr, slot, serviceId);
      if (check.available) {
        availableSlotsCount++;
      } else {
        fullyBookedSlotsCount++;
        if (!primaryReason) primaryReason = check.reason || 'Date unavailable';
      }
    }

    if (availableSlotsCount === 0) {
      return {
        available: false,
        reason: primaryReason,
        isFullyBooked: primaryReason.includes('Fully booked'),
        totalSlots: standardSlots.length,
        availableSlotsCount: 0,
        fullyBookedSlotsCount: standardSlots.length
      };
    }

    return { 
      available: true, 
      totalSlots: standardSlots.length, 
      availableSlotsCount, 
      fullyBookedSlotsCount 
    };
  };

  const addAvailabilityRule = async (ruleData: Omit<AvailabilityRule, 'id' | 'createdAt'>) => {
    const newId = 'rule-' + Date.now();
    const newRule: AvailabilityRule = {
      ...ruleData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const conflictAppointments = appointments.filter(a => {
      if (a.status === 'cancelled' || a.status === 'rejected') return false;
      if (newRule.serviceId && newRule.serviceId !== 'all' && newRule.serviceId !== a.serviceId) return false;

      if (newRule.type === 'single_date' && newRule.startDate === a.date) {
        return !newRule.timeSlot || newRule.timeSlot === 'All Day' || newRule.timeSlot === a.timeSlot;
      }
      if (newRule.type === 'date_range' && newRule.startDate && newRule.endDate) {
        if (a.date >= newRule.startDate && a.date <= newRule.endDate) {
          return !newRule.timeSlot || newRule.timeSlot === 'All Day' || newRule.timeSlot === a.timeSlot;
        }
      }
      if (newRule.type === 'time_slot' && newRule.startDate === a.date) {
        return newRule.timeSlot === a.timeSlot;
      }
      if (newRule.type === 'recurring' && newRule.recurringDays) {
        const day = new Date(a.date + 'T00:00:00').getDay();
        if (newRule.recurringDays.includes(day)) {
          return !newRule.timeSlot || newRule.timeSlot === 'All Day' || newRule.timeSlot === a.timeSlot;
        }
      }
      return false;
    });

    setAvailabilityRules(prev => [newRule, ...prev]);
    logAction('CREATE_AVAILABILITY_RULE', `Added unavailability rule: ${newRule.title} (${newRule.type})`);

    try {
      await setDoc(doc(db, 'availabilityRules', newId), cleanPayload(newRule));
    } catch (e) {
      console.warn('Firestore write availability rule error:', e);
    }

    return {
      success: true,
      conflictCount: conflictAppointments.length,
      conflictAppointments
    };
  };

  const updateAvailabilityRule = async (id: string, ruleData: Partial<AvailabilityRule>) => {
    const updated = { ...ruleData, updatedAt: new Date().toISOString().split('T')[0] };
    setAvailabilityRules(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
    logAction('UPDATE_AVAILABILITY_RULE', `Updated availability rule ID: ${id}`);
    try {
      await setDoc(doc(db, 'availabilityRules', id), cleanPayload(updated), { merge: true });
    } catch (e) {
      console.warn('Firestore update availability rule error:', e);
    }
  };

  const deleteAvailabilityRule = async (id: string) => {
    setAvailabilityRules(prev => prev.filter(r => r.id !== id));
    logAction('DELETE_AVAILABILITY_RULE', `Deleted availability rule ID: ${id} (Restored availability)`);
    try {
      await deleteDoc(doc(db, 'availabilityRules', id));
    } catch (e) {
      console.warn('Firestore delete availability rule error:', e);
    }
  };

  const bookAppointment = async (aptData: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => {
    const availability = checkSlotAvailability(aptData.date, aptData.timeSlot, aptData.serviceId);
    if (!availability.available) {
      console.warn('Appointment booking rejected:', availability.reason);
      throw new Error(availability.reason || 'Selected date or time slot is not available.');
    }

    const maxCapacity = settings.maxCapacityPerSlot || 5;

    // Database / Firestore Transaction Guard against simultaneous requests
    try {
      const q = query(
        collection(db, 'appointments'),
        where('date', '==', aptData.date),
        where('timeSlot', '==', aptData.timeSlot)
      );
      const snap = await getDocs(q);
      const activeInDb = snap.docs.filter(d => {
        const status = d.data().status;
        return status !== 'cancelled' && status !== 'rejected';
      });

      if (activeInDb.length >= maxCapacity) {
        throw new Error(`This time slot (${aptData.timeSlot}) on ${aptData.date} has reached its maximum capacity of ${maxCapacity} appointments.`);
      }
    } catch (e: any) {
      if (e.message && e.message.includes('maximum capacity')) {
        throw e;
      }
      console.warn('Firestore capacity query check warning (proceeding with local state validation):', e);
    }

    const newId = 'apt-' + Date.now();
    const newApt: Appointment = {
      ...aptData,
      id: newId,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setAppointments(prev => [newApt, ...prev]);
    logAction('BOOK_APPOINTMENT', `Booked appointment for service: ${newApt.serviceName} by ${newApt.customerName} on ${newApt.date} (${newApt.timeSlot})`);

    try {
      await setDoc(doc(db, 'appointments', newId), cleanPayload(newApt));
      console.log('Firebase backend: Saved appointment successfully:', newId);
    } catch (e) {
      console.error('Firebase backend book appointment error:', e);
      handleFirestoreError(e, OperationType.CREATE, `appointments/${newId}`);
    }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    logAction('UPDATE_APPOINTMENT', `Updated appointment ID ${id} status to ${status}`);
    try {
      await setDoc(doc(db, 'appointments', id), { status }, { merge: true });
      console.log('Firebase backend: Updated appointment status successfully:', id);
    } catch (e) {
      console.error('Firebase backend update appointment error:', e);
      handleFirestoreError(e, OperationType.UPDATE, `appointments/${id}`);
    }
  };

  const addCategory = async (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: 'cat-' + Date.now()
    };
    setCategories(prev => [...prev, newCat]);
    logAction('CREATE_CATEGORY', `Created category: ${newCat.name}`);
    try {
      await setDoc(doc(db, 'categories', newCat.id), cleanPayload(newCat));
      console.log('Firebase backend: Saved category successfully:', newCat.id);
    } catch (e) {
      console.error('Firebase backend add category error:', e);
      handleFirestoreError(e, OperationType.CREATE, `categories/${newCat.id}`);
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    logAction('DELETE_CATEGORY', `Deleted category ID: ${id}`);
    try {
      await deleteDoc(doc(db, 'categories', id));
      console.log('Firebase backend: Deleted category successfully:', id);
    } catch (e) {
      console.error('Firebase backend delete category error:', e);
      handleFirestoreError(e, OperationType.DELETE, `categories/${id}`);
    }
  };

  const updateSettings = async (newSettings: Partial<WebsiteSettings>) => {
    let mergedSettings: WebsiteSettings = { ...settings, ...newSettings };
    if (newSettings.contactNumber !== undefined) {
      mergedSettings.contactPhone = newSettings.contactNumber;
    } else if (newSettings.contactPhone !== undefined) {
      mergedSettings.contactNumber = newSettings.contactPhone;
    }
    if (newSettings.location !== undefined) {
      mergedSettings.address = newSettings.location;
    } else if (newSettings.address !== undefined) {
      mergedSettings.location = newSettings.address;
    }
    setSettings(mergedSettings);
    localStorage.setItem('sdh_settings', JSON.stringify(mergedSettings));
    logAction('UPDATE_SETTINGS', 'Updated website settings');
    try {
      // Exclude logoUrl from general settings to avoid document size limit and remove if present
      const { logoUrl, ...settingsWithoutLogo } = mergedSettings;
      await setDoc(doc(db, 'settings', 'general'), {
        ...cleanPayload(settingsWithoutLogo),
        logoUrl: deleteField()
      }, { merge: true });
      console.log('Firebase backend: Saved website settings successfully');
    } catch (e) {
      console.error('Firebase backend update settings error:', e);
      handleFirestoreError(e, OperationType.WRITE, 'settings/general');
    }
  };

  const updateLogo = async (logoUrl: string) => {
    const updatedSettings = { ...settings, logoUrl };
    setSettings(updatedSettings);
    localStorage.setItem('sdh_settings', JSON.stringify(updatedSettings));
    logAction('UPDATE_LOGO', 'Updated website logo');
    try {
      await setDoc(doc(db, 'settings', 'logo'), { logoUrl }, { merge: true });
      console.log('Firebase backend: Saved logo successfully');
    } catch (e) {
      console.error('Firebase backend update logo error:', e);
      handleFirestoreError(e, OperationType.WRITE, 'settings/logo');
    }
  };

  const addAnnouncement = async (annData: Omit<Announcement, 'id'>) => {
    const newAnn: Announcement = {
      ...annData,
      id: 'ann-' + Date.now()
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    logAction('CREATE_ANNOUNCEMENT', `Created announcement: ${newAnn.title}`);
    try {
      await setDoc(doc(db, 'announcements', newAnn.id), cleanPayload(newAnn));
      console.log('Firebase backend: Saved announcement successfully:', newAnn.id);
    } catch (e) {
      console.error('Firebase backend add announcement error:', e);
      handleFirestoreError(e, OperationType.CREATE, `announcements/${newAnn.id}`);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    logAction('DELETE_ANNOUNCEMENT', `Deleted announcement ID: ${id}`);
    try {
      await deleteDoc(doc(db, 'announcements', id));
      console.log('Firebase backend: Deleted announcement successfully:', id);
    } catch (e) {
      console.error('Firebase backend delete announcement error:', e);
      handleFirestoreError(e, OperationType.DELETE, `announcements/${id}`);
    }
  };

  const updateUserRole = async (userId: string, role: User['role']) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    logAction('UPDATE_USER_ROLE', `Updated user ID ${userId} role to ${role}`);
    try {
      await setDoc(doc(db, 'users', userId), { role }, { merge: true });
    } catch (e) {
      console.warn('Firestore update user role:', e);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    const target = users.find(u => u.id === userId);
    const newStatus = target?.status === 'active' ? 'suspended' : 'active';
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    logAction('TOGGLE_USER_STATUS', `Toggled status for user ID: ${userId} to ${newStatus}`);
    try {
      await setDoc(doc(db, 'users', userId), { status: newStatus }, { merge: true });
    } catch (e) {
      console.warn('Firestore toggle user status:', e);
    }
  };

  const updateWhatsAppConfig = async (newConfig: Partial<WhatsAppConfig>, publish: boolean = true): Promise<{ success: boolean; error?: string }> => {
    const checkPhone = newConfig.phoneNumber !== undefined ? newConfig.phoneNumber : whatsappConfig.phoneNumber;
    const cleanDigits = (checkPhone || '').replace(/[^0-9]/g, '');
    if (publish && cleanDigits.length < 7) {
      return { success: false, error: 'Please enter a valid phone number (at least 7 to 10 digits).' };
    }

    const updated: WhatsAppConfig = {
      ...whatsappConfig,
      ...newConfig,
      status: publish ? 'published' : (newConfig.status || 'draft'),
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.email || 'admin'
    };

    setWhatsAppConfig(updated);
    try {
      localStorage.setItem('sdh_whatsapp_config', JSON.stringify(updated));
    } catch (e) {}

    logAction('UPDATE_WHATSAPP_CONFIG', `Updated WhatsApp Customer Support configuration (${publish ? 'Published' : 'Draft saved'})`);

    try {
      await setDoc(doc(db, 'settings', 'whatsapp'), cleanPayload(updated), { merge: true });
      return { success: true };
    } catch (err: any) {
      console.warn('Firestore update WhatsApp config error:', err);
      return { success: true };
    }
  };

  return (
    <AppContext.Provider value={{
      language, setLanguage,
      currentUser, sessionRevokedMessage, clearSessionRevokedMessage, login, registerCustomer, sendPasswordResetEmail, resendVerification, logout,
      signInWithGoogle, loginWithGoogleMock, isFirebaseReady: true,
      isDarkMode, toggleDarkMode,
      posts, addPost, updatePost, deletePost,
      studyMaterials, addStudyMaterial, deleteStudyMaterial,
      digitalServices, addDigitalService, updateDigitalService, deleteDigitalService,
      appointments, bookAppointment, updateAppointmentStatus,
      categories, addCategory, deleteCategory,
      settings, updateSettings, updateLogo,
      announcements, addAnnouncement, deleteAnnouncement,
      users, updateUserRole, toggleUserStatus,
      auditLogs, logAction,
      templates, addTemplate, deleteTemplate,
      websiteSections, addSection, updateSection, deleteSection,
      whatsappConfig, updateWhatsAppConfig,
      availabilityRules, addAvailabilityRule, updateAvailabilityRule, deleteAvailabilityRule,
      checkSlotAvailability, checkDateAvailability
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
