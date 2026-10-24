import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface ShareLinkButtonProps {
  post: {
    id: string;
    slug?: string;
    contentType?: string;
  };
  className?: string;
}

export const ShareLinkButton: React.FC<ShareLinkButtonProps> = ({ 
  post, 
  className = ''
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const slugOrId = post.slug || post.id;
    const categoryPath = post.contentType ? `${post.contentType}s` : 'jobs';
    const shareUrl = `${window.location.origin}/${categoryPath}/${slugOrId}`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleShare}
        type="button"
        title="Share Link"
        className={className || "flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold text-xs transition cursor-pointer border border-indigo-200/50 dark:border-indigo-800/50 shadow-sm"}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Link</span>
          </>
        )}
      </button>

      {copied && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none animate-bounce">
          Link copied successfully!
        </div>
      )}
    </div>
  );
};
