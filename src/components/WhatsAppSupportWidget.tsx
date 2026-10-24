import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  buildWhatsAppUrl, 
  isSupportOnlineNow, 
  getContextualPrefill, 
  formatWhatsAppDisplay 
} from '../lib/whatsapp';
import { 
  X, Send, CheckCheck, Clock, ExternalLink, ShieldCheck, Sparkles, MessageCircle 
} from 'lucide-react';

interface WhatsAppSupportWidgetProps {
  activePage: string;
  customSectionTitle?: string;
}

export const WhatsAppSupportWidget: React.FC<WhatsAppSupportWidgetProps> = ({ 
  activePage, 
  customSectionTitle 
}) => {
  const { whatsappConfig } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [selectedTopicKey, setSelectedTopicKey] = useState<string>('');
  const [hasUnreadNotification, setHasUnreadNotification] = useState(true);

  // Define checks
  const isEnabled = whatsappConfig.enabled;
  const allowed = whatsappConfig.allowedPages || ['all'];
  const isAllowedOnThisPage = allowed.includes('all') || allowed.includes(activePage);

  // Sync contextual prefill whenever activePage or customSectionTitle changes
  useEffect(() => {
    if (!isEnabled || !isAllowedOnThisPage) return;

    const contextualMessage = getContextualPrefill(whatsappConfig, activePage, customSectionTitle);
    setUserQuery(contextualMessage);
    
    // Also set selected chip key
    if (activePage.includes('job')) setSelectedTopicKey('jobs');
    else if (activePage.includes('scholarship')) setSelectedTopicKey('scholarships');
    else if (activePage.includes('service')) setSelectedTopicKey('digital-services');
    else if (activePage.includes('appointment')) setSelectedTopicKey('book-appointment');
    else if (activePage.includes('material')) setSelectedTopicKey('study-materials');
    else setSelectedTopicKey('general');
  }, [activePage, customSectionTitle, whatsappConfig, isEnabled, isAllowedOnThisPage]);

  // If globally disabled, do not render
  if (!isEnabled || !isAllowedOnThisPage) {
    return null;
  }


  const handleOpenWidget = () => {
    setIsOpen(!isOpen);
    setHasUnreadNotification(false);
  };

  const handleSelectTopic = (topicKey: string, prefill: string) => {
    setSelectedTopicKey(topicKey);
    setUserQuery(prefill);
  };

  const handleStartChat = () => {
    const directUrl = buildWhatsAppUrl(
      whatsappConfig.countryCode, 
      whatsappConfig.phoneNumber, 
      userQuery.trim() || whatsappConfig.defaultWelcomeMessage
    );
    window.open(directUrl, '_blank', 'noopener,noreferrer');
  };

  const onlineInfo = isSupportOnlineNow(whatsappConfig.businessHours, whatsappConfig.onlineStatus);
  const isLeft = whatsappConfig.position === 'bottom-left';
  const formattedNumber = formatWhatsAppDisplay(whatsappConfig.countryCode, whatsappConfig.phoneNumber);

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className={`fixed bottom-6 ${isLeft ? 'left-6' : 'right-6'} z-40 flex flex-col ${isLeft ? 'items-start' : 'items-end'}`}>
      
      {/* WhatsApp Chat Popup Card */}
      {isOpen && (
        <div 
          className={`mb-4 w-[340px] sm:w-[390px] max-w-[calc(100vw-32px)] bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-emerald-500/30 overflow-hidden animate-fadeIn flex flex-col transition-all duration-300`}
          style={{ maxHeight: 'calc(100vh - 120px)' }}
        >
          {/* Card Header (Authentic WhatsApp Dark Emerald) */}
          <div className="bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#0D6E63] p-4 text-white relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center p-1 border border-white/20 shadow-md">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" 
                      alt="SDH Support" 
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${onlineInfo.badgeColor}`} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-sm leading-tight text-white tracking-wide">
                      {whatsappConfig.heading || 'Sayan Digital Hub'}
                    </h4>
                    <span className="bg-emerald-400 text-slate-950 p-0.5 rounded-full text-[9px]" title="Verified Business Channel">
                      <ShieldCheck className="w-3 h-3" />
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-100/90 font-medium flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                    {onlineInfo.label}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white/90 hover:text-white transition cursor-pointer"
                aria-label="Close WhatsApp chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-2.5 pt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-emerald-100">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-300 shrink-0" />
                {whatsappConfig.responseTimeNotice || 'Replies in 10-15 mins'}
              </span>
              <span className="font-mono font-semibold text-emerald-200">
                {formattedNumber}
              </span>
            </div>
          </div>

          {/* Chat Body (Message Bubble & Quick Inquiries) */}
          <div className="p-4 bg-slate-950/80 backdrop-blur-md flex-1 overflow-y-auto space-y-3.5 text-xs">
            
            {/* Business Status Notice */}
            <div className="text-center">
              <span className="inline-block bg-slate-800/80 text-slate-400 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-slate-700/50">
                {whatsappConfig.businessHours || 'Hours: 9:00 AM – 9:00 PM (Mon – Sat)'}
              </span>
            </div>

            {/* Chat Bubble from Sayan Digital Hub */}
            <div className="flex flex-col items-start max-w-[92%]">
              <div className="bg-[#0b141a] text-slate-100 p-3.5 rounded-2xl rounded-tl-sm border border-[#202c33] shadow-md space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sayan Digital Hub Support</span>
                </div>
                <p className="leading-relaxed text-[12px] text-slate-200">
                  {whatsappConfig.defaultWelcomeMessage || 'Hello! How can we help you with form fillup, scholarships, or services today?'}
                </p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-500 pt-0.5">
                  <span>{currentTime}</span>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
            </div>

            {/* Topic Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                Tap to select your topic:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(whatsappConfig.sectionPrefills || []).map((p) => {
                  const isSelected = selectedTopicKey === p.sectionKey;
                  return (
                    <button
                      key={p.sectionKey}
                      type="button"
                      onClick={() => handleSelectTopic(p.sectionKey, p.prefillMessage)}
                      className={`text-[11px] px-2.5 py-1.5 rounded-xl font-medium transition cursor-pointer text-left ${
                        isSelected 
                          ? 'bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-600/30 ring-1 ring-emerald-400' 
                          : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                      }`}
                    >
                      {p.sectionName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Textarea for customer to customize message */}
            <div className="space-y-1 pt-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
                <span>Your Message:</span>
                <span className="text-emerald-400 font-normal">Editable</span>
              </label>
              <textarea
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Type your inquiry or details here..."
                rows={3}
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 outline-none resize-none transition"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-3.5 bg-slate-900 border-t border-slate-800/80 space-y-2">
            <button
              onClick={handleStartChat}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#22bf5b] hover:to-[#0f776a] text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition transform active:scale-98 cursor-pointer"
            >
              <Send className="w-4 h-4 fill-current" />
              <span>Start WhatsApp Chat Now</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
            <p className="text-[10px] text-center text-slate-500">
              Direct official WhatsApp Business conversation. No signup required.
            </p>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <div className="relative group">
        {/* Pulsing Aura */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-75 blur group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt pointer-events-none" />

        <button
          onClick={handleOpenWidget}
          className="relative flex items-center gap-2.5 px-4 py-3.5 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white rounded-full shadow-2xl hover:shadow-emerald-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer border border-emerald-300/40"
          aria-label={whatsappConfig.tooltip || "Chat on WhatsApp"}
        >
          {/* Authentic WhatsApp SVG Logo */}
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.148.566 4.167 1.558 5.918l-1.558 5.682 5.836-1.532c1.691.923 3.633 1.45 5.702 1.45 6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
            </svg>
          </div>

          <span className="text-xs font-black tracking-wide pr-1">
            {whatsappConfig.buttonLabel || 'WhatsApp Help'}
          </span>

          {/* Unread Alert Ping */}
          {hasUnreadNotification && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-600 border-2 border-white text-[9px] font-black items-center justify-center text-white">
                1
              </span>
            </span>
          )}
        </button>
      </div>

    </div>
  );
};
