import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar as CalendarIcon, Clock, Lock, Unlock, AlertTriangle, 
  CheckCircle, Plus, Trash2, Edit, ChevronLeft, ChevronRight, X, 
  RotateCcw, Info, ShieldAlert, Sparkles, AlertCircle, Filter, Users, Settings, Save, ShieldCheck
} from 'lucide-react';
import { AvailabilityRule, AvailabilityRuleType, Appointment, DEFAULT_HOURLY_TIME_SLOTS } from '../types';

export const AvailabilityManagement: React.FC = () => {
  const { 
    availabilityRules, 
    addAvailabilityRule, 
    updateAvailabilityRule, 
    deleteAvailabilityRule, 
    appointments, 
    updateAppointmentStatus,
    digitalServices,
    checkSlotAvailability,
    checkDateAvailability,
    settings,
    updateSettings
  } = useApp();

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(
    new Date().toISOString().split('T')[0]
  );

  // Filter by service
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>('all');

  // Modals
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AvailabilityRule | null>(null);
  const [conflictWarning, setConflictWarning] = useState<{
    pendingRule: Omit<AvailabilityRule, 'id' | 'createdAt'>;
    conflicts: Appointment[];
  } | null>(null);

  // Capacity & Office Hours Form State
  const [maxCapacityConfig, setMaxCapacityConfig] = useState(settings.maxCapacityPerSlot || 5);
  const [startTimeConfig, setStartTimeConfig] = useState(settings.officeStartTime || '09:00 AM');
  const [endTimeConfig, setEndTimeConfig] = useState(settings.officeEndTime || '08:00 PM');

  // Rule Form State
  const [ruleTitle, setRuleTitle] = useState('');
  const [ruleType, setRuleType] = useState<AvailabilityRuleType>('single_date');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('All Day');
  const [recurringDays, setRecurringDays] = useState<number[]>([0]); // Default Sunday
  const [targetServiceId, setTargetServiceId] = useState('all');
  const [reason, setReason] = useState('');
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const standardTimeSlots = ['All Day', ...DEFAULT_HOURLY_TIME_SLOTS];

  const daysOfWeek = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 }
  ];

  // Calendar logic helpers
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 - 11
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getFirstDayOfMonth(year, month);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedCalendarDate(today.toISOString().split('T')[0]);
  };

  const openNewRuleModal = (type: AvailabilityRuleType = 'single_date', initialDate?: string) => {
    setEditingRule(null);
    setRuleType(type);
    const dateToUse = initialDate || selectedCalendarDate || new Date().toISOString().split('T')[0];
    setStartDate(dateToUse);
    setEndDate(dateToUse);
    setTimeSlot('All Day');
    setRecurringDays([0]);
    setTargetServiceId(selectedServiceFilter !== 'all' ? selectedServiceFilter : 'all');
    setReason('');
    
    if (type === 'single_date') setRuleTitle('Office Unavailability');
    else if (type === 'date_range') setRuleTitle('Vacation / Holiday Closure');
    else if (type === 'time_slot') setRuleTitle('Blocked Time Slot');
    else if (type === 'recurring') setRuleTitle('Weekly Holiday');

    setShowAddRuleModal(true);
  };

  const handleSaveCapacitySettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      maxCapacityPerSlot: Number(maxCapacityConfig) || 5,
      officeStartTime: startTimeConfig,
      officeEndTime: endTimeConfig
    });
    setShowSettingsModal(false);
    setNoticeMessage(`Appointment settings saved! Max capacity set to ${maxCapacityConfig} appointments per slot.`);
    setTimeout(() => setNoticeMessage(null), 4000);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ruleTitle.trim()) {
      alert('Please enter a title for this rule.');
      return;
    }

    if (!reason.trim()) {
      alert('Please state a reason for unavailability (e.g. Diwali Holiday, Staff Training, Personal Leave).');
      return;
    }

    const payload: Omit<AvailabilityRule, 'id' | 'createdAt'> = {
      title: ruleTitle.trim(),
      type: ruleType,
      startDate: ruleType === 'recurring' ? undefined : startDate,
      endDate: ruleType === 'date_range' ? endDate : undefined,
      timeSlot: ruleType === 'recurring' ? (timeSlot === 'All Day' ? undefined : timeSlot) : (timeSlot === 'All Day' ? undefined : timeSlot),
      recurringDays: ruleType === 'recurring' ? recurringDays : undefined,
      serviceId: targetServiceId,
      reason: reason.trim()
    };

    if (editingRule) {
      await updateAvailabilityRule(editingRule.id, payload);
      setShowAddRuleModal(false);
      setEditingRule(null);
      setNoticeMessage(`Rule "${payload.title}" updated successfully!`);
      setTimeout(() => setNoticeMessage(null), 4000);
      return;
    }

    // Try creating rule and check conflicts
    const result = await addAvailabilityRule(payload);
    if (result.conflictCount > 0) {
      // Conflict detected! Show warning modal
      setConflictWarning({
        pendingRule: payload,
        conflicts: result.conflictAppointments
      });
      setShowAddRuleModal(false);
    } else {
      setShowAddRuleModal(false);
      setNoticeMessage(`Rule "${payload.title}" applied! Availability updated.`);
      setTimeout(() => setNoticeMessage(null), 4000);
    }
  };

  const handleConfirmConflictAction = async (action: 'reschedule' | 'keep') => {
    if (!conflictWarning) return;

    if (action === 'reschedule') {
      // Automatically update affected appointments status to 'rescheduled'
      for (const apt of conflictWarning.conflicts) {
        await updateAppointmentStatus(apt.id, 'rescheduled');
      }
      setNoticeMessage(`Rule applied! ${conflictWarning.conflicts.length} confirmed appointment(s) updated to 'rescheduled'.`);
    } else {
      setNoticeMessage(`Rule applied! Existing appointments retained.`);
    }

    setConflictWarning(null);
    setTimeout(() => setNoticeMessage(null), 5000);
  };

  const handleRestoreAvailability = async (ruleId: string, ruleTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the rule "${ruleTitle}" and restore date availability?`)) {
      await deleteAvailabilityRule(ruleId);
      setNoticeMessage(`Availability restored! Deleted rule "${ruleTitle}".`);
      setTimeout(() => setNoticeMessage(null), 4000);
    }
  };

  // Calculate day status for calendar grid
  const getDayStatus = (dayNum: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const todayStr = new Date().toISOString().split('T')[0];
    const isPast = dateStr < todayStr;
    const isToday = dateStr === todayStr;

    // Check booked appointments on this date
    const dayAppointments = appointments.filter(a => 
      a.date === dateStr && 
      a.status !== 'cancelled' && 
      a.status !== 'rejected' &&
      (selectedServiceFilter === 'all' || a.serviceId === selectedServiceFilter)
    );
    const bookedCount = dayAppointments.length;

    // Check availability
    const availCheck = checkDateAvailability(
      dateStr, 
      selectedServiceFilter === 'all' ? undefined : selectedServiceFilter
    );

    // Find rules affecting this date
    const targetDate = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = targetDate.getDay();

    const matchedRules = availabilityRules.filter(r => {
      if (r.serviceId && r.serviceId !== 'all' && selectedServiceFilter !== 'all' && r.serviceId !== selectedServiceFilter) {
        return false;
      }

      if (r.type === 'single_date' && r.startDate === dateStr) return true;
      if (r.type === 'date_range' && r.startDate && r.endDate && dateStr >= r.startDate && dateStr <= r.endDate) return true;
      if (r.type === 'time_slot' && r.startDate === dateStr) return true;
      if (r.type === 'recurring' && r.recurringDays && r.recurringDays.includes(dayOfWeek)) return true;
      return false;
    });

    const isBlocked = !availCheck.available || matchedRules.some(r => !r.timeSlot || r.timeSlot === 'All Day');

    return {
      dateStr,
      dayNum,
      isPast,
      isToday,
      isBlocked,
      bookedCount,
      matchedRules,
      blockedReason: availCheck.reason || matchedRules[0]?.reason
    };
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#111C35] to-[#1E1B4B] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30 uppercase tracking-wider">
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Admin Appointment & Capacity Control</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Hourly Availability & Capacity Management
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Strictly capped at max <strong>{settings.maxCapacityPerSlot || 5} appointments per hour</strong> (Asia/Kolkata timezone). View live slot capacity, block dates/ranges/hours, and manage customer bookings.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>Configure Capacity ({settings.maxCapacityPerSlot || 5}/hr)</span>
            </button>

            <button
              onClick={() => openNewRuleModal('single_date')}
              className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Block Date</span>
            </button>

            <button
              onClick={() => openNewRuleModal('date_range')}
              className="px-3.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Block Range</span>
            </button>

            <button
              onClick={() => openNewRuleModal('time_slot')}
              className="px-3.5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Block Hour</span>
            </button>

            <button
              onClick={() => openNewRuleModal('recurring')}
              className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Recurring Day</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notice Alert */}
      {noticeMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-sm animate-fadeIn">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            {noticeMessage}
          </span>
          <button onClick={() => setNoticeMessage(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Calendar & Capacity Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Calendar View (Left 7 Columns) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#111827] rounded-3xl p-6 shadow-md border border-slate-200 dark:border-[#263449] space-y-6">
          
          {/* Calendar Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
                {monthNames[month]} {year}
              </h3>
              <button
                onClick={handleToday}
                className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-bold rounded-lg transition"
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Service Filter dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#172033] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#263449] text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedServiceFilter}
                  onChange={e => setSelectedServiceFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value="all">All Digital Services</option>
                  {digitalServices.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Month Navigation */}
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Color Legend Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#172033] p-3 rounded-2xl border border-slate-200 dark:border-[#263449]">
            <span className="font-bold text-slate-800 dark:text-slate-200">Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Open Capacity</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Bookings Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span>Blocked / Unavailable</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-400" />
              <span>Past Date</span>
            </div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
              <div key={i} className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase py-1">
                {d}
              </div>
            ))}

            {/* Blank cells for offset */}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`blank-${i}`} className="h-20 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 border border-transparent" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const status = getDayStatus(dayNum);
              const isSelected = selectedCalendarDate === status.dateStr;

              let bgClasses = 'bg-emerald-50/60 hover:bg-emerald-100/80 border-emerald-200 text-emerald-950 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-300';
              
              if (status.isPast) {
                bgClasses = 'bg-slate-100/80 border-slate-200 text-slate-400 dark:bg-slate-900/40 dark:border-slate-800 dark:text-slate-600';
              } else if (status.isBlocked) {
                bgClasses = 'bg-rose-50 border-rose-300 text-rose-950 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-300';
              } else if (status.bookedCount > 0) {
                bgClasses = 'bg-blue-50 border-blue-300 text-blue-950 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-300';
              }

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedCalendarDate(status.dateStr)}
                  className={`h-22 p-2 rounded-2xl border text-left cursor-pointer transition flex flex-col justify-between relative ${bgClasses} ${
                    isSelected ? 'ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-slate-900 shadow-md font-bold' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-extrabold rounded-lg px-1.5 py-0.5 ${
                      status.isToday ? 'bg-indigo-600 text-white' : ''
                    }`}>
                      {dayNum}
                    </span>
                    {status.isBlocked && <Lock className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />}
                  </div>

                  {/* Indicators */}
                  <div className="space-y-1">
                    {status.bookedCount > 0 && (
                      <span className="inline-block text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">
                        {status.bookedCount} booked
                      </span>
                    )}

                    {status.isBlocked && (
                      <span className="inline-block text-[9px] bg-rose-600 text-white px-1 py-0.5 rounded font-bold truncate max-w-full">
                        {status.blockedReason || 'Blocked'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Capacity Breakdown & Customer Inspector (Right 5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Selected Date Capacity Info Box */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 shadow-md border border-slate-200 dark:border-[#263449] space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hourly Capacity Inspector</span>
                <h4 className="text-xl font-black text-slate-900 dark:text-slate-100">
                  {selectedCalendarDate || 'No Date Selected'}
                </h4>
              </div>
              <button
                onClick={() => openNewRuleModal('single_date', selectedCalendarDate || undefined)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Block Date</span>
              </button>
            </div>

            {/* Hourly Slot Capacity Meters Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                <span>1-Hour Slot Capacity Meters</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                  Limit: {settings.maxCapacityPerSlot || 5} / hour
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {DEFAULT_HOURLY_TIME_SLOTS.map(slot => {
                  if (!selectedCalendarDate) return null;

                  const slotAvail = checkSlotAvailability(
                    selectedCalendarDate, 
                    slot, 
                    selectedServiceFilter === 'all' ? undefined : selectedServiceFilter
                  );

                  const { bookedCount, maxCapacity, remainingCapacity, available, reason: slotReason } = slotAvail;
                  const percentUsed = Math.min(100, Math.round((bookedCount / maxCapacity) * 100));

                  const slotAppointments = appointments.filter(a => 
                    a.date === selectedCalendarDate && 
                    a.timeSlot === slot && 
                    a.status !== 'cancelled' && 
                    a.status !== 'rejected'
                  );

                  return (
                    <div
                      key={slot}
                      className={`p-3 rounded-2xl border text-xs space-y-2 ${
                        !available && remainingCapacity === 0
                          ? 'bg-rose-50/80 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-200'
                          : !available
                          ? 'bg-amber-50/80 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-200'
                          : bookedCount > 0
                          ? 'bg-blue-50/80 border-blue-200 text-blue-900 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-200'
                          : 'bg-emerald-50/80 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 shrink-0 opacity-75" />
                          {slot}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-[11px] px-2 py-0.5 rounded bg-white/70 dark:bg-black/30">
                            {bookedCount} / {maxCapacity} Booked
                          </span>
                          {!available && remainingCapacity === 0 && (
                            <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-bold uppercase">
                              Full
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Capacity Progress Meter */}
                      <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            !available && remainingCapacity === 0 
                              ? 'bg-rose-600' 
                              : bookedCount > 0 
                              ? 'bg-blue-600' 
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percentUsed}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                        <span>
                          {!available && remainingCapacity > 0 
                            ? `Blocked: ${slotReason}` 
                            : isNaN(remainingCapacity) 
                            ? '' 
                            : `${remainingCapacity} slots remaining`}
                        </span>

                        <button
                          onClick={() => openNewRuleModal('time_slot', selectedCalendarDate)}
                          className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                        >
                          Block Hour
                        </button>
                      </div>

                      {/* List Booked Customers for this hour */}
                      {slotAppointments.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-1 text-[11px]">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block">Bookings in this hour:</span>
                          {slotAppointments.map(apt => (
                            <div key={apt.id} className="flex items-center justify-between bg-white dark:bg-[#172033] p-1.5 rounded-lg border border-slate-200 dark:border-[#263449]">
                              <div>
                                <span className="font-bold text-slate-900 dark:text-slate-100">{apt.customerName}</span>
                                <span className="text-slate-500 text-[10px] block">{apt.serviceName} • {apt.customerPhone}</span>
                              </div>
                              <select
                                value={apt.status}
                                onChange={e => updateAppointmentStatus(apt.id, e.target.value as any)}
                                className="text-[10px] font-bold p-1 bg-slate-50 dark:bg-slate-800 border rounded cursor-pointer"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="rescheduled">Rescheduled</option>
                                <option value="rejected">Rejected</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Config Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Working Hours & Capacity</span>
              </h4>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold px-3 py-1 rounded-lg border border-slate-700 transition"
              >
                Configure
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                <span className="text-2xl font-black text-emerald-400">{settings.maxCapacityPerSlot || 5}</span>
                <span className="text-[11px] text-slate-400 block font-medium">Max Limit / Hour</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                <span className="text-xs font-black text-indigo-300 block">{settings.timezone || 'Asia/Kolkata'}</span>
                <span className="text-[11px] text-slate-400 block font-medium">Time Zone (IST)</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Active Rules & Restore Availability Management Table */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 shadow-md border border-slate-200 dark:border-[#263449] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
              Active Unavailability Rules & Restore Availability
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review all configured date blocks, recurring closures, and slot blocks. Click "Restore Availability" to delete a rule and reopen slots immediately.
            </p>
          </div>

          <button
            onClick={() => openNewRuleModal('single_date')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Rule</span>
          </button>
        </div>

        {availabilityRules.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50 dark:bg-slate-900/30 rounded-2xl">
            No active availability rules configured. All dates and default time slots are currently open for customer bookings up to max {settings.maxCapacityPerSlot || 5} per hour.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#172033] border-b border-slate-200 dark:border-[#263449] text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  <th className="p-3.5">Rule Title & Reason</th>
                  <th className="p-3.5">Rule Type</th>
                  <th className="p-3.5">Blocked Period / Slot</th>
                  <th className="p-3.5">Target Service</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {availabilityRules.map(rule => {
                  const srv = digitalServices.find(s => s.id === rule.serviceId);

                  return (
                    <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">{rule.title}</span>
                        <span className="text-slate-500 text-[11px] italic block">{rule.reason}</span>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                          rule.type === 'single_date' ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300' :
                          rule.type === 'date_range' ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300' :
                          rule.type === 'time_slot' ? 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300' :
                          'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300'
                        }`}>
                          {rule.type.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">
                        {rule.type === 'single_date' && (rule.startDate || 'Specific Date')}
                        {rule.type === 'date_range' && `${rule.startDate} to ${rule.endDate}`}
                        {rule.type === 'time_slot' && `${rule.startDate} (${rule.timeSlot || 'Slot'})`}
                        {rule.type === 'recurring' && (
                          <span>
                            Every {rule.recurringDays?.map(d => daysOfWeek.find(dw => dw.value === d)?.label).join(', ')}
                            {rule.timeSlot ? ` (${rule.timeSlot})` : ''}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-600 dark:text-slate-400 font-medium">
                        {rule.serviceId === 'all' || !rule.serviceId ? 'All Services' : (srv?.name || rule.serviceId)}
                      </td>

                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingRule(rule);
                            setRuleTitle(rule.title);
                            setRuleType(rule.type);
                            setStartDate(rule.startDate || new Date().toISOString().split('T')[0]);
                            setEndDate(rule.endDate || new Date().toISOString().split('T')[0]);
                            setTimeSlot(rule.timeSlot || 'All Day');
                            setRecurringDays(rule.recurringDays || [0]);
                            setTargetServiceId(rule.serviceId || 'all');
                            setReason(rule.reason);
                            setShowAddRuleModal(true);
                          }}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition"
                          title="Edit Rule"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleRestoreAvailability(rule.id, rule.title)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold text-[11px] rounded-lg transition border border-emerald-200 dark:border-emerald-800"
                          title="Delete rule and restore date availability"
                        >
                          Restore Availability
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* OFFICE WORKING HOURS & SLOT CAPACITY CONFIGURATION MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 border border-slate-200 dark:border-[#263449]">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-600" />
                  <span>Working Hours & Capacity</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Set default maximum booking limits per hourly slot.
                </p>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCapacitySettings} className="space-y-4 text-xs font-medium text-slate-800 dark:text-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Maximum Appointments Per 1-Hour Slot *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={50}
                  value={maxCapacityConfig}
                  onChange={e => setMaxCapacityConfig(Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl outline-none font-bold text-sm focus:border-indigo-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">Default requirement is 5 appointments per hour.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Office Opening Time
                  </label>
                  <input
                    type="text"
                    value={startTimeConfig}
                    onChange={e => setStartTimeConfig(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full p-3 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl outline-none text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Office Closing Time
                  </label>
                  <input
                    type="text"
                    value={endTimeConfig}
                    onChange={e => setEndTimeConfig(e.target.value)}
                    placeholder="08:00 PM"
                    className="w-full p-3 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl outline-none text-xs font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-900 text-[11px] text-indigo-900 dark:text-indigo-200">
                <strong>Business Timezone:</strong> Asia/Kolkata (IST). Changes update live capacity meters across the platform.
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="w-1/3 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-2/3 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition text-xs flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT AVAILABILITY RULE MODAL */}
      {showAddRuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-xl w-full p-8 shadow-2xl space-y-6 my-8 border border-slate-200 dark:border-[#263449]">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {editingRule ? 'Edit Unavailability Rule' : 'Configure Unavailability Rule'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Block dates or time slots from customer appointment booking.
                </p>
              </div>
              <button
                onClick={() => setShowAddRuleModal(false)}
                className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4 text-xs font-medium text-slate-800 dark:text-slate-200">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Rule Title *
                </label>
                <input
                  type="text"
                  required
                  value={ruleTitle}
                  onChange={e => setRuleTitle(e.target.value)}
                  placeholder="e.g. Office Closed for Diwali"
                  className="w-full p-3 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl outline-none focus:border-indigo-600 text-xs"
                />
              </div>

              {/* Rule Type */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { type: 'single_date', label: 'Single Date' },
                  { type: 'date_range', label: 'Date Range' },
                  { type: 'time_slot', label: 'Time Slot' },
                  { type: 'recurring', label: 'Recurring Day' }
                ].map(item => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setRuleType(item.type as AvailabilityRuleType)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      ruleType === item.type
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                        : 'bg-slate-50 dark:bg-[#172033] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#263449]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Dynamic Inputs based on type */}
              {ruleType === 'single_date' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Select Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl outline-none text-xs font-bold"
                  />
                </div>
              )}

              {ruleType === 'date_range' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl outline-none text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">End Date *</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl outline-none text-xs font-bold"
                    />
                  </div>
                </div>
              )}

              {ruleType === 'time_slot' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Target Date *</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl outline-none text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Select Time Slot *</label>
                    <select
                      value={timeSlot}
                      onChange={e => setTimeSlot(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl outline-none text-xs font-bold"
                    >
                      {standardTimeSlots.filter(s => s !== 'All Day').map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {ruleType === 'recurring' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Select Recurring Closed Days *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map(day => {
                      const isChecked = recurringDays.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              setRecurringDays(recurringDays.filter(d => d !== day.value));
                            } else {
                              setRecurringDays([...recurringDays, day.value]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold transition text-xs border ${
                            isChecked
                              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                              : 'bg-slate-50 dark:bg-[#172033] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#263449]'
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Digital Service Target */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Apply Rule To Digital Service
                </label>
                <select
                  value={targetServiceId}
                  onChange={e => setTargetServiceId(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl outline-none text-xs font-bold"
                >
                  <option value="all">All Digital Services (Entire Office Block)</option>
                  {digitalServices.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Reason for Unavailability (Shown to Customers) *
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Physical Office Closed due to Public Holiday"
                  className="w-full p-3 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl outline-none text-xs"
                />
              </div>

              {/* Submit / Cancel */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddRuleModal(false)}
                  className="w-1/3 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-2/3 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition text-xs flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{editingRule ? 'Update Rule' : 'Save & Enforce Rule'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFLICT WARNING MODAL */}
      {conflictWarning && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-xl w-full p-8 shadow-2xl space-y-6 border border-rose-300 dark:border-rose-900 animate-fadeIn">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 bg-rose-100 dark:bg-rose-950/60 rounded-2xl">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
                  Appointment Conflict Detected!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {conflictWarning.conflicts.length} existing confirmed/pending appointment(s) overlap with this new rule.
                </p>
              </div>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/30 p-4 rounded-2xl border border-rose-200 dark:border-rose-900 space-y-2">
              <span className="text-xs font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wide block">
                Affected Customer Appointments:
              </span>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {conflictWarning.conflicts.map(apt => (
                  <div key={apt.id} className="p-2.5 bg-white dark:bg-[#172033] rounded-xl border border-slate-200 dark:border-[#263449] text-xs flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900 dark:text-slate-100 block">{apt.customerName}</strong>
                      <span className="text-slate-500 text-[11px]">{apt.serviceName} • {apt.date} ({apt.timeSlot})</span>
                    </div>
                    <span className="text-xs font-mono text-indigo-600 font-bold">{apt.customerPhone}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Applying this rule will make these dates unavailable. How would you like to handle the affected existing appointments?
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleConfirmConflictAction('reschedule')}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Enforce Block & Mark Confirmed Appointments as 'Rescheduled'</span>
              </button>

              <button
                onClick={() => handleConfirmConflictAction('keep')}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 font-bold rounded-xl text-xs transition"
              >
                Enforce Block & Keep Current Appointment Status Unchanged
              </button>

              <button
                onClick={() => setConflictWarning(null)}
                className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-700 transition text-center block"
              >
                Abort & Cancel Rule Creation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
