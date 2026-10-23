import { WhatsAppConfig } from '../types';

/**
 * Validate WhatsApp mobile number
 */
export function validateWhatsAppNumber(phone: string, countryCode: string = '+91'): { isValid: boolean; cleaned: string; error?: string } {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, cleaned: '', error: 'WhatsApp number is required.' };
  }

  const cleaned = phone.replace(/[^0-9]/g, '');

  if (cleaned.length === 0) {
    return { isValid: false, cleaned: '', error: 'Please enter a valid phone number with digits only.' };
  }

  // If India (+91)
  if (countryCode === '+91' || countryCode === '91') {
    if (cleaned.length === 10) {
      return { isValid: true, cleaned };
    }
    // Also allow 12 digits if user included 91 prefix
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return { isValid: true, cleaned: cleaned.substring(2) };
    }
    return { isValid: false, cleaned, error: 'Indian WhatsApp number must be exactly 10 digits (e.g. 8116957965).' };
  }

  // International standard (E.164 without prefix: 7 to 15 digits)
  if (cleaned.length >= 7 && cleaned.length <= 15) {
    return { isValid: true, cleaned };
  }

  return { isValid: false, cleaned, error: 'Phone number must be between 7 and 15 digits.' };
}

/**
 * Clean & Format WhatsApp full international number for display
 */
export function formatWhatsAppDisplay(countryCode: string, phone: string): string {
  const code = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
  const clean = (phone || '').replace(/[^0-9]/g, '');
  if (clean.length === 10) {
    return `${code} ${clean.substring(0, 5)} ${clean.substring(5)}`;
  }
  return `${code} ${clean}`;
}

/**
 * Generate official WhatsApp Direct wa.me chat URL
 */
export function buildWhatsAppUrl(countryCode: string, phone: string, message: string = ''): string {
  const cleanCode = (countryCode || '+91').replace(/[^0-9]/g, '');
  let cleanPhone = (phone || '').replace(/[^0-9]/g, '');

  // Strip leading 0 or country code duplication
  if (cleanPhone.startsWith('0')) {
    cleanPhone = cleanPhone.substring(1);
  }
  if (cleanPhone.startsWith(cleanCode)) {
    cleanPhone = cleanPhone.substring(cleanCode.length);
  }

  const fullNumber = `${cleanCode}${cleanPhone}`;
  const encodedText = encodeURIComponent(message.trim());

  return `https://wa.me/${fullNumber}?text=${encodedText}`;
}

/**
 * Determine live business support availability status
 */
export function isSupportOnlineNow(
  businessHours: string, 
  statusMode: 'auto' | 'online' | 'offline' = 'auto'
): { isOnline: boolean; label: string; badgeColor: string } {
  if (statusMode === 'online') {
    return { isOnline: true, label: 'Available Now', badgeColor: 'bg-emerald-500' };
  }
  if (statusMode === 'offline') {
    return { isOnline: false, label: 'Offline • Leave a message', badgeColor: 'bg-amber-500' };
  }

  // Automatic calculation based on Indian Standard Time (IST - Asia/Kolkata)
  try {
    const now = new Date();
    // Convert to IST
    const istTimeStr = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: false });
    const istDayStr = now.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', weekday: 'short' });
    const currentHour = parseInt(istTimeStr.split(':')[0], 10);

    // Monday (Mon) to Saturday (Sat), 09:00 to 21:00 IST
    const isWorkingDay = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].includes(istDayStr);
    const isWorkingHour = currentHour >= 9 && currentHour < 21;

    if (isWorkingDay && isWorkingHour) {
      return { isOnline: true, label: 'Online • Quick Reply', badgeColor: 'bg-emerald-500' };
    } else {
      return { isOnline: false, label: 'Outside Hours • Replies Soon', badgeColor: 'bg-amber-400' };
    }
  } catch (e) {
    return { isOnline: true, label: 'Online Support', badgeColor: 'bg-emerald-500' };
  }
}

/**
 * Resolve contextual prefill message based on current page
 */
export function getContextualPrefill(
  config: WhatsAppConfig, 
  activePage: string, 
  customSectionTitle?: string
): string {
  if (!config.sectionPrefills || config.sectionPrefills.length === 0) {
    return config.defaultWelcomeMessage || 'Hello Sayan Digital Hub, I need assistance.';
  }

  // Direct match with sectionKey
  const match = config.sectionPrefills.find(p => p.sectionKey.toLowerCase() === activePage.toLowerCase());
  if (match && match.prefillMessage) {
    return match.prefillMessage;
  }

  // Partial or alias matches
  if (activePage === 'home') {
    const general = config.sectionPrefills.find(p => p.sectionKey === 'general');
    return general?.prefillMessage || config.defaultWelcomeMessage;
  }
  if (activePage.includes('job')) {
    const job = config.sectionPrefills.find(p => p.sectionKey === 'jobs');
    if (job?.prefillMessage) return job.prefillMessage;
  }
  if (activePage.includes('scholarship')) {
    const sch = config.sectionPrefills.find(p => p.sectionKey === 'scholarships');
    if (sch?.prefillMessage) return sch.prefillMessage;
  }
  if (activePage.includes('service')) {
    const srv = config.sectionPrefills.find(p => p.sectionKey === 'digital-services');
    if (srv?.prefillMessage) return srv.prefillMessage;
  }
  if (activePage.includes('appointment')) {
    const apt = config.sectionPrefills.find(p => p.sectionKey === 'book-appointment');
    if (apt?.prefillMessage) return apt.prefillMessage;
  }
  if (activePage.includes('material')) {
    const mat = config.sectionPrefills.find(p => p.sectionKey === 'study-materials');
    if (mat?.prefillMessage) return mat.prefillMessage;
  }

  if (customSectionTitle) {
    return `Hello Sayan Digital Hub, I would like to inquire about ${customSectionTitle}.`;
  }

  const general = config.sectionPrefills.find(p => p.sectionKey === 'general');
  return general?.prefillMessage || config.defaultWelcomeMessage;
}
