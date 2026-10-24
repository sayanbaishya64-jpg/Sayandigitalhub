import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../i18n/translations';
import { 
  MonitorSmartphone, CheckCircle2, Clock, IndianRupee, ArrowRight, 
  Plus, Edit, Trash2, ShieldCheck, ExternalLink, Calendar 
} from 'lucide-react';
import { DigitalService } from '../../types';
import { DigitalServiceModal } from '../../components/DigitalServiceModal';

interface DigitalServicesPageProps {
  setActivePage: (page: string) => void;
}

export const DigitalServicesPage: React.FC<DigitalServicesPageProps> = ({ setActivePage }) => {
  const { digitalServices, deleteDigitalService, language, currentUser } = useApp();
  const t = translations[language];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<DigitalService | null>(null);

  const isAdmin = Boolean(
    currentUser && (
      currentUser.role === 'admin' || 
      currentUser.role === 'super_admin' || 
      currentUser.role.toLowerCase().includes('admin')
    )
  );

  const handleOpenAddModal = () => {
    setServiceToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (srv: DigitalService) => {
    setServiceToEdit(srv);
    setIsModalOpen(true);
  };

  const handleDeleteService = async (srv: DigitalService) => {
    const confirmMessage = `Are you sure you want to delete "${srv.name}"? This will remove it from the digital services directory and appointment booking system.`;
    if (window.confirm(confirmMessage)) {
      try {
        await deleteDigitalService(srv.id);
      } catch (err: any) {
        alert(`Failed to delete service: ${err.message || 'Database error'}`);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {language === 'bn' ? 'ডিজিটাল সহায়তা' : 'Online Digital Services'}
            </span>
            {isAdmin && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Management Enabled</span>
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mt-2">
            {t.digitalServices}
          </h1>
          <p className="text-slate-300 text-sm mt-2 max-w-xl">
            {language === 'bn' 
              ? 'অনলাইন ফর্ম ফিলাপ, স্কলারশিপ ও পেমেন্ট সংক্রান্ত সমস্ত পরিষেবার জন্য আমাদের সাথে যোগাযোগ করুন।' 
              : 'Explore verified online services, fees, processing timelines, and book dedicated support appointments.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {isAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3.5 rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
              title="Add a new digital service"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          )}

          <button
            onClick={() => setActivePage('book-appointment')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>{t.bookAppointment}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {digitalServices.map(srv => (
          <div 
            key={srv.id} 
            className="bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-md border border-slate-200 dark:border-[#263449] hover:shadow-xl transition flex flex-col justify-between"
          >
            <div>
              {srv.imageUrl && (
                <div className="w-full h-40 rounded-xl overflow-hidden mb-4 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                  <img src={srv.imageUrl} alt={srv.name} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-3">
                <span className="bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/40">
                  {srv.category}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Available
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-2">
                {language === 'bn' && srv.bengaliName ? srv.bengaliName : srv.name}
              </h3>
              
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-3 leading-relaxed">
                {language === 'bn' && srv.bengaliDescription ? srv.bengaliDescription : srv.shortDescription}
              </p>

              <div className="space-y-2 mb-6 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#172033] p-3.5 rounded-xl border border-slate-100 dark:border-[#263449]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Processing:</span>
                  </span>
                  <strong className="text-slate-900 dark:text-slate-100">{srv.processingTime}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Service Fee:</span>
                  </span>
                  <strong className="text-emerald-700 dark:text-emerald-300 font-black">{srv.charges}</strong>
                </div>

                {srv.officialWebsite && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Official Portal:</span>
                    <a
                      href={srv.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Visit Site</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setActivePage('book-appointment')}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>{t.bookNow}</span>
              </button>

              {/* Admin Action Buttons */}
              {isAdmin && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-[#263449]">
                  <button
                    onClick={() => handleOpenEditModal(srv)}
                    className="flex-1 py-2 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl transition border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Edit Service Details"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Service</span>
                  </button>

                  <button
                    onClick={() => handleDeleteService(srv)}
                    className="p-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl transition border border-rose-200 dark:border-rose-900/50 cursor-pointer"
                    title="Delete Service"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Admin Add / Edit Modal */}
      {isAdmin && (
        <DigitalServiceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          serviceToEdit={serviceToEdit}
        />
      )}
    </div>
  );
};
