/**
 * Generic empty-state card reused across feature components.
 *
 * @param {{ icon: React.ReactNode, title: string, description: string }} props
 */
export default function EmptyState({ icon, title, description }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-400 mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
