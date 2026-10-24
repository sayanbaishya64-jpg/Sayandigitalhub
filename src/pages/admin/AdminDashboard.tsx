import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../i18n/translations';
import { 
  LayoutDashboard, FileText, BookOpen, MonitorSmartphone, CalendarClock, 
  Users, Settings, Shield, Plus, Trash2, CheckCircle, Edit, Globe, AlertCircle, LogOut, Search, ChevronRight, X, Clock, IndianRupee, ExternalLink, Lock,
  Image as ImageIcon, UploadCloud, Link as LinkIcon, MessageSquare, Phone, Send, Smartphone, Tablet, Monitor, Eye, Copy, Save, CheckCheck, RefreshCw, ShieldCheck, Sparkles
} from 'lucide-react';
import { ContentType, PostStatus, Post, StudyMaterial, DigitalService, ContentTemplateDef, ContentTemplateField, WebsiteSection, WhatsAppConfig, WhatsAppSectionPrefill } from '../../types';
import { buildWhatsAppUrl, validateWhatsAppNumber, formatWhatsAppDisplay, isSupportOnlineNow } from '../../lib/whatsapp';
import { AvailabilityManagement } from '../../components/AvailabilityManagement';
import { compressImage } from '../../utils/imageCompressor';

interface AdminDashboardProps {
  setActivePage: (page: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setActivePage }) => {
  const { 
    currentUser, posts, addPost, deletePost, 
    studyMaterials, addStudyMaterial, deleteStudyMaterial,
    digitalServices, addDigitalService, deleteDigitalService,
    appointments, updateAppointmentStatus,
    users, updateUserRole, toggleUserStatus,
    settings, updateSettings, updateLogo, auditLogs, language,
    templates, addTemplate, deleteTemplate,
    websiteSections, addSection, updateSection, deleteSection,
    whatsappConfig, updateWhatsAppConfig, addAnnouncement
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'templates' | 'sections' | 'materials' | 'services' | 'appointments' | 'users' | 'whatsapp' | 'settings' | 'audit' | 'rls'>('overview');
  const [appointmentSubTab, setAppointmentSubTab] = useState<'list' | 'availability'>('list');
  
  // Modals
  const [newPostModal, setNewPostModal] = useState(false);
  const [newTemplateModal, setNewTemplateModal] = useState(false);
  const [newMaterialModal, setNewMaterialModal] = useState(false);
  const [newServiceModal, setNewServiceModal] = useState(false);
  const [newSectionModal, setNewSectionModal] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [previewSection, setPreviewSection] = useState<WebsiteSection | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [sectionToDelete, setSectionToDelete] = useState<WebsiteSection | null>(null);
  const [sectionNotice, setSectionNotice] = useState<string | null>(null);

  // Section Form State
  const [secName, setSecName] = useState('');
  const [secTitle, setSecTitle] = useState('');
  const [secSlug, setSecSlug] = useState('');
  const [secDesc, setSecDesc] = useState('');
  const [secIcon, setSecIcon] = useState('Briefcase');
  const [secBanner, setSecBanner] = useState('');
  const [secLayout, setSecLayout] = useState<'card-grid' | 'list' | 'featured' | 'banner' | 'article-feed' | 'service-catalog'>('card-grid');
  const [secShowHomepage, setSecShowHomepage] = useState(true);
  const [secShowDesktopNav, setSecShowDesktopNav] = useState(true);
  const [secShowMobileNav, setSecShowMobileNav] = useState(true);
  const [secShowFooter, setSecShowFooter] = useState(true);
  const [secDisplayOrder, setSecDisplayOrder] = useState<number>(1);
  const [secColorTheme, setSecColorTheme] = useState('indigo');
  const [secStatus, setSecStatus] = useState<'published' | 'draft' | 'archived'>('published');
  const [secSeoTitle, setSecSeoTitle] = useState('');
  const [secSeoDesc, setSecSeoDesc] = useState('');

  // New Post Form State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [contentType, setContentType] = useState<ContentType>('job');
  const [title, setTitle] = useState('');
  const [bengaliTitle, setBengaliTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [bengaliSummary, setBengaliSummary] = useState('');
  const [content, setContent] = useState('');
  const [organization, setOrganization] = useState('');
  const [totalVacancies, setTotalVacancies] = useState('');
  const [qualification, setQualification] = useState('');
  const [lastDate, setLastDate] = useState('');
  const [officialUrl, setOfficialUrl] = useState('');
  const [applyUrl, setApplyUrl] = useState('');
  const [amount, setAmount] = useState('');
  const [examDate, setExamDate] = useState('');
  const [matSubject, setMatSubject] = useState('');
  const [matDriveUrl, setMatDriveUrl] = useState('');
  const [matAccess, setMatAccess] = useState<'public' | 'registered' | 'restricted'>('public');
  const [srvCategory, setSrvCategory] = useState('');
  const [srvCharges, setSrvCharges] = useState('');
  const [srvProcessingTime, setSrvProcessingTime] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');

  // New Template Form State
  const [tmplName, setTmplName] = useState('');
  const [tmplType, setTmplType] = useState<ContentType>('job');
  const [tmplDesc, setTmplDesc] = useState('');
  const [tmplFields, setTmplFields] = useState<ContentTemplateField[]>([
    { name: 'organization', label: 'Organization / Provider', type: 'text', required: true },
    { name: 'lastDate', label: 'Deadline / Date', type: 'date', required: true },
    { name: 'featuredImage', label: 'Featured Banner / Poster Image', type: 'image', required: false }
  ]);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldType, setNewFieldType] = useState<ContentTemplateField['type']>('image');
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  // Direct Study Material Form State
  const [directMatTopic, setDirectMatTopic] = useState('');
  const [directMatBengaliTopic, setDirectMatBengaliTopic] = useState('');
  const [directMatSubject, setDirectMatSubject] = useState('');
  const [directMatShortDesc, setDirectMatShortDesc] = useState('');
  const [directMatClass, setDirectMatClass] = useState('');
  const [directMatAuthor, setDirectMatAuthor] = useState('');
  const [directMatLang, setDirectMatLang] = useState<'English' | 'Bengali' | 'Both'>('English');
  const [directMatFileUrl, setDirectMatFileUrl] = useState('');
  const [directMatAccess, setDirectMatAccess] = useState<'public' | 'registered' | 'restricted'>('public');
  const [directMatImage, setDirectMatImage] = useState('');

  // Direct Digital Service Form State
  const [directSrvName, setDirectSrvName] = useState('');
  const [directSrvBengaliName, setDirectSrvBengaliName] = useState('');
  const [directSrvCategory, setDirectSrvCategory] = useState('Application Assistance');
  const [directSrvShortDesc, setDirectSrvShortDesc] = useState('');
  const [directSrvCharges, setDirectSrvCharges] = useState('₹100');
  const [directSrvProcessingTime, setDirectSrvProcessingTime] = useState('1 - 2 Hours');
  const [directSrvEligibility, setDirectSrvEligibility] = useState('All Eligible Candidates');
  const [directSrvRequiredDocs, setDirectSrvRequiredDocs] = useState('Aadhaar Card, Academic Mark Sheets, Photo');
  const [directSrvProcess, setDirectSrvProcess] = useState('Submit details online or visit our hub.');
  const [directSrvBookingRequired, setDirectSrvBookingRequired] = useState(true);
  const [directSrvWebsite, setDirectSrvWebsite] = useState('');
  const [directSrvImage, setDirectSrvImage] = useState('');

  // WhatsApp Customer Support Management State
  const [waPhone, setWaPhone] = useState(whatsappConfig?.phoneNumber || '8116957965');
  const [waCountryCode, setWaCountryCode] = useState(whatsappConfig?.countryCode || '+91');
  const [waEnabled, setWaEnabled] = useState(whatsappConfig?.enabled ?? true);
  const [waShowOnHomepage, setWaShowOnHomepage] = useState(whatsappConfig?.showOnHomepage ?? true);
  const [waPosition, setWaPosition] = useState<'bottom-right' | 'bottom-left'>(whatsappConfig?.position || 'bottom-right');
  const [waButtonLabel, setWaButtonLabel] = useState(whatsappConfig?.buttonLabel || 'WhatsApp Help');
  const [waTooltip, setWaTooltip] = useState(whatsappConfig?.tooltip || 'Need quick help? Chat with Sayan Digital Hub');
  const [waHeading, setWaHeading] = useState(whatsappConfig?.heading || 'Sayan Digital Hub Support');
  const [waDescription, setWaDescription] = useState(whatsappConfig?.description || 'Verified Business Support | Online Form Fillup, Scholarships & Cyber Cafe Services');
  const [waWelcomeMessage, setWaWelcomeMessage] = useState(whatsappConfig?.defaultWelcomeMessage || 'Hello Sayan Digital Hub! I need assistance regarding online services and notifications.');
  const [waBusinessHours, setWaBusinessHours] = useState(whatsappConfig?.businessHours || '9:00 AM – 9:00 PM (Monday to Saturday)');
  const [waResponseTime, setWaResponseTime] = useState(whatsappConfig?.responseTimeNotice || 'Typically replies within 10 to 15 minutes');
  const [waOnlineStatus, setWaOnlineStatus] = useState<'auto' | 'online' | 'offline'>(whatsappConfig?.onlineStatus || 'auto');
  const [waAllowedPages, setWaAllowedPages] = useState<string[]>(whatsappConfig?.allowedPages || ['all']);
  const [waSectionPrefills, setWaSectionPrefills] = useState<WhatsAppSectionPrefill[]>(whatsappConfig?.sectionPrefills || []);
  const [waPreviewDevice, setWaPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [waPreviewCardOpen, setWaPreviewCardOpen] = useState(true);
  const [waFeedback, setWaFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isWaSaving, setIsWaSaving] = useState(false);
  const [newPrefillName, setNewPrefillName] = useState('');
  const [newPrefillKey, setNewPrefillKey] = useState('');
  const [newPrefillMsg, setNewPrefillMsg] = useState('');
  const [newPrefillModal, setNewPrefillModal] = useState(false);

  useEffect(() => {
    if (whatsappConfig) {
      setWaPhone(whatsappConfig.phoneNumber);
      setWaCountryCode(whatsappConfig.countryCode || '+91');
      setWaEnabled(whatsappConfig.enabled);
      setWaShowOnHomepage(whatsappConfig.showOnHomepage);
      setWaPosition(whatsappConfig.position);
      setWaButtonLabel(whatsappConfig.buttonLabel);
      setWaTooltip(whatsappConfig.tooltip);
      setWaHeading(whatsappConfig.heading);
      setWaDescription(whatsappConfig.description);
      setWaWelcomeMessage(whatsappConfig.defaultWelcomeMessage);
      setWaBusinessHours(whatsappConfig.businessHours);
      setWaResponseTime(whatsappConfig.responseTimeNotice);
      setWaOnlineStatus(whatsappConfig.onlineStatus);
      setWaAllowedPages(whatsappConfig.allowedPages);
      setWaSectionPrefills(whatsappConfig.sectionPrefills || []);
    }
  }, [whatsappConfig]);

  const handleSaveWhatsAppConfig = async (publish: boolean) => {
    setIsWaSaving(true);
    setWaFeedback(null);

    const validation = validateWhatsAppNumber(waPhone, waCountryCode);
    if (publish && !validation.isValid) {
      setIsWaSaving(false);
      setWaFeedback({
        type: 'error',
        message: validation.error || 'Please enter a valid WhatsApp phone number before publishing.'
      });
      return;
    }

    const payload: Partial<WhatsAppConfig> = {
      phoneNumber: validation.cleaned || waPhone.trim(),
      countryCode: waCountryCode.trim(),
      enabled: waEnabled,
      showOnHomepage: waShowOnHomepage,
      position: waPosition,
      buttonLabel: waButtonLabel.trim(),
      tooltip: waTooltip.trim(),
      heading: waHeading.trim(),
      description: waDescription.trim(),
      defaultWelcomeMessage: waWelcomeMessage.trim(),
      businessHours: waBusinessHours.trim(),
      responseTimeNotice: waResponseTime.trim(),
      onlineStatus: waOnlineStatus,
      allowedPages: waAllowedPages,
      sectionPrefills: waSectionPrefills,
      status: publish ? 'published' : 'draft'
    };

    const res = await updateWhatsAppConfig(payload, publish);
    setIsWaSaving(false);

    if (res.success) {
      setWaFeedback({
        type: 'success',
        message: publish 
          ? 'WhatsApp Customer Support configuration successfully published to live website!' 
          : 'Draft saved successfully!'
      });
      setTimeout(() => setWaFeedback(null), 5000);
    } else {
      setWaFeedback({
        type: 'error',
        message: res.error || 'Failed to save configuration.'
      });
    }
  };

  if (!currentUser || !currentUser.role.toLowerCase().includes('admin')) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Shield className="w-16 h-16 text-rose-600 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
        <p className="text-slate-600 text-sm">You must be logged in as an Administrator or Super Admin to access this dashboard.</p>
        <button onClick={() => setActivePage('home')} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm">
          Return to Home
        </button>
      </div>
    );
  }

  const [isPublishing, setIsPublishing] = useState(false);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      alert('Please enter a Title (English) for the post before publishing.');
      return;
    }
    if (isPublishing) return;
    setIsPublishing(true);

    try {
      if (contentType === 'material') {
        await addStudyMaterial({
          topicName: cleanTitle,
          bengaliTopicName: bengaliTitle.trim() || undefined,
          subject: matSubject.trim() || organization.trim() || 'General Studies',
          shortDescription: summary.trim() || cleanTitle,
          detailedDescription: content.trim(),
          classLevel: qualification.trim() || 'All Levels',
          author: currentUser?.name || 'SDH Admin',
          language: 'Both',
          fileUrl: matDriveUrl.trim() || officialUrl.trim() || 'https://drive.google.com',
          fileName: cleanTitle.replace(/[^a-zA-Z0-9]/g, '_') + '.pdf',
          fileType: 'drive',
          accessPermission: matAccess,
          imageUrl: featuredImage.trim() || undefined
        });
      } else if (contentType === 'service') {
        await addDigitalService({
          name: cleanTitle,
          bengaliName: bengaliTitle.trim() || undefined,
          category: srvCategory.trim() || organization.trim() || 'Digital Services',
          shortDescription: summary.trim() || cleanTitle,
          detailedDescription: content.trim(),
          icon: 'MonitorSmartphone',
          imageUrl: featuredImage.trim() || undefined,
          eligibility: qualification.trim() || 'All Applicants',
          requiredDocuments: ['Aadhaar Card', 'Academic Mark Sheets', 'Photo Specimen'],
          process: content.trim() || 'Submit details online or visit our hub.',
          charges: srvCharges.trim() || amount.trim() || '₹100',
          processingTime: srvProcessingTime.trim() || lastDate.trim() || '1 - 2 Days',
          availability: true,
          bookingRequired: true,
          officialWebsite: officialUrl.trim() || undefined
        });
      } else if (contentType === 'announcement') {
        await addAnnouncement({
          title: cleanTitle,
          bengaliTitle: bengaliTitle.trim() || undefined,
          text: content.trim() || summary.trim() || cleanTitle,
          bengaliText: bengaliSummary.trim() || bengaliTitle.trim() || cleanTitle,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          active: true
        });
      }

      await addPost({
        title: cleanTitle,
        bengaliTitle: bengaliTitle.trim() || undefined,
        slug: cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        contentType,
        summary: summary.trim(),
        bengaliSummary: bengaliSummary.trim() || undefined,
        content: content.trim(),
        categoryId: contentType === 'material' ? 'cat-5' : contentType === 'service' ? 'cat-6' : 'cat-1',
        featuredImage: featuredImage.trim() || undefined,
        authorId: currentUser?.id || 'admin',
        status: 'published',
        organization: organization.trim() || matSubject.trim() || srvCategory.trim() || undefined,
        totalVacancies: totalVacancies.trim() || undefined,
        qualification: qualification.trim() || undefined,
        lastDate: lastDate.trim() || srvProcessingTime.trim() || undefined,
        officialUrl: officialUrl.trim() || matDriveUrl.trim() || undefined,
        applyUrl: applyUrl.trim() || undefined,
        amount: amount.trim() || srvCharges.trim() || undefined,
        examDate: examDate.trim() || undefined
      });

      setNewPostModal(false);
      setTitle('');
      setBengaliTitle('');
      setSummary('');
      setBengaliSummary('');
      setContent('');
      setOrganization('');
      setTotalVacancies('');
      setQualification('');
      setLastDate('');
      setOfficialUrl('');
      setApplyUrl('');
      setAmount('');
      setExamDate('');
      setMatSubject('');
      setMatDriveUrl('');
      setSrvCategory('');
      setSrvCharges('');
      setFeaturedImage('');
      alert('Post published successfully and saved permanently to Firebase!');
    } catch (err: any) {
      console.error('Failed to publish post:', err);
      alert(`Failed to publish content: ${err?.message || 'Database write operation failed. Form data has been preserved.'}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tmplName.trim()) return;

    try {
      await addTemplate({
        name: tmplName.trim(),
        contentType: tmplType,
        description: tmplDesc.trim() || `Reusable template for ${tmplType}`,
        fields: tmplFields
      });

      setNewTemplateModal(false);
      setTmplName('');
      setTmplDesc('');
      setTmplFields([
        { name: 'organization', label: 'Organization / Provider', type: 'text', required: true },
        { name: 'lastDate', label: 'Deadline / Date', type: 'date', required: true },
        { name: 'featuredImage', label: 'Featured Banner / Poster Image', type: 'image', required: false }
      ]);
    } catch (err: any) {
      console.error('Failed to create template:', err);
      alert(`Failed to create template: ${err?.message || 'Database write operation failed.'}`);
    }
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secName.trim()) {
      setSectionNotice('Section Name is required.');
      return;
    }
    const titleToUse = secTitle.trim() || secName.trim();
    const rawSlug = secSlug.trim() || secName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = rawSlug || 'section-' + Date.now().toString().slice(-4);
    
    // Check slug collision
    const otherSections = websiteSections.filter(s => s.id !== editingSectionId);
    if (otherSections.some(s => s.slug === slug)) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    try {
      if (editingSectionId) {
        await updateSection(editingSectionId, {
          name: secName.trim(),
          title: titleToUse,
          slug,
          description: secDesc.trim(),
          icon: secIcon.trim() || 'Briefcase',
          bannerImage: secBanner.trim() || undefined,
          layout: secLayout,
          showOnHomepage: secShowHomepage,
          showInDesktopNav: secShowDesktopNav,
          showInMobileNav: secShowMobileNav,
          showInFooter: secShowFooter,
          displayOrder: Number(secDisplayOrder) || 1,
          colorTheme: secColorTheme,
          status: secStatus || 'published',
          seoTitle: secSeoTitle.trim() || undefined,
          seoDescription: secSeoDesc.trim() || undefined
        });
        setSectionNotice(`Section "${secName.trim()}" updated successfully!`);
      } else {
        await addSection({
          name: secName.trim(),
          title: titleToUse,
          slug,
          description: secDesc.trim(),
          icon: secIcon.trim() || 'Briefcase',
          bannerImage: secBanner.trim() || undefined,
          layout: secLayout,
          showOnHomepage: secShowHomepage,
          showInDesktopNav: secShowDesktopNav,
          showInMobileNav: secShowMobileNav,
          showInFooter: secShowFooter,
          displayOrder: Number(secDisplayOrder) || (websiteSections.length + 1),
          colorTheme: secColorTheme,
          status: secStatus || 'published',
          seoTitle: secSeoTitle.trim() || undefined,
          seoDescription: secSeoDesc.trim() || undefined
        });
        setSectionNotice(`Section "${secName.trim()}" published successfully!`);
      }

      setNewSectionModal(false);
      setEditingSectionId(null);
      setSecName('');
      setSecTitle('');
      setSecSlug('');
      setSecDesc('');
      setSecIcon('Briefcase');
      setSecBanner('');
      setSecLayout('card-grid');
      setSecShowHomepage(true);
      setSecShowDesktopNav(true);
      setSecShowMobileNav(true);
      setSecShowFooter(true);
      setSecDisplayOrder(1);
      setSecColorTheme('indigo');
      setSecStatus('published');
      setSecSeoTitle('');
      setSecSeoDesc('');
      setTimeout(() => setSectionNotice(null), 4000);
    } catch (err: any) {
      console.error('Failed to save section:', err);
      setSectionNotice(`Error saving section: ${err?.message || 'Database operation failed.'}`);
    }
  };

  const handleEditSectionModal = (sec: WebsiteSection) => {
    setEditingSectionId(sec.id);
    setSecName(sec.name);
    setSecTitle(sec.title);
    setSecSlug(sec.slug);
    setSecDesc(sec.description);
    setSecIcon(sec.icon);
    setSecBanner(sec.bannerImage || '');
    setSecLayout(sec.layout);
    setSecShowHomepage(sec.showOnHomepage);
    setSecShowDesktopNav(sec.showInDesktopNav);
    setSecShowMobileNav(sec.showInMobileNav);
    setSecShowFooter(sec.showInFooter);
    setSecDisplayOrder(sec.displayOrder);
    setSecColorTheme(sec.colorTheme);
    setSecStatus(sec.status);
    setSecSeoTitle(sec.seoTitle || '');
    setSecSeoDesc(sec.seoDescription || '');
    setNewSectionModal(true);
  };

  const handleDuplicateSection = (sec: WebsiteSection) => {
    addSection({
      name: sec.name + ' (Copy)',
      title: sec.title + ' (Copy)',
      slug: sec.slug + '-copy-' + Date.now().toString().slice(-4),
      description: sec.description,
      icon: sec.icon,
      bannerImage: sec.bannerImage,
      layout: sec.layout,
      showOnHomepage: sec.showOnHomepage,
      showInDesktopNav: sec.showInDesktopNav,
      showInMobileNav: sec.showInMobileNav,
      showInFooter: sec.showInFooter,
      displayOrder: websiteSections.length + 1,
      colorTheme: sec.colorTheme,
      status: 'draft',
      seoTitle: sec.seoTitle,
      seoDescription: sec.seoDescription
    });
  };

  const handleAddFieldToTemplate = () => {
    if (!newFieldLabel.trim()) return;
    const key = newFieldKey.trim() || newFieldLabel.toLowerCase().replace(/[^a-z0-9]/g, '_');
    setTmplFields(prev => [...prev, {
      name: key,
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: newFieldRequired
    }]);
    setNewFieldLabel('');
    setNewFieldKey('');
  };

  const handleRemoveFieldFromTemplate = (index: number) => {
    setTmplFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateDirectMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directMatTopic.trim() || !directMatSubject.trim() || !directMatFileUrl.trim()) {
      alert('Please fill in Topic Name, Subject, and Google Drive Link.');
      return;
    }
    if (isPublishing) return;
    setIsPublishing(true);

    try {
      await addStudyMaterial({
        topicName: directMatTopic.trim(),
        bengaliTopicName: directMatBengaliTopic.trim() || undefined,
        subject: directMatSubject.trim(),
        shortDescription: directMatShortDesc.trim() || directMatTopic.trim(),
        classLevel: directMatClass.trim() || 'General',
        author: directMatAuthor.trim() || currentUser?.name || 'SDH Panel',
        language: directMatLang,
        fileUrl: directMatFileUrl.trim(),
        fileName: directMatTopic.trim().replace(/[^a-zA-Z0-9]/g, '_') + '.pdf',
        fileType: 'drive',
        accessPermission: directMatAccess,
        imageUrl: directMatImage.trim() || undefined
      });

      await addPost({
        title: directMatTopic.trim(),
        bengaliTitle: directMatBengaliTopic.trim() || undefined,
        slug: directMatTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        contentType: 'material',
        summary: directMatShortDesc.trim() || directMatTopic.trim(),
        content: `Access comprehensive study material for ${directMatSubject}: ${directMatTopic}. Google Drive Link: ${directMatFileUrl}`,
        categoryId: 'cat-5',
        featuredImage: directMatImage.trim() || undefined,
        authorId: currentUser?.id || 'admin',
        status: 'published',
        organization: directMatSubject.trim(),
        officialUrl: directMatFileUrl.trim()
      });

      setNewMaterialModal(false);
      setDirectMatTopic('');
      setDirectMatBengaliTopic('');
      setDirectMatSubject('');
      setDirectMatShortDesc('');
      setDirectMatClass('');
      setDirectMatAuthor('');
      setDirectMatFileUrl('');
      setDirectMatImage('');
      alert('Study material published successfully and saved permanently to Firebase!');
    } catch (err: any) {
      console.error('Failed to create study material:', err);
      alert(`Failed to save study material: ${err?.message || 'Database write failed. Form data preserved.'}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCreateDirectService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directSrvName.trim() || !directSrvCategory.trim()) {
      alert('Please fill in Service Name and Category.');
      return;
    }
    if (isPublishing) return;
    setIsPublishing(true);

    try {
      await addDigitalService({
        name: directSrvName.trim(),
        bengaliName: directSrvBengaliName.trim() || undefined,
        category: directSrvCategory.trim(),
        shortDescription: directSrvShortDesc.trim() || directSrvName.trim(),
        icon: 'MonitorSmartphone',
        imageUrl: directSrvImage.trim() || undefined,
        charges: directSrvCharges.trim() || '₹100',
        processingTime: directSrvProcessingTime.trim() || '1 - 2 Hours',
        eligibility: directSrvEligibility.trim(),
        requiredDocuments: directSrvRequiredDocs.split(',').map(d => d.trim()).filter(Boolean),
        process: directSrvProcess.trim(),
        availability: true,
        bookingRequired: directSrvBookingRequired,
        officialWebsite: directSrvWebsite.trim() || undefined
      });

      await addPost({
        title: directSrvName.trim(),
        bengaliTitle: directSrvBengaliName.trim() || undefined,
        slug: directSrvName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        contentType: 'service',
        summary: directSrvShortDesc.trim() || directSrvName.trim(),
        content: `Digital service: ${directSrvName}. Fee: ${directSrvCharges}. Processing Time: ${directSrvProcessingTime}. Booking available through SDH portal.`,
        categoryId: 'cat-6',
        featuredImage: directSrvImage.trim() || undefined,
        authorId: currentUser?.id || 'admin',
        status: 'published',
        organization: directSrvCategory.trim(),
        amount: directSrvCharges.trim(),
        officialUrl: directSrvWebsite.trim()
      });

      setNewServiceModal(false);
      setDirectSrvName('');
      setDirectSrvBengaliName('');
      setDirectSrvCategory('Application Assistance');
      setDirectSrvShortDesc('');
      setDirectSrvWebsite('');
      setDirectSrvImage('');
      alert('Digital service published successfully and saved permanently to Firebase!');
    } catch (err: any) {
      console.error('Failed to create digital service:', err);
      alert(`Failed to save digital service: ${err?.message || 'Database write failed. Form data preserved.'}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Top Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span className="bg-amber-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {currentUser.role.toLowerCase().includes('super') ? 'Super Admin Portal' : 'Admin Portal'}
          </span>
          <h1 className="text-3xl font-black mt-2">Sayan Digital Hub Control Panel</h1>
          <p className="text-slate-400 text-sm mt-1">Logged in as {currentUser.email} ({currentUser.role})</p>
        </div>
        <button
          onClick={() => setActivePage('home')}
          className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition"
        >
          View Live Website
        </button>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'content', label: `Content Management (${posts.length})`, icon: FileText },
          { id: 'templates', label: `Content Templates (${templates.length})`, icon: FileText },
          { id: 'sections', label: `Website Sections (${websiteSections.length})`, icon: Globe },
          { id: 'materials', label: `Study Materials (${studyMaterials.length})`, icon: BookOpen },
          { id: 'services', label: `Digital Services (${digitalServices.length})`, icon: MonitorSmartphone },
          { id: 'appointments', label: `Appointments (${appointments.length})`, icon: CalendarClock },
          { id: 'users', label: `Users & Roles (${users.length})`, icon: Users },
          { id: 'whatsapp', label: 'WhatsApp Management', icon: MessageSquare },
          { id: 'settings', label: 'Website Settings', icon: Settings },
          { id: 'rls', label: 'Database & RLS', icon: Shield },
          { id: 'audit', label: 'Audit Logs', icon: Shield },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Firebase Connection Status Card */}
          <div className="p-6 rounded-2xl border flex items-center justify-between bg-emerald-50 border-emerald-200 text-emerald-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white bg-emerald-600">
                ✓
              </div>
              <div>
                <h4 className="font-bold text-base">
                  Firebase & Firestore Connected Successfully
                </h4>
                <p className="text-xs opacity-80 mt-0.5">
                  Connected to Google Cloud Firebase (Project ID: <code className="font-mono font-bold">hale-dragon-3ghtt</code>) with active ABAC Firestore rules.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-200 text-emerald-900">
              Firebase Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Posts</span>
              <h3 className="text-3xl font-black text-slate-900 mt-2">{posts.length}</h3>
              <p className="text-xs text-emerald-600 font-semibold mt-1">100% Published Active</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase">Registered Customers</span>
              <h3 className="text-3xl font-black text-slate-900 mt-2">{users.filter(u => u.role === 'customer').length}</h3>
              <p className="text-xs text-blue-600 font-semibold mt-1">Active Accounts</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase">Digital Services</span>
              <h3 className="text-3xl font-black text-slate-900 mt-2">{digitalServices.length}</h3>
              <p className="text-xs text-purple-600 font-semibold mt-1">Available for Booking</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase">Appointments</span>
              <h3 className="text-3xl font-black text-slate-900 mt-2">{appointments.length}</h3>
              <p className="text-xs text-amber-600 font-semibold mt-1">Pending & Confirmed</p>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT MANAGEMENT TAB */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900">Content Management System (CMS)</h3>
            <button
              onClick={() => setNewPostModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Update</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <th className="p-4">Title</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Organization</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {posts.map(post => (
                  <tr key={post.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-bold text-slate-800">{post.title}</td>
                    <td className="p-4">
                      <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-semibold uppercase">
                        {post.contentType}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{post.organization || '-'}</td>
                    <td className="p-4 text-slate-500 text-xs">{post.createdAt}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => deletePost(post.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TEMPLATES TAB */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Content Templates Management</h3>
              <p className="text-xs text-slate-500 mt-0.5">Admins and Super Admins can create and configure reusable content templates without code.</p>
            </div>
            <button
              onClick={() => setNewTemplateModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Template</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map(tmpl => (
              <div key={tmpl.id} className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full uppercase tracking-wider">
                        {tmpl.contentType}
                      </span>
                      {tmpl.fields.some(f => f.type === 'image' || f.name === 'featuredImage') && (
                        <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-purple-600" /> Image Upload
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => deleteTemplate(tmpl.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">{tmpl.name}</h4>
                  <p className="text-xs text-slate-600 mt-1">{tmpl.description}</p>
                  <div className="pt-3 border-t border-slate-100 mt-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Configured Fields:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {tmpl.fields.map((f, idx) => (
                        <span 
                          key={idx} 
                          className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 ${
                            f.type === 'image' 
                              ? 'bg-purple-100 text-purple-800 font-bold border border-purple-200' 
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {f.type === 'image' && <ImageIcon className="w-3 h-3 text-purple-600" />}
                          {f.label} ({f.type}){f.required ? ' *' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedTemplateId(tmpl.id);
                    setContentType(tmpl.contentType);
                    setTitle(`New ${tmpl.name.replace('Template', '').trim()}`);
                    setNewPostModal(true);
                  }}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-indigo-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Use Template to Publish</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STUDY MATERIALS TAB */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Study Materials & Google Drive Links</h3>
              <p className="text-xs text-slate-500 mt-0.5">Publish syllabus guides, semester notes, and Google Drive PDF documents.</p>
            </div>
            <button
              onClick={() => setNewMaterialModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Study Material</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <th className="p-4">Topic Name</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Access</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {studyMaterials.map(mat => (
                  <tr key={mat.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-bold text-slate-800">{mat.topicName}</td>
                    <td className="p-4 text-slate-600">{mat.subject}</td>
                    <td className="p-4 uppercase text-xs font-semibold text-emerald-600">{mat.accessPermission}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => deleteStudyMaterial(mat.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DIGITAL SERVICES TAB */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Digital Services Management</h3>
              <p className="text-xs text-slate-500 mt-0.5">Manage digital application services, fee structures, and appointment requirements.</p>
            </div>
            <button
              onClick={() => setNewServiceModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Digital Service</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {digitalServices.map(srv => (
              <div key={srv.id} className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full uppercase">
                      {srv.category}
                    </span>
                    <button
                      onClick={() => deleteDigitalService(srv.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">{srv.name}</h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{srv.shortDescription}</p>
                  
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fee / Charges:</span>
                      <strong className="text-emerald-600">{srv.charges}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Processing Time:</span>
                      <strong>{srv.processingTime}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Booking Required:</span>
                      <span className={`font-bold ${srv.bookingRequired ? 'text-indigo-600' : 'text-slate-500'}`}>
                        {srv.bookingRequired ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setTitle(srv.name);
                    setContentType('service');
                    setSummary(srv.shortDescription);
                    setContent(srv.detailedDescription || srv.shortDescription);
                    setAmount(srv.charges);
                    setOrganization(srv.category);
                    setNewPostModal(true);
                  }}
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-200"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Update in CMS</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* APPOINTMENTS TAB */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-[#263449] shadow-sm">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Service Appointments & Availability Management</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage customer booking requests, status updates, and office availability calendar schedule.</p>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#172033] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setAppointmentSubTab('list')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                  appointmentSubTab === 'list'
                    ? 'bg-white dark:bg-[#0B1220] text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Customer Appointments ({appointments.length})
              </button>

              <button
                type="button"
                onClick={() => setAppointmentSubTab('availability')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  appointmentSubTab === 'availability'
                    ? 'bg-white dark:bg-[#0B1220] text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <CalendarClock className="w-3.5 h-3.5" />
                <span>Availability Management</span>
              </button>
            </div>
          </div>

          {appointmentSubTab === 'availability' ? (
            <AvailabilityManagement />
          ) : (
            <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-md border border-slate-200 dark:border-[#263449] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#172033] border-b border-slate-200 dark:border-[#263449] text-xs font-bold text-slate-500 uppercase">
                    <th className="p-4">Service</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Date & Slot</th>
                    <th className="p-4">OTP Authorization</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {appointments.map(apt => (
                    <tr key={apt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{apt.serviceName}</td>
                      <td className="p-4 text-slate-700 dark:text-slate-300">{apt.customerName}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-400 font-mono text-xs">{apt.customerPhone}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-400 text-xs">{apt.date} ({apt.timeSlot})</td>
                      <td className="p-4">
                        {apt.otpConsentAccepted !== false ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 px-2.5 py-1 rounded-full text-xs font-bold" title="Customer agreed to OTP Consent & Authorization Policy">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Authorized</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2.5 py-1 rounded-full text-xs font-medium">
                            <span>Standard</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${
                          apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          apt.status === 'rescheduled' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' :
                          apt.status === 'rejected' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                          apt.status === 'completed' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                          apt.status === 'cancelled' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                          'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <select
                            value={apt.status}
                            onChange={(e) => updateAppointmentStatus(apt.id, e.target.value as any)}
                            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100 shadow-sm focus:outline-none focus:border-indigo-600 cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="rescheduled">Rescheduled</option>
                            <option value="rejected">Rejected</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* USERS & ROLES TAB */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">User & Role Management (Super Admin & Admin Control)</h3>
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Authentication</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-bold text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 font-mono text-xs">{u.email}</td>
                    <td className="p-4">
                      {u.authProvider === 'google' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                          </svg>
                          Google Auth
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          Email Password
                        </span>
                      )}
                    </td>
                    <td className="p-4 uppercase text-xs font-bold text-indigo-600">{u.role.replace('_', ' ')}</td>
                    <td className="p-4 uppercase text-xs font-bold text-emerald-600">{u.status}</td>
                    <td className="p-4 text-right">
                      {currentUser.role.toLowerCase().includes('super') && !u.role.toLowerCase().includes('super') && (
                        <button
                          onClick={() => updateUserRole(u.id, u.role.toLowerCase() === 'admin' ? 'Customer' : 'Admin')}
                          className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow hover:bg-indigo-700 transition"
                        >
                          Toggle Admin Role
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WHATSAPP CUSTOMER SUPPORT MANAGEMENT TAB */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-8">
          
          {/* Header & Status Banner */}
          <div className="bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#0A2540] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-200 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Official Super Admin Panel</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
                  <svg className="w-7 h-7 fill-[#25D366] shrink-0" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.148.566 4.167 1.558 5.918l-1.558 5.682 5.836-1.532c1.691.923 3.633 1.45 5.702 1.45 6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
                  </svg>
                  WhatsApp Customer Support System
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
                  Configure business phone number, prefilled section messages, floating widget placement, homepage banner, business hours, and instant live preview.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={buildWhatsAppUrl(waCountryCode, waPhone, waWelcomeMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Test WhatsApp Direct Chat in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Test WhatsApp Chat</span>
                </a>

                <button
                  type="button"
                  disabled={isWaSaving}
                  onClick={() => handleSaveWhatsAppConfig(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5 text-slate-300" />
                  <span>Save Draft</span>
                </button>

                <button
                  type="button"
                  disabled={isWaSaving}
                  onClick={() => handleSaveWhatsAppConfig(true)}
                  className="px-5 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>{isWaSaving ? 'Publishing...' : 'Publish to Live'}</span>
                </button>
              </div>
            </div>

            {/* Current Status Badge Footer */}
            <div className="mt-6 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-emerald-200">Active Live Number:</span>
                <span className="font-mono font-bold text-white bg-black/30 px-2.5 py-0.5 rounded-lg border border-white/10">
                  {formatWhatsAppDisplay(whatsappConfig.countryCode, whatsappConfig.phoneNumber)}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  whatsappConfig.status === 'published' ? 'bg-emerald-400 text-slate-950' : 'bg-amber-400 text-slate-950'
                }`}>
                  {whatsappConfig.status || 'published'}
                </span>
              </div>

              <div className="flex items-center gap-3 text-emerald-100 text-[11px]">
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${whatsappConfig.enabled ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  Floating Widget: {whatsappConfig.enabled ? 'Active' : 'Disabled'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${whatsappConfig.showOnHomepage ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  Homepage Section: {whatsappConfig.showOnHomepage ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          {/* Feedback Notice */}
          {waFeedback && (
            <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-fadeIn ${
              waFeedback.type === 'success' 
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' 
                : 'bg-rose-50 border border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-center gap-2">
                {waFeedback.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>{waFeedback.message}</span>
              </div>
              <button onClick={() => setWaFeedback(null)} className="p-1 hover:opacity-75">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Configuration Grid & Live Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left 7 Columns: Form Configurations */}
            <div className="lg:col-span-7 space-y-6">

              {/* CARD 1: Official WhatsApp Number & Country Code */}
              <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-5">
                <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                      1. Official Business WhatsApp Number
                    </h4>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                    Required for wa.me
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Country Code */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Country Code</label>
                    <select
                      value={waCountryCode}
                      onChange={e => setWaCountryCode(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-emerald-600 focus:bg-white transition"
                    >
                      <option value="+91">+91 (India - Default)</option>
                      <option value="+1">+1 (USA / Canada)</option>
                      <option value="+44">+44 (United Kingdom)</option>
                      <option value="+971">+971 (UAE)</option>
                      <option value="+880">+880 (Bangladesh)</option>
                      <option value="+977">+977 (Nepal)</option>
                    </select>
                  </div>

                  {/* Phone Number */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Business WhatsApp Phone Number *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={waPhone}
                        onChange={e => setWaPhone(e.target.value)}
                        placeholder="e.g. 8116957965"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-xs outline-none focus:border-emerald-600 focus:bg-white transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Number Validation Feedback */}
                {(() => {
                  const check = validateWhatsAppNumber(waPhone, waCountryCode);
                  return (
                    <div className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
                      check.isValid 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}>
                      <div className="flex items-center gap-2">
                        {check.isValid ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span className="font-semibold">
                          {check.isValid 
                            ? `Valid WhatsApp number: ${formatWhatsAppDisplay(waCountryCode, check.cleaned)}` 
                            : (check.error || 'Please enter a valid 10-digit number.')}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] opacity-75">
                        wa.me/{waCountryCode.replace('+', '')}{check.cleaned}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* CARD 2: Floating Button & Homepage Placement Controls */}
              <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-5">
                <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                      2. Widget Display & Placement Controls
                    </h4>
                  </div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                    Visibility & Position
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Floating Button Toggle */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-xs text-slate-800">Floating Button</h5>
                      <p className="text-[11px] text-slate-500">Show floating WhatsApp widget</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={waEnabled}
                        onChange={e => setWaEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Homepage Section Toggle */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-xs text-slate-800">Homepage Contact Section</h5>
                      <p className="text-[11px] text-slate-500">Show WhatsApp card on Homepage</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={waShowOnHomepage}
                        onChange={e => setWaShowOnHomepage(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Position */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Floating Position</label>
                    <select
                      value={waPosition}
                      onChange={e => setWaPosition(e.target.value as any)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-emerald-600"
                    >
                      <option value="bottom-right">Bottom Right (Recommended)</option>
                      <option value="bottom-left">Bottom Left</option>
                    </select>
                  </div>

                  {/* Button Label */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Button Label</label>
                    <input
                      type="text"
                      value={waButtonLabel}
                      onChange={e => setWaButtonLabel(e.target.value)}
                      placeholder="e.g. WhatsApp Help"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs outline-none focus:border-emerald-600"
                    />
                  </div>

                  {/* Tooltip */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Button Tooltip</label>
                    <input
                      type="text"
                      value={waTooltip}
                      onChange={e => setWaTooltip(e.target.value)}
                      placeholder="e.g. Chat with Sayan Digital Hub"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Modal Heading */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Chat Modal Heading</label>
                    <input
                      type="text"
                      value={waHeading}
                      onChange={e => setWaHeading(e.target.value)}
                      placeholder="e.g. Sayan Digital Hub Support"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs outline-none focus:border-emerald-600"
                    />
                  </div>

                  {/* Modal Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Sub-heading / Description</label>
                    <input
                      type="text"
                      value={waDescription}
                      onChange={e => setWaDescription(e.target.value)}
                      placeholder="e.g. Verified Business Support | Form Fillup & Scholarships"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Permitted Pages Selection */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Select Public Pages Displaying Floating WhatsApp Button
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Choose whether the floating button appears on all pages or only specific sections:
                  </p>
                  
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setWaAllowedPages(['all'])}
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                        waAllowedPages.includes('all')
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      ✓ All Pages (Global)
                    </button>

                    {[
                      { key: 'home', label: 'Home Page' },
                      { key: 'jobs', label: 'Jobs' },
                      { key: 'scholarships', label: 'Scholarships' },
                      { key: 'digital-services', label: 'Digital Services' },
                      { key: 'study-materials', label: 'Study Materials' },
                      { key: 'book-appointment', label: 'Book Appointment' },
                      { key: 'exam-updates', label: 'Exam Updates' },
                      { key: 'contact-us', label: 'Contact Us' },
                      ...websiteSections.map(s => ({ key: s.slug, label: s.name }))
                    ].map(pageItem => {
                      const isChecked = !waAllowedPages.includes('all') && waAllowedPages.includes(pageItem.key);
                      return (
                        <button
                          key={pageItem.key}
                          type="button"
                          onClick={() => {
                            let current = waAllowedPages.includes('all') ? [] : [...waAllowedPages];
                            if (current.includes(pageItem.key)) {
                              current = current.filter(k => k !== pageItem.key);
                              if (current.length === 0) current = ['all'];
                            } else {
                              current.push(pageItem.key);
                            }
                            setWaAllowedPages(current);
                          }}
                          className={`text-xs px-3 py-1.5 rounded-xl font-medium transition cursor-pointer border ${
                            isChecked
                              ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-sm'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {pageItem.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* CARD 3: Business Hours & Customer Support Status */}
              <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-5">
                <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                      3. Business Hours & Live Support Status
                    </h4>
                  </div>
                  <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-full">
                    Availability
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Status Mode */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Online Status Mode</label>
                    <select
                      value={waOnlineStatus}
                      onChange={e => setWaOnlineStatus(e.target.value as any)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-emerald-600"
                    >
                      <option value="auto">Auto (9 AM – 9 PM IST)</option>
                      <option value="online">Always Online (Available)</option>
                      <option value="offline">Offline (Leave Message)</option>
                    </select>
                  </div>

                  {/* Business Hours */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Business Hours Text</label>
                    <input
                      type="text"
                      value={waBusinessHours}
                      onChange={e => setWaBusinessHours(e.target.value)}
                      placeholder="e.g. 9:00 AM – 9:00 PM (Mon – Sat)"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs outline-none focus:border-emerald-600"
                    />
                  </div>

                  {/* Response Time Notice */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Response Time Notice</label>
                    <input
                      type="text"
                      value={waResponseTime}
                      onChange={e => setWaResponseTime(e.target.value)}
                      placeholder="e.g. Typically replies in 15 mins"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Current Live Status Preview */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Calculated Live Status for Customers:</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isSupportOnlineNow(waBusinessHours, waOnlineStatus).badgeColor}`} />
                    <strong className="text-slate-900 font-bold">{isSupportOnlineNow(waBusinessHours, waOnlineStatus).label}</strong>
                  </div>
                </div>
              </div>

              {/* CARD 4: Welcome & Section-Specific Prefilled Messages */}
              <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-5">
                <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                      4. Welcome & Section Prefilled Messages
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewPrefillName('');
                      setNewPrefillKey('');
                      setNewPrefillMsg('');
                      setNewPrefillModal(true);
                    }}
                    className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-xl border border-emerald-200 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Section Prefill</span>
                  </button>
                </div>

                {/* Default Welcome Message */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Default Welcome Message (Fallback for all pages)
                  </label>
                  <textarea
                    rows={3}
                    value={waWelcomeMessage}
                    onChange={e => setWaWelcomeMessage(e.target.value)}
                    placeholder="Enter default welcome greeting and question..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs outline-none focus:border-emerald-600 focus:bg-white transition"
                  />
                </div>

                {/* Section Specific Prefills List */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Configured Website Section Messages ({waSectionPrefills.length})
                  </label>

                  <div className="space-y-3">
                    {waSectionPrefills.map((prefill, idx) => (
                      <div key={prefill.sectionKey} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <h5 className="font-bold text-xs text-slate-900">{prefill.sectionName}</h5>
                            <code className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                              Key: {prefill.sectionKey}
                            </code>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setWaSectionPrefills(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition"
                            title="Delete prefill"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <textarea
                          rows={2}
                          value={prefill.prefillMessage}
                          onChange={e => {
                            const val = e.target.value;
                            setWaSectionPrefills(prev => prev.map((p, i) => i === idx ? { ...p, prefillMessage: val } : p));
                          }}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium text-xs text-slate-800 outline-none focus:border-emerald-600 transition"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Right 5 Columns: Live Interactive Preview Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="sticky top-6 bg-white rounded-3xl p-6 shadow-xl border border-slate-200 space-y-5">
                
                {/* Preview Header & Device Selector */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-emerald-600" />
                      Live Device Preview
                    </h4>
                    <p className="text-[11px] text-slate-500">Real-time simulation of customer view</p>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setWaPreviewDevice('desktop')}
                      className={`p-1.5 rounded-lg transition ${waPreviewDevice === 'desktop' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                      title="Desktop view"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setWaPreviewDevice('tablet')}
                      className={`p-1.5 rounded-lg transition ${waPreviewDevice === 'tablet' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                      title="Tablet view"
                    >
                      <Tablet className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setWaPreviewDevice('mobile')}
                      className={`p-1.5 rounded-lg transition ${waPreviewDevice === 'mobile' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                      title="Mobile view"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Preview Device Mockup Screen */}
                <div className={`mx-auto bg-slate-950 rounded-3xl p-4 border-4 border-slate-800 shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                  waPreviewDevice === 'mobile' ? 'max-w-[320px] min-h-[520px]' : waPreviewDevice === 'tablet' ? 'max-w-[400px] min-h-[540px]' : 'w-full min-h-[540px]'
                }`}>
                  
                  {/* Mock Page Top Bar */}
                  <div className="pb-3 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      <span className="font-mono text-[10px] text-slate-500 ml-1">sayandigitalhub.in</span>
                    </div>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">Preview</span>
                  </div>

                  {/* Mock Background Page Content */}
                  <div className="py-6 space-y-3 opacity-60">
                    <div className="h-4 bg-indigo-900/60 rounded-md w-3/4"></div>
                    <div className="h-3 bg-slate-800 rounded-md w-full"></div>
                    <div className="h-3 bg-slate-800 rounded-md w-5/6"></div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="h-16 bg-slate-900 rounded-xl border border-slate-800"></div>
                      <div className="h-16 bg-slate-900 rounded-xl border border-slate-800"></div>
                    </div>
                  </div>

                  {/* Render Mock WhatsApp Chat Card if open */}
                  {waPreviewCardOpen && (
                    <div className="my-auto bg-slate-900 rounded-2xl shadow-2xl border border-emerald-500/30 overflow-hidden text-white animate-fadeIn text-xs">
                      <div className="bg-gradient-to-r from-[#075E54] to-[#128C7E] p-3 text-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center p-1 border border-white/20">
                              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="SDH" className="w-full h-full object-cover rounded-lg" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                <h5 className="font-extrabold text-xs text-white leading-tight">{waHeading || 'Sayan Digital Hub'}</h5>
                                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                              </div>
                              <p className="text-[10px] text-emerald-100 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                                {isSupportOnlineNow(waBusinessHours, waOnlineStatus).label}
                              </p>
                            </div>
                          </div>
                          <button onClick={() => setWaPreviewCardOpen(false)} className="text-white/80 hover:text-white p-1">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950 space-y-2.5">
                        <div className="bg-[#0b141a] p-2.5 rounded-xl border border-[#202c33] space-y-1">
                          <p className="text-[11px] text-slate-200 leading-relaxed">{waWelcomeMessage}</p>
                          <div className="flex justify-end items-center gap-1 text-[9px] text-slate-500">
                            <span>10:30 AM</span>
                            <CheckCheck className="w-3 h-3 text-emerald-400" />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {waSectionPrefills.slice(0, 3).map(p => (
                            <span key={p.sectionKey} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded-lg border border-slate-700">
                              {p.sectionName}
                            </span>
                          ))}
                        </div>

                        <a
                          href={buildWhatsAppUrl(waCountryCode, waPhone, waWelcomeMessage)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1.5 shadow"
                        >
                          <Send className="w-3 h-3 fill-current" />
                          <span>Start WhatsApp Chat</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Render Mock Floating Trigger Button */}
                  <div className={`mt-auto flex ${waPosition === 'bottom-left' ? 'justify-start' : 'justify-end'}`}>
                    <button
                      onClick={() => setWaPreviewCardOpen(!waPreviewCardOpen)}
                      className="px-3.5 py-2.5 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-black text-xs rounded-full shadow-lg flex items-center gap-2 border border-emerald-300/40 cursor-pointer"
                    >
                      <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.148.566 4.167 1.558 5.918l-1.558 5.682 5.836-1.532c1.691.923 3.633 1.45 5.702 1.45 6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
                      </svg>
                      <span>{waButtonLabel || 'WhatsApp Help'}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <p className="text-[11px] text-slate-500">
                    💡 Click the floating button inside the preview frame to toggle the interactive chat window.
                  </p>
                </div>

              </div>
            </div>

          </div>

          {/* ADD CUSTOM SECTION PREFILL MODAL */}
          {newPrefillModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-extrabold text-base text-slate-900">Add Section Prefilled Message</h4>
                  </div>
                  <button onClick={() => setNewPrefillModal(false)} className="p-1 text-slate-400 hover:text-slate-800">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Section Display Name *</label>
                    <input
                      type="text"
                      value={newPrefillName}
                      onChange={e => {
                        const val = e.target.value;
                        setNewPrefillName(val);
                        if (!newPrefillKey) {
                          setNewPrefillKey(val.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                        }
                      }}
                      placeholder="e.g. WB Police Recruitment or College Admission"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Section Key / Slug *</label>
                    <input
                      type="text"
                      value={newPrefillKey}
                      onChange={e => setNewPrefillKey(e.target.value)}
                      placeholder="e.g. wb-police or admission-2026"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">WhatsApp Prefilled Message *</label>
                    <textarea
                      rows={3}
                      value={newPrefillMsg}
                      onChange={e => setNewPrefillMsg(e.target.value)}
                      placeholder="Hello Sayan Digital Hub, I need assistance regarding..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setNewPrefillModal(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newPrefillName.trim() || !newPrefillKey.trim() || !newPrefillMsg.trim()) return;
                      setWaSectionPrefills(prev => [
                        ...prev.filter(p => p.sectionKey !== newPrefillKey.trim()),
                        {
                          sectionKey: newPrefillKey.trim(),
                          sectionName: newPrefillName.trim(),
                          prefillMessage: newPrefillMsg.trim()
                        }
                      ]);
                      setNewPrefillModal(false);
                    }}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition"
                  >
                    Save Section Prefill
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* WEBSITE SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 max-w-2xl space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Website General Settings (Super Admin)</h3>
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Website Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={e => updateSettings({ siteName: e.target.value })}
                className="w-full p-3 bg-slate-50 border rounded-xl font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={e => updateSettings({ tagline: e.target.value })}
                className="w-full p-3 bg-slate-50 border rounded-xl font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={e => updateSettings({ contactEmail: e.target.value })}
                className="w-full p-3 bg-slate-50 border rounded-xl font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Number</label>
              <input
                type="text"
                value={settings.contactNumber || ''}
                onChange={e => updateSettings({ contactNumber: e.target.value })}
                className="w-full p-3 bg-slate-50 border rounded-xl font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location / Address</label>
              <input
                type="text"
                value={settings.location || ''}
                onChange={e => updateSettings({ location: e.target.value })}
                className="w-full p-3 bg-slate-50 border rounded-xl font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600"
              />
            </div>

            {/* Logo & Branding Customization */}
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    Website Logo & Branding Customization
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Super Admin can upload a new logo file, enter a logo image URL, or choose a preset. Changes reflect immediately across headers.
                  </p>
                </div>
                {settings.logoUrl && (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    Custom Logo Active
                  </span>
                )}
              </div>
              
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative group shrink-0">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 via-blue-600 to-cyan-400 flex items-center justify-center text-white font-black text-xl overflow-hidden border-4 border-white shadow-lg ring-2 ring-indigo-200">
                      {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span>SDH</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer">
                        <UploadCloud className="w-4 h-4" />
                        <span>Upload Logo File (PNG, JPG, SVG, WebP)</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const compressed = await compressImage(file, 600, 600, 0.8);
                              updateLogo(compressed);
                            }
                          }}
                        />
                      </label>

                      {settings.logoUrl && (
                        <button
                          type="button"
                          onClick={() => updateLogo('')}
                          className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition"
                        >
                          Remove Logo
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase">Or Enter Direct Logo Image URL</label>
                      <input
                        type="url"
                        value={settings.logoUrl || ''}
                        placeholder="https://images.unsplash.com/... or image URL"
                        onChange={e => updateLogo(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-800 outline-none focus:border-indigo-600"
                      />
                    </div>

                    {/* Logo Presets */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Presets:</span>
                      {[
                        { label: 'Cyber Tech Badge', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80' },
                        { label: 'Digital Hub Shield', url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=300&q=80' },
                        { label: 'Gold Emblem', url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=300&q=80' }
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => updateLogo(preset.url)}
                          className="text-[10px] font-bold bg-white border border-slate-200 hover:border-indigo-400 text-slate-600 hover:text-indigo-600 px-2.5 py-1 rounded-lg transition shadow-sm cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT LOGS TAB */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">System Audit Logs</h3>
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-4 text-slate-500">{log.timestamp}</td>
                    <td className="p-4 font-bold text-indigo-700">{log.action}</td>
                    <td className="p-4 text-slate-600">{log.userEmail}</td>
                    <td className="p-4 text-slate-800">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DATABASE & RLS POLICIES TAB */}
      {activeTab === 'rls' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Database Schema & Row Level Security (RLS)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Role authorization model for <strong>Super Admin</strong>, <strong>Admin</strong>, and <strong>Customer</strong>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                RLS Policies Active
              </span>
            </div>
          </div>

          {/* Role Access Matrix */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h4 className="text-sm font-bold text-slate-800">Role Authorization Matrix</h4>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase">
                  <th className="p-3.5">Feature / Resource</th>
                  <th className="p-3.5 text-center">Customer</th>
                  <th className="p-3.5 text-center">Admin</th>
                  <th className="p-3.5 text-center">Super Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3.5 font-medium text-slate-800">View Published Posts & Opportunities</td>
                  <td className="p-3.5 text-center text-emerald-600 font-bold">✓ Public Access</td>
                  <td className="p-3.5 text-center text-emerald-600 font-bold">✓ Full Access</td>
                  <td className="p-3.5 text-center text-emerald-600 font-bold">✓ Full Access</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium text-slate-800">Create, Edit, Schedule & Publish Content</td>
                  <td className="p-3.5 text-center text-rose-500 font-semibold">✗ Denied</td>
                  <td className="p-3.5 text-center text-emerald-600 font-bold">✓ Full Authority</td>
                  <td className="p-3.5 text-center text-emerald-600 font-bold">✓ Full Authority</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium text-slate-800">Create & Configure Content Templates</td>
                  <td className="p-3.5 text-center text-rose-500 font-semibold">✗ Denied</td>
                  <td className="p-3.5 text-center text-emerald-600 font-bold">✓ Full Authority</td>
                  <td className="p-3.5 text-center text-emerald-600 font-bold">✓ Full Authority</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium text-slate-800">Access & Manage Own Appointments</td>
                  <td className="p-3.5 text-center text-emerald-600 font-bold">✓ Own Only (RLS)</td>
                  <td className="p-3.5 text-center text-emerald-600 font-bold">✓ Manage All</td>
                  <td className="p-3.5 text-center text-emerald-600 font-bold">✓ Manage All</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium text-slate-800">Update Own Profile (Name, Phone, Avatar)</td>
                  <td className="p-3.5 text-center text-emerald-600 font-bold">✓ Own Only (RLS)</td>
                  <td className="p-3.5 text-center text-emerald-600 font-bold">✓ Own Only (RLS)</td>
                  <td className="p-3.5 text-center text-emerald-600 font-bold">✓ Full Authority</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium text-slate-800">Elevate or Modify User Roles</td>
                  <td className="p-3.5 text-center text-rose-500 font-semibold">✗ Denied</td>
                  <td className="p-3.5 text-center text-rose-500 font-semibold">✗ Denied</td>
                  <td className="p-3.5 text-center text-amber-600 font-bold">✓ Exclusive Super Admin</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium text-slate-800">Global Website Settings & Branding</td>
                  <td className="p-3.5 text-center text-rose-500 font-semibold">✗ Denied</td>
                  <td className="p-3.5 text-center text-slate-400 font-semibold">Read Only</td>
                  <td className="p-3.5 text-center text-amber-600 font-bold">✓ Exclusive Super Admin</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Firestore Security Rules Box */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">Cloud Firestore Security Rules (ABAC)</h4>
                <p className="text-xs text-slate-400">Deployed rules protecting user profiles, posts, services, and appointment bookings.</p>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-mono">
                firestore.rules
              </span>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto max-h-60 overflow-y-auto border border-slate-800">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Default deny
    match /{document=**} { allow read, write: if false; }

    function isSuperAdmin() {
      return request.auth != null && request.auth.token.email.lower() == 'sayanbaishya64@gmail.com';
    }

    function isAdmin() {
      return request.auth != null && (
        isSuperAdmin() || 
        (exists(/databases/$(database)/documents/users/$(request.auth.uid)) && 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super_admin'])
      );
    }

    match /users/{userId} {
      allow get: if request.auth.uid == userId || isAdmin();
      allow list: if isAdmin();
      allow create: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId || isAdmin();
    }

    match /posts/{postId} {
      allow read: if resource.data.status == 'published' || isAdmin();
      allow write: if isAdmin();
    }

    match /appointments/{appointmentId} {
      allow create: if true;
      allow read, write: if isAdmin() || (request.auth != null && resource.data.customerId == request.auth.uid);
    }
  }
}`}
            </pre>
          </div>
        </div>
      )}

      {/* CREATE POST / USE TEMPLATE MODAL */}
      {newPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedTemplateId 
                    ? `Publish with Template: ${templates.find(t => t.id === selectedTemplateId)?.name || 'Custom Template'}`
                    : 'Create New Website Update (CMS)'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Fill in the details below to publish directly to the live website feed and corresponding section.
                </p>
              </div>
              <button 
                onClick={() => {
                  setNewPostModal(false);
                  setSelectedTemplateId('');
                }} 
                className="text-slate-400 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedTemplateId && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">Active Template</span>
                  <p className="text-sm font-semibold text-slate-800">
                    {templates.find(t => t.id === selectedTemplateId)?.name}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {templates.find(t => t.id === selectedTemplateId)?.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTemplateId('')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold px-3 py-1.5 bg-white border border-indigo-200 rounded-lg shadow-sm"
                >
                  Clear Template
                </button>
              </div>
            )}

            <form onSubmit={handleCreatePost} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Content Category / Type *</label>
                <select
                  value={contentType}
                  onChange={e => setContentType(e.target.value as ContentType)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:bg-white focus:border-indigo-600"
                >
                  <option value="job">Government Job (Govt Jobs Page)</option>
                  <option value="scholarship">Scholarship & Grant (Scholarships Page)</option>
                  <option value="material">Study Material & Drive Notes (Study Materials Page)</option>
                  <option value="service">Digital Service Listing (Services & Appointment Page)</option>
                  <option value="exam">Examination Routine & Update (Exam Updates Page)</option>
                  <option value="admit">Admit Card / Hall Ticket (Admit Cards Page)</option>
                  <option value="result">Examination Result (Results Page)</option>
                  <option value="admission">College / University Admission (Admissions Page)</option>
                  <option value="news">Education News & Articles</option>
                  <option value="announcement">Important Notice / Announcement</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title (English) *</label>
                  <input 
                    type="text" 
                    required 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="e.g. WB Police Constable Recruitment 2026" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title (Bengali / বাংলা)</label>
                  <input 
                    type="text" 
                    value={bengaliTitle} 
                    onChange={e => setBengaliTitle(e.target.value)} 
                    placeholder="e.g. পশ্চিমবঙ্গ পুলিশ কনস্টেবল নিয়োগ ২০২৬" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600" 
                  />
                </div>
              </div>

              {/* IMAGE UPLOAD SECTION FOR ALL TEMPLATES */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Featured Image / Poster Banner (Content Templates)
                    </span>
                  </div>
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className={`px-2.5 py-1 rounded-md transition ${imageInputMode === 'upload' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-2.5 py-1 rounded-md transition ${imageInputMode === 'url' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {imageInputMode === 'upload' ? (
                  <div>
                    <label className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/20 rounded-xl cursor-pointer transition group">
                      <UploadCloud className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition mb-1" />
                      <span className="text-xs font-bold text-slate-700">Click or Drag to Upload Featured Image</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Supports PNG, JPG, JPEG, WebP, SVG</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const compressed = await compressImage(file);
                            setFeaturedImage(compressed);
                          }
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={featuredImage}
                      onChange={e => setFeaturedImage(e.target.value)}
                      placeholder="Paste Image URL: https://images.unsplash.com/... or direct image link"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-600 text-xs font-mono"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Quick Presets:</span>
                      {[
                        { label: 'Govt Job Banner', url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80' },
                        { label: 'Scholarship Banner', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80' },
                        { label: 'Exam Routine', url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80' },
                        { label: 'Study Notes Cover', url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80' },
                        { label: 'Digital Hub Service', url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80' }
                      ].map((stock, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFeaturedImage(stock.url)}
                          className="text-[10px] bg-white border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 px-2 py-0.5 rounded shadow-sm transition"
                        >
                          {stock.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {featuredImage && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white p-2.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src={featuredImage} alt="Preview" className="w-20 h-14 object-cover rounded-lg border border-slate-200 shadow-sm" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-xs font-bold text-slate-800">Featured Image Attached</span>
                        </div>
                        <span className="text-[11px] text-slate-500">Will be featured on website cards and detail banner</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFeaturedImage('')}
                      className="text-xs text-rose-600 hover:text-rose-800 font-bold px-3 py-1.5 rounded-lg hover:bg-rose-50 transition border border-rose-100"
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>

              {/* SPECIFIC FIELDS FOR STUDY MATERIAL TEMPLATE */}
              {contentType === 'material' && (
                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-900 uppercase">Study Material & Drive Attachment Fields</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject / Discipline *</label>
                      <input 
                        type="text" 
                        required
                        value={matSubject} 
                        onChange={e => setMatSubject(e.target.value)} 
                        placeholder="e.g. Mathematics, Physics, WBCS GS" 
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-600 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Class / Semester / Exam</label>
                      <input 
                        type="text" 
                        value={qualification} 
                        onChange={e => setQualification(e.target.value)} 
                        placeholder="e.g. Class 12 / Sem 4 / General" 
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-600 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Access Level</label>
                      <select
                        value={matAccess}
                        onChange={e => setMatAccess(e.target.value as any)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none text-xs font-medium"
                      >
                        <option value="public">Public (Open for all students)</option>
                        <option value="registered">Registered Students Only</option>
                        <option value="restricted">Restricted / Premium</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Google Drive PDF URL / File Download Link *</label>
                    <input 
                      type="url" 
                      required
                      value={matDriveUrl} 
                      onChange={e => setMatDriveUrl(e.target.value)} 
                      placeholder="https://drive.google.com/file/d/your-pdf-id/view?usp=sharing" 
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-600 text-xs font-mono" 
                    />
                  </div>
                </div>
              )}

              {/* SPECIFIC FIELDS FOR DIGITAL SERVICES TEMPLATE */}
              {contentType === 'service' && (
                <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 space-y-4">
                  <div className="flex items-center gap-2">
                    <MonitorSmartphone className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-purple-900 uppercase">Digital Service Configuration Fields</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Service Category</label>
                      <input 
                        type="text" 
                        value={srvCategory} 
                        onChange={e => setSrvCategory(e.target.value)} 
                        placeholder="e.g. Application Assistance" 
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Service Charges / Fees</label>
                      <input 
                        type="text" 
                        value={srvCharges} 
                        onChange={e => setSrvCharges(e.target.value)} 
                        placeholder="e.g. ₹50 - ₹150 + Govt Fee" 
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Processing Time</label>
                      <input 
                        type="text" 
                        value={srvProcessingTime} 
                        onChange={e => setSrvProcessingTime(e.target.value)} 
                        placeholder="e.g. 30 Mins / 1 Day" 
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none text-xs" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STANDARD FIELDS FOR JOBS, SCHOLARSHIPS, EXAMS */}
              {contentType !== 'material' && contentType !== 'service' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      {contentType === 'exam' || contentType === 'admit' || contentType === 'result' ? 'Conducting Board / Authority' : 'Organization / Authority'}
                    </label>
                    <input 
                      type="text" 
                      value={organization} 
                      onChange={e => setOrganization(e.target.value)} 
                      placeholder="e.g. WBPRB, SSC, WBBSE, WBCHSE" 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      {contentType === 'scholarship' ? 'Scholarship Amount' : contentType === 'exam' || contentType === 'admit' ? 'Exam Date' : 'Total Vacancies'}
                    </label>
                    <input 
                      type="text" 
                      value={contentType === 'scholarship' ? amount : contentType === 'exam' || contentType === 'admit' ? examDate : totalVacancies} 
                      onChange={e => {
                        if (contentType === 'scholarship') setAmount(e.target.value);
                        else if (contentType === 'exam' || contentType === 'admit') setExamDate(e.target.value);
                        else setTotalVacancies(e.target.value);
                      }} 
                      placeholder={contentType === 'scholarship' ? 'e.g. ₹12,000 / year' : contentType === 'exam' ? 'e.g. 15 December 2026' : 'e.g. 12,500 posts'} 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600" 
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {contentType === 'service' ? 'Official Portal URL' : contentType === 'material' ? 'Reference Link' : 'Official Notification URL'}
                  </label>
                  <input 
                    type="url" 
                    value={officialUrl} 
                    onChange={e => setOfficialUrl(e.target.value)} 
                    placeholder="https://..." 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 text-xs font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {contentType === 'admit' ? 'Direct Admit Card Download URL' : contentType === 'result' ? 'Result Portal URL' : 'Apply Online / Portal URL'}
                  </label>
                  <input 
                    type="url" 
                    value={applyUrl} 
                    onChange={e => setApplyUrl(e.target.value)} 
                    placeholder="https://..." 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 text-xs font-mono" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Short Summary (English) *</label>
                <textarea 
                  rows={2} 
                  required
                  value={summary} 
                  onChange={e => setSummary(e.target.value)} 
                  placeholder="A clear brief overview displayed on cards and search results..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Detailed Content / Instructions</label>
                <textarea 
                  rows={4} 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  placeholder="Complete post details, eligibility instructions, procedure, and notes..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewPostModal(false);
                    setSelectedTemplateId('');
                  }}
                  className="w-1/3 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isPublishing}
                  className={`w-2/3 py-3.5 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                    isPublishing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                  }`}
                >
                  {isPublishing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Publishing to Database...</span>
                    </>
                  ) : (
                    <span>Publish Immediately</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW TEMPLATE MODAL */}
      {newTemplateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Create New Content Template</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Design reusable form templates with custom fields. Admins can use this template to publish content instantly without coding.
                </p>
              </div>
              <button 
                onClick={() => setNewTemplateModal(false)} 
                className="text-slate-400 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Quick Template Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTmplName('Study Materials & Notes Publishing Template');
                    setTmplType('material');
                    setTmplDesc('Template for uploading semester syllabus guides, chapter notes, and Google Drive PDFs with cover image.');
                    setTmplFields([
                      { name: 'subject', label: 'Subject / Discipline', type: 'text', required: true },
                      { name: 'classLevel', label: 'Class / Semester / Exam', type: 'text', required: false },
                      { name: 'author', label: 'Author / Faculty / Panel', type: 'text', required: false },
                      { name: 'language', label: 'Language (English / Bengali / Both)', type: 'text', required: true },
                      { name: 'fileUrl', label: 'Google Drive File URL / PDF Link', type: 'url', required: true },
                      { name: 'accessPermission', label: 'Access Level (public / registered)', type: 'text', required: true },
                      { name: 'featuredImage', label: 'Study Material Cover / PDF Thumbnail', type: 'image', required: false }
                    ]);
                  }}
                  className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Study Materials Template</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTmplName('Digital Services & Online Booking Template');
                    setTmplType('service');
                    setTmplDesc('Template for listing public digital services, online application assistance, charges, and timeframes.');
                    setTmplFields([
                      { name: 'category', label: 'Service Category', type: 'text', required: true },
                      { name: 'charges', label: 'Service Fee / Charges', type: 'text', required: true },
                      { name: 'processingTime', label: 'Estimated Processing Time', type: 'text', required: true },
                      { name: 'eligibility', label: 'Eligibility / Target Audience', type: 'text', required: false },
                      { name: 'requiredDocuments', label: 'Required Documents List', type: 'textarea', required: false },
                      { name: 'process', label: 'Step-by-step Process', type: 'textarea', required: false },
                      { name: 'officialWebsite', label: 'Official Portal Website', type: 'url', required: false },
                      { name: 'featuredImage', label: 'Digital Service Banner / Poster Image', type: 'image', required: false }
                    ]);
                  }}
                  className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  <MonitorSmartphone className="w-3.5 h-3.5" />
                  <span>Digital Services Template</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTmplName('Blank Page Template');
                    setTmplType('news');
                    setTmplDesc('A completely blank template with no default fields for fully custom content.');
                    setTmplFields([]);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span className="w-3.5 h-3.5 border-2 border-slate-400 rounded-sm"></span>
                  <span>Blank Page</span>
                </button>


                <button
                  type="button"
                  onClick={() => {
                    setTmplName('Government Job Standard Template');
                    setTmplType('job');
                    setTmplDesc('Standard template for recruitment notifications, vacancies, eligibility, and links.');
                    setTmplFields([
                      { name: 'organization', label: 'Organization Name', type: 'text', required: true },
                      { name: 'totalVacancies', label: 'Total Vacancies', type: 'text', required: true },
                      { name: 'qualification', label: 'Educational Qualification', type: 'text', required: true },
                      { name: 'lastDate', label: 'Application Deadline', type: 'date', required: true },
                      { name: 'applyUrl', label: 'Online Application Portal', type: 'url', required: false },
                      { name: 'featuredImage', label: 'Featured Recruitment Banner / Poster Image', type: 'image', required: false }
                    ]);
                  }}
                  className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Govt Job Template</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTmplName('Scholarship Opportunity Template');
                    setTmplType('scholarship');
                    setTmplDesc('Template for publishing financial scholarships and educational grants.');
                    setTmplFields([
                      { name: 'organization', label: 'Provider / Foundation', type: 'text', required: true },
                      { name: 'amount', label: 'Scholarship Amount', type: 'text', required: true },
                      { name: 'qualification', label: 'Eligibility & Criteria', type: 'text', required: true },
                      { name: 'lastDate', label: 'Application Deadline', type: 'date', required: true },
                      { name: 'applyUrl', label: 'Application Portal URL', type: 'url', required: false },
                      { name: 'featuredImage', label: 'Scholarship Banner / Poster Image', type: 'image', required: false }
                    ]);
                  }}
                  className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  <CalendarClock className="w-3.5 h-3.5" />
                  <span>Scholarship Template</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Template Name *</label>
                  <input
                    type="text"
                    required
                    value={tmplName}
                    onChange={e => setTmplName(e.target.value)}
                    placeholder="e.g. Higher Secondary Study Material Template"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Content Type *</label>
                  <select
                    value={tmplType}
                    onChange={e => {
                      const newType = e.target.value as ContentType;
                      setTmplType(newType);
                      if (newType === 'material') {
                        setTmplFields([
                          { name: 'subject', label: 'Subject / Discipline', type: 'text', required: true },
                          { name: 'classLevel', label: 'Class / Semester / Exam', type: 'text', required: false },
                          { name: 'author', label: 'Author / Faculty / Panel', type: 'text', required: false },
                          { name: 'fileUrl', label: 'Google Drive File URL / PDF Link', type: 'url', required: true },
                          { name: 'featuredImage', label: 'Study Material Cover / PDF Thumbnail', type: 'image', required: false }
                        ]);
                      } else if (newType === 'service') {
                        setTmplFields([
                          { name: 'category', label: 'Service Category', type: 'text', required: true },
                          { name: 'charges', label: 'Service Charges', type: 'text', required: true },
                          { name: 'processingTime', label: 'Processing Time', type: 'text', required: true },
                          { name: 'requiredDocuments', label: 'Required Documents List', type: 'textarea', required: false },
                          { name: 'featuredImage', label: 'Digital Service Banner / Poster Image', type: 'image', required: false }
                        ]);
                      } else if (newType === 'job') {
                        setTmplFields([
                          { name: 'organization', label: 'Organization Name', type: 'text', required: true },
                          { name: 'totalVacancies', label: 'Total Vacancies', type: 'text', required: true },
                          { name: 'qualification', label: 'Educational Qualification', type: 'text', required: true },
                          { name: 'lastDate', label: 'Application Deadline', type: 'date', required: true },
                          { name: 'applyUrl', label: 'Online Application Portal', type: 'url', required: false },
                          { name: 'featuredImage', label: 'Featured Recruitment Banner / Poster Image', type: 'image', required: false }
                        ]);
                      } else if (newType === 'scholarship') {
                        setTmplFields([
                          { name: 'organization', label: 'Provider / Foundation', type: 'text', required: true },
                          { name: 'amount', label: 'Scholarship Amount', type: 'text', required: true },
                          { name: 'qualification', label: 'Eligibility & Criteria', type: 'text', required: true },
                          { name: 'lastDate', label: 'Application Deadline', type: 'date', required: true },
                          { name: 'applyUrl', label: 'Application Portal URL', type: 'url', required: false },
                          { name: 'featuredImage', label: 'Scholarship Banner / Poster Image', type: 'image', required: false }
                        ]);
                      } else if (newType === 'exam' || newType === 'admit' || newType === 'result') {
                        setTmplFields([
                          { name: 'organization', label: 'Conducting Body / Authority', type: 'text', required: true },
                          { name: 'examDate', label: 'Examination / Routine Date', type: 'text', required: false },
                          { name: 'officialUrl', label: 'Official Portal / Result URL', type: 'url', required: true },
                          { name: 'featuredImage', label: 'Official Notice / Schedule Banner Image', type: 'image', required: false }
                        ]);
                      } else {
                        setTmplFields([
                          { name: 'organization', label: 'Organization / Source', type: 'text', required: false },
                          { name: 'officialUrl', label: 'Official / Notification URL', type: 'url', required: false },
                          { name: 'featuredImage', label: 'Featured Banner / Poster Image', type: 'image', required: false }
                        ]);
                      }
                    }}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 text-sm font-semibold"
                  >
                    <option value="material">Study Materials & Drive Notes (material)</option>
                    <option value="service">Digital Services Listing (service)</option>
                    <option value="job">Government Job (job)</option>
                    <option value="scholarship">Scholarship & Grants (scholarship)</option>
                    <option value="exam">Examination Routine (exam)</option>
                    <option value="admit">Admit Card Release (admit)</option>
                    <option value="result">Examination Result (result)</option>
                    <option value="admission">College / University Admission (admission)</option>
                    <option value="news">Educational News (news)</option>
                    <option value="announcement">General Announcement (announcement)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Template Description</label>
                <input
                  type="text"
                  value={tmplDesc}
                  onChange={e => setTmplDesc(e.target.value)}
                  placeholder="e.g. Standard structure for publishing study materials with Google Drive links."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 text-sm"
                />
              </div>

              {/* CONFIGURED FIELDS LIST */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Configured Template Fields ({tmplFields.length})
                  </label>
                  <span className="text-[11px] text-slate-500">Each field becomes an input in the publishing form.</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto p-1">
                  {tmplFields.map((field, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-xs">{field.label}</span>
                            {field.type === 'image' && (
                              <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" /> Image Upload
                              </span>
                            )}
                            {field.required && (
                              <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold uppercase">
                                Required
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            key: {field.name} | type: {field.type}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveFieldFromTemplate(index)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        title="Remove Field"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ADD CUSTOM FIELD SUB-FORM */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-300 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase block">Add Custom Field to Template</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={newFieldLabel}
                      onChange={e => setNewFieldLabel(e.target.value)}
                      placeholder="Field Label (e.g. Featured Banner / Poster)"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none text-xs"
                    />
                  </div>
                  <div>
                    <select
                      value={newFieldType}
                      onChange={e => setNewFieldType(e.target.value as any)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none text-xs font-semibold"
                    >
                      <option value="image">Image Upload / Photo Banner</option>
                      <option value="text">Text Input</option>
                      <option value="textarea">Multi-line Text</option>
                      <option value="url">URL / Web Link</option>
                      <option value="date">Date Picker</option>
                      <option value="number">Number</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newFieldRequired}
                        onChange={e => setNewFieldRequired(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span className="font-semibold">Required</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddFieldToTemplate}
                      className="ml-auto px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setNewTemplateModal(false)}
                  className="w-1/3 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition text-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Save & Enable Template</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STUDY MATERIAL MODAL */}
      {newMaterialModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Add New Study Material</h3>
                <p className="text-xs text-slate-500 mt-1">Upload or link notes, syllabus materials, and Google Drive PDFs.</p>
              </div>
              <button 
                onClick={() => setNewMaterialModal(false)} 
                className="text-slate-400 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDirectMaterial} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Topic / Chapter Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={directMatTopic}
                    onChange={e => setDirectMatTopic(e.target.value)}
                    placeholder="e.g. Modern Indian History WBCS Quick Revision"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Topic Name (Bengali / বাংলা)</label>
                  <input
                    type="text"
                    value={directMatBengaliTopic}
                    onChange={e => setDirectMatBengaliTopic(e.target.value)}
                    placeholder="e.g. আধুনিক ভারতের ইতিহাস হ্যান্ডনোটস"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject / Discipline *</label>
                  <input
                    type="text"
                    required
                    value={directMatSubject}
                    onChange={e => setDirectMatSubject(e.target.value)}
                    placeholder="e.g. History, Physics, Math"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Class / Semester / Exam</label>
                  <input
                    type="text"
                    value={directMatClass}
                    onChange={e => setDirectMatClass(e.target.value)}
                    placeholder="e.g. Class 12 / WBCS / Sem 2"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Author / Faculty</label>
                  <input
                    type="text"
                    value={directMatAuthor}
                    onChange={e => setDirectMatAuthor(e.target.value)}
                    placeholder="e.g. SDH Academic Panel"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Material Language</label>
                  <select
                    value={directMatLang}
                    onChange={e => setDirectMatLang(e.target.value as any)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-semibold"
                  >
                    <option value="English">English</option>
                    <option value="Bengali">Bengali (বাংলা)</option>
                    <option value="Both">Bilingual (Both)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Access Permission</label>
                  <select
                    value={directMatAccess}
                    onChange={e => setDirectMatAccess(e.target.value as any)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-semibold"
                  >
                    <option value="public">Public (Open for Everyone)</option>
                    <option value="registered">Registered Students Only</option>
                    <option value="restricted">Restricted Access</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Google Drive File Link / PDF URL *</label>
                <input
                  type="url"
                  required
                  value={directMatFileUrl}
                  onChange={e => setDirectMatFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/.../view"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 text-xs font-mono"
                />
              </div>

              {/* COVER IMAGE UPLOAD SECTION */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Study Material Cover Image / PDF Thumbnail
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Optional</span>
                </div>

                <div className="space-y-2">
                  <label className="w-full flex items-center justify-center p-3 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/20 rounded-xl cursor-pointer transition text-xs font-bold text-indigo-700">
                    <UploadCloud className="w-4 h-4 mr-2 text-indigo-600" />
                    <span>Upload Cover Image (PNG, JPG, WebP)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const compressed = await compressImage(file);
                          setDirectMatImage(compressed);
                        }
                      }}
                    />
                  </label>

                  <input
                    type="url"
                    value={directMatImage}
                    onChange={e => setDirectMatImage(e.target.value)}
                    placeholder="Or enter direct image URL: https://..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none text-xs font-mono"
                  />

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Presets:</span>
                    {[
                      { label: 'Study Notes Book', url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80' },
                      { label: 'Science / Physics', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80' },
                      { label: 'Exam Routine', url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80' }
                    ].map((stock, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setDirectMatImage(stock.url)}
                        className="text-[10px] bg-white border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 px-2 py-0.5 rounded shadow-sm transition"
                      >
                        {stock.label}
                      </button>
                    ))}
                  </div>

                  {directMatImage && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white p-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={directMatImage} alt="Cover preview" className="w-16 h-12 object-cover rounded-lg border border-slate-200" />
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Cover Attached
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDirectMatImage('')}
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Short Description / Syllabus Overview</label>
                <textarea
                  rows={3}
                  value={directMatShortDesc}
                  onChange={e => setDirectMatShortDesc(e.target.value)}
                  placeholder="Summary of contents included in this PDF file..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 text-xs"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNewMaterialModal(false)}
                  className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className={`w-2/3 py-3 text-white font-bold rounded-xl shadow transition text-xs flex items-center justify-center gap-2 cursor-pointer ${
                    isPublishing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isPublishing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Publishing Material...</span>
                    </>
                  ) : (
                    <span>Publish Study Material</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD DIGITAL SERVICE MODAL */}
      {newServiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Add New Digital Service</h3>
                <p className="text-xs text-slate-500 mt-1">Configure service offerings, application charges, and appointment requirements.</p>
              </div>
              <button 
                onClick={() => setNewServiceModal(false)} 
                className="text-slate-400 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDirectService} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Service Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={directSrvName}
                    onChange={e => setDirectSrvName(e.target.value)}
                    placeholder="e.g. WB Police SI Online Form Fillup"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Service Name (Bengali / বাংলা)</label>
                  <input
                    type="text"
                    value={directSrvBengaliName}
                    onChange={e => setDirectSrvBengaliName(e.target.value)}
                    placeholder="e.g. পুলিশ এসআই অনলাইন ফর্ম ফিলাপ"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={directSrvCategory}
                    onChange={e => setDirectSrvCategory(e.target.value)}
                    placeholder="Application Assistance"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Charges / Fees *</label>
                  <input
                    type="text"
                    required
                    value={directSrvCharges}
                    onChange={e => setDirectSrvCharges(e.target.value)}
                    placeholder="e.g. ₹100"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Processing Time *</label>
                  <input
                    type="text"
                    required
                    value={directSrvProcessingTime}
                    onChange={e => setDirectSrvProcessingTime(e.target.value)}
                    placeholder="e.g. 1 - 2 Hours"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Audience / Eligibility</label>
                  <input
                    type="text"
                    value={directSrvEligibility}
                    onChange={e => setDirectSrvEligibility(e.target.value)}
                    placeholder="All Eligible Candidates"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Official Portal Website</label>
                  <input
                    type="url"
                    value={directSrvWebsite}
                    onChange={e => setDirectSrvWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-mono"
                  />
                </div>
              </div>

              {/* SERVICE BANNER IMAGE UPLOAD SECTION */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Digital Service Banner / Poster Image
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Optional</span>
                </div>

                <div className="space-y-2">
                  <label className="w-full flex items-center justify-center p-3 border-2 border-dashed border-purple-200 hover:border-purple-400 bg-white hover:bg-purple-50/20 rounded-xl cursor-pointer transition text-xs font-bold text-purple-700">
                    <UploadCloud className="w-4 h-4 mr-2 text-purple-600" />
                    <span>Upload Service Image (PNG, JPG, WebP)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const compressed = await compressImage(file);
                          setDirectSrvImage(compressed);
                        }
                      }}
                    />
                  </label>

                  <input
                    type="url"
                    value={directSrvImage}
                    onChange={e => setDirectSrvImage(e.target.value)}
                    placeholder="Or enter direct image URL: https://..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none text-xs font-mono"
                  />

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Presets:</span>
                    {[
                      { label: 'Digital Hub Desk', url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80' },
                      { label: 'Online Application', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80' },
                      { label: 'Card & ID Services', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80' }
                    ].map((stock, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setDirectSrvImage(stock.url)}
                        className="text-[10px] bg-white border border-slate-200 hover:border-purple-300 text-slate-600 hover:text-purple-600 px-2 py-0.5 rounded shadow-sm transition"
                      >
                        {stock.label}
                      </button>
                    ))}
                  </div>

                  {directSrvImage && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white p-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={directSrvImage} alt="Service preview" className="w-16 h-12 object-cover rounded-lg border border-slate-200" />
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Service Image Attached
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDirectSrvImage('')}
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Required Documents (comma separated)</label>
                <input
                  type="text"
                  value={directSrvRequiredDocs}
                  onChange={e => setDirectSrvRequiredDocs(e.target.value)}
                  placeholder="Aadhaar Card, Mark Sheets, Photo Specimen"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Application Steps & Process</label>
                <textarea
                  rows={2}
                  value={directSrvProcess}
                  onChange={e => setDirectSrvProcess(e.target.value)}
                  placeholder="Describe the steps to apply or visit our center..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="srvBookingCheck"
                  checked={directSrvBookingRequired}
                  onChange={e => setDirectSrvBookingRequired(e.target.checked)}
                  className="rounded text-indigo-600 w-4 h-4"
                />
                <label htmlFor="srvBookingCheck" className="text-xs font-semibold text-slate-800 cursor-pointer">
                  Enable Online Appointment Booking for this Service
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNewServiceModal(false)}
                  className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className={`w-2/3 py-3 text-white font-bold rounded-xl shadow transition text-xs flex items-center justify-center gap-2 cursor-pointer ${
                    isPublishing ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {isPublishing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Publishing Service...</span>
                    </>
                  ) : (
                    <span>Publish Digital Service</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTIONS TAB (Website Section Builder) */}
      {activeTab === 'sections' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Website Section Builder (CMS)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Create, configure, reorder, and publish custom dynamic sections across the SAYAN DIGITAL HUB platform.</p>
            </div>
            <button
              onClick={() => {
                setEditingSectionId(null);
                setSecName('');
                setSecTitle('');
                setSecSlug('');
                setSecDesc('');
                setSecIcon('Briefcase');
                setSecBanner('');
                setSecLayout('card-grid');
                setSecShowHomepage(true);
                setSecShowDesktopNav(true);
                setSecShowMobileNav(true);
                setSecShowFooter(true);
                setSecDisplayOrder(websiteSections.length + 1);
                setSecColorTheme('indigo');
                setSecStatus('published');
                setSecSeoTitle('');
                setSecSeoDesc('');
                setNewSectionModal(true);
              }}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Section</span>
            </button>
          </div>

          {sectionNotice && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-fadeIn shadow-sm">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                {sectionNotice}
              </span>
              <button onClick={() => setSectionNotice(null)} className="p-1 hover:text-emerald-950">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {websiteSections.sort((a,b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0)).map(sec => (
              <div key={sec.id} className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                      sec.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {sec.status}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">Order: #{sec.displayOrder}</span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-base">{sec.name}</h4>
                  <p className="text-xs text-indigo-600 font-semibold mt-0.5">Slug: <code className="font-mono">/{sec.slug}</code></p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{sec.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Layout:</span>
                      <strong className="uppercase">{sec.layout}</strong>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {sec.showOnHomepage && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-bold">Homepage</span>}
                      {sec.showInDesktopNav && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-bold">Desktop Nav</span>}
                      {sec.showInMobileNav && <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded font-bold">Mobile Nav</span>}
                      {sec.showInFooter && <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-bold">Footer</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setPreviewSection(sec);
                      setPreviewDevice('desktop');
                    }}
                    className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:border-indigo-300"
                    title="Preview Section"
                  >
                    <Globe className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={() => handleEditSectionModal(sec)}
                    className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition cursor-pointer"
                    title="Edit Section"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicateSection(sec)}
                    className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition cursor-pointer"
                    title="Duplicate Section"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSectionToDelete(sec)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition cursor-pointer"
                    title="Delete Section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION BUILDER MODAL */}
      {newSectionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900">
                {editingSectionId ? 'Edit Website Section' : 'Create New Website Section'}
              </h3>
              <button onClick={() => setNewSectionModal(false)} className="p-2 text-slate-400 hover:text-slate-700 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Section Name *</label>
                  <input
                    type="text"
                    required
                    value={secName}
                    onChange={e => {
                      const val = e.target.value;
                      setSecName(val);
                      if (!editingSectionId && (!secTitle || secTitle === secName)) {
                        setSecTitle(val);
                      }
                    }}
                    placeholder="e.g. Job Updates"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Public Display Title (Optional)</label>
                  <input
                    type="text"
                    value={secTitle}
                    onChange={e => setSecTitle(e.target.value)}
                    placeholder="Defaults to Section Name"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={secSlug}
                    onChange={e => setSecSlug(e.target.value)}
                    placeholder="jobs (auto-generated if empty)"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Layout Preset</label>
                  <select
                    value={secLayout}
                    onChange={e => setSecLayout(e.target.value as any)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs outline-none focus:border-indigo-600"
                  >
                    <option value="card-grid">Card Grid</option>
                    <option value="list">List View</option>
                    <option value="featured">Featured Content</option>
                    <option value="banner">Banner Highlight</option>
                    <option value="article-feed">Article Feed</option>
                    <option value="service-catalog">Service Catalogue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={secDesc}
                  onChange={e => setSecDesc(e.target.value)}
                  placeholder="Short description of this section..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs outline-none focus:border-indigo-600"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Display Order</label>
                  <input
                    type="number"
                    value={secDisplayOrder}
                    onChange={e => setSecDisplayOrder(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Color Theme</label>
                  <select
                    value={secColorTheme}
                    onChange={e => setSecColorTheme(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs outline-none focus:border-indigo-600"
                  >
                    <option value="indigo">Indigo (Primary)</option>
                    <option value="blue">Blue</option>
                    <option value="purple">Purple</option>
                    <option value="teal">Teal</option>
                    <option value="emerald">Emerald</option>
                    <option value="amber">Amber</option>
                    <option value="rose">Rose</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    value={secStatus}
                    onChange={e => setSecStatus(e.target.value as any)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs outline-none focus:border-indigo-600"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Visibility Options */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Visibility & Navigation Placement</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={secShowHomepage} onChange={e => setSecShowHomepage(e.target.checked)} className="w-4 h-4 rounded text-indigo-600" />
                    <span>Homepage</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={secShowDesktopNav} onChange={e => setSecShowDesktopNav(e.target.checked)} className="w-4 h-4 rounded text-indigo-600" />
                    <span>Desktop Nav</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={secShowMobileNav} onChange={e => setSecShowMobileNav(e.target.checked)} className="w-4 h-4 rounded text-indigo-600" />
                    <span>Mobile Nav</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={secShowFooter} onChange={e => setSecShowFooter(e.target.checked)} className="w-4 h-4 rounded text-indigo-600" />
                    <span>Footer</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Banner Image URL (Optional)</label>
                <input
                  type="url"
                  value={secBanner}
                  onChange={e => setSecBanner(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">SEO Title (Meta)</label>
                  <input
                    type="text"
                    value={secSeoTitle}
                    onChange={e => setSecSeoTitle(e.target.value)}
                    placeholder="Custom page title for search engines"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">SEO Description (Meta)</label>
                  <input
                    type="text"
                    value={secSeoDesc}
                    onChange={e => setSecSeoDesc(e.target.value)}
                    placeholder="Custom meta description"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewSectionModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow transition"
                >
                  {editingSectionId ? 'Update Section' : 'Publish Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IN-APP SECTION DELETE CONFIRMATION MODAL */}
      {sectionToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">Delete Website Section?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <span className="font-bold text-slate-900">"{sectionToDelete.name}"</span>? This will immediately remove it from the website navigation and database.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSectionToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = sectionToDelete.id;
                  const name = sectionToDelete.name;
                  deleteSection(id);
                  setSectionToDelete(null);
                  setSectionNotice(`Section "${name}" deleted successfully.`);
                  setTimeout(() => setSectionNotice(null), 4000);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition shadow cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION PREVIEW MODAL */}
      {previewSection && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
            previewDevice === 'mobile' ? 'max-w-sm w-full h-[80vh]' : previewDevice === 'tablet' ? 'max-w-xl w-full h-[85vh]' : 'max-w-4xl w-full h-[90vh]'
          }`}>
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold bg-indigo-600 px-2.5 py-1 rounded">Live Preview</span>
                <span className="text-sm font-bold truncate max-w-[160px] sm:max-w-xs">{previewSection.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-800 p-1 rounded-lg text-xs font-semibold">
                  <button onClick={() => setPreviewDevice('desktop')} className={`px-2.5 py-1 rounded transition ${previewDevice === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Desktop</button>
                  <button onClick={() => setPreviewDevice('tablet')} className={`px-2.5 py-1 rounded transition ${previewDevice === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Tablet</button>
                  <button onClick={() => setPreviewDevice('mobile')} className={`px-2.5 py-1 rounded transition ${previewDevice === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Mobile</button>
                </div>
                <button
                  onClick={() => {
                    setActivePage(previewSection.slug);
                    setPreviewSection(null);
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow"
                  title="Open live on website"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Visit Live</span>
                </button>
                <button onClick={() => setPreviewSection(null)} className="p-1.5 text-slate-400 hover:text-white rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
              {previewSection.bannerImage && (
                <div className="w-full h-48 rounded-2xl overflow-hidden shadow-md">
                  <img src={previewSection.bannerImage} alt={previewSection.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    Slug: /{previewSection.slug}
                  </span>
                  <span className="text-xs font-bold uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    {previewSection.status}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">{previewSection.title}</h2>
                <p className="text-sm text-slate-600">{previewSection.description}</p>
              </div>

              {/* Layout Content Mock Preview */}
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h4 className="font-bold text-slate-800 text-sm">
                    Layout Style: <span className="uppercase text-indigo-600 font-black">{previewSection.layout}</span>
                  </h4>
                  <button
                    onClick={() => {
                      setActivePage(previewSection.slug);
                      setPreviewSection(null);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    <span>View Section Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {previewSection.layout === 'card-grid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {[1, 2].map(i => (
                      <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-left">
                        <div className="h-4 bg-indigo-200 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-200 rounded w-full"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                )}

                {previewSection.layout === 'list' && (
                  <div className="space-y-2 pt-2 text-left">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div className="space-y-1 w-2/3">
                          <div className="h-3.5 bg-indigo-200 rounded w-3/4"></div>
                          <div className="h-2.5 bg-slate-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-7 w-16 bg-indigo-100 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                )}

                {(previewSection.layout === 'service-catalog' || previewSection.layout === 'featured' || previewSection.layout === 'banner' || previewSection.layout === 'article-feed') && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="h-4 bg-indigo-200 rounded w-40"></div>
                        <div className="h-3 bg-slate-200 rounded w-28"></div>
                      </div>
                    </div>
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                  </div>
                )}

                <p className="text-xs text-slate-500 pt-2 text-center">
                  Placement: {previewSection.showOnHomepage ? 'Homepage • ' : ''}{previewSection.showInDesktopNav ? 'Desktop Nav • ' : ''}{previewSection.showInMobileNav ? 'Mobile Nav • ' : ''}{previewSection.showInFooter ? 'Footer' : ''}
                </p>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => {
                    setActivePage(previewSection.slug);
                    setPreviewSection(null);
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition inline-flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Full Section on Live Website</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
