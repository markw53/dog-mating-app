'use client';

type AdminTab = 'pending' | 'users' | 'stats';

interface AdminTabsProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  pendingCount: number;
  usersCount: number;
}

export default function AdminTabs({
  activeTab,
  onTabChange,
  pendingCount,
  usersCount,
}: AdminTabsProps) {
  const tabs: { id: AdminTab; label: string; count?: number }[] = [
    { id: 'pending', label: 'Pending Dogs', count: pendingCount },
    { id: 'users', label: 'Users', count: usersCount },
  ];

  return (
    <div className="mb-6 border-b">
      <nav className="-mb-px flex space-x-8">
        {tabs.map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {label} {count !== undefined ? `(${count})` : ''}
          </button>
        ))}
      </nav>
    </div>
  );
}