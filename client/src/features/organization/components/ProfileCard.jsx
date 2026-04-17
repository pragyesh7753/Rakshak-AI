'use client';

import { Building2, Globe, Hash } from 'lucide-react';

export default function ProfileCard({ organization }) {
  if (!organization) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-gray-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-400 mb-2">No Organization Data</h3>
        <p className="text-sm text-gray-500">Organization information is not available.</p>
      </div>
    );
  }

  const monitoredKeywords =
    organization?.keyword_bank?.final_keywords?.length > 0
      ? organization.keyword_bank.final_keywords
      : Array.isArray(organization.keywords)
        ? organization.keywords
        : [];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      {/* Header banner */}
      <div className="bg-linear-to-r from-cyan-500 to-blue-500 h-24 sm:h-32" />

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Avatar */}
        <div className="-mt-12 sm:-mt-16 mb-2 sm:mb-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-900 border-4 border-gray-900 rounded-lg flex items-center justify-center">
            <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400" />
          </div>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{organization.org_name}</h2>
          <p className="text-cyan-400 font-medium text-sm sm:text-base">{organization.sector}</p>
          {organization.description && (
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">{organization.description}</p>
          )}
        </div>

        {/* Details */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-1">Domain</p>
              <p className="text-white font-medium text-sm sm:text-base break-all">{organization.domain}</p>
            </div>
          </div>

          {monitoredKeywords.length > 0 && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                <Hash className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-2">Monitored Keywords (Dynamic Bank)</p>
                <div className="flex flex-wrap gap-2">
                  {monitoredKeywords.slice(0, 24).map((keyword, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-800 text-cyan-400 text-xs font-medium rounded-full">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-gray-800">
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
            <p className="text-xs text-gray-400 mb-1">Organization ID</p>
            <p className="text-xs sm:text-sm text-white font-mono truncate">{organization.id}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
            <p className="text-xs text-gray-400 mb-1">Sector</p>
            <p className="text-xs sm:text-sm text-white font-medium uppercase">{organization.sector}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
