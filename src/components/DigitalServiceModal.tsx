import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DigitalService } from '../types';
import { uploadImageToCloudinary } from '../lib/cloudinary';
import { 
  X, CheckCircle, RefreshCw, UploadCloud, Image as ImageIcon, 
  MonitorSmartphone, IndianRupee, Clock, AlertCircle, ShieldAlert 
} from 'lucide-react';

interface DigitalServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceToEdit?: DigitalService | null;
  onSuccess?: (serviceId: string) => void;
}

export const DigitalServiceModal: React.FC<DigitalServiceModalProps> = ({
  isOpen,
  onClose,
  serviceToEdit,
  onSuccess
}) => {
  const { currentUser, addDigitalService, updateDigitalService } = useApp();

  const isAuthorized = Boolean(
    currentUser && (
      currentUser.role === 'admin' || 
      currentUser.role === 'super_admin' || 
      currentUser.role.toLowerCase().includes('admin')
    )
  );

  const [name, setName] = useState('');
  const [bengaliName, setBengaliName] = useState('');
  const [category, setCategory] = useState('Application Assistance');
  const [shortDescription, setShortDescription] = useState('');
  const [bengaliDescription, setBengaliDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [charges, setCharges] = useState('₹100');
  const [processingTime, setProcessingTime] = useState('1 - 2 Hours');
  const [eligibility, setEligibility] = useState('All Eligible Candidates');
  const [requiredDocs, setRequiredDocs] = useState('');
  const [processSteps, setProcessSteps] = useState('');
  const [bookingRequired, setBookingRequired] = useState(true);
  const [officialWebsite, setOfficialWebsite] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state when editing or opening
  useEffect(() => {
    if (serviceToEdit) {
      setName(serviceToEdit.name || '');
      setBengaliName(serviceToEdit.bengaliName || '');
      setCategory(serviceToEdit.category || 'Application Assistance');
      setShortDescription(serviceToEdit.shortDescription || '');
      setBengaliDescription(serviceToEdit.bengaliDescription || '');
      setDetailedDescription(serviceToEdit.detailedDescription || '');
      setCharges(serviceToEdit.charges || '₹100');
      setProcessingTime(serviceToEdit.processingTime || '1 - 2 Hours');
      setEligibility(serviceToEdit.eligibility || 'All Eligible Candidates');
      setRequiredDocs(Array.isArray(serviceToEdit.requiredDocuments) ? serviceToEdit.requiredDocuments.join(', ') : '');
      setProcessSteps(serviceToEdit.process || '');
      setBookingRequired(serviceToEdit.bookingRequired ?? true);
      setOfficialWebsite(serviceToEdit.officialWebsite || '');
      setImageUrl(serviceToEdit.imageUrl || '');
    } else {
      setName('');
      setBengaliName('');
      setCategory('Application Assistance');
      setShortDescription('');
      setBengaliDescription('');
      setDetailedDescription('');
      setCharges('₹100');
      setProcessingTime('1 - 2 Hours');
      setEligibility('All Eligible Candidates');
      setRequiredDocs('Aadhaar Card, Academic Marksheet, Passport Photo Specimen');
      setProcessSteps('1. Choose time slot and submit details\n2. Admin reviews documents\n3. Completion certificate / acknowledgement receipt generated');
      setBookingRequired(true);
      setOfficialWebsite('');
      setImageUrl('');
    }
    setErrorMessage(null);
  }, [serviceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setErrorMessage(null);

    try {
      const uploadRes = await uploadImageToCloudinary(file, { folder: 'sayan_digital_hub/services' });
      setImageUrl(uploadRes.url);
    } catch (err: any) {
      console.error('Service image upload error:', err);
      setErrorMessage(`Image upload failed: ${err.message || 'Please verify image format and size'}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) {
      setErrorMessage('Access Denied: Only Admins and Super Admins can manage digital services.');
      return;
    }

    if (!name.trim()) {
      setErrorMessage('Please enter a service name.');
      return;
    }
    if (!category.trim()) {
      setErrorMessage('Please select or specify a category.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const docsArray = requiredDocs
      .split(',')
      .map(d => d.trim())
      .filter(Boolean);

    const payload = {
      name: name.trim(),
      bengaliName: bengaliName.trim() || undefined,
      category: category.trim(),
      shortDescription: shortDescription.trim() || name.trim(),
      bengaliDescription: bengaliDescription.trim() || undefined,
      detailedDescription: detailedDescription.trim() || undefined,
      icon: 'MonitorSmartphone',
      imageUrl: imageUrl.trim() || undefined,
      charges: charges.trim() || '₹100',
      processingTime: processingTime.trim() || '1 - 2 Hours',
      eligibility: eligibility.trim() || 'All Eligible Candidates',
      requiredDocuments: docsArray.length > 0 ? docsArray : ['Valid ID Proof', 'Relevant Documents'],
      process: processSteps.trim() || 'Submit documents through digital appointment booking or direct verification.',
      availability: true,
      bookingRequired,
      officialWebsite: officialWebsite.trim() || undefined
    };

    try {
      if (serviceToEdit && serviceToEdit.id) {
        await updateDigitalService(serviceToEdit.id, payload);
        if (onSuccess) onSuccess(serviceToEdit.id);
      } else {
        await addDigitalService(payload);
        if (onSuccess) onSuccess('new');
      }
      onClose();
    } catch (err: any) {
      console.error('Error saving digital service:', err);
      setErrorMessage(`Failed to save service: ${err.message || 'Firestore database error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#111827] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-[#263449]">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-[#263449] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <MonitorSmartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
                {serviceToEdit ? 'Edit Digital Service' : 'Add New Digital Service'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {serviceToEdit 
                  ? `Editing: ${serviceToEdit.name} (Authorized: ${currentUser?.role?.replace('_', ' ').toUpperCase()})` 
                  : `Super Admin & Admin Service Publisher`}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1f293d] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAuthorized ? (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 p-4 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-300">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <p className="text-xs font-semibold">You need Admin or Super Admin privileges to add, edit, or delete digital services.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-sm">
            {errorMessage && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-3.5 rounded-xl flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Names: English and Bengali */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                  Service Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. WB Police SI Online Form Fillup"
                  className="w-full p-3 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                  Service Name (Bengali / বাংলা)
                </label>
                <input
                  type="text"
                  value={bengaliName}
                  onChange={e => setBengaliName(e.target.value)}
                  placeholder="e.g. পুলিশ এসআই অনলাইন ফর্ম ফিলাপ"
                  className="w-full p-3 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600 transition"
                />
              </div>
            </div>

            {/* Category, Fee, Processing Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600 transition"
                >
                  <option value="Application Assistance">Application Assistance</option>
                  <option value="Scholarship & Grants">Scholarship & Grants</option>
                  <option value="Certificate & Identity">Certificate & Identity</option>
                  <option value="Banking & PAN Services">Banking & PAN Services</option>
                  <option value="Admission & Counseling">Admission & Counseling</option>
                  <option value="Government Schemes">Government Schemes</option>
                  <option value="General Digital Services">General Digital Services</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                  Fee / Charges *
                </label>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={charges}
                    onChange={e => setCharges(e.target.value)}
                    placeholder="e.g. ₹100 or Free"
                    className="w-full pl-8 pr-3 py-3 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                  Processing Time *
                </label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={processingTime}
                    onChange={e => setProcessingTime(e.target.value)}
                    placeholder="e.g. 1 - 2 Hours"
                    className="w-full pl-8 pr-3 py-3 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600 transition"
                  />
                </div>
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                  Short Description (English) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={shortDescription}
                  onChange={e => setShortDescription(e.target.value)}
                  placeholder="Summary of service, requirements, and benefits..."
                  className="w-full p-3 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                  Short Description (Bengali / বাংলা)
                </label>
                <textarea
                  rows={2}
                  value={bengaliDescription}
                  onChange={e => setBengaliDescription(e.target.value)}
                  placeholder="ডিজিটাল পরিষেবার সারসংক্ষেপ..."
                  className="w-full p-3 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600 transition"
                />
              </div>
            </div>

            {/* Eligibility & Portal URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                  Target Audience / Eligibility
                </label>
                <input
                  type="text"
                  value={eligibility}
                  onChange={e => setEligibility(e.target.value)}
                  placeholder="e.g. Madhyamik / Higher Secondary Passed"
                  className="w-full p-3 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                  Official Portal Website
                </label>
                <input
                  type="url"
                  value={officialWebsite}
                  onChange={e => setOfficialWebsite(e.target.value)}
                  placeholder="https://wbpolice.gov.in"
                  className="w-full p-3 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600 transition"
                />
              </div>
            </div>

            {/* Banner Image */}
            <div className="bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                    Service Banner Image (Cloudinary Powered)
                  </span>
                </div>
                <div className="flex items-center bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-[#263449] rounded-lg p-0.5 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setImageInputMode('upload')}
                    className={`px-2.5 py-1 rounded-md transition ${imageInputMode === 'upload' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputMode('url')}
                    className={`px-2.5 py-1 rounded-md transition ${imageInputMode === 'url' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    Image URL
                  </button>
                </div>
              </div>

              {imageInputMode === 'upload' ? (
                <div>
                  <label className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-400 bg-white dark:bg-[#0B1220] hover:bg-indigo-50/20 rounded-xl cursor-pointer transition group">
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center py-2">
                        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mb-1" />
                        <span className="text-xs font-bold text-indigo-600">Uploading to Cloudinary...</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition mb-1" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Click to Upload Service Banner</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP (Cloudinary auto-optimized)</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingImage}
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or direct image URL"
                    className="w-full p-2.5 bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-[#263449] rounded-xl text-xs font-mono outline-none text-slate-900 dark:text-slate-100"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Presets:</span>
                    {[
                      { label: 'Application Desk', url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80' },
                      { label: 'Online Form Fillup', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80' },
                      { label: 'Scholarship Banner', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80' }
                    ].map((stock, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(stock.url)}
                        className="text-[10px] bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-[#263449] hover:border-indigo-400 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded shadow-sm transition"
                      >
                        {stock.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {imageUrl && (
                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-[#0B1220] rounded-xl border border-slate-200 dark:border-[#263449]">
                  <div className="flex items-center gap-3">
                    <img src={imageUrl} alt="Preview" className="w-16 h-12 object-cover rounded-lg border border-slate-200 dark:border-[#263449]" />
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Banner Attached
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Required Documents & Steps */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                Required Documents (comma separated)
              </label>
              <input
                type="text"
                value={requiredDocs}
                onChange={e => setRequiredDocs(e.target.value)}
                placeholder="Aadhaar Card, Mark Sheets, Photo Specimen, Caste Certificate"
                className="w-full p-3 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                Application Steps & Process
              </label>
              <textarea
                rows={2}
                value={processSteps}
                onChange={e => setProcessSteps(e.target.value)}
                placeholder="1. Submit appointment or details\n2. Documentation verification\n3. Final submission receipt"
                className="w-full p-3 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263449] rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600 transition"
              />
            </div>

            {/* Booking Toggle */}
            <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-[#172033] rounded-xl border border-slate-200 dark:border-[#263449]">
              <input
                type="checkbox"
                id="modalBookingCheck"
                checked={bookingRequired}
                onChange={e => setBookingRequired(e.target.checked)}
                className="rounded text-indigo-600 w-4 h-4"
              />
              <label htmlFor="modalBookingCheck" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                Enable Online Appointment Booking for this Service
              </label>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-[#263449]">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 bg-slate-100 dark:bg-[#1f293d] hover:bg-slate-200 dark:hover:bg-[#263449] text-slate-700 dark:text-slate-300 font-bold rounded-xl transition text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploadingImage}
                className={`w-2/3 py-3 text-white font-bold rounded-xl shadow-lg transition text-xs flex items-center justify-center gap-2 cursor-pointer ${
                  isSubmitting || isUploadingImage
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving to Firestore...</span>
                  </>
                ) : (
                  <span>{serviceToEdit ? 'Update Service' : 'Publish Digital Service'}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
