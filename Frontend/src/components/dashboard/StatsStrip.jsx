import React from 'react';

const COLORS = {
  enrolled:   { bg: 'bg-blue-50',   text: 'text-blue-600',   icon: '📚' },
  completed:  { bg: 'bg-green-50',  text: 'text-green-600',  icon: '🏆' },
  inProgress: { bg: 'bg-amber-50',  text: 'text-amber-600',  icon: '⚡' },
  lessons:    { bg: 'bg-purple-50', text: 'text-purple-600', icon: '✅' },
};

const StatsStrip = ({ enrolled, completed, inProgress, lessonsCompleted }) => {
  const stats = [
    { label: 'Enrolled',     value: enrolled,        ...COLORS.enrolled },
    { label: 'Completed',    value: completed,        ...COLORS.completed },
    { label: 'In Progress',  value: inProgress,       ...COLORS.inProgress },
    { label: 'Lessons Done', value: lessonsCompleted, ...COLORS.lessons },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map(s => (
        <div key={s.label} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft hover:shadow-soft-purple transition-all">
          <div className={`w-11 h-11 rounded-2xl ${s.bg} flex items-center justify-center text-xl mb-4`}>
            {s.icon}
          </div>
          <p className="text-secondary text-sm font-medium mb-1">{s.label}</p>
          <p className="text-3xl font-extrabold text-textMain">{s.value}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsStrip;
