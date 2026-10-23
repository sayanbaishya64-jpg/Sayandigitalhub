import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../i18n/translations';
import { BookOpen, Search, Download, ExternalLink, ShieldCheck, Lock } from 'lucide-react';

export const StudyMaterialsPage: React.FC = () => {
  const { studyMaterials, language, currentUser } = useApp();
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  const subjects = ['All', ...Array.from(new Set(studyMaterials.map(m => m.subject)))];

  const filteredMaterials = studyMaterials.filter(m => {
    const matchesSearch = m.topicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || m.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-teal-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {language === 'bn' ? 'স্টাডি মেটেরিয়ালস' : 'Educational Resources'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mt-2">
            {t.studyMaterials}
          </h1>
          <p className="text-indigo-100 text-sm mt-2 max-w-xl">
            {language === 'bn' ? 'প্রতিযোগিতামূলক পরীক্ষা ও স্কুল-কলেজের জন্য ফ্রি স্টাডি নোটস, পিডিএফ ও Google Drive লিঙ্ক।' : 'Access educational notes, PDFs, semester resources, and competitive exam study materials.'}
          </p>
        </div>
        <div className="w-full md:w-80">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search notes & PDFs..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-indigo-600/40 rounded-xl text-sm text-white placeholder-indigo-200 outline-none focus:bg-white focus:text-slate-900 transition"
            />
          </div>
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {subjects.map(subj => (
          <button
            key={subj}
            onClick={() => setSelectedSubject(subj)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedSubject === subj 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {subj}
          </button>
        ))}
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-500">
            No study materials found.
          </div>
        ) : (
          filteredMaterials.map(mat => {
            const isRestricted = mat.accessPermission === 'registered' && !currentUser;
            return (
              <div
                key={mat.id}
                className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:shadow-xl transition flex flex-col justify-between"
              >
                <div>
                  {mat.imageUrl && (
                    <div className="w-full h-36 rounded-xl overflow-hidden mb-3 border border-slate-100 bg-slate-50">
                      <img src={mat.imageUrl} alt={mat.topicName} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs font-bold mb-3">
                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full uppercase">
                      {mat.subject}
                    </span>
                    <span className="text-slate-500">{mat.classLevel || 'General'}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {language === 'bn' && mat.bengaliTopicName ? mat.bengaliTopicName : mat.topicName}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                    {language === 'bn' && mat.bengaliDescription ? mat.bengaliDescription : mat.shortDescription}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Author: <strong className="text-slate-800">{mat.author || 'SDH Expert'}</strong></span>
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase">{mat.language}</span>
                  </div>

                  {isRestricted ? (
                    <div className="bg-amber-50 text-amber-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <Lock className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>Registered users only. Please login to access.</span>
                    </div>
                  ) : (
                    <a
                      href={mat.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>{t.openGoogleDrive}</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
