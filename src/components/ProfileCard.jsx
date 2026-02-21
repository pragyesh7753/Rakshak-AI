import { Building2, Globe, Layers, Tag } from 'lucide-react';

export default function ProfileCard({ organization }) {
  if (!organization) {
    return (
      <div className="text-center py-12 text-gray-500">Loading organization profile…</div>
    );
  }

  const fields = [
    { icon: Building2, label: 'Organization', value: organization.org_name },
    { icon: Layers, label: 'Sector', value: organization.sector },
    { icon: Globe, label: 'Domain', value: organization.domain },
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
      {/* Avatar + name */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
          <Building2 className="w-7 h-7 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">{organization.org_name}</h2>
          <p className="text-sm text-gray-400">{organization.sector}</p>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        {fields.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-sm text-gray-200 mt-0.5">{value ?? '—'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Keywords */}
      {organization.keywords?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-gray-400" />
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Monitored Keywords</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {organization.keywords.map((kw) => (
              <span
                key={kw}
                className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
