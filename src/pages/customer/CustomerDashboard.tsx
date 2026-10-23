import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../i18n/translations';
import { User, CalendarClock, BookOpen, Settings, Shield, CheckCircle, Clock, XCircle } from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { currentUser, appointments, studyMaterials, language } = useApp();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'appointments' | 'profile' | 'materials'>('appointments');

  const myAppointments = appointments.filter(a => a.customerEmail === currentUser?.email);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-blue-900 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          {currentUser?.avatarUrl ? (
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.name} 
              className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400/50 shadow-md"
            />
          ) : (
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center font-black text-2xl">
              {currentUser?.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">{currentUser?.name}</h1>
              {currentUser?.authProvider === 'google' && (
                <span className="text-[10px] font-bold bg-white text-indigo-950 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  Google
                </span>
              )}
            </div>
            <p className="text-indigo-200 text-xs">{currentUser?.email} • Customer Account</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-xs font-semibold">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Active Customer Session</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
            activeTab === 'appointments' ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          <span>My Appointments ({myAppointments.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
            activeTab === 'materials' ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Study Materials</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
            activeTab === 'profile' ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Profile Settings</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Your Booked Service Appointments</h3>
          {myAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center text-slate-500 border border-slate-200">
              You have not booked any service appointments yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myAppointments.map(apt => (
                <div key={apt.id} className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full uppercase">
                      {apt.serviceName}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase border ${
                      apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      apt.status === 'rescheduled' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' :
                      apt.status === 'rejected' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                      apt.status === 'completed' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      apt.status === 'cancelled' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                      'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p>Date: <strong className="text-slate-900">{apt.date}</strong></p>
                    <p>Time Slot: <strong className="text-slate-900">{apt.timeSlot}</strong></p>
                    {apt.notes && <p>Notes: {apt.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'materials' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Available Study Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {studyMaterials.map(mat => (
              <div key={mat.id} className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 space-y-3">
                <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded uppercase">{mat.subject}</span>
                <h4 className="font-bold text-slate-900">{mat.topicName}</h4>
                <p className="text-xs text-slate-600">{mat.shortDescription}</p>
                <a
                  href={mat.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow"
                >
                  Open Resource Link
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 max-w-xl space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Customer Profile Information</h3>
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
              <input type="text" readOnly value={currentUser?.name} className="w-full p-3 bg-slate-50 border rounded-xl font-semibold text-slate-800" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
              <input type="email" readOnly value={currentUser?.email} className="w-full p-3 bg-slate-50 border rounded-xl font-semibold text-slate-800" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account Role</label>
              <input type="text" readOnly value={currentUser?.role} className="w-full p-3 bg-slate-50 border rounded-xl font-semibold text-slate-800 uppercase" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
