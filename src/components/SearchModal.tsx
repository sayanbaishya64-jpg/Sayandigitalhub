import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { Search, X, Briefcase, GraduationCap, CalendarCheck, BookOpen, ChevronRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPost: (postId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectPost }) => {
  const { posts, studyMaterials, language } = useApp();
  const t = translations[language];
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filteredPosts = query.trim() === '' ? [] : posts.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase()) || 
    p.summary.toLowerCase().includes(query.toLowerCase()) ||
    (p.bengaliTitle && p.bengaliTitle.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredMaterials = query.trim() === '' ? [] : studyMaterials.filter(m =>
    m.topicName.toLowerCase().includes(query.toLowerCase()) ||
    m.subject.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden">
        {/* Search Input Header */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-6 h-6 text-indigo-600" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            autoFocus
            className="w-full text-lg outline-none font-medium text-slate-800 placeholder-slate-400"
          />
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
          {query.trim() === '' ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              Type to search across government jobs, scholarships, exam updates, and study materials...
            </div>
          ) : filteredPosts.length === 0 && filteredMaterials.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              No results found for "<span className="font-bold text-slate-800">{query}</span>".
            </div>
          ) : (
            <>
              {filteredPosts.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Updates & Jobs</h4>
                  <div className="space-y-2">
                    {filteredPosts.map(post => (
                      <div
                        key={post.id}
                        onClick={() => { onSelectPost(post.id); onClose(); }}
                        className="p-3 hover:bg-indigo-50 rounded-xl cursor-pointer transition flex items-center justify-between group border border-slate-100"
                      >
                        <div>
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase">
                            {post.contentType}
                          </span>
                          <h5 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 mt-1">
                            {language === 'bn' && post.bengaliTitle ? post.bengaliTitle : post.title}
                          </h5>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{post.summary}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredMaterials.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Study Materials</h4>
                  <div className="space-y-2">
                    {filteredMaterials.map(mat => (
                      <div
                        key={mat.id}
                        onClick={() => { onClose(); }}
                        className="p-3 hover:bg-blue-50 rounded-xl cursor-pointer transition flex items-center justify-between group border border-slate-100"
                      >
                        <div>
                          <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full uppercase">
                            {mat.subject}
                          </span>
                          <h5 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 mt-1">
                            {language === 'bn' && mat.bengaliTopicName ? mat.bengaliTopicName : mat.topicName}
                          </h5>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
