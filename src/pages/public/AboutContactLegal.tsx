import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../i18n/translations';
import { Shield, Mail, Phone, MapPin, CheckCircle, MessageSquare } from 'lucide-react';
import { buildWhatsAppUrl, formatWhatsAppDisplay } from '../../lib/whatsapp';

export const AboutUsPage: React.FC = () => {
  const { language, settings } = useApp();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 bg-white my-10 rounded-3xl shadow-xl border border-slate-200">
      <div className="border-b border-slate-100 pb-6">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">About Us</span>
        <h1 className="text-3xl font-black text-slate-900 mt-2">{settings.siteName}</h1>
        <p className="text-slate-600 text-sm mt-1">{settings.tagline}</p>
      </div>
      <div className="prose text-slate-700 text-sm sm:text-base space-y-4 leading-relaxed">
        <p>
          <strong>{settings.siteName}</strong> is a premier educational portal and digital services platform dedicated to helping students, job aspirants, and citizens across West Bengal and India.
        </p>
        <p>
          We provide accurate, up-to-date notifications on government recruitment, scholarships, examination routines, admit cards, results, and admissions, alongside reliable digital assistance services.
        </p>
      </div>
    </div>
  );
};

export const ContactUsPage: React.FC = () => {
  const { settings, language, whatsappConfig } = useApp();
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 bg-white my-10 rounded-3xl shadow-xl border border-slate-200">
      <div className="border-b border-slate-100 pb-6">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Get In Touch</span>
        <h1 className="text-3xl font-black text-slate-900 mt-2">Contact Us</h1>
        <p className="text-slate-600 text-sm mt-1">We are here to help you with your queries and digital service needs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-indigo-600 shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-sm text-slate-900">Office Address</h4>
              <p className="text-xs text-slate-600 mt-0.5">{settings.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-slate-900">Phone Number</h4>
              <p className="text-xs text-slate-600 mt-0.5">{settings.contactPhone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-slate-900">Email Address</h4>
              <p className="text-xs text-slate-600 mt-0.5">{settings.contactEmail}</p>
            </div>
          </div>

          {/* Official WhatsApp Business Support Channel */}
          {whatsappConfig && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="w-9 h-9 rounded-xl bg-[#25D366] flex items-center justify-center text-white shrink-0 shadow-sm">
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.148.566 4.167 1.558 5.918l-1.558 5.682 5.836-1.532c1.691.923 3.633 1.45 5.702 1.45 6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-emerald-950 flex items-center justify-between">
                  <span>WhatsApp Business Support</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">Fast Reply</span>
                </h4>
                <p className="text-xs text-emerald-800 font-mono font-bold mt-0.5">
                  {formatWhatsAppDisplay(whatsappConfig.countryCode, whatsappConfig.phoneNumber)}
                </p>
                <a 
                  href={buildWhatsAppUrl(whatsappConfig.countryCode, whatsappConfig.phoneNumber, 'Hello Sayan Digital Hub, I am reaching out from your Contact page.')} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-bold underline mt-1 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Chat directly on WhatsApp</span>
                  <span>&rarr;</span>
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          {submitted ? (
            <div className="bg-emerald-50 text-emerald-800 p-6 rounded-xl text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold">Message Sent!</h4>
              <p className="text-xs">We will get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Your Name</label>
                <input type="text" required className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email / Phone</label>
                <input type="text" required className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Message</label>
                <textarea rows={3} required className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none"></textarea>
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 bg-white my-10 rounded-3xl shadow-xl border border-slate-200 text-sm sm:text-base text-slate-700 leading-relaxed">
      <h1 className="text-3xl font-black text-slate-900 border-b pb-4">Privacy Policy</h1>
      <p>Sayan Digital Hub respects your privacy and is committed to protecting your personal information. We collect information necessary to provide educational updates and digital services assistance.</p>
      <h3 className="text-lg font-bold text-slate-900 pt-4">Information We Collect</h3>
      <p>Name, email address, phone number when registering or booking digital service appointments.</p>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 bg-white my-10 rounded-3xl shadow-xl border border-slate-200 text-sm sm:text-base text-slate-700 leading-relaxed">
      <h1 className="text-3xl font-black text-slate-900 border-b pb-4">Terms and Conditions</h1>
      <p>By accessing Sayan Digital Hub, you agree to comply with our terms and conditions. All content is for informational and educational purposes.</p>
    </div>
  );
};

export const DisclaimerPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 bg-white my-10 rounded-3xl shadow-xl border border-slate-200 text-sm sm:text-base text-slate-700 leading-relaxed">
      <h1 className="text-3xl font-black text-slate-900 border-b pb-4">Disclaimer</h1>
      <p>Sayan Digital Hub is an informational portal and digital services assistance platform. We are not an official government website. Users are advised to verify all recruitment notifications from official government websites before applying.</p>
    </div>
  );
};

export const OtpConsentPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 bg-white my-10 rounded-3xl shadow-xl border border-slate-200 text-sm sm:text-base text-slate-700 leading-relaxed">
      <div className="border-b border-slate-200 pb-6">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Legal & Compliance</span>
        <h1 className="text-3xl font-black text-slate-900 mt-2">OTP Consent & Authorization Policy</h1>
        <p className="text-slate-500 text-sm mt-1">Official security agreement and authorization terms for SAYAN DIGITAL HUB</p>
      </div>

      <div className="p-6 bg-indigo-50/80 rounded-2xl border border-indigo-200 space-y-4">
        <p className="font-bold text-slate-900 text-base leading-relaxed">
          I agree to provide the required OTP (One-Time Password) when necessary to complete my requested service or appointment-related work. I authorize SAYAN DIGITAL HUB to use the OTP solely for the specific service I have requested.
        </p>
        <p className="text-slate-700 text-sm">
          I understand that OTP verification may be required for identity verification, application submission, authentication, or other authorized service-related activities.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          <span>Important Security Notice</span>
        </h3>
        <ul className="space-y-3 pl-4 list-disc text-slate-700">
          <li><strong>Specific Authorization:</strong> I will provide an OTP only when necessary for my requested service.</li>
          <li><strong>Intended Use Only:</strong> I understand that OTPs must be used only for their intended purpose.</li>
          <li><strong>Strict Confidentiality:</strong> I will not share OTPs for unrelated activities or unauthorized transactions.</li>
          <li><strong>Non-Misuse Guarantee:</strong> SAYAN DIGITAL HUB must not use my OTP for any purpose beyond the service I have authorized.</li>
          <li><strong>Review Duty:</strong> I understand that I should review the details of any transaction or application before confirming it.</li>
        </ul>
      </div>

      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 font-semibold text-xs sm:text-sm">
        By checking the OTP Consent agreement box during appointment booking or service request submissions, customers confirm that they have read and agree to this OTP Consent Policy.
      </div>
    </div>
  );
};
