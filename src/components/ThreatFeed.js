'use client';

import { useState } from 'react';

export default function ThreatFeed({ threats, onThreatClick }) {
  const getSeverityColor = (score) => {
    if (score >= 7) return 'bg-red-500';
    if (score >= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getSeverityLabel = (score) => {
    if (score >= 7) return 'High';
    if (score >= 4) return 'Medium';
    return 'Low';
  };

  if (!threats || threats.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-400 mb-2">No Threats Found</h3>
        <p className="text-sm text-gray-500">No threat intelligence available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {threats.map((threat) => (
        <div
          key={threat.id}
          onClick={() => onThreatClick(threat.id)}
          className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6 hover:border-cyan-500 active:border-cyan-500 cursor-pointer transition-all"
        >
          <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 sm:gap-4 mb-4">
            <div className="flex-1 w-full">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                <span className="text-base sm:text-lg font-semibold text-white">
                  {threat.threat_type || 'Unknown Threat'}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getSeverityColor(
                    threat.severity_score
                  )}`}
                >
                  {getSeverityLabel(threat.severity_score)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                <span>Sector: {threat.sector || 'N/A'}</span>
                <span className="hidden sm:inline">•</span>
                <span>Credibility: {threat.credibility_score}/10</span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xl sm:text-2xl font-bold text-cyan-400">
                {threat.severity_score}
              </div>
              <div className="text-xs text-gray-500">severity</div>
            </div>
          </div>

          <p className="text-gray-300 text-sm line-clamp-2">
            {threat.summary || 'No summary available'}
          </p>

          {threat.raw_posts && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <p className="text-xs text-gray-500">
                Source: {threat.raw_posts.author || 'Unknown'}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
