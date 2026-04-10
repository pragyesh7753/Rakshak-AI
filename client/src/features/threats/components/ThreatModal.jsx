'use client';

import { X, ExternalLink } from 'lucide-react';
import { useEffect } from 'react';
import { getSeverityColor, getSeverityLabel } from '@/shared/utils/severity';

export default function ThreatModal({ threat, onClose }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!threat) return null;

  const rawPost = threat.raw_posts;
  const source = rawPost?.threat_sources;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-800 rounded-lg w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 sm:p-6 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold text-white mb-2 pr-2">
              {rawPost?.title || threat.threat_type || 'Threat Details'}
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getSeverityColor(threat.severity_score)}`}>
                {getSeverityLabel(threat.severity_score)} Severity
              </span>
              <span className="text-xs sm:text-sm text-gray-400">Sector: {threat.sector || 'N/A'}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition-all shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs text-gray-400 mb-1">Severity Score</p>
              <p className="text-xl sm:text-2xl font-bold text-cyan-400">{threat.severity_score}/10</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs text-gray-400 mb-1">Credibility</p>
              <p className="text-xl sm:text-2xl font-bold text-cyan-400">{threat.credibility_score}/10</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs text-gray-400 mb-1">Impact Level</p>
              <p className="text-lg sm:text-2xl font-bold text-cyan-400 uppercase">{threat.impact_level || 'N/A'}</p>
            </div>
          </div>

          {/* Summary */}
          {threat.summary && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Summary</h3>
              <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                <p className="text-gray-300 text-sm leading-relaxed">{threat.summary}</p>
              </div>
            </div>
          )}

          {/* Full Content */}
          {rawPost?.content && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Full Content</h3>
              <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{rawPost.content}</p>
              </div>
            </div>
          )}

          {/* Source Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {source && (
              <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                <p className="text-xs text-gray-400 mb-2">Source</p>
                <p className="text-white font-medium">{source.name}</p>
                <p className="text-xs text-cyan-400 mt-1 uppercase">{source.type}</p>
              </div>
            )}
            {rawPost?.author && (
              <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                <p className="text-xs text-gray-400 mb-2">Author</p>
                <p className="text-white font-medium">{rawPost.author}</p>
              </div>
            )}
          </div>

          {/* URL */}
          {rawPost?.url && (
            <div>
              <a
                href={rawPost.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-gray-900 font-medium rounded-lg hover:bg-cyan-400 transition-all text-sm sm:text-base"
              >
                <span>View Original Post</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
