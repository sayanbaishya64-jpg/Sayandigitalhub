export type ContentType = 
  | 'job' 
  | 'scholarship' 
  | 'exam' 
  | 'admit' 
  | 'result' 
  | 'admission' 
  | 'news' 
  | 'announcement'
  | 'material'
  | 'service';

export type PostStatus = 
  | 'draft' 
  | 'pending' 
  | 'approved' 
  | 'scheduled' 
  | 'published' 
  | 'archived' 
  | 'rejected';

export interface Post {
  id: string;
  title: string;
  bengaliTitle?: string;
  slug: string;
  contentType: ContentType;
  summary: string;
  bengaliSummary?: string;
  content: string;
  bengaliContent?: string;
  categoryId: string;
  featuredImage?: string;
  authorId: string;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
  publishedAt?: string;
  // Template specific fields
  organization?: string;
  totalVacancies?: string;
  qualification?: string;
  ageLimit?: string;
  applicationFee?: string;
  lastDate?: string;
  officialUrl?: string;
  applyUrl?: string;
  amount?: string;
  examDate?: string;
  resultDate?: string;
  location?: string;
  salary?: string;
  metadata?: Record<string, any>;
}

export interface ContentTemplateField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'url' | 'image';
  required: boolean;
}

export interface ContentTemplateDef {
  id: string;
  name: string;
  contentType: ContentType;
  description: string;
  fields: ContentTemplateField[];
}

export interface StudyMaterial {
  id: string;
  topicName: string;
  bengaliTopicName?: string;
  subject: string;
  shortDescription: string;
  bengaliDescription?: string;
  detailedDescription?: string;
  classLevel?: string;
  semester?: string;
  university?: string;
  examination?: string;
  author?: string;
  language: 'English' | 'Bengali' | 'Both';
  fileUrl: string;
  fileName: string;
  fileType: 'pdf' | 'doc' | 'drive' | 'link';
  accessPermission: 'public' | 'registered' | 'restricted';
  imageUrl?: string;
  createdAt: string;
}

export interface DigitalService {
  id: string;
  name: string;
  bengaliName?: string;
  category: string;
  shortDescription: string;
  bengaliDescription?: string;
  detailedDescription?: string;
  icon: string;
  imageUrl?: string;
  eligibility: string;
  requiredDocuments: string[];
  process: string;
  charges: string;
  processingTime: string;
  availability: boolean;
  bookingRequired: boolean;
  officialWebsite?: string;
}

export interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'rescheduled' | 'rejected' | 'completed' | 'cancelled';
  notes?: string;
  otpConsentAccepted?: boolean;
  otpConsentTimestamp?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  bengaliName: string;
  slug: string;
  description: string;
  icon: string;
  contentType: ContentType | 'all';
}

export interface WebsiteSettings {
  siteName: string;
  tagline: string;
  bengaliTagline: string;
  subTagline?: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  contactNumber?: string;
  address: string;
  location?: string;
  socialLinks: {
    facebook?: string;
    telegram?: string;
    whatsapp?: string;
    youtube?: string;
    twitter?: string;
  };
  copyrightText: string;
  defaultLanguage: 'en' | 'bn';
  timezone: string;
  primaryColor: string;
  maxCapacityPerSlot?: number; // Default 5
  officeStartTime?: string; // Default "09:00 AM"
  officeEndTime?: string; // Default "08:00 PM"
}

export const DEFAULT_HOURLY_TIME_SLOTS = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
  '06:00 PM - 07:00 PM',
  '07:00 PM - 08:00 PM'
];

export interface HomepageSection {
  id: string;
  name: string;
  title: string;
  enabled: boolean;
  order: number;
  itemCount: number;
}

export interface Announcement {
  id: string;
  title: string;
  bengaliTitle?: string;
  text: string;
  bengaliText?: string;
  startDate: string;
  endDate: string;
  linkUrl?: string;
  active: boolean;
}

export type UserRole = 'Super Admin' | 'Admin' | 'Customer' | 'super_admin' | 'admin' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: 'active' | 'suspended';
  createdAt: string;
  phone?: string;
  avatarUrl?: string;
  authProvider?: 'google' | 'email' | 'firebase' | 'supabase';
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userEmail: string;
  timestamp: string;
  details: string;
}

export interface WebsiteSection {
  id: string;
  name: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  bannerImage?: string;
  layout: 'card-grid' | 'list' | 'featured' | 'banner' | 'article-feed' | 'service-catalog';
  showOnHomepage: boolean;
  showInDesktopNav: boolean;
  showInMobileNav: boolean;
  showInFooter: boolean;
  displayOrder: number;
  colorTheme: string;
  status: 'published' | 'draft' | 'archived';
  seoTitle?: string;
  seoDescription?: string;
}

export interface WhatsAppSectionPrefill {
  sectionKey: string;
  sectionName: string;
  prefillMessage: string;
}

export interface WhatsAppConfig {
  phoneNumber: string;
  countryCode: string;
  enabled: boolean;
  showOnHomepage: boolean;
  position: 'bottom-right' | 'bottom-left';
  buttonLabel: string;
  tooltip: string;
  heading: string;
  description: string;
  defaultWelcomeMessage: string;
  businessHours: string;
  responseTimeNotice: string;
  onlineStatus: 'auto' | 'online' | 'offline';
  allowedPages: string[];
  sectionPrefills: WhatsAppSectionPrefill[];
  status: 'published' | 'draft';
  updatedAt?: string;
  updatedBy?: string;
}

export type AvailabilityRuleType = 'single_date' | 'date_range' | 'time_slot' | 'recurring';

export interface AvailabilityRule {
  id: string;
  title: string;
  type: AvailabilityRuleType;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  timeSlot?: string; // e.g. "02:00 PM - 03:00 PM"
  recurringDays?: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  serviceId?: string; // "all" or specific digital service ID
  reason: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}


