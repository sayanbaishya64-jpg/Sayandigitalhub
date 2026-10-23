import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../i18n/translations';
import { CalendarClock, CheckCircle, Calendar, Clock, User, Phone, Mail, AlertTriangle, Lock, Users } from 'lucide-react';
import { OtpConsentSection } from '../../components/OtpConsentSection';
import { DEFAULT_HOURLY_TIME_SLOTS } from '../../types';

export const BookAppointmentPage: React.FC = () => {
  const { digitalServices, bookAppointment, currentUser, language, checkSlotAvailability, checkDateAvailability, settings } = useApp();
  const t = translations[language];

  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedServiceId, setSelectedServiceId] = useState(digitalServices[0]?.id || '');
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [date, setDate] = useState(todayStr);
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 11:00 AM');
  const [notes, setNotes] = useState('');
  const [otpConsentAccepted, setOtpConsentAccepted] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const maxCapacity = settings.maxCapacityPerSlot || 5;

  // Evaluate date availability
  const dateCheck = date ? checkDateAvailability(date, selectedServiceId) : { available: true, totalSlots: 0, availableSlotsCount: 0, fullyBookedSlotsCount: 0 };

  // Evaluate slots for selected date
  const slotStatuses = DEFAULT_HOURLY_TIME_SLOTS.map(slot => {
    const status = date ? checkSlotAvailability(date, slot, selectedServiceId) : { available: true, bookedCount: 0, maxCapacity, remainingCapacity: maxCapacity };
    return { slot, ...status };
  });

  // Auto-select first available time slot if currently selected one is unavailable
  useEffect(() => {
    if (date) {
      const currentAvail = checkSlotAvailability(date, timeSlot, selectedServiceId);
      if (!currentAvail.available) {
        const firstAvail = slotStatuses.find(s => s.available);
        if (firstAvail) {
          setTimeSlot(firstAvail.slot);
        }
      }
    }
  }, [date, selectedServiceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!otpConsentAccepted) {
      setBookingError('You must agree to the OTP Consent & Authorization policy before submitting your service appointment request.');
      return;
    }

    if (!date) {
      setBookingError('Please select an appointment date.');
      return;
    }

    if (date < todayStr) {
      setBookingError('Past dates cannot be selected for appointment booking.');
      return;
    }

    const availCheck = checkSlotAvailability(date, timeSlot, selectedServiceId);
    if (!availCheck.available) {
      setBookingError(`Selected time slot is unavailable: ${availCheck.reason}`);
      return;
    }

    const service = digitalServices.find(s => s.id === selectedServiceId);
    if (!service) {
      setBookingError('Please select a valid digital service.');
      return;
    }

    try {
      await bookAppointment({
        serviceId: service.id,
        serviceName: service.name,
        customerId: currentUser?.id || 'guest-' + Date.now(),
        customerName,
        customerEmail,
        customerPhone,
        date,
        timeSlot,
        notes,
        otpConsentAccepted: true,
        otpConsentTimestamp: new Date().toISOString()
      });

      setSuccess(true);
      setBookingError(null);
      setTimeout(() => {
        setSuccess(false);
        setDate(todayStr);
        setNotes('');
        setOtpConsentAccepted(false);
      }, 5000);
    } catch (err: any) {
      setBookingError(err.message || 'Failed to submit appointment booking. Please try another time slot.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B1220] via-[#111C35] to-[#1E1B4B] text-white rounded-3xl p-8 border border-[#263449] shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <span className="bg-[#2563EB]/20 text-[#00D4FF] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-[#00D4FF]/30">
          {language === 'bn' ? 'সরাসরি সময় বুক করুন' : 'Service Booking & Hourly Capacity'}
        </span>
        <h1 className="text-3xl font-black mt-3">
          {t.bookAppointment}
        </h1>
        <p className="text-slate-300 text-sm mt-2 leading-relaxed">
          {language === 'bn' 
            ? 'আমাদের বিশেষজ্ঞের সাথে আপনার সুবিধাজনক সময়ে ডিজিটাল পরিষেবার জন্য বুক করুন। প্রতিটি ১-ঘন্টার স্লটে সর্বাধিক ৫ টি অ্যাপয়েন্টমেন্ট বুকিং সম্ভব।' 
            : `Schedule a verified appointment slot. Strictly capped at ${maxCapacity} appointments per hourly slot in Asia/Kolkata business time.`}
        </p>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-[#263449]">
        {success ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 p-8 rounded-2xl text-center space-y-4 border border-emerald-200 dark:border-emerald-800/40">
            <CheckCircle className="w-16 h-16 text-emerald-600 dark:text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-2xl font-bold">{t.bookingSuccess}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Your appointment request has been confirmed. Reserved slot: {date} ({timeSlot}).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Service Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">
                {t.selectService} *
              </label>
              <select
                value={selectedServiceId}
                onChange={e => setSelectedServiceId(e.target.value)}
                className="w-full p-3.5 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-[#080D18] focus:border-[#2563EB] transition"
              >
                {digitalServices.map(srv => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name} ({srv.charges})
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">
                  {t.fullName} *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-[#080D18] focus:border-[#2563EB] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">
                  {t.phoneNumber} *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-[#080D18] focus:border-[#2563EB] transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">
                {t.emailAddress} *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-[#080D18] focus:border-[#2563EB] transition"
                />
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">
                {t.selectDate} *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#172033] border rounded-xl text-sm font-bold outline-none transition ${
                    !dateCheck.available 
                      ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200' 
                      : 'border-slate-200 dark:border-[#263449] text-slate-900 dark:text-slate-100 focus:border-[#2563EB]'
                  }`}
                />
              </div>

              {/* Date Availability Alert */}
              {!dateCheck.available && (
                <div className="mt-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    Selected date ({date}) is unavailable for booking. {dateCheck.reason}
                  </span>
                </div>
              )}
            </div>

            {/* Time Slot Selection Grid with Real Capacity Labels */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  {t.selectTimeSlot} (Asia/Kolkata IST) *
                </label>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span>Max {maxCapacity} appointments per slot</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {slotStatuses.map(({ slot, available, reason: slotReason, bookedCount, maxCapacity: slotMax, remainingCapacity }) => {
                  const isSelected = timeSlot === slot;
                  const isFullyBooked = remainingCapacity <= 0;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={!available || !dateCheck.available}
                      onClick={() => setTimeSlot(slot)}
                      className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                        !available || !dateCheck.available
                          ? 'bg-slate-100/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-75'
                          : isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400/50 font-bold'
                          : 'bg-slate-50 dark:bg-[#172033] hover:bg-slate-100 dark:hover:bg-[#1f2b45] text-slate-800 dark:text-slate-200 border-slate-200 dark:border-[#263449]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 shrink-0 opacity-75" />
                          {slot}
                        </span>
                        {!available || !dateCheck.available ? (
                          <Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        ) : isSelected ? (
                          <CheckCircle className="w-4 h-4 text-white shrink-0" />
                        ) : null}
                      </div>

                      {/* Remaining Capacity Banner */}
                      <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[11px]">
                        {isFullyBooked ? (
                          <span className="text-rose-600 dark:text-rose-400 font-extrabold flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Fully booked — 0 of {slotMax} slots available
                          </span>
                        ) : !available ? (
                          <span className="text-rose-600 dark:text-rose-400 font-semibold truncate">
                            {slotReason || 'Blocked'}
                          </span>
                        ) : (
                          <span className={isSelected ? 'text-blue-100 font-extrabold' : 'text-emerald-600 dark:text-emerald-400 font-extrabold'}>
                            {remainingCapacity} of {slotMax} slots available
                          </span>
                        )}

                        {available && (
                          <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {bookedCount}/{slotMax}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">
                Additional Notes / Service Details
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Mention specific form details or documents you will bring..."
                className="w-full p-3 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-[#080D18] focus:border-[#2563EB] transition"
              ></textarea>
            </div>

            {/* OTP Consent Section */}
            <OtpConsentSection
              accepted={otpConsentAccepted}
              onChange={(val) => {
                setOtpConsentAccepted(val);
                if (val) setBookingError(null);
              }}
              error={bookingError}
              language={language}
            />

            {/* Booking Submit Button */}
            <button
              type="submit"
              disabled={!dateCheck.available}
              className="w-full py-4 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-xl shadow-[#2563EB]/25 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <CalendarClock className="w-5 h-5" />
              <span>{t.submitBooking}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
